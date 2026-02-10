'use client';

import Image from 'next/image';
import { FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

export default function CampaignHero({ campaign, creator }) {
    return (
        <div className="relative">
            {/* Cover Image */}
            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                {/* Image or Gradient Background */}
                {campaign.coverImage ? (
                    <Image
                        src={campaign.coverImage}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black" />
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                            {/* Creator Profile Picture */}
                            <div className="relative">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white/20 backdrop-blur-sm shadow-2xl">
                                    <Image
                                        src={creator.profilepic || '/images/default-profilepic.jpg'}
                                        alt={creator.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                {creator.verified && (
                                    <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1.5 border-2 border-black">
                                        <FaCheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Campaign Info */}
                            <div className="flex-1">
                                {/* Category Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full backdrop-blur-sm mb-3">
                                    <span className="text-purple-300 text-sm font-medium capitalize">{campaign.category}</span>
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
                                    {campaign.title}
                                </h1>

                                {/* Creator Info */}
                                <div className="flex flex-wrap items-center gap-4 text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">by</span>
                                        <span className="font-semibold text-white">{creator.name}</span>
                                        <span className="text-sm text-gray-400">@{creator.username}</span>
                                    </div>

                                    {creator.location && (
                                        <>
                                            <span className="text-gray-600">•</span>
                                            <div className="flex items-center gap-1.5">
                                                <FaMapMarkerAlt className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-sm">{creator.location}</span>
                                            </div>
                                        </>
                                    )}

                                    {campaign.endDate && (
                                        <>
                                            <span className="text-gray-600">•</span>
                                            <div className="flex items-center gap-1.5">
                                                <FaCalendarAlt className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-sm">
                                                    {new Date(campaign.endDate).toLocaleDateString('en-IN', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
