// components/about/TeamSection.js
"use client"
import { useInView } from 'react-intersection-observer';
import { Bot, Monitor, Palette, MessageCircle } from 'lucide-react';

export default function TeamSection() {
    const { ref, inView } = useInView({
        threshold: 0.3,
        triggerOnce: true
    });

    const team = [
        {
            name: 'AI Development Team',
            role: 'Artificial Intelligence',
            bio: 'Building cutting-edge AI solutions for creators',
            skills: ['Machine Learning', 'NLP', 'Deep Learning'],
            icon: Bot,
            color: 'from-purple-500 to-pink-500'
        },
        {
            name: 'Platform Team',
            role: 'Full Stack Development',
            bio: 'Creating seamless user experiences',
            skills: ['Next.js', 'React', 'Node.js'],
            icon: Monitor,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            name: 'Design Team',
            role: 'UI/UX Design',
            bio: 'Crafting beautiful and intuitive interfaces',
            skills: ['UI Design', 'UX Research', 'Prototyping'],
            icon: Palette,
            color: 'from-green-500 to-emerald-500'
        },
        {
            name: 'Support Team',
            role: 'Customer Success',
            bio: 'Ensuring every creator succeeds',
            skills: ['Support', 'Training', 'Community'],
            icon: MessageCircle,
            color: 'from-orange-500 to-red-500'
        }
    ];

    return (
        <div className="py-20 bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Meet Our Team
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Passionate experts dedicated to empowering creators worldwide
                    </p>
                </div>

                <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {team.map((member, index) => (
                        <div
                            key={index}
                            className={`group bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                            style={{
                                transitionDelay: `${index * 100}ms`
                            }}
                        >
                            {/* Icon/Avatar */}
                            <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-r ${member.color} rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                                <member.icon className="w-8 h-8 text-white" />
                            </div>

                            {/* Name & Role */}
                            <h3 className="text-xl font-bold text-white text-center mb-1">
                                {member.name}
                            </h3>
                            <p className={`text-sm bg-gradient-to-r ${member.color} bg-clip-text text-transparent font-semibold text-center mb-3`}>
                                {member.role}
                            </p>

                            {/* Bio */}
                            <p className="text-gray-400 text-sm text-center mb-4">
                                {member.bio}
                            </p>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                {member.skills.map((skill, skillIndex) => (
                                    <span
                                        key={skillIndex}
                                        className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Join Team CTA */}
                <div className="mt-16 text-center">
                    <div className="inline-block bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-white mb-3">
                            Want to Join Our Team?
                        </h3>
                        <p className="text-gray-400 mb-6">
                            We're always looking for talented individuals who share our passion
                        </p>
                        <a href="mailto:careers@getmeachai.com">
                            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105">
                                View Open Positions
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
