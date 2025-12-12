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

// Helper to get date range from period
function getDateRange(period: string): { startDate: Date; endDate: Date } {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      const endYesterday = new Date(startDate);
      endYesterday.setHours(23, 59, 59, 999);
      return { startDate, endDate: endYesterday };
    case '7d':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '30d':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate: today };
}

// Helper to calculate percentage change
function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Format date for display
function formatDateLabel(date: Date): string {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') || '7d';
  const customStart = request.nextUrl.searchParams.get('startDate');
  const customEnd = request.nextUrl.searchParams.get('endDate');
  const storeId = request.nextUrl.searchParams.get('storeId');

  try {
    // Get date range
    let startDate: Date, endDate: Date;
    if (customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      ({ startDate, endDate } = getDateRange(range));
    }

    // Calculate previous period for comparison
    const periodMs = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime() - 1);
    const prevStartDate = new Date(prevEndDate.getTime() - periodMs);

    // Fetch Shopify stores
    const { data: stores } = await supabase
      .from('shopify_stores')
      .select('*')
      .eq('is_active', true);

    const hasStores = stores && stores.length > 0;

    // If no stores, return empty state
    if (!hasStores) {
      return NextResponse.json({
        metrics: null,
        chartData: [],
        stores: [],
        integrations: {
          shopify: false,
          klaviyo: false,
          meta: false,
          google: false,
          tiktok: false,
        },
      });
    }

    // Fetch orders for all stores in the period
    const storeIds = stores.map(s => s.id);
    const storeFilter = storeId || (storeIds.length > 0 ? storeIds : null);

    // Current period orders
    let ordersQuery = supabase
      .from('shopify_orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (storeFilter) {
      ordersQuery = Array.isArray(storeFilter) 
        ? ordersQuery.in('store_id', storeFilter)
        : ordersQuery.eq('store_id', storeFilter);
    }

    const { data: orders } = await ordersQuery;

    // Previous period orders
    let prevOrdersQuery = supabase
      .from('shopify_orders')
      .select('total_price, total_tax')
      .gte('created_at', prevStartDate.toISOString())
      .lte('created_at', prevEndDate.toISOString());
    
    if (storeFilter) {
      prevOrdersQuery = Array.isArray(storeFilter) 
        ? prevOrdersQuery.in('store_id', storeFilter)
        : prevOrdersQuery.eq('store_id', storeFilter);
    }

    const { data: prevOrders } = await prevOrdersQuery;

    // Calculate current period metrics
    const currentMetrics = (orders || []).reduce((acc, order) => {
      const totalPrice = parseFloat(order.total_price || '0');
      const totalTax = parseFloat(order.total_tax || '0');
      const subtotal = parseFloat(order.subtotal_price || '0');
      
      return {
        receita: acc.receita + totalPrice,
        impostos: acc.impostos + totalTax,
        pedidos: acc.pedidos + 1,
      };
    }, { receita: 0, impostos: 0, pedidos: 0 });

    // Calculate previous period metrics
    const prevMetrics = (prevOrders || []).reduce((acc, order) => {
      return {
        receita: acc.receita + parseFloat(order.total_price || '0'),
        impostos: acc.impostos + parseFloat(order.total_tax || '0'),
        pedidos: acc.pedidos + 1,
      };
    }, { receita: 0, impostos: 0, pedidos: 0 });

    // Fetch marketing spend (ads) for the period
    const [metaSpend, googleSpend, tiktokSpend] = await Promise.all([
      supabase.from('meta_insights').select('spend').gte('date', startDate.toISOString().split('T')[0]).lte('date', endDate.toISOString().split('T')[0]),
      supabase.from('google_ads_metrics').select('cost').gte('date', startDate.toISOString().split('T')[0]).lte('date', endDate.toISOString().split('T')[0]),
      supabase.from('tiktok_metrics').select('spend').gte('date', startDate.toISOString().split('T')[0]).lte('date', endDate.toISOString().split('T')[0]),
    ]);

    const totalMarketing = 
      (metaSpend.data || []).reduce((acc, m) => acc + parseFloat(m.spend || '0'), 0) +
      (googleSpend.data || []).reduce((acc, g) => acc + parseFloat(g.cost || '0'), 0) +
      (tiktokSpend.data || []).reduce((acc, t) => acc + parseFloat(t.spend || '0'), 0);

    // Estimate product costs (30% of revenue as placeholder)
    const custos = currentMetrics.receita * 0.30;
    const prevCustos = prevMetrics.receita * 0.30;

    // Calculate derived metrics
    const lucro = currentMetrics.receita - custos - totalMarketing - currentMetrics.impostos;
    const prevLucro = prevMetrics.receita - prevCustos - prevMetrics.impostos;
    const margem = currentMetrics.receita > 0 ? (lucro / currentMetrics.receita) * 100 : 0;
    const prevMargem = prevMetrics.receita > 0 ? (prevLucro / prevMetrics.receita) * 100 : 0;
    const ticketMedio = currentMetrics.pedidos > 0 ? currentMetrics.receita / currentMetrics.pedidos : 0;
    const prevTicketMedio = prevMetrics.pedidos > 0 ? prevMetrics.receita / prevMetrics.pedidos : 0;

    // Build chart data (daily breakdown)
    const chartData: any[] = [];
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + dayMs)) {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = (orders || []).filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });

      const dayReceita = dayOrders.reduce((acc, o) => acc + parseFloat(o.total_price || '0'), 0);
      const dayImpostos = dayOrders.reduce((acc, o) => acc + parseFloat(o.total_tax || '0'), 0);
      const dayCustos = dayReceita * 0.30;
      const dayMarketing = totalMarketing / Math.ceil((endDate.getTime() - startDate.getTime()) / dayMs);
      const dayLucro = dayReceita - dayCustos - dayMarketing - dayImpostos;

      chartData.push({
        date: formatDateLabel(d),
        receita: dayReceita,
        custos: dayCustos,
        marketing: dayMarketing,
        impostos: dayImpostos,
        lucro: Math.max(0, dayLucro),
      });
    }

    // Build stores data
    const storesData = stores.map(store => {
      const storeOrders = (orders || []).filter(o => o.store_id === store.id);
      const storeReceita = storeOrders.reduce((acc, o) => acc + parseFloat(o.total_price || '0'), 0);
      const storeCustos = storeReceita * 0.30 + (totalMarketing / stores.length);
      const storeLucro = storeReceita - storeCustos;
      
      return {
        id: store.id,
        name: store.shop_name,
        domain: store.shop_domain,
        pedidos: storeOrders.length,
        receita: storeReceita,
        custos: storeCustos,
        lucro: storeLucro,
        margem: storeReceita > 0 ? (storeLucro / storeReceita) * 100 : 0,
      };
    });

    // Check integration status
    const integrations = {
      shopify: hasStores,
      klaviyo: false, // TODO: Check actual connection
      meta: (metaSpend.data || []).length > 0,
      google: (googleSpend.data || []).length > 0,
      tiktok: (tiktokSpend.data || []).length > 0,
    };

    return NextResponse.json({
      metrics: {
        receita: currentMetrics.receita,
        receitaChange: calcChange(currentMetrics.receita, prevMetrics.receita),
        custos,
        custosChange: calcChange(custos, prevCustos),
        marketing: totalMarketing,
        marketingChange: 0, // TODO: Calculate previous period marketing
        impostos: currentMetrics.impostos,
        impostosChange: calcChange(currentMetrics.impostos, prevMetrics.impostos),
        margem,
        margemChange: margem - prevMargem,
        lucro,
        lucroChange: calcChange(lucro, prevLucro),
        pedidos: currentMetrics.pedidos,
        pedidosChange: calcChange(currentMetrics.pedidos, prevMetrics.pedidos),
        ticketMedio,
        ticketMedioChange: calcChange(ticketMedio, prevTicketMedio),
      },
      chartData,
      stores: storesData,
      integrations,
    });
  } catch (error: any) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch metrics',
      metrics: null,
      chartData: [],
      stores: [],
      integrations: {
        shopify: false,
        klaviyo: false,
        meta: false,
        google: false,
        tiktok: false,
      },
    }, { status: 500 });
  }
}
