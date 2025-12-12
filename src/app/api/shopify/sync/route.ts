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

const SHOPIFY_API_VERSION = '2024-01';

// Shopify API helper with rate limiting
async function shopifyFetch(shopDomain: string, accessToken: string, endpoint: string) {
  const response = await fetch(
    `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}${endpoint}`,
    {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Shopify API error (${response.status}): ${error}`);
  }

  return response.json();
}

// Sync all orders (with pagination)
async function syncOrders(storeId: string, shopDomain: string, accessToken: string): Promise<number> {
  console.log(`[Shopify Sync] Starting orders sync for ${shopDomain}...`);
  
  let allOrders: any[] = [];
  let pageInfo: string | null = null;
  let pageCount = 0;
  const maxPages = 20; // Max 5000 orders (250 per page)

  do {
    let endpoint = '/orders.json?status=any&limit=250';
    if (pageInfo) {
      endpoint = `/orders.json?limit=250&page_info=${pageInfo}`;
    }

    const response = await shopifyFetch(shopDomain, accessToken, endpoint);
    const orders = response.orders || [];
    allOrders = [...allOrders, ...orders];
    pageCount++;

    // Check for next page using Link header pattern
    // Shopify returns pagination info in the response
    if (orders.length === 250 && pageCount < maxPages) {
      // Get next page cursor - Shopify uses cursor-based pagination
      // For simplicity, we'll use created_at_min for pagination
      const lastOrder = orders[orders.length - 1];
      if (lastOrder) {
        const lastCreatedAt = new Date(lastOrder.created_at);
        lastCreatedAt.setMilliseconds(lastCreatedAt.getMilliseconds() + 1);
        endpoint = `/orders.json?status=any&limit=250&created_at_max=${lastOrder.created_at}`;
        
        const nextResponse = await shopifyFetch(shopDomain, accessToken, endpoint);
        if (nextResponse.orders && nextResponse.orders.length > 0) {
          allOrders = [...allOrders, ...nextResponse.orders];
          pageCount++;
        } else {
          break;
        }
      } else {
        break;
      }
    } else {
      break;
    }
  } while (pageCount < maxPages);

  console.log(`[Shopify Sync] Fetched ${allOrders.length} orders`);

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

    // Insert in batches of 100
    for (let i = 0; i < ordersToInsert.length; i += 100) {
      const batch = ordersToInsert.slice(i, i + 100);
      const { error } = await supabase
        .from('shopify_orders')
        .upsert(batch, { 
          onConflict: 'store_id,shopify_order_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`[Shopify Sync] Error inserting orders batch ${i/100 + 1}:`, error.message);
      }
    }

    console.log(`[Shopify Sync] Saved ${ordersToInsert.length} orders to database`);
  }

  return allOrders.length;
}

// Sync all customers
async function syncCustomers(storeId: string, shopDomain: string, accessToken: string): Promise<number> {
  console.log(`[Shopify Sync] Starting customers sync for ${shopDomain}...`);
  
  let allCustomers: any[] = [];
  let sinceId: string | null = null;
  let pageCount = 0;
  const maxPages = 20;

  do {
    let endpoint = '/customers.json?limit=250';
    if (sinceId) {
      endpoint += `&since_id=${sinceId}`;
    }

    const response = await shopifyFetch(shopDomain, accessToken, endpoint);
    const customers = response.customers || [];
    
    if (customers.length === 0) break;
    
    allCustomers = [...allCustomers, ...customers];
    sinceId = customers[customers.length - 1]?.id?.toString();
    pageCount++;
  } while (pageCount < maxPages);

  console.log(`[Shopify Sync] Fetched ${allCustomers.length} customers`);

  // Save customers to database
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

    // Insert in batches
    for (let i = 0; i < customersToInsert.length; i += 100) {
      const batch = customersToInsert.slice(i, i + 100);
      const { error } = await supabase
        .from('shopify_customers')
        .upsert(batch, { 
          onConflict: 'store_id,shopify_customer_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`[Shopify Sync] Error inserting customers batch:`, error.message);
      }
    }

    console.log(`[Shopify Sync] Saved ${customersToInsert.length} customers to database`);
  }

  return allCustomers.length;
}

// Sync all products
async function syncProducts(storeId: string, shopDomain: string, accessToken: string): Promise<number> {
  console.log(`[Shopify Sync] Starting products sync for ${shopDomain}...`);
  
  let allProducts: any[] = [];
  let sinceId: string | null = null;
  let pageCount = 0;
  const maxPages = 20;

  do {
    let endpoint = '/products.json?limit=250';
    if (sinceId) {
      endpoint += `&since_id=${sinceId}`;
    }

    const response = await shopifyFetch(shopDomain, accessToken, endpoint);
    const products = response.products || [];
    
    if (products.length === 0) break;
    
    allProducts = [...allProducts, ...products];
    sinceId = products[products.length - 1]?.id?.toString();
    pageCount++;
  } while (pageCount < maxPages);

  console.log(`[Shopify Sync] Fetched ${allProducts.length} products`);

  // Save products to database
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
        cost_per_item: firstVariant.inventory_item?.cost ? parseFloat(firstVariant.inventory_item.cost) : 0,
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

    // Insert in batches
    for (let i = 0; i < productsToInsert.length; i += 100) {
      const batch = productsToInsert.slice(i, i + 100);
      const { error } = await supabase
        .from('shopify_products')
        .upsert(batch, { 
          onConflict: 'store_id,shopify_product_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`[Shopify Sync] Error inserting products batch:`, error.message);
      }
    }

    console.log(`[Shopify Sync] Saved ${productsToInsert.length} products to database`);
  }

  return allProducts.length;
}

// Get counts from Shopify API
async function getCounts(shopDomain: string, accessToken: string) {
  const [ordersCount, customersCount, productsCount] = await Promise.all([
    shopifyFetch(shopDomain, accessToken, '/orders/count.json?status=any').then(r => r.count).catch(() => 0),
    shopifyFetch(shopDomain, accessToken, '/customers/count.json').then(r => r.count).catch(() => 0),
    shopifyFetch(shopDomain, accessToken, '/products/count.json').then(r => r.count).catch(() => 0),
  ]);

  return { ordersCount, customersCount, productsCount };
}

// Main sync endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, syncType = 'all' } = body;

    // Get store(s) to sync
    let query = supabase
      .from('shopify_stores')
      .select('id, shop_domain, access_token, shop_name')
      .eq('is_active', true);
    
    if (storeId) {
      query = query.eq('id', storeId);
    }

    const { data: stores, error: storesError } = await query;

    if (storesError) throw storesError;
    
    if (!stores || stores.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma loja encontrada para sincronizar' },
        { status: 404 }
      );
    }

    const results = [];

    for (const store of stores) {
      try {
        console.log(`[Shopify Sync] Starting full sync for ${store.shop_name} (${store.shop_domain})...`);
        
        let ordersCount = 0;
        let customersCount = 0;
        let productsCount = 0;
        let totalRevenue = 0;

        // Sync based on type
        if (syncType === 'all' || syncType === 'orders') {
          ordersCount = await syncOrders(store.id, store.shop_domain, store.access_token);
          
          // Calculate total revenue from synced orders
          const { data: revenueData } = await supabase
            .from('shopify_orders')
            .select('total_price')
            .eq('store_id', store.id)
            .in('financial_status', ['paid', 'partially_paid', 'partially_refunded']);
          
          totalRevenue = (revenueData || []).reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0);
        }

        if (syncType === 'all' || syncType === 'customers') {
          customersCount = await syncCustomers(store.id, store.shop_domain, store.access_token);
        }

        if (syncType === 'all' || syncType === 'products') {
          productsCount = await syncProducts(store.id, store.shop_domain, store.access_token);
        }

        // Update store stats
        await supabase
          .from('shopify_stores')
          .update({
            total_orders: ordersCount,
            total_customers: customersCount,
            total_products: productsCount,
            total_revenue: totalRevenue,
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', store.id);

        results.push({
          storeId: store.id,
          storeName: store.shop_name,
          domain: store.shop_domain,
          success: true,
          orders: ordersCount,
          customers: customersCount,
          products: productsCount,
          revenue: totalRevenue,
        });

        console.log(`[Shopify Sync] Completed sync for ${store.shop_name}: ${ordersCount} orders, ${customersCount} customers, ${productsCount} products`);
      } catch (err: any) {
        console.error(`[Shopify Sync] Error syncing ${store.shop_domain}:`, err.message);
        results.push({
          storeId: store.id,
          storeName: store.shop_name,
          domain: store.shop_domain,
          success: false,
          error: err.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalOrders = results.reduce((sum, r) => sum + (r.orders || 0), 0);

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída para ${successCount}/${stores.length} loja(s)`,
      totalOrders,
      results,
    });
  } catch (error: any) {
    console.error('[Shopify Sync] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar' },
      { status: 500 }
    );
  }
}

// GET - Quick sync / status check
export async function GET(request: NextRequest) {
  const storeId = request.nextUrl.searchParams.get('storeId');
  
  try {
    // Get store(s)
    let query = supabase
      .from('shopify_stores')
      .select('id, shop_domain, access_token, shop_name')
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

    // Sync all stores
    let totalOrders = 0;
    let totalRevenue = 0;
    const results = [];

    for (const store of stores) {
      try {
        // Sync orders
        const ordersCount = await syncOrders(store.id, store.shop_domain, store.access_token);
        
        // Calculate revenue
        const { data: revenueData } = await supabase
          .from('shopify_orders')
          .select('total_price')
          .eq('store_id', store.id)
          .in('financial_status', ['paid', 'partially_paid', 'partially_refunded']);
        
        const storeRevenue = (revenueData || []).reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0);

        // Update store
        await supabase
          .from('shopify_stores')
          .update({
            total_orders: ordersCount,
            total_revenue: storeRevenue,
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', store.id);

        totalOrders += ordersCount;
        totalRevenue += storeRevenue;
        
        results.push({
          store: store.shop_name,
          orders: ordersCount,
          revenue: storeRevenue,
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

    return NextResponse.json({
      success: true,
      message: `Sincronizados ${totalOrders} pedidos de ${stores.length} loja(s)`,
      totalOrders,
      totalRevenue,
      results,
    });
  } catch (error: any) {
    console.error('[Shopify Sync] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar' },
      { status: 500 }
    );
  }
}
