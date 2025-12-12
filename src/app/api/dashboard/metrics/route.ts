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
    case '90d':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 89);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'all':
      // All time - start from 10 years ago
      startDate = new Date(today);
      startDate.setFullYear(startDate.getFullYear() - 10);
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
  const debug = request.nextUrl.searchParams.get('debug') === 'true';

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

    console.log(`[Dashboard] Range: ${range}`);
    console.log(`[Dashboard] Current period: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    console.log(`[Dashboard] Previous period: ${prevStartDate.toISOString()} to ${prevEndDate.toISOString()}`);

    // Fetch Shopify stores
    const { data: stores } = await supabase
      .from('shopify_stores')
      .select('*')
      .eq('is_active', true);

    const hasStores = stores && stores.length > 0;

    // Check Klaviyo connection
    const { data: klaviyoAccount } = await supabase
      .from('klaviyo_accounts')
      .select('id, is_active')
      .eq('is_active', true)
      .limit(1)
      .single();
    
    const hasKlaviyo = !!klaviyoAccount;

    // If no stores, return empty state
    if (!hasStores) {
      return NextResponse.json({
        metrics: null,
        chartData: [],
        stores: [],
        integrations: {
          shopify: false,
          klaviyo: hasKlaviyo,
          meta: false,
          google: false,
          tiktok: false,
        },
      });
    }

    // Fetch orders for all stores in the period
    const storeIds = stores.map(s => s.id);
    const storeFilter = storeId || (storeIds.length > 0 ? storeIds : null);

    // ============================================
    // FETCH ALL ORDERS (no date filter for totals)
    // ============================================
    let allOrdersQuery = supabase
      .from('shopify_orders')
      .select('*');
    
    if (storeFilter) {
      allOrdersQuery = Array.isArray(storeFilter) 
        ? allOrdersQuery.in('store_id', storeFilter)
        : allOrdersQuery.eq('store_id', storeFilter);
    }

    const { data: allOrders, error: allOrdersError } = await allOrdersQuery;
    
    if (allOrdersError) {
      console.error('[Dashboard] Error fetching all orders:', allOrdersError);
    }

    // Calculate total historical metrics (all time)
    const totalHistorico = {
      pedidos: (allOrders || []).length,
      receita: 0,
      paidOrders: 0,
    };

    (allOrders || []).forEach(order => {
      if (['paid', 'partially_paid'].includes(order.financial_status)) {
        totalHistorico.receita += parseFloat(order.total_price || '0');
        totalHistorico.paidOrders++;
      }
    });

    console.log(`[Dashboard] Total histórico: ${totalHistorico.pedidos} pedidos, R$ ${totalHistorico.receita.toFixed(2)} receita`);

    // ============================================
    // FETCH PERIOD ORDERS (with date filter)
    // ============================================
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
      .select('total_price, total_tax, financial_status')
      .gte('created_at', prevStartDate.toISOString())
      .lte('created_at', prevEndDate.toISOString());
    
    if (storeFilter) {
      prevOrdersQuery = Array.isArray(storeFilter) 
        ? prevOrdersQuery.in('store_id', storeFilter)
        : prevOrdersQuery.eq('store_id', storeFilter);
    }

    const { data: prevOrders } = await prevOrdersQuery;

    console.log(`[Dashboard] Current period orders: ${(orders || []).length}`);
    console.log(`[Dashboard] Previous period orders: ${(prevOrders || []).length}`);

    // Calculate current period metrics (ONLY PAID ORDERS)
    const currentMetrics = (orders || []).reduce((acc, order) => {
      const isPaid = ['paid', 'partially_paid'].includes(order.financial_status);
      const totalPrice = parseFloat(order.total_price || '0');
      const totalTax = parseFloat(order.total_tax || '0');
      
      return {
        receita: acc.receita + (isPaid ? totalPrice : 0),
        impostos: acc.impostos + (isPaid ? totalTax : 0),
        pedidos: acc.pedidos + 1,
        pedidosPagos: acc.pedidosPagos + (isPaid ? 1 : 0),
      };
    }, { receita: 0, impostos: 0, pedidos: 0, pedidosPagos: 0 });

    // Calculate previous period metrics
    const prevMetrics = (prevOrders || []).reduce((acc, order) => {
      const isPaid = ['paid', 'partially_paid'].includes(order.financial_status);
      return {
        receita: acc.receita + (isPaid ? parseFloat(order.total_price || '0') : 0),
        impostos: acc.impostos + (isPaid ? parseFloat(order.total_tax || '0') : 0),
        pedidos: acc.pedidos + 1,
      };
    }, { receita: 0, impostos: 0, pedidos: 0 });

    console.log(`[Dashboard] Current: R$ ${currentMetrics.receita.toFixed(2)} (${currentMetrics.pedidosPagos} paid orders)`);
    console.log(`[Dashboard] Previous: R$ ${prevMetrics.receita.toFixed(2)}`);

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
    const ticketMedio = currentMetrics.pedidosPagos > 0 ? currentMetrics.receita / currentMetrics.pedidosPagos : 0;
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

      // Only count paid orders for revenue
      const paidDayOrders = dayOrders.filter(o => ['paid', 'partially_paid'].includes(o.financial_status));
      const dayReceita = paidDayOrders.reduce((acc, o) => acc + parseFloat(o.total_price || '0'), 0);
      const dayImpostos = paidDayOrders.reduce((acc, o) => acc + parseFloat(o.total_tax || '0'), 0);
      const dayCustos = dayReceita * 0.30;
      const numDays = Math.ceil((endDate.getTime() - startDate.getTime()) / dayMs);
      const dayMarketing = totalMarketing / Math.max(numDays, 1);
      const dayLucro = dayReceita - dayCustos - dayMarketing - dayImpostos;

      chartData.push({
        date: formatDateLabel(d),
        receita: dayReceita,
        custos: dayCustos,
        marketing: dayMarketing,
        impostos: dayImpostos,
        lucro: Math.max(0, dayLucro),
        pedidos: dayOrders.length,
        pedidosPagos: paidDayOrders.length,
      });
    }

    // Build stores data
    const storesData = stores.map(store => {
      const storeOrders = (orders || []).filter(o => o.store_id === store.id);
      const paidStoreOrders = storeOrders.filter(o => ['paid', 'partially_paid'].includes(o.financial_status));
      const storeReceita = paidStoreOrders.reduce((acc, o) => acc + parseFloat(o.total_price || '0'), 0);
      const storeCustos = storeReceita * 0.30 + (totalMarketing / stores.length);
      const storeLucro = storeReceita - storeCustos;
      
      return {
        id: store.id,
        name: store.shop_name,
        domain: store.shop_domain,
        pedidos: storeOrders.length,
        pedidosPagos: paidStoreOrders.length,
        receita: storeReceita,
        custos: storeCustos,
        lucro: storeLucro,
        margem: storeReceita > 0 ? (storeLucro / storeReceita) * 100 : 0,
        lastSync: store.last_sync_at,
      };
    });

    // Check integration status
    const integrations = {
      shopify: hasStores,
      klaviyo: hasKlaviyo,
      meta: (metaSpend.data || []).length > 0,
      google: (googleSpend.data || []).length > 0,
      tiktok: (tiktokSpend.data || []).length > 0,
    };

    // Build response
    const response: any = {
      metrics: {
        receita: currentMetrics.receita,
        receitaChange: calcChange(currentMetrics.receita, prevMetrics.receita),
        custos,
        custosChange: calcChange(custos, prevCustos),
        marketing: totalMarketing,
        marketingChange: 0,
        impostos: currentMetrics.impostos,
        impostosChange: calcChange(currentMetrics.impostos, prevMetrics.impostos),
        margem,
        margemChange: margem - prevMargem,
        lucro,
        lucroChange: calcChange(lucro, prevLucro),
        pedidos: currentMetrics.pedidos,
        pedidosPagos: currentMetrics.pedidosPagos,
        pedidosChange: calcChange(currentMetrics.pedidos, prevMetrics.pedidos),
        ticketMedio,
        ticketMedioChange: calcChange(ticketMedio, prevTicketMedio),
      },
      // Total histórico (all time)
      totals: {
        pedidos: totalHistorico.pedidos,
        pedidosPagos: totalHistorico.paidOrders,
        receita: totalHistorico.receita,
      },
      chartData,
      stores: storesData,
      integrations,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        range,
      },
    };

    // Add debug info if requested
    if (debug) {
      const sampleOrders = (allOrders || []).slice(0, 5).map(o => ({
        id: o.shopify_order_id,
        name: o.name,
        total_price: o.total_price,
        financial_status: o.financial_status,
        created_at: o.created_at,
      }));

      const statusCounts: Record<string, number> = {};
      (allOrders || []).forEach(o => {
        statusCounts[o.financial_status || 'unknown'] = (statusCounts[o.financial_status || 'unknown'] || 0) + 1;
      });

      response.debug = {
        totalOrdersInDb: (allOrders || []).length,
        ordersInPeriod: (orders || []).length,
        statusBreakdown: statusCounts,
        sampleOrders,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      };
    }

    return NextResponse.json(response);
    
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
