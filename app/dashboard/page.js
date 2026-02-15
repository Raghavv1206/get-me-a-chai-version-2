import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
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
  'use server';

  await connectDb();

  // Get user data
  const user = await User.findById(userId).lean();

  // Handle case where user doesn't exist
  if (!user) {
    return {
      user: { name: 'User', username: '', email: '', profilepic: '' },
      campaigns: [],
      transactions: [],
      stats: {
        today: { earnings: 0, supporters: 0, campaigns: 0, avgDonation: 0, earningsChange: 0, supportersChange: 0, campaignsChange: 0, avgDonationChange: 0 },
        week: { earnings: 0, supporters: 0, campaigns: 0, avgDonation: 0, earningsChange: 0, supportersChange: 0, campaignsChange: 0, avgDonationChange: 0 },
        month: { earnings: 0, supporters: 0, campaigns: 0, avgDonation: 0, earningsChange: 0, supportersChange: 0, campaignsChange: 0, avgDonationChange: 0 },
        'all-time': { earnings: 0, supporters: 0, campaigns: 0, avgDonation: 0, earningsChange: 0, supportersChange: 0, campaignsChange: 0, avgDonationChange: 0 }
      },
      chartData: { daily: [], hourly: [], monthly: [] },
      activities: []
    };
  }

  // Get campaigns - Convert userId to ObjectId for proper matching
  const campaigns = await Campaign.find({
    creator: userId, // Mongoose automatically converts string to ObjectId
    status: { $ne: 'deleted' }
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('creator', 'username')
    .lean();

  console.log('Dashboard - User ID:', userId);
  console.log('Dashboard - Campaigns found:', campaigns.length);

  // Get recent transactions
  const transactions = await Payment.find({
    to_user: user.username,
    done: true
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('campaign', 'title')
    .lean();

  // Calculate stats
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const allPayments = await Payment.find({
    to_user: user.username,
    done: true,
    status: 'success'
  }).lean();

  const todayPayments = allPayments.filter(p => new Date(p.createdAt) >= today);
  const weekPayments = allPayments.filter(p => new Date(p.createdAt) >= weekAgo);
  const monthPayments = allPayments.filter(p => new Date(p.createdAt) >= monthAgo);

  const calculateStats = (payments) => ({
    earnings: payments.reduce((sum, p) => sum + p.amount, 0),
    supporters: new Set(payments.map(p => p.userId || p.email)).size,
    campaigns: campaigns.filter(c => c.status === 'active').length,
    avgDonation: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0
  });

  const stats = {
    today: { ...calculateStats(todayPayments), earningsChange: 0, supportersChange: 0, campaignsChange: 0, avgDonationChange: 0 },
    week: { ...calculateStats(weekPayments), earningsChange: 12, supportersChange: 8, campaignsChange: 0, avgDonationChange: 5 },
    month: { ...calculateStats(monthPayments), earningsChange: 25, supportersChange: 15, campaignsChange: 2, avgDonationChange: 10 },
    'all-time': { ...calculateStats(allPayments), earningsChange: 0, supportersChange: 0, campaignsChange: 0, avgDonationChange: 0 }
  };

  // Generate earnings chart data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    const dayPayments = allPayments.filter(p => {
      const pDate = new Date(p.createdAt);
      return pDate.toDateString() === date.toDateString();
    });

    return {
      label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      amount: dayPayments.reduce((sum, p) => sum + p.amount, 0)
    };
  });

  const chartData = {
    daily: last30Days,
    hourly: [], // Would need more detailed tracking
    monthly: [] // Would aggregate by month
  };

  // Recent activity
  const activities = [
    ...transactions.slice(0, 5).map(t => ({
      _id: t._id,
      type: 'new_supporter',
      message: `${t.anonymous ? 'Someone' : t.name} supported your campaign with ₹${t.amount.toLocaleString('en-IN')}`,
      createdAt: t.createdAt
    }))
  ];

  return JSON.parse(JSON.stringify({
    user,
    campaigns,
    transactions,
    stats,
    chartData,
    activities
  }));
}

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  const data = await getDashboardData(session.user.id);


  return <DashboardClient data={data} />;
}
