// components/about/FAQAccordion.js
"use client"
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

export default function FAQAccordion() {
    const [openIndex, setOpenIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { ref, inView } = useInView({
        threshold: 0.2,
        triggerOnce: true
    });

    const faqs = [
        {
            question: 'How does the AI Campaign Builder work?',
            answer: 'Our AI analyzes your project idea and automatically generates a compelling campaign story, suggests reward tiers, creates milestones, and even writes FAQs. Simply provide a brief description of your project, and our AI does the heavy lifting in minutes.',
            category: 'AI Features'
        },
        {
            question: 'What fees does Get Me a Chai charge?',
            answer: 'We charge a transparent 5% platform fee on successfully funded campaigns, plus payment processing fees (2-3% depending on payment method). There are no hidden charges or upfront costs. You only pay when you succeed.',
            category: 'Pricing'
        },
        {
            question: 'How long does it take to receive funds?',
            answer: 'Funds are typically transferred to your bank account within 7-10 business days after your campaign ends successfully. For campaigns with flexible funding, you can withdraw funds as they come in.',
            category: 'Payments'
        },
        {
            question: 'Can I edit my campaign after launching?',
            answer: 'Yes! You can edit your campaign description, add updates, and modify reward tiers at any time. However, you cannot change your funding goal once the campaign has received its first contribution.',
            category: 'Campaigns'
        },
        {
            question: "What happens if my campaign doesn't reach its goal?",
            answer: 'We offer two funding models: All-or-Nothing (you must reach your goal to receive funds) and Flexible Funding (you keep what you raise). You choose which model works best for your project when creating your campaign.',
            category: 'Campaigns'
        },
        {
            question: 'Is my personal and payment information secure?',
            answer: 'Absolutely. We use bank-grade 256-bit SSL encryption for all transactions. Payment processing is handled by Razorpay, a PCI DSS compliant payment gateway. We never store your complete card details.',
            category: 'Security'
        },
        {
            question: 'How does the AI Chatbot help me?',
            answer: 'Our 24/7 AI Chatbot provides instant answers to questions, helps troubleshoot issues, offers campaign optimization tips, and guides you through the platform. It learns from thousands of successful campaigns to give you personalized advice.',
            category: 'AI Features'
        },
        {
            question: 'Can international supporters contribute to my campaign?',
            answer: "Currently, we support payments from India only. We're working on expanding to international payments soon. Stay tuned for updates!",
            category: 'Payments'
        },
        {
            question: 'How do I promote my campaign?',
            answer: 'We provide built-in tools including social media sharing, email templates, and campaign analytics. Our AI also recommends your campaign to interested supporters through our smart recommendation engine, giving you organic visibility.',
            category: 'Marketing'
        },
        {
            question: 'What types of projects can I fund on Get Me a Chai?',
            answer: "We support a wide range of creative projects including technology, art, music, games, education, food & beverage, and more. As long as your project is legal and follows our community guidelines, you're welcome to launch a campaign.",
            category: 'Campaigns'
        }
    ];

    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="py-20 bg-gradient-to-b from-gray-900 to-black">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                        Find answers to common questions about our platform
                    </p>

                    {/* Search */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <svg
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search FAQs..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div ref={ref} className="max-w-3xl mx-auto space-y-4">
                    {filteredFAQs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400">No FAQs found matching your search.</p>
                        </div>
                    ) : (
                        filteredFAQs.map((faq, index) => (
                            <div
                                key={index}
                                className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                                    } ${openIndex === index ? 'border-purple-500/50' : ''}`}
                                style={{
                                    transitionDelay: `${index * 50}ms`
                                }}
                            >
                                {/* Question */}
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-gray-700/30 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 text-xs font-semibold">
                                                {faq.category}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">
                                            {faq.question}
                                        </h3>
                                    </div>
                                    <svg
                                        className={`w-6 h-6 text-gray-400 flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {/* Answer */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                        }`}
                                >
                                    <div className="px-6 pb-6 pt-0">
                                        <p className="text-gray-300 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Still have questions? */}
                <div className="mt-16 text-center">
                    <p className="text-gray-400 mb-4">
                        Still have questions?
                    </p>
                    <a href="mailto:support@getmeachai.com">
                        <button className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-700 transition-all">
                            Contact Support
                        </button>
                    </a>
                </div>
            </div>
        </div>
    );
}
