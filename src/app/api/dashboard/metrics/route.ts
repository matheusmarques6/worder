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
function getDateRange(period: string): { startDate: string; endDate: string } {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  let startDate: string;

  switch (period) {
    case 'today':
      startDate = endDate;
      break;
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = yesterday.toISOString().split('T')[0];
      break;
    case '7d':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      break;
    case '30d':
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      startDate = monthAgo.toISOString().split('T')[0];
      break;
    case 'mtd': // Month to date
      startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
      break;
    case 'ytd': // Year to date
      startDate = `${today.getFullYear()}-01-01`;
      break;
    default:
      const defaultStart = new Date(today);
      defaultStart.setDate(defaultStart.getDate() - 7);
      startDate = defaultStart.toISOString().split('T')[0];
  }

  return { startDate, endDate };
}

// Helper to calculate percentage change
function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function GET(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get('organizationId');
  const period = request.nextUrl.searchParams.get('period') || '7d';
  const customStart = request.nextUrl.searchParams.get('startDate');
  const customEnd = request.nextUrl.searchParams.get('endDate');

  if (!organizationId) {
    return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
  }

  try {
    // Get date range
    let startDate: string, endDate: string;
    if (customStart && customEnd) {
      startDate = customStart;
      endDate = customEnd;
    } else {
      ({ startDate, endDate } = getDateRange(period));
    }

    // Calculate previous period for comparison
    const currentDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - currentDays + 1);

    // Fetch all metrics in parallel
    const [
      metaMetrics,
      googleMetrics,
      tiktokMetrics,
      shopifyStores,
      klaviyoCampaigns,
      prevMetaMetrics,
      prevGoogleMetrics,
      prevTiktokMetrics,
    ] = await Promise.all([
      // Current period
      supabase
        .from('meta_insights')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('level', 'account')
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('google_ads_metrics')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('level', 'account')
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('tiktok_metrics')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('level', 'advertiser')
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('shopify_stores')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true),
      supabase
        .from('campaign_metrics')
        .select('*')
        .eq('organization_id', organizationId)
        .order('revenue', { ascending: false })
        .limit(10),
      // Previous period for comparison
      supabase
        .from('meta_insights')
        .select('spend')
        .eq('organization_id', organizationId)
        .eq('level', 'account')
        .gte('date', prevStartDate.toISOString().split('T')[0])
        .lte('date', prevEndDate.toISOString().split('T')[0]),
      supabase
        .from('google_ads_metrics')
        .select('cost')
        .eq('organization_id', organizationId)
        .eq('level', 'account')
        .gte('date', prevStartDate.toISOString().split('T')[0])
        .lte('date', prevEndDate.toISOString().split('T')[0]),
      supabase
        .from('tiktok_metrics')
        .select('spend')
        .eq('organization_id', organizationId)
        .eq('level', 'advertiser')
        .gte('date', prevStartDate.toISOString().split('T')[0])
        .lte('date', prevEndDate.toISOString().split('T')[0]),
    ]);

    // Aggregate Meta metrics
    const meta = (metaMetrics.data || []).reduce((acc, m) => ({
      spend: acc.spend + parseFloat(m.spend || '0'),
      impressions: acc.impressions + (m.impressions || 0),
      clicks: acc.clicks + (m.clicks || 0),
      conversions: acc.conversions + (m.conversions || 0),
      conversionValue: acc.conversionValue + parseFloat(m.conversion_value || '0'),
    }), { spend: 0, impressions: 0, clicks: 0, conversions: 0, conversionValue: 0 });

    const prevMetaSpend = (prevMetaMetrics.data || []).reduce((acc, m) => acc + parseFloat(m.spend || '0'), 0);

    // Aggregate Google metrics
    const google = (googleMetrics.data || []).reduce((acc, m) => ({
      spend: acc.spend + parseFloat(m.cost || '0'),
      impressions: acc.impressions + (m.impressions || 0),
      clicks: acc.clicks + (m.clicks || 0),
      conversions: acc.conversions + parseFloat(m.conversions || '0'),
      conversionValue: acc.conversionValue + parseFloat(m.conversions_value || '0'),
    }), { spend: 0, impressions: 0, clicks: 0, conversions: 0, conversionValue: 0 });

    const prevGoogleSpend = (prevGoogleMetrics.data || []).reduce((acc, m) => acc + parseFloat(m.cost || '0'), 0);

    // Aggregate TikTok metrics
    const tiktok = (tiktokMetrics.data || []).reduce((acc, m) => ({
      spend: acc.spend + parseFloat(m.spend || '0'),
      impressions: acc.impressions + (m.impressions || 0),
      clicks: acc.clicks + (m.clicks || 0),
      conversions: acc.conversions + (m.conversions || 0),
      conversionValue: acc.conversionValue + parseFloat(m.conversion_value || '0'),
      videoViews: acc.videoViews + (m.video_views || 0),
    }), { spend: 0, impressions: 0, clicks: 0, conversions: 0, conversionValue: 0, videoViews: 0 });

    const prevTiktokSpend = (prevTiktokMetrics.data || []).reduce((acc, m) => acc + parseFloat(m.spend || '0'), 0);

    // Calculate totals
    const totalSpend = meta.spend + google.spend + tiktok.spend;
    const prevTotalSpend = prevMetaSpend + prevGoogleSpend + prevTiktokSpend;
    const totalConversions = meta.conversions + google.conversions + tiktok.conversions;
    const totalConversionValue = meta.conversionValue + google.conversionValue + tiktok.conversionValue;
    const totalClicks = meta.clicks + google.clicks + tiktok.clicks;
    const totalImpressions = meta.impressions + google.impressions + tiktok.impressions;

    // Build daily data for charts
    const dailyData = buildDailyData(
      metaMetrics.data || [],
      googleMetrics.data || [],
      tiktokMetrics.data || [],
      startDate,
      endDate
    );

    // Top campaigns from Klaviyo
    const topCampaigns = (klaviyoCampaigns.data || []).map(c => ({
      id: c.id,
      name: c.name,
      sent: c.recipients || 0,
      opens: c.opened || 0,
      clicks: c.clicked || 0,
      revenue: c.revenue || 0,
      openRate: c.recipients > 0 ? (c.opened / c.recipients) * 100 : 0,
      clickRate: c.recipients > 0 ? (c.clicked / c.recipients) * 100 : 0,
    }));

    // Response
    const response = {
      period: { startDate, endDate },
      
      // Summary KPIs
      summary: {
        totalSpend,
        totalSpendChange: calcChange(totalSpend, prevTotalSpend),
        totalConversions,
        totalConversionValue,
        cpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
        roas: totalSpend > 0 ? totalConversionValue / totalSpend : 0,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      },

      // Per-platform breakdown
      platforms: {
        meta: {
          spend: meta.spend,
          spendChange: calcChange(meta.spend, prevMetaSpend),
          impressions: meta.impressions,
          clicks: meta.clicks,
          conversions: meta.conversions,
          conversionValue: meta.conversionValue,
          cpa: meta.conversions > 0 ? meta.spend / meta.conversions : 0,
          roas: meta.spend > 0 ? meta.conversionValue / meta.spend : 0,
          ctr: meta.impressions > 0 ? (meta.clicks / meta.impressions) * 100 : 0,
        },
        google: {
          spend: google.spend,
          spendChange: calcChange(google.spend, prevGoogleSpend),
          impressions: google.impressions,
          clicks: google.clicks,
          conversions: google.conversions,
          conversionValue: google.conversionValue,
          cpa: google.conversions > 0 ? google.spend / google.conversions : 0,
          roas: google.spend > 0 ? google.conversionValue / google.spend : 0,
          ctr: google.impressions > 0 ? (google.clicks / google.impressions) * 100 : 0,
        },
        tiktok: {
          spend: tiktok.spend,
          spendChange: calcChange(tiktok.spend, prevTiktokSpend),
          impressions: tiktok.impressions,
          clicks: tiktok.clicks,
          conversions: tiktok.conversions,
          conversionValue: tiktok.conversionValue,
          videoViews: tiktok.videoViews,
          cpa: tiktok.conversions > 0 ? tiktok.spend / tiktok.conversions : 0,
          roas: tiktok.spend > 0 ? tiktok.conversionValue / tiktok.spend : 0,
          ctr: tiktok.impressions > 0 ? (tiktok.clicks / tiktok.impressions) * 100 : 0,
        },
      },

      // Spend distribution for pie chart
      spendDistribution: [
        { name: 'Facebook Ads', value: meta.spend, color: '#1877F2' },
        { name: 'Google Ads', value: google.spend, color: '#EA4335' },
        { name: 'TikTok Ads', value: tiktok.spend, color: '#000000' },
      ],

      // Daily data for charts
      dailyData,

      // Top campaigns
      topCampaigns,

      // Connected stores
      stores: (shopifyStores.data || []).map(s => ({
        id: s.id,
        name: s.shop_name,
        domain: s.shop_domain,
        totalOrders: s.total_orders,
        totalRevenue: s.total_revenue,
      })),

      // Integration status
      integrations: {
        shopify: (shopifyStores.data || []).length > 0,
        klaviyo: (klaviyoCampaigns.data || []).length > 0,
        meta: (metaMetrics.data || []).length > 0,
        google: (googleMetrics.data || []).length > 0,
        tiktok: (tiktokMetrics.data || []).length > 0,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch metrics' }, { status: 500 });
  }
}

// Build daily data combining all platforms
function buildDailyData(
  metaData: any[],
  googleData: any[],
  tiktokData: any[],
  startDate: string,
  endDate: string
) {
  const dailyMap: Record<string, any> = {};

  // Initialize all days
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dailyMap[dateStr] = {
      date: dateStr,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      meta: 0,
      google: 0,
      tiktok: 0,
      total: 0,
    };
  }

  // Add Meta data
  for (const m of metaData) {
    if (dailyMap[m.date]) {
      dailyMap[m.date].meta += parseFloat(m.spend || '0');
      dailyMap[m.date].total += parseFloat(m.spend || '0');
    }
  }

  // Add Google data
  for (const g of googleData) {
    if (dailyMap[g.date]) {
      dailyMap[g.date].google += parseFloat(g.cost || '0');
      dailyMap[g.date].total += parseFloat(g.cost || '0');
    }
  }

  // Add TikTok data
  for (const t of tiktokData) {
    if (dailyMap[t.date]) {
      dailyMap[t.date].tiktok += parseFloat(t.spend || '0');
      dailyMap[t.date].total += parseFloat(t.spend || '0');
    }
  }

  return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
}
