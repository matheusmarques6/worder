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

// Connect store via Access Token (custom app method)
export async function POST(request: NextRequest) {
  try {
    const { name, domain, accessToken, organizationId } = await request.json();

    if (!name || !domain || !accessToken) {
      return NextResponse.json(
        { error: 'Nome, domínio e access token são obrigatórios' },
        { status: 400 }
      );
    }

    // Format domain
    const shopDomain = domain.includes('.myshopify.com') 
      ? domain 
      : `${domain}.myshopify.com`;

    // Verify access token by fetching shop info
    const shopResponse = await fetch(
      `https://${shopDomain}/admin/api/2024-01/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!shopResponse.ok) {
      const errorData = await shopResponse.json().catch(() => ({}));
      if (shopResponse.status === 401) {
        return NextResponse.json(
          { error: 'Access Token inválido. Verifique e tente novamente.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Não foi possível conectar à loja. Verifique o domínio e o token.' },
        { status: 400 }
      );
    }

    const { shop: shopData } = await shopResponse.json();

    // Get organization ID from session or use provided
    // In production, get this from authenticated user session
    const orgId = organizationId || 'demo-org-id';

    // Check if store already exists
    const { data: existingStore } = await supabase
      .from('shopify_stores')
      .select('id')
      .eq('shop_domain', shopDomain)
      .single();

    if (existingStore) {
      // Update existing store
      const { error: updateError } = await supabase
        .from('shopify_stores')
        .update({
          shop_name: name,
          access_token: accessToken,
          shop_email: shopData.email,
          currency: shopData.currency,
          timezone: shopData.timezone,
          is_active: true,
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', existingStore.id);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: 'Loja atualizada com sucesso',
        store: {
          id: existingStore.id,
          name,
          domain: shopDomain,
        },
      });
    }

    // Create new store
    const { data: newStore, error: insertError } = await supabase
      .from('shopify_stores')
      .insert({
        organization_id: orgId,
        shop_domain: shopDomain,
        shop_name: name,
        shop_email: shopData.email,
        access_token: accessToken,
        currency: shopData.currency,
        timezone: shopData.timezone,
        is_active: true,
        last_sync_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Trigger initial data sync (async)
    syncStoreData(newStore.id, shopDomain, accessToken).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Loja conectada com sucesso',
      store: {
        id: newStore.id,
        name: newStore.shop_name,
        domain: newStore.shop_domain,
      },
    });
  } catch (error: any) {
    console.error('Connect store error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao conectar loja' },
      { status: 500 }
    );
  }
}

// GET - List stores for organization
export async function GET(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get('organizationId');

  if (!organizationId) {
    return NextResponse.json(
      { error: 'Organization ID required' },
      { status: 400 }
    );
  }

  try {
    const { data: stores, error } = await supabase
      .from('shopify_stores')
      .select('id, shop_name, shop_domain, shop_email, currency, is_active, total_orders, total_revenue, last_sync_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      stores: stores?.map(s => ({
        id: s.id,
        name: s.shop_name,
        domain: s.shop_domain,
        email: s.shop_email,
        currency: s.currency,
        isActive: s.is_active,
        totalOrders: s.total_orders,
        totalRevenue: s.total_revenue,
        lastSyncAt: s.last_sync_at,
      })) || [],
    });
  } catch (error: any) {
    console.error('List stores error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar lojas' },
      { status: 500 }
    );
  }
}

// Sync store data (orders, products, customers)
async function syncStoreData(storeId: string, shopDomain: string, accessToken: string) {
  try {
    // Fetch recent orders
    const ordersResponse = await fetch(
      `https://${shopDomain}/admin/api/2024-01/orders.json?status=any&limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (ordersResponse.ok) {
      const { orders } = await ordersResponse.json();
      
      // Calculate totals
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, order: any) => 
        sum + parseFloat(order.total_price || '0'), 0
      );

      // Update store stats
      await supabase
        .from('shopify_stores')
        .update({
          total_orders: totalOrders,
          total_revenue: totalRevenue,
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', storeId);
    }
  } catch (error) {
    console.error('Sync store data error:', error);
  }
}
