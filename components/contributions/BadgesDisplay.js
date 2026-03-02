// components/contributions/BadgesDisplay.js
"use client"

/**
 * Badges Display Component
 * 
 * Features:
 * - Achievement badges
 * - First Supporter, Top Contributor, Loyal Supporter, Community Champion
 * - Badge hover shows description
 * - Animated reveals
 * - Responsive grid
 * 
 * @component
 */

import { useState } from 'react';
import { Award, Lock, Info, Medal, Gem, Heart, Trophy, Bird, Star, Sparkles, Users, HeartHandshake } from 'lucide-react';

export default function BadgesDisplay({ badges, loading = false }) {
    const [hoveredBadge, setHoveredBadge] = useState(null);

    // All possible badges (for showing locked ones)
    const allBadges = [
        {
            id: 'first-contribution',
            name: 'First Step',
            description: 'Made your first contribution',
            icon: <Sparkles className="w-14 h-14 text-emerald-400" />,
            requirement: 'Make your first contribution to any campaign',
        },
        {
            id: 'first-supporter',
            name: 'First Supporter',
            description: 'First to support a campaign',
            icon: <Medal className="w-14 h-14 text-yellow-400" />,
            requirement: 'Be the first supporter of any campaign',
        },
        {
            id: 'regular-supporter',
            name: 'Regular Supporter',
            description: 'Supported 3 or more campaigns',
            icon: <Users className="w-14 h-14 text-indigo-400" />,
            requirement: 'Support 3 different campaigns',
        },
        {
            id: 'big-hearted',
            name: 'Big Hearted',
            description: 'Contributed over ₹5,000 in total',
            icon: <HeartHandshake className="w-14 h-14 text-pink-400" />,
            requirement: 'Contribute ₹5,000+ in total',
        },
        {
            id: 'top-contributor',
            name: 'Top Contributor',
            description: 'Contributed ₹10,000 or more in a single donation',
            icon: <Gem className="w-14 h-14 text-blue-400" />,
            requirement: 'Make a single contribution of ₹10,000+',
        },
        {
            id: 'loyal-supporter',
            name: 'Loyal Supporter',
            description: 'Active monthly subscriber',
            icon: <Heart className="w-14 h-14 text-red-400" />,
            requirement: 'Subscribe to at least one campaign',
        },
        {
            id: 'community-champion',
            name: 'Community Champion',
            description: 'Supported 5 or more campaigns',
            icon: <Trophy className="w-14 h-14 text-amber-400" />,
            requirement: 'Support 5 different campaigns',
        },
        {
            id: 'early-bird',
            name: 'Early Bird',
            description: 'Supported a campaign within 24 hours of launch',
            icon: <Bird className="w-14 h-14 text-cyan-400" />,
            requirement: 'Support a campaign in its first 24 hours',
        },
        {
            id: 'generous-giver',
            name: 'Generous Giver',
            description: 'Contributed over ₹50,000 in total',
            icon: <Star className="w-14 h-14 text-yellow-400" />,
            requirement: 'Contribute ₹50,000+ in total',
        },
    ];

    if (loading) {
        return <BadgesSkeleton />;
    }

    const earnedBadgeIds = badges?.map(b => b.id) || [];
    const earnedBadges = allBadges.filter(b => earnedBadgeIds.includes(b.id));
    const lockedBadges = allBadges.filter(b => !earnedBadgeIds.includes(b.id));

    // Merge earned badges with their data, but preserve the component-based icon
    // (server sends icon as a string name like 'sparkles', we need the JSX component)
    const enrichedEarnedBadges = earnedBadges.map(badge => {
        const earnedData = badges.find(b => b.id === badge.id);
        if (!earnedData) return badge;
        // Destructure out `icon` from server data to prevent overwriting JSX icon
        const { icon: _serverIcon, ...earnedDataWithoutIcon } = earnedData;
        return { ...badge, ...earnedDataWithoutIcon };
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Achievement Badges
                    </h2>
                    <p className="text-gray-400 mt-1">
                        {earnedBadges.length} of {allBadges.length} badges earned
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold">
                        {earnedBadges.length}/{allBadges.length}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${(earnedBadges.length / allBadges.length) * 100}%`,
                    }}
                />
            </div>

            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Earned Badges
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {enrichedEarnedBadges.map((badge, index) => (
                            <BadgeCard
                                key={badge.id}
                                badge={badge}
                                earned={true}
                                index={index}
                                isHovered={hoveredBadge === badge.id}
                                onHover={() => setHoveredBadge(badge.id)}
                                onLeave={() => setHoveredBadge(null)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Badges */}
            {lockedBadges.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Locked Badges
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {lockedBadges.map((badge, index) => (
                            <BadgeCard
                                key={badge.id}
                                badge={badge}
                                earned={false}
                                index={index}
                                isHovered={hoveredBadge === badge.id}
                                onHover={() => setHoveredBadge(badge.id)}
                                onLeave={() => setHoveredBadge(null)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {earnedBadges.length === 0 && (
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 text-center border-2 border-dashed border-purple-700">
                    <Award className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Start Earning Badges!
                    </h3>
                    <p className="text-gray-400">
                        Support campaigns to unlock achievement badges and boost your impact score
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Individual Badge Card
 */
function BadgeCard({ badge, earned, index, isHovered, onHover, onLeave }) {
    return (
        <div
            className="relative group"
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            style={{
                animation: earned ? `badgeReveal 0.5s ease-out ${index * 0.1}s both` : 'none',
            }}
        >
            <div
                className={`
                    relative aspect-square rounded-2xl p-4 border-2 transition-all duration-300
                    ${earned
                        ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-600 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105'
                        : 'bg-white/5 border-white/10 opacity-50 hover:opacity-75'
                    }
                `}
            >
                {/* Badge Icon */}
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className={`flex justify-center mb-3 ${!earned && 'grayscale'}`}>
                        {earned ? badge.icon : <Lock className="w-14 h-14 text-gray-400" />}
                    </div>
                    <div className={`text-sm font-semibold ${earned ? 'text-white' : 'text-gray-500'}`}>
                        {badge.name}
                    </div>
                </div>

                {/* Earned indicator */}
                {earned && badge.earnedAt && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                )}

                {/* Lock icon for locked badges */}
                {!earned && (
                    <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-gray-600" />
                    </div>
                )}
            </div>

            {/* Tooltip */}
            {isHovered && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-2xl border border-gray-700 animate-fadeIn">
                    <div className="flex items-start gap-3 mb-2">
                        <div className="flex justify-center mb-2">{badge.icon}</div>
                        <div className="flex-1">
                            <h4 className="font-semibold mb-1">{badge.name}</h4>
                            <p className="text-sm text-gray-300">{badge.description}</p>
                        </div>
                    </div>

                    {earned ? (
                        <>
                            {badge.earnedAt && (
                                <div className="text-xs text-gray-400 mt-2">
                                    Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                                </div>
                            )}
                            {badge.count && badge.count > 1 && (
                                <div className="text-xs text-purple-400 mt-1">
                                    Achieved {badge.count} times
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="flex items-start gap-2 text-xs text-gray-400">
                                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{badge.requirement}</span>
                            </div>
                        </div>
                    )}

                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="w-3 h-3 bg-gray-900 dark:bg-gray-800 border-r border-b border-gray-700 rotate-45" />
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes badgeReveal {
                    from {
                        opacity: 0;
                        transform: scale(0.5) rotate(-10deg);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.15s ease-out forwards;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}

/**
 * Loading skeleton
 */
function BadgesSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-2" />
                    <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="h-10 w-20 bg-white/10 rounded-lg animate-pulse" />
            </div>

            <div className="h-3 bg-white/10 rounded-full animate-pulse" />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(9)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square bg-white/5 rounded-2xl animate-pulse"
                    />
                ))}
            </div>
        </div>
    );
}
