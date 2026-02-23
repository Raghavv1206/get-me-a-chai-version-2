// components/about/TrustBadges.js
"use client"
import { useInView } from 'react-intersection-observer';
import { Lock, CreditCard, CheckCircle2, Shield, Award, Phone, Smartphone, Landmark } from 'lucide-react';

export default function TrustBadges() {
    const { ref, inView } = useInView({
        threshold: 0.3,
        triggerOnce: true
    });

    const trustFeatures = [
        {
            icon: Lock,
            title: 'Bank-Grade Security',
            description: '256-bit SSL encryption protects all transactions',
            badge: 'SSL Certified'
        },
        {
            icon: CreditCard,
            title: 'Razorpay Powered',
            description: 'Trusted payment gateway used by millions',
            badge: 'PCI DSS Compliant'
        },
        {
            icon: CheckCircle2,
            title: 'Verified Creators',
            description: 'All creators undergo identity verification',
            badge: 'KYC Verified'
        },
        {
            icon: Shield,
            title: 'Fraud Detection',
            description: 'AI-powered fraud prevention system',
            badge: 'AI Protected'
        },
        {
            icon: Award,
            title: 'Money-Back Guarantee',
            description: 'Full refund if campaign is fraudulent',
            badge: '100% Guarantee'
        },
        {
            icon: Phone,
            title: '24/7 Support',
            description: 'Round-the-clock customer assistance',
            badge: 'Always Available'
        }
    ];

    const paymentPartners = [
        { name: 'Razorpay', logo: CreditCard },
        { name: 'UPI', logo: Smartphone },
        { name: 'Visa', logo: CreditCard },
        { name: 'Mastercard', logo: CreditCard },
        { name: 'NetBanking', logo: Landmark }
    ];

    return (
        <div className="py-20 bg-gradient-to-b from-gray-950 to-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Your Security is Our Priority
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        We use industry-leading security measures to protect your funds and personal information
                    </p>
                </div>

                {/* Trust Features Grid */}
                <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {trustFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                }`}
                            style={{
                                transitionDelay: `${index * 100}ms`
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <feature.icon className="w-8 h-8 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-bold text-white">
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-3">
                                        {feature.description}
                                    </p>
                                    <span className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-semibold">
                                        {feature.badge}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment Partners */}
                <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
                    <h3 className="text-2xl font-bold text-white text-center mb-8">
                        Trusted Payment Partners
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {paymentPartners.map((partner, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center gap-2 p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors"
                            >
                                <partner.logo className="w-8 h-8 text-gray-300" />
                                <span className="text-sm text-gray-400 font-medium">
                                    {partner.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Statement */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-sm max-w-3xl mx-auto">
                        <Lock className="w-4 h-4 inline-block mr-1" /> All payments are processed through secure, PCI DSS compliant payment gateways.
                        We never store your complete card details. Your financial information is encrypted
                        and protected at all times.
                    </p>
                </div>
            </div>
        </div>
    );
}
