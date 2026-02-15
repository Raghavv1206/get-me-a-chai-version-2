// app/stories/page.js
"use client"

/**
 * Success Stories Page - Enhanced with Demo Data & Animations
 * 
 * Features:
 * - Rich demo data with realistic success stories
 * - Smooth animations and transitions
 * - Filtering by category
 * - Search functionality
 * - Detailed story cards with images
 * - Impact metrics
 * - Creator testimonials
 * - Hover effects and micro-interactions
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, Users, DollarSign, Award, Filter, X, Heart, Star, Sparkles, Zap, Target, Clock } from 'lucide-react';

// Demo Success Stories Data
const DEMO_STORIES = [
    {
        _id: '1',
        title: 'AI-Powered Learning Platform for Rural India',
        creatorName: 'Priya Sharma',
        category: 'education',
        currentAmount: 450000,
        goalAmount: 300000,
        stats: { supporters: 892, views: 15420 },
        shortDescription: 'Bringing quality education to underserved communities through AI-powered personalized learning.',
        coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
        testimonial: 'Get Me A Chai helped me reach supporters who truly believed in democratizing education. We exceeded our goal by 150%!',
        daysToFund: 18,
        impactMetrics: { studentsReached: 5000, villagesImpacted: 45 }
    },
    {
        _id: '2',
        title: 'Indie Game Studio: Pixel Quest Adventures',
        creatorName: 'Rahul Verma',
        category: 'games',
        currentAmount: 820000,
        goalAmount: 500000,
        stats: { supporters: 1245, views: 28900 },
        shortDescription: 'A retro-style RPG that celebrates Indian mythology with modern gameplay mechanics.',
        coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop',
        testimonial: 'The community support was incredible! We not only funded our game but built a loyal fanbase.',
        daysToFund: 12,
        impactMetrics: { betaTesters: 2500, wishlistAdds: 12000 }
    },
    {
        _id: '3',
        title: 'Sustainable Fashion: Eco-Friendly Clothing Line',
        creatorName: 'Ananya Patel',
        category: 'fashion',
        currentAmount: 380000,
        goalAmount: 350000,
        stats: { supporters: 567, views: 12300 },
        shortDescription: 'Creating beautiful, sustainable fashion from recycled materials and organic fabrics.',
        coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop',
        testimonial: 'This platform connected me with eco-conscious supporters who share my vision for sustainable fashion.',
        daysToFund: 25,
        impactMetrics: { plasticBottlesRecycled: 15000, treesPlanted: 500 }
    },
    {
        _id: '4',
        title: 'Farm-to-Table Organic Restaurant',
        creatorName: 'Vikram Singh',
        category: 'food',
        currentAmount: 650000,
        goalAmount: 600000,
        stats: { supporters: 789, views: 18700 },
        shortDescription: 'A restaurant serving organic, locally-sourced meals while supporting local farmers.',
        coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
        testimonial: 'We built more than a restaurant - we built a community of food lovers and sustainability advocates.',
        daysToFund: 30,
        impactMetrics: { farmersSupported: 25, mealsServed: 10000 }
    },
    {
        _id: '5',
        title: 'Digital Art Gallery & NFT Marketplace',
        creatorName: 'Meera Krishnan',
        category: 'art',
        currentAmount: 520000,
        goalAmount: 400000,
        stats: { supporters: 934, views: 22100 },
        shortDescription: 'Empowering digital artists with a platform to showcase and sell their work as NFTs.',
        coverImage: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=600&fit=crop',
        testimonial: 'The AI campaign builder made it so easy to tell my story. I reached my goal in just 2 weeks!',
        daysToFund: 14,
        impactMetrics: { artistsOnboarded: 150, artworksSold: 450 }
    },
    {
        _id: '6',
        title: 'Music Production Studio for Aspiring Artists',
        creatorName: 'Arjun Malhotra',
        category: 'music',
        currentAmount: 720000,
        goalAmount: 550000,
        stats: { supporters: 1123, views: 31200 },
        shortDescription: 'A professional recording studio offering affordable rates for independent musicians.',
        coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop',
        testimonial: 'Amazing platform! The supporters weren\'t just funders - they became our first fans and promoters.',
        daysToFund: 20,
        impactMetrics: { songsRecorded: 85, artistsHelped: 42 }
    },
    {
        _id: '7',
        title: 'Documentary: Stories of Street Vendors',
        creatorName: 'Kavya Reddy',
        category: 'film',
        currentAmount: 420000,
        goalAmount: 400000,
        stats: { supporters: 678, views: 14500 },
        shortDescription: 'A heartwarming documentary celebrating the resilience of street vendors across India.',
        coverImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop',
        testimonial: 'This campaign allowed me to tell stories that matter. The support was overwhelming and heartfelt.',
        daysToFund: 28,
        impactMetrics: { vendorsInterviewed: 50, citiesCovered: 12 }
    },
    {
        _id: '8',
        title: 'Smart Home Automation for Everyone',
        creatorName: 'Karthik Iyer',
        category: 'technology',
        currentAmount: 890000,
        goalAmount: 700000,
        stats: { supporters: 1456, views: 35600 },
        shortDescription: 'Affordable smart home devices designed and manufactured in India.',
        coverImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=600&fit=crop',
        testimonial: 'We exceeded our funding goal by 127%! The platform\'s AI recommendations brought in perfect backers.',
        daysToFund: 15,
        impactMetrics: { devicesShipped: 3500, homesAutomated: 1200 }
    },
    {
        _id: '9',
        title: 'Children\'s Book Series: Indian Folktales',
        creatorName: 'Divya Nair',
        category: 'education',
        currentAmount: 280000,
        goalAmount: 250000,
        stats: { supporters: 445, views: 9800 },
        shortDescription: 'Beautifully illustrated books bringing Indian folktales to a new generation.',
        coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop',
        testimonial: 'Parents and educators rallied behind this project. We\'re now in 200+ schools!',
        daysToFund: 22,
        impactMetrics: { booksPublished: 5, schoolsReached: 200 }
    },
    {
        _id: '10',
        title: 'Artisan Coffee Roastery & Café',
        creatorName: 'Rohan Desai',
        category: 'food',
        currentAmount: 550000,
        goalAmount: 500000,
        stats: { supporters: 823, views: 19400 },
        shortDescription: 'Sourcing directly from farmers and roasting premium coffee beans in-house.',
        coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
        testimonial: 'Coffee lovers from across the country supported us. We opened our café 2 months ahead of schedule!',
        daysToFund: 19,
        impactMetrics: { farmerPartnerships: 15, cupsServed: 25000 }
    },
    {
        _id: '11',
        title: 'Mobile App: Mental Health Support',
        creatorName: 'Sneha Gupta',
        category: 'technology',
        currentAmount: 620000,
        goalAmount: 450000,
        stats: { supporters: 1089, views: 24700 },
        shortDescription: 'AI-powered mental health app providing affordable therapy and support.',
        coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
        testimonial: 'The campaign went viral! We\'re now helping thousands of people access mental health support.',
        daysToFund: 16,
        impactMetrics: { usersHelped: 8000, therapistsOnboarded: 120 }
    },
    {
        _id: '12',
        title: 'Board Game Café: Strategy & Fun',
        creatorName: 'Amit Kapoor',
        category: 'games',
        currentAmount: 480000,
        goalAmount: 450000,
        stats: { supporters: 712, views: 16200 },
        shortDescription: 'A cozy café with 500+ board games, hosting tournaments and game nights.',
        coverImage: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=600&fit=crop',
        testimonial: 'Board game enthusiasts came together to make this dream a reality. We\'re now a community hub!',
        daysToFund: 24,
        impactMetrics: { gamesInLibrary: 500, eventsHosted: 150 }
    }
];

export default function SuccessStoriesPage() {
    const [stories, setStories] = useState([]);
    const [displayStories, setDisplayStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState({
        totalFunded: 0,
        totalCampaigns: 0,
        totalSupporters: 0,
        averageFunding: 0
    });

    const categories = [
        { id: 'all', label: 'All Stories', icon: '🌟' },
        { id: 'technology', label: 'Technology', icon: '💻' },
        { id: 'art', label: 'Art & Design', icon: '🎨' },
        { id: 'music', label: 'Music', icon: '🎵' },
        { id: 'games', label: 'Games', icon: '🎮' },
        { id: 'food', label: 'Food', icon: '🍕' },
        { id: 'education', label: 'Education', icon: '📚' },
        { id: 'film', label: 'Film & Video', icon: '🎬' },
        { id: 'fashion', label: 'Fashion', icon: '👗' },
    ];

    useEffect(() => {
        fetchSuccessStories();
    }, []);

    useEffect(() => {
        filterStories();
    }, [selectedCategory, searchQuery, stories]);

    const fetchSuccessStories = async () => {
        try {
            setLoading(true);

            // Try to fetch real data first
            const params = new URLSearchParams();
            params.append('status', 'completed');
            params.append('sort', 'most-funded');
            params.append('limit', '50');

            const response = await fetch(`/api/campaigns/filter?${params.toString()}`);
            const data = await response.json();

            let campaignsToUse = [];

            if (data.success && data.campaigns && data.campaigns.length > 0) {
                // Use real data if available
                campaignsToUse = data.campaigns;
            } else {
                // Fallback to demo data
                campaignsToUse = DEMO_STORIES;
            }

            setStories(campaignsToUse);

            // Calculate stats
            const totalFunded = campaignsToUse.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
            const totalSupporters = campaignsToUse.reduce((sum, c) => sum + (c.stats?.supporters || 0), 0);

            setStats({
                totalFunded,
                totalCampaigns: campaignsToUse.length,
                totalSupporters,
                averageFunding: campaignsToUse.length > 0 ? totalFunded / campaignsToUse.length : 0
            });

            // Simulate loading for smooth transition
            setTimeout(() => setLoading(false), 800);
        } catch (error) {
            console.error('Error fetching success stories:', error);
            // Use demo data on error
            setStories(DEMO_STORIES);
            const totalFunded = DEMO_STORIES.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
            const totalSupporters = DEMO_STORIES.reduce((sum, c) => sum + (c.stats?.supporters || 0), 0);
            setStats({
                totalFunded,
                totalCampaigns: DEMO_STORIES.length,
                totalSupporters,
                averageFunding: totalFunded / DEMO_STORIES.length
            });
            setTimeout(() => setLoading(false), 800);
        }
    };

    const filterStories = () => {
        let filtered = stories;

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(story => story.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(story =>
                story.title?.toLowerCase().includes(query) ||
                story.creatorName?.toLowerCase().includes(query) ||
                story.shortDescription?.toLowerCase().includes(query) ||
                story.category?.toLowerCase().includes(query)
            );
        }

        setDisplayStories(filtered);
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Animated Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-green-900/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative pt-24 pb-16">
                <div className="container mx-auto px-4 sm:px-6">
                    {/* Hero Section with Animations */}
                    <div className="text-center mb-16 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-semibold mb-6 animate-bounce-slow">
                            <Award className="w-4 h-4" />
                            Success Stories
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent animate-gradient">
                            Dreams Turned Reality
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                            Discover inspiring stories of creators who successfully funded their dreams and made an impact
                        </p>

                        {/* Animated Stats Overview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 hover:border-green-500/30 group">
                                <DollarSign className="w-8 h-8 text-green-400 mb-2 mx-auto group-hover:animate-bounce" />
                                <div className="text-2xl font-bold text-white">₹{(stats.totalFunded / 100000).toFixed(1)}L+</div>
                                <div className="text-sm text-gray-400">Total Funded</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 hover:border-purple-500/30 group">
                                <TrendingUp className="w-8 h-8 text-purple-400 mb-2 mx-auto group-hover:animate-bounce" />
                                <div className="text-2xl font-bold text-white">{stats.totalCampaigns}+</div>
                                <div className="text-sm text-gray-400">Success Stories</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 hover:border-blue-500/30 group">
                                <Users className="w-8 h-8 text-blue-400 mb-2 mx-auto group-hover:animate-bounce" />
                                <div className="text-2xl font-bold text-white">{stats.totalSupporters.toLocaleString()}+</div>
                                <div className="text-sm text-gray-400">Happy Supporters</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 hover:border-yellow-500/30 group">
                                <Award className="w-8 h-8 text-yellow-400 mb-2 mx-auto group-hover:animate-bounce" />
                                <div className="text-2xl font-bold text-white">₹{(stats.averageFunding / 1000).toFixed(0)}K</div>
                                <div className="text-sm text-gray-400">Avg. Funding</div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8">
                        {/* Search Bar with Animation */}
                        <div className="relative max-w-2xl mx-auto mb-6 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search success stories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>

                        {/* Category Filters - Desktop */}
                        <div className="hidden lg:flex items-center justify-center gap-3 flex-wrap">
                            {categories.map((category, index) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${selectedCategory === category.id
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <span className="mr-2">{category.icon}</span>
                                    {category.label}
                                </button>
                            ))}
                        </div>

                        {/* Category Filters - Mobile */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white flex items-center justify-between hover:bg-white/10 transition-all"
                            >
                                <span className="flex items-center gap-2">
                                    <Filter className="w-5 h-5" />
                                    {categories.find(c => c.id === selectedCategory)?.label || 'All Stories'}
                                </span>
                                <X className={`w-5 h-5 transition-transform duration-300 ${showFilters ? 'rotate-0' : 'rotate-45'}`} />
                            </button>

                            {showFilters && (
                                <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 animate-slide-down">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                setSelectedCategory(category.id);
                                                setShowFilters(false);
                                            }}
                                            className={`w-full px-4 py-2 rounded-lg text-left transition-all ${selectedCategory === category.id
                                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="mr-2">{category.icon}</span>
                                            {category.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stories Grid with Staggered Animation */}
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-white/5 rounded-2xl overflow-hidden">
                                        <div className="h-48 bg-gradient-to-br from-white/10 to-white/5" />
                                        <div className="p-6 space-y-3">
                                            <div className="h-6 bg-white/10 rounded w-3/4" />
                                            <div className="h-4 bg-white/10 rounded w-full" />
                                            <div className="h-4 bg-white/10 rounded w-2/3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : displayStories.length === 0 ? (
                        <div className="text-center py-20 animate-fade-in">
                            <div className="text-6xl mb-4 animate-bounce">🔍</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No Success Stories Found</h3>
                            <p className="text-gray-400">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayStories.map((story, index) => (
                                <div
                                    key={story._id}
                                    className="animate-fade-in-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <StoryCard story={story} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA Section with Animation */}
                    <div className="mt-20 text-center animate-fade-in">
                        <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-3xl p-12 hover:border-purple-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
                            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Write Your Success Story?
                            </h2>
                            <p className="text-gray-400 text-lg mb-8">
                                Join thousands of creators who have successfully funded their dreams
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105 group"
                            >
                                Start Your Campaign
                                <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                    opacity: 0;
                }
                
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
                
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
                
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    );
}

// Enhanced Story Card Component with Animations
function StoryCard({ story }) {
    const [isHovered, setIsHovered] = useState(false);

    const progress = story.goalAmount > 0
        ? Math.min((story.currentAmount / story.goalAmount) * 100, 100)
        : 0;

    const fundingPercentage = Math.round(progress);
    const overfunded = fundingPercentage > 100;

    const categoryIcons = {
        technology: '💻',
        art: '🎨',
        music: '🎵',
        games: '🎮',
        food: '🍕',
        education: '📚',
        film: '🎬',
        fashion: '👗',
    };

    const categoryColors = {
        technology: 'from-blue-500 to-cyan-500',
        art: 'from-purple-500 to-pink-500',
        music: 'from-red-500 to-orange-500',
        games: 'from-green-500 to-emerald-500',
        food: 'from-yellow-500 to-orange-500',
        education: 'from-indigo-500 to-purple-500',
        film: 'from-pink-500 to-rose-500',
        fashion: 'from-violet-500 to-purple-500',
    };

    return (
        <Link
            href={`/campaign/${story._id}`}
            className="group block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image with Overlay */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                {story.coverImage ? (
                    <img
                        src={story.coverImage}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                        {categoryIcons[story.category] || '🚀'}
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Success Badge with Animation */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                    <Award className="w-3 h-3" />
                    {overfunded ? `${fundingPercentage}% Funded` : 'Fully Funded'}
                </div>

                {/* Category Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 bg-gradient-to-r ${categoryColors[story.category] || 'from-gray-500 to-gray-600'} text-white text-xs font-semibold rounded-full shadow-lg`}>
                    {story.category}
                </div>

                {/* Hover Stats Overlay */}
                {isHovered && story.daysToFund && (
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 animate-fade-in">
                        <div className="flex-1 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {story.daysToFund} days
                        </div>
                        <div className="flex-1 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {fundingPercentage}%
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Creator with Avatar */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all">
                        {story.creatorName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        by {story.creatorName || 'Anonymous'}
                    </span>
                    {story.stats?.views && (
                        <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                            <Star className="w-3 h-3" />
                            {(story.stats.views / 1000).toFixed(1)}K views
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                    {story.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 group-hover:text-gray-300 transition-colors">
                    {story.shortDescription || story.story?.substring(0, 100) + '...'}
                </p>

                {/* Testimonial (on hover) */}
                {isHovered && story.testimonial && (
                    <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10 animate-fade-in">
                        <p className="text-xs text-gray-400 italic line-clamp-2">
                            "{story.testimonial}"
                        </p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-3 group-hover:border-green-500/40 transition-all">
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Raised
                        </div>
                        <div className="text-lg font-bold text-green-400">
                            ₹{((story.currentAmount || 0) / 1000).toFixed(0)}K
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-3 group-hover:border-blue-500/40 transition-all">
                        <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Supporters
                        </div>
                        <div className="text-lg font-bold text-white">
                            {story.stats?.supporters || 0}
                        </div>
                    </div>
                </div>

                {/* Progress Bar with Animation */}
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Goal: ₹{((story.goalAmount || 0) / 1000).toFixed(0)}K</span>
                        <span className="font-semibold text-green-400">{fundingPercentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${categoryColors[story.category] || 'from-purple-500 to-blue-500'} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: isHovered ? `${Math.min(progress, 100)}%` : '0%' }}
                        />
                    </div>
                </div>

                {/* Impact Metrics (on hover) */}
                {isHovered && story.impactMetrics && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg animate-fade-in">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            <span className="font-semibold text-white">Impact:</span>
                            {Object.entries(story.impactMetrics).slice(0, 1).map(([key, value]) => (
                                <span key={key}>{value.toLocaleString()} {key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Read More with Arrow Animation */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-400 font-medium group-hover:text-purple-300 transition-colors flex items-center gap-2">
                        Read Success Story
                        <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </span>
                    <Heart className="w-4 h-4 text-gray-600 group-hover:text-red-500 group-hover:fill-red-500 transition-all" />
                </div>
            </div>
        </Link>
    );
}
