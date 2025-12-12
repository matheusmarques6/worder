import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/api-utils';
import { SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
function getDb(): SupabaseClient {
  if (!_supabase) {
    _supabase = getSupabaseClient();
    if (!_supabase) throw new Error('Database not configured');
  }
  return _supabase;
}

const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) { return (getDb() as any)[prop]; }
});

const SHOPIFY_API_VERSION = '2024-10';

// ============================================
// SHOPIFY API HELPER WITH RATE LIMITING
// ============================================
interface ShopifyResponse {
  data: any;
  nextPageUrl: string | null;
  rateLimitRemaining: number;
}

async function shopifyFetch(
  shopDomain: string, 
  accessToken: string, 
  endpoint: string,
  retryCount = 0
): Promise<ShopifyResponse> {
  const maxRetries = 3;
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}${endpoint}`;
  
  console.log(`[Shopify API] Fetching: ${url.substring(0, 100)}...`);
  
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  });

  // Handle rate limiting (429)
  if (response.status === 429) {
    if (retryCount >= maxRetries) {
      throw new Error('Rate limit exceeded after max retries');
    }
    
    const retryAfter = response.headers.get('Retry-After');
    const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000 * (retryCount + 1);
    
    console.log(`[Shopify API] Rate limited. Waiting ${waitTime}ms before retry ${retryCount + 1}...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    return shopifyFetch(shopDomain, accessToken, endpoint, retryCount + 1);
  }

  if (!response.ok) {
    const error = await response.text();
    console.error(`[Shopify API] Error ${response.status}:`, error);
    throw new Error(`Shopify API error (${response.status}): ${error}`);
  }

  // Extract pagination from Link header
  // Format: <https://store.myshopify.com/admin/api/2024-10/orders.json?page_info=xxx>; rel="next"
  const linkHeader = response.headers.get('Link');
  let nextPageUrl: string | null = null;
  
  if (linkHeader) {
    const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    if (nextMatch) {
      nextPageUrl = nextMatch[1];
    }
  }

  // Get rate limit info
  const rateLimitHeader = response.headers.get('X-Shopify-Shop-Api-Call-Limit');
  let rateLimitRemaining = 40;
  if (rateLimitHeader) {
    const [used, total] = rateLimitHeader.split('/').map(Number);
    rateLimitRemaining = total - used;
    console.log(`[Shopify API] Rate limit: ${used}/${total} (${rateLimitRemaining} remaining)`);
  }

  // If we're getting close to rate limit, slow down
  if (rateLimitRemaining < 5) {
    console.log(`[Shopify API] Approaching rate limit, waiting 1s...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const data = await response.json();
  
  return { data, nextPageUrl, rateLimitRemaining };
}

// ============================================
// SYNC ORDERS - CORRECT PAGINATION
// ============================================
async function syncOrders(storeId: string, shopDomain: string, accessToken: string): Promise<{
  count: number;
  revenue: number;
  paidCount: number;
}> {
  console.log(`\n[Shopify Sync] ========== STARTING ORDERS SYNC ==========`);
  console.log(`[Shopify Sync] Store: ${shopDomain}`);
  
  let allOrders: any[] = [];
  let nextUrl: string | null = `/orders.json?status=any&limit=250`;
  let pageCount = 0;
  const maxPages = 40; // Max 10,000 orders (250 per page)

  while (nextUrl && pageCount < maxPages) {
    pageCount++;
    console.log(`[Shopify Sync] Fetching page ${pageCount}...`);
    
    const { data, nextPageUrl } = await shopifyFetch(shopDomain, accessToken, nextUrl);
    const orders = data.orders || [];
    
    console.log(`[Shopify Sync] Page ${pageCount}: Got ${orders.length} orders`);
    
    if (orders.length === 0) break;
    
    // Log first order for debugging
    if (pageCount === 1 && orders.length > 0) {
      const firstOrder = orders[0];
      console.log(`[Shopify Sync] Sample order:`, {
        id: firstOrder.id,
        name: firstOrder.name,
        total_price: firstOrder.total_price,
        financial_status: firstOrder.financial_status,
        created_at: firstOrder.created_at,
      });
    }
    
    allOrders = [...allOrders, ...orders];
    nextUrl = nextPageUrl;
    
    // Small delay between pages to be nice to API
    if (nextUrl) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  console.log(`[Shopify Sync] Total orders fetched: ${allOrders.length}`);

  // Analyze orders before saving
  const analysis = {
    total: allOrders.length,
    paid: 0,
    pending: 0,
    refunded: 0,
    cancelled: 0,
    other: 0,
    totalRevenue: 0,
    paidRevenue: 0,
  };

  allOrders.forEach(order => {
    const price = parseFloat(order.total_price || '0');
    analysis.totalRevenue += price;
    
    switch (order.financial_status) {
      case 'paid':
        analysis.paid++;
        analysis.paidRevenue += price;
        break;
      case 'pending':
        analysis.pending++;
        break;
      case 'refunded':
      case 'partially_refunded':
        analysis.refunded++;
        break;
      case 'voided':
        analysis.cancelled++;
        break;
      default:
        analysis.other++;
    }
  });

  console.log(`[Shopify Sync] Order Analysis:`, analysis);

  // Save orders to database
  if (allOrders.length > 0) {
    const ordersToInsert = allOrders.map((order: any) => ({
      store_id: storeId,
      shopify_order_id: order.id.toString(),
      order_number: order.order_number,
      name: order.name,
      email: order.email || order.contact_email || null,
      phone: order.phone || null,
      total_price: parseFloat(order.total_price || '0'),
      subtotal_price: parseFloat(order.subtotal_price || '0'),
      total_tax: parseFloat(order.total_tax || '0'),
      total_discounts: parseFloat(order.total_discounts || '0'),
      total_shipping: parseFloat(order.total_shipping_price_set?.shop_money?.amount || '0'),
      currency: order.currency || 'BRL',
      financial_status: order.financial_status || 'pending',
      fulfillment_status: order.fulfillment_status || null,
      customer_id: order.customer?.id?.toString() || null,
      customer_email: order.customer?.email || null,
      customer_first_name: order.customer?.first_name || null,
      customer_last_name: order.customer?.last_name || null,
      line_items: order.line_items || [],
      shipping_address: order.shipping_address || null,
      billing_address: order.billing_address || null,
      processed_at: order.processed_at || order.created_at,
      created_at: order.created_at,
      updated_at: order.updated_at,
      cancelled_at: order.cancelled_at || null,
      closed_at: order.closed_at || null,
    }));

    // Clear existing orders for this store first (to avoid orphans)
    console.log(`[Shopify Sync] Clearing existing orders for store...`);
    await supabase
      .from('shopify_orders')
      .delete()
      .eq('store_id', storeId);

    // Insert in batches of 100
    let insertedCount = 0;
    for (let i = 0; i < ordersToInsert.length; i += 100) {
      const batch = ordersToInsert.slice(i, i + 100);
      const { error } = await supabase
        .from('shopify_orders')
        .insert(batch);
      
      if (error) {
        console.error(`[Shopify Sync] Error inserting batch ${Math.floor(i/100) + 1}:`, error.message);
      } else {
        insertedCount += batch.length;
      }
    }

    console.log(`[Shopify Sync] Inserted ${insertedCount} orders to database`);

    // Verify what was saved
    const { data: verifyData, count } = await supabase
      .from('shopify_orders')
      .select('total_price, financial_status', { count: 'exact' })
      .eq('store_id', storeId)
      .limit(5);
    
    console.log(`[Shopify Sync] Verification - Orders in DB: ${count}`);
    console.log(`[Shopify Sync] Sample saved orders:`, verifyData);
  }

  return {
    count: allOrders.length,
    revenue: analysis.paidRevenue,
    paidCount: analysis.paid,
  };
}

// ============================================
// SYNC CUSTOMERS
// ============================================
async function syncCustomers(storeId: string, shopDomain: string, accessToken: string): Promise<number> {
  console.log(`\n[Shopify Sync] ========== STARTING CUSTOMERS SYNC ==========`);
  
  let allCustomers: any[] = [];
  let nextUrl: string | null = `/customers.json?limit=250`;
  let pageCount = 0;
  const maxPages = 20;

  while (nextUrl && pageCount < maxPages) {
    pageCount++;
    const { data, nextPageUrl } = await shopifyFetch(shopDomain, accessToken, nextUrl);
    const customers = data.customers || [];
    
    if (customers.length === 0) break;
    
    allCustomers = [...allCustomers, ...customers];
    nextUrl = nextPageUrl;
    
    if (nextUrl) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  console.log(`[Shopify Sync] Fetched ${allCustomers.length} customers`);

  if (allCustomers.length > 0) {
    const customersToInsert = allCustomers.map((customer: any) => ({
      store_id: storeId,
      shopify_customer_id: customer.id.toString(),
      email: customer.email || null,
      phone: customer.phone || null,
      first_name: customer.first_name || null,
      last_name: customer.last_name || null,
      orders_count: customer.orders_count || 0,
      total_spent: parseFloat(customer.total_spent || '0'),
      accepts_marketing: customer.accepts_marketing || false,
      accepts_marketing_updated_at: customer.accepts_marketing_updated_at || null,
      tags: customer.tags || null,
      note: customer.note || null,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    }));

    // Clear and insert
    await supabase.from('shopify_customers').delete().eq('store_id', storeId);

    for (let i = 0; i < customersToInsert.length; i += 100) {
      const batch = customersToInsert.slice(i, i + 100);
      const { error } = await supabase
        .from('shopify_customers')
        .insert(batch);
      
      if (error) {
        console.error(`[Shopify Sync] Error inserting customers batch:`, error.message);
      }
    }
  }

  return allCustomers.length;
}

// ============================================
// SYNC PRODUCTS
// ============================================
async function syncProducts(storeId: string, shopDomain: string, accessToken: string): Promise<number> {
  console.log(`\n[Shopify Sync] ========== STARTING PRODUCTS SYNC ==========`);
  
  let allProducts: any[] = [];
  let nextUrl: string | null = `/products.json?limit=250`;
  let pageCount = 0;
  const maxPages = 20;

  while (nextUrl && pageCount < maxPages) {
    pageCount++;
    const { data, nextPageUrl } = await shopifyFetch(shopDomain, accessToken, nextUrl);
    const products = data.products || [];
    
    if (products.length === 0) break;
    
    allProducts = [...allProducts, ...products];
    nextUrl = nextPageUrl;
    
    if (nextUrl) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  console.log(`[Shopify Sync] Fetched ${allProducts.length} products`);

  if (allProducts.length > 0) {
    const productsToInsert = allProducts.map((product: any) => {
      const firstVariant = product.variants?.[0] || {};
      const firstImage = product.images?.[0];
      
      return {
        store_id: storeId,
        shopify_product_id: product.id.toString(),
        title: product.title,
        handle: product.handle,
        product_type: product.product_type || null,
        vendor: product.vendor || null,
        status: product.status || 'active',
        price: parseFloat(firstVariant.price || '0'),
        compare_at_price: firstVariant.compare_at_price ? parseFloat(firstVariant.compare_at_price) : null,
        cost_per_item: firstVariant.cost ? parseFloat(firstVariant.cost) : 0,
        sku: firstVariant.sku || null,
        barcode: firstVariant.barcode || null,
        inventory_quantity: firstVariant.inventory_quantity || 0,
        image_url: firstImage?.src || null,
        images: product.images || [],
        variants: product.variants || [],
        created_at: product.created_at,
        updated_at: product.updated_at,
        published_at: product.published_at || null,
      };
    });

    // Clear and insert
    await supabase.from('shopify_products').delete().eq('store_id', storeId);

    for (let i = 0; i < productsToInsert.length; i += 100) {
      const batch = productsToInsert.slice(i, i + 100);
      const { error } = await supabase
        .from('shopify_products')
        .insert(batch);
      
      if (error) {
        console.error(`[Shopify Sync] Error inserting products batch:`, error.message);
      }
    }
  }

  return allProducts.length;
}

// ============================================
// MAIN SYNC ENDPOINT - POST
// ============================================
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json().catch(() => ({}));
    const { storeId, syncType = 'all' } = body;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[Shopify Sync] SYNC REQUEST STARTED`);
    console.log(`[Shopify Sync] Type: ${syncType}, StoreId: ${storeId || 'all'}`);
    console.log(`${'='.repeat(60)}\n`);

    // Get store(s) to sync
    let query = supabase
      .from('shopify_stores')
      .select('id, shop_domain, access_token, shop_name')
      .eq('is_active', true);
    
    if (storeId) {
      query = query.eq('id', storeId);
    }

    const { data: stores, error: storesError } = await query;

    if (storesError) {
      console.error('[Shopify Sync] Error fetching stores:', storesError);
      throw storesError;
    }
    
    if (!stores || stores.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma loja encontrada para sincronizar' },
        { status: 404 }
      );
    }

    console.log(`[Shopify Sync] Found ${stores.length} store(s) to sync`);

    const results = [];

    for (const store of stores) {
      const storeStartTime = Date.now();
      
      try {
        console.log(`\n[Shopify Sync] Processing store: ${store.shop_name} (${store.shop_domain})`);
        
        let ordersResult = { count: 0, revenue: 0, paidCount: 0 };
        let customersCount = 0;
        let productsCount = 0;

        // Sync based on type
        if (syncType === 'all' || syncType === 'orders') {
          ordersResult = await syncOrders(store.id, store.shop_domain, store.access_token);
        }

        if (syncType === 'all' || syncType === 'customers') {
          customersCount = await syncCustomers(store.id, store.shop_domain, store.access_token);
        }

        if (syncType === 'all' || syncType === 'products') {
          productsCount = await syncProducts(store.id, store.shop_domain, store.access_token);
        }

        // Update store stats
        const { error: updateError } = await supabase
          .from('shopify_stores')
          .update({
            total_orders: ordersResult.count,
            total_customers: customersCount,
            total_products: productsCount,
            total_revenue: ordersResult.revenue,
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', store.id);

        if (updateError) {
          console.error('[Shopify Sync] Error updating store stats:', updateError);
        }

        const storeTime = ((Date.now() - storeStartTime) / 1000).toFixed(1);
        
        results.push({
          storeId: store.id,
          storeName: store.shop_name,
          domain: store.shop_domain,
          success: true,
          orders: ordersResult.count,
          paidOrders: ordersResult.paidCount,
          customers: customersCount,
          products: productsCount,
          revenue: ordersResult.revenue,
          timeSeconds: parseFloat(storeTime),
        });

        console.log(`\n[Shopify Sync] ✅ Completed ${store.shop_name} in ${storeTime}s`);
        console.log(`[Shopify Sync] Orders: ${ordersResult.count} (${ordersResult.paidCount} paid)`);
        console.log(`[Shopify Sync] Revenue: R$ ${ordersResult.revenue.toFixed(2)}`);
        
      } catch (err: any) {
        console.error(`[Shopify Sync] ❌ Error syncing ${store.shop_domain}:`, err.message);
        results.push({
          storeId: store.id,
          storeName: store.shop_name,
          domain: store.shop_domain,
          success: false,
          error: err.message,
        });
      }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    const successCount = results.filter(r => r.success).length;
    const totalOrders = results.reduce((sum, r) => sum + (r.orders || 0), 0);
    const totalRevenue = results.reduce((sum, r) => sum + (r.revenue || 0), 0);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[Shopify Sync] SYNC COMPLETED`);
    console.log(`[Shopify Sync] Total time: ${totalTime}s`);
    console.log(`[Shopify Sync] Stores: ${successCount}/${stores.length} successful`);
    console.log(`[Shopify Sync] Total orders: ${totalOrders}`);
    console.log(`[Shopify Sync] Total revenue: R$ ${totalRevenue.toFixed(2)}`);
    console.log(`${'='.repeat(60)}\n`);

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída! ${totalOrders} pedidos importados.`,
      totalOrders,
      totalRevenue,
      timeSeconds: parseFloat(totalTime),
      results,
    });
    
  } catch (error: any) {
    console.error('[Shopify Sync] Fatal error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar' },
      { status: 500 }
    );
  }
}

// ============================================
// GET - Quick status / trigger sync
// ============================================
export async function GET(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get('storeId');
  const action = request.nextUrl.searchParams.get('action');
  
  try {
    // Get store(s)
    let query = supabase
      .from('shopify_stores')
      .select('id, shop_domain, access_token, shop_name, total_orders, total_revenue, last_sync_at')
      .eq('is_active', true);
    
    if (storeId) {
      query = query.eq('id', storeId);
    }

    const { data: stores, error: storesError } = await query;

    if (storesError) throw storesError;
    
    if (!stores || stores.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma loja encontrada' },
        { status: 404 }
      );
    }

    // If action=sync, do a full sync
    if (action === 'sync') {
      const results = [];
      
      for (const store of stores) {
        try {
          const ordersResult = await syncOrders(store.id, store.shop_domain, store.access_token);
          
          await supabase
            .from('shopify_stores')
            .update({
              total_orders: ordersResult.count,
              total_revenue: ordersResult.revenue,
              last_sync_at: new Date().toISOString(),
            })
            .eq('id', store.id);

          results.push({
            store: store.shop_name,
            orders: ordersResult.count,
            revenue: ordersResult.revenue,
            success: true,
          });
        } catch (err: any) {
          results.push({
            store: store.shop_name,
            error: err.message,
            success: false,
          });
        }
      }

      const totalOrders = results.reduce((sum, r) => sum + (r.orders || 0), 0);
      const totalRevenue = results.reduce((sum, r) => sum + (r.revenue || 0), 0);

      return NextResponse.json({
        success: true,
        message: `Sincronizados ${totalOrders} pedidos`,
        totalOrders,
        totalRevenue,
        results,
      });
    }

    // Otherwise just return status
    const storeStats = await Promise.all(stores.map(async (store) => {
      const { count: dbOrderCount } = await supabase
        .from('shopify_orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id);

      const { data: revenueData } = await supabase
        .from('shopify_orders')
        .select('total_price')
        .eq('store_id', store.id)
        .in('financial_status', ['paid', 'partially_paid']);

      const dbRevenue = (revenueData || []).reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0);

      return {
        id: store.id,
        name: store.shop_name,
        domain: store.shop_domain,
        ordersInDb: dbOrderCount || 0,
        revenueInDb: dbRevenue,
        lastSync: store.last_sync_at,
      };
    }));

    return NextResponse.json({
      success: true,
      stores: storeStats,
    });
    
  } catch (error: any) {
    console.error('[Shopify Sync] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro' },
      { status: 500 }
    );
  }
}
