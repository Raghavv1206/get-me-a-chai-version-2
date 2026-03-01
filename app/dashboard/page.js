import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/connectDb';
import Campaign from '@/models/Campaign';
import Payment from '@/models/Payment';
import User from '@/models/User';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const metadata = {
  title: 'Dashboard - Get Me A Chai',
  description: 'Manage your campaigns and view analytics'
};

async function getDashboardData(userId) {
  try {
    await connectDb();

    // Get user data
    const user = await User.findById(userId).lean();

    // Handle case where user doesn't exist
    if (!user) {
      console.warn('[Dashboard] User not found for ID:', userId);
      return getEmptyDashboardData();
    }

    // Get all campaigns for this user (not just active)
    const campaigns = await Campaign.find({
      creator: userId,
      status: { $ne: 'deleted' }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('creator', 'username')
      .lean();

    // Get recent transactions — use `done: true` as the primary filter
    // since that's the indexed field and the most reliable completion indicator.
    // Fall back to also accepting status: 'success' for compatibility.
    const transactions = await Payment.find({
      to_user: user.username,
      $or: [
        { done: true },
        { status: 'success' }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('campaign', 'title')
      .lean();

    // Get ALL completed payments for stats calculations
    const allPayments = await Payment.find({
      to_user: user.username,
      $or: [
        { done: true },
        { status: 'success' }
      ]
    }).lean();

    // Calculate time-based stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prevWeekStart = new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevMonthStart = new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const todayPayments = allPayments.filter(p => new Date(p.createdAt) >= today);
    const yesterdayPayments = allPayments.filter(p => {
      const d = new Date(p.createdAt);
      return d >= yesterday && d < today;
    });
    const weekPayments = allPayments.filter(p => new Date(p.createdAt) >= weekAgo);
    const prevWeekPayments = allPayments.filter(p => {
      const d = new Date(p.createdAt);
      return d >= prevWeekStart && d < weekAgo;
    });
    const monthPayments = allPayments.filter(p => new Date(p.createdAt) >= monthAgo);
    const prevMonthPayments = allPayments.filter(p => {
      const d = new Date(p.createdAt);
      return d >= prevMonthStart && d < monthAgo;
    });

    const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;

    const calculateStats = (payments) => ({
      earnings: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      supporters: new Set(payments.map(p => (p.userId?.toString() || p.email || p.name || 'unknown'))).size,
      campaigns: activeCampaignsCount,
      avgDonation: payments.length > 0
        ? Math.round(payments.reduce((sum, p) => sum + (p.amount || 0), 0) / payments.length)
        : 0
    });

    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const todayStats = calculateStats(todayPayments);
    const yesterdayStats = calculateStats(yesterdayPayments);
    const weekStats = calculateStats(weekPayments);
    const prevWeekStats = calculateStats(prevWeekPayments);
    const monthStats = calculateStats(monthPayments);
    const prevMonthStats = calculateStats(prevMonthPayments);
    const allTimeStats = calculateStats(allPayments);

    const stats = {
      today: {
        ...todayStats,
        earningsChange: calcChange(todayStats.earnings, yesterdayStats.earnings),
        supportersChange: calcChange(todayStats.supporters, yesterdayStats.supporters),
        campaignsChange: 0,
        avgDonationChange: calcChange(todayStats.avgDonation, yesterdayStats.avgDonation)
      },
      week: {
        ...weekStats,
        earningsChange: calcChange(weekStats.earnings, prevWeekStats.earnings),
        supportersChange: calcChange(weekStats.supporters, prevWeekStats.supporters),
        campaignsChange: 0,
        avgDonationChange: calcChange(weekStats.avgDonation, prevWeekStats.avgDonation)
      },
      month: {
        ...monthStats,
        earningsChange: calcChange(monthStats.earnings, prevMonthStats.earnings),
        supportersChange: calcChange(monthStats.supporters, prevMonthStats.supporters),
        campaignsChange: 0,
        avgDonationChange: calcChange(monthStats.avgDonation, prevMonthStats.avgDonation)
      },
      'all-time': {
        ...allTimeStats,
        earningsChange: 0,
        supportersChange: 0,
        campaignsChange: 0,
        avgDonationChange: 0
      }
    };

    // Generate daily earnings chart data (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayPayments = allPayments.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate >= dayStart && pDate < dayEnd;
      });

      return {
        label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        amount: dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      };
    });

    // Generate hourly data for today (last 24 hours)
    const last24Hours = Array.from({ length: 24 }, (_, i) => {
      const hourStart = new Date(today.getTime() + i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const hourPayments = allPayments.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate >= hourStart && pDate < hourEnd;
      });

      return {
        label: `${String(i).padStart(2, '0')}:00`,
        amount: hourPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      };
    });

    // Generate monthly data (last 12 months)
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

      const mPayments = allPayments.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate >= monthDate && pDate <= monthEnd;
      });

      return {
        label: monthDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        amount: mPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      };
    });

    const chartData = {
      daily: last30Days,
      hourly: last24Hours,
      monthly: last12Months
    };

    // Recent activity from transactions
    const activities = transactions.slice(0, 5).map(t => ({
      _id: t._id?.toString() || `activity-${Date.now()}-${Math.random()}`,
      type: 'new_supporter',
      message: `${t.anonymous ? 'Someone' : (t.name || 'A supporter')} supported your campaign with ₹${(t.amount || 0).toLocaleString('en-IN')}`,
      createdAt: t.createdAt
    }));

    // Safely serialize all data (convert ObjectIds, Dates, etc.)
    return JSON.parse(JSON.stringify({
      user: {
        _id: user._id,
        name: user.name || user.username || 'User',
        username: user.username || '',
        email: user.email || '',
        profilepic: user.profilepic || '/images/default-profilepic.svg'
      },
      campaigns,
      transactions,
      stats,
      chartData,
      activities
    }));

  } catch (error) {
    console.error('[Dashboard] Error fetching dashboard data:', error);
    return getEmptyDashboardData();
  }
}

function getEmptyDashboardData() {
  const emptyPeriod = {
    earnings: 0,
    supporters: 0,
    campaigns: 0,
    avgDonation: 0,
    earningsChange: 0,
    supportersChange: 0,
    campaignsChange: 0,
    avgDonationChange: 0
  };

  return {
    user: { name: 'User', username: '', email: '', profilepic: '/images/default-profilepic.svg' },
    campaigns: [],
    transactions: [],
    stats: {
      today: { ...emptyPeriod },
      week: { ...emptyPeriod },
      month: { ...emptyPeriod },
      'all-time': { ...emptyPeriod }
    },
    chartData: {
      daily: [],
      hourly: [],
      monthly: []
    },
    activities: []
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const data = await getDashboardData(session.user.id);

  return <DashboardClient data={data} />;
}
