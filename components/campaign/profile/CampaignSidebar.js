'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaHeart, FaShare, FaFlag, FaClock, FaFire, FaLock } from 'react-icons/fa';
import Script from 'next/script';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initiate } from '@/actions/useractions';
import { calculateDaysLeft } from '@/lib/campaignUtils';

export default function CampaignSidebar({ campaign, creator, selectedReward, onSupportClick }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [amount, setAmount] = useState(selectedReward?.amount || 100);
    const [paymentForm, setPaymentForm] = useState({
        name: '',
        message: '',
        amount: selectedReward?.amount || 100
    });

    // Calculate progress
    const currentAmount = campaign.currentAmount || 0;
    const goalAmount = campaign.goalAmount || 1;
    const progress = Math.min((currentAmount / goalAmount) * 100, 100);

    // Calculate days remaining from endDate
    const daysRemaining = calculateDaysLeft(campaign.endDate);
    const isEnded = campaign.status === 'completed' || daysRemaining === 0;

    // Check for payment success
    useEffect(() => {
        if (searchParams.get("paymentdone") === "true") {
            toast.success('Thanks for your donation!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
                transition: Bounce,
            });
            // Refresh the page to update stats
            setTimeout(() => {
                window.location.href = `/campaign/${campaign._id}`;
            }, 1500);
        }
    }, [searchParams, campaign._id]);

    // Update amount in form when quick amount is selected
    useEffect(() => {
        setPaymentForm(prev => ({ ...prev, amount }));
    }, [amount]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPaymentForm({ ...paymentForm, [name]: value });
        if (name === 'amount') {
            setAmount(Math.max(1, parseInt(value) || 0));
        }
    };

    const pay = async (paymentAmount) => {
        try {
            // Validate inputs
            if (!paymentForm.name || paymentForm.name.length < 3) {
                toast.error('Please enter your name (minimum 3 characters)', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "dark",
                    transition: Bounce,
                });
                return;
            }

            if (!paymentForm.message || paymentForm.message.length < 3) {
                toast.error('Please enter a message (minimum 3 characters)', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "dark",
                    transition: Bounce,
                });
                return;
            }

            if (!paymentAmount || isNaN(paymentAmount) || paymentAmount < 1) {
                toast.error('Please enter a valid amount (minimum ₹1)', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "dark",
                    transition: Bounce,
                });
                return;
            }

            // Get the order Id
            const order = await initiate(paymentAmount * 100, creator.username, {
                ...paymentForm,
                campaign: campaign._id
            });
            const orderId = order.id;

            const options = {
                "key": creator.razorpayid, // Creator's Razorpay Key ID
                "amount": paymentAmount * 100, // Amount in paise
                "currency": "INR",
                "name": "Get Me A Chai",
                "description": `Support for ${campaign.title}`,
                "image": creator.profilepic || "/images/default-profilepic.svg",
                "order_id": orderId,
                "handler": async function (response) {
                    // Payment successful - verify and update
                    try {
                        const verifyResponse = await fetch('/api/razorpay', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: new URLSearchParams({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                            }).toString()
                        });

                        const result = await verifyResponse.json();

                        if (result.success) {
                            toast.success('Payment successful! Thank you for your support!', {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                theme: "dark",
                                transition: Bounce,
                            });

                            // Redirect to campaign page with success flag
                            setTimeout(() => {
                                router.push(`/campaign/${campaign._id}?paymentdone=true`);
                            }, 1500);
                        } else {
                            toast.error('Payment verification failed. Please contact support.', {
                                position: "top-right",
                                autoClose: 5000,
                                theme: "dark",
                                transition: Bounce,
                            });
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        toast.error('An error occurred. Please contact support.', {
                            position: "top-right",
                            autoClose: 5000,
                            theme: "dark",
                            transition: Bounce,
                        });
                    }
                },
                "prefill": {
                    "name": paymentForm.name || "Supporter",
                    "email": session?.user?.email || "",
                    "contact": ""
                },
                "notes": {
                    "campaign_id": campaign._id,
                    "campaign_title": campaign.title
                },
                "theme": {
                    "color": "#8b5cf6"
                },
                "modal": {
                    "ondismiss": function () {
                        toast.info('Payment cancelled', {
                            position: "top-right",
                            autoClose: 2000,
                            theme: "dark",
                            transition: Bounce,
                        });
                    }
                }
            };

            if (typeof window !== 'undefined' && window.Razorpay) {
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            } else {
                toast.error('Payment gateway not loaded. Please refresh the page.', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "dark",
                    transition: Bounce,
                });
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            toast.error(error.message || 'Failed to initiate payment. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
                transition: Bounce,
            });
        }
    };

    const handleSupport = () => {
        // Check if user is authenticated
        if (status === 'loading') {
            toast.info('Checking authentication...', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
                transition: Bounce,
            });
            return;
        }

        if (!session) {
            toast.error('Please login to support this campaign', {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
                transition: Bounce,
            });
            // Redirect to login page with return URL
            setTimeout(() => {
                router.push(`/login?callbackUrl=/campaign/${campaign._id}`);
            }, 1000);
            return;
        }

        // User is authenticated, proceed with payment
        pay(amount);
    };

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <div className="space-y-6">
                {/* Main Support Card */}
                <div id="payment-sidebar" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    {/* Progress Section */}
                    <div className="mb-6">
                        <div className="flex items-baseline justify-between mb-2">
                            <div>
                                <div className="text-3xl font-bold text-white">
                                    ₹{(currentAmount / 1000).toFixed(1)}K
                                </div>
                                <div className="text-sm text-gray-400">
                                    raised of ₹{(goalAmount / 1000).toFixed(0)}K goal
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-purple-400">
                                    {progress.toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1.5 text-gray-400">
                                <FaHeart className="w-3.5 h-3.5 text-red-400" />
                                <span>{campaign.stats?.supporters || 0} supporters</span>
                            </div>
                            <div className={`flex items-center gap-1.5 ${isEnded ? 'text-red-400' : 'text-gray-400'}`}>
                                <FaClock className={`w-3.5 h-3.5 ${isEnded ? 'text-red-400' : 'text-orange-400'}`} />
                                <span className={isEnded ? 'font-semibold' : ''}>{isEnded ? 'Campaign Ended' : `${daysRemaining} days left`}</span>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Ended Banner */}
                    {isEnded && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                            <div className="text-red-400 font-bold text-lg mb-1">Campaign Has Ended</div>
                            <p className="text-gray-400 text-sm">This campaign is no longer accepting contributions.</p>
                        </div>
                    )}

                    {/* Payment Form Fields - Hidden when ended */}
                    {!isEnded && (
                        <div className="space-y-4 mb-4">
                            {/* Name Input */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1 ml-1">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={paymentForm.name}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>

                            {/* Message Input */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1 ml-1">
                                    Message
                                </label>
                                <input
                                    type="text"
                                    name="message"
                                    value={paymentForm.message}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="Say something nice..."
                                />
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1 ml-1">
                                    Support Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={amount}
                                        onChange={handleChange}
                                        className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Enter amount"
                                        min="1"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Amount Buttons - Hidden when ended */}
                    {!isEnded && (
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {[100, 500, 1000].map((quickAmount) => (
                                <button
                                    key={quickAmount}
                                    type="button"
                                    onClick={() => {
                                        setAmount(quickAmount);
                                        setPaymentForm({ ...paymentForm, amount: quickAmount });
                                    }}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${amount === quickAmount
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                        }`}
                                >
                                    ₹{quickAmount}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Support Button */}
                    <button
                        onClick={handleSupport}
                        disabled={isEnded || (session && (!paymentForm.name || paymentForm.name.length < 3 || !paymentForm.message || paymentForm.message.length < 3 || !amount))}
                        className={`w-full py-4 font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isEnded
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-500/50 hover:scale-105'
                            }`}
                    >
                        {isEnded ? (
                            <>
                                <FaClock className="w-4 h-4" />
                                <span>Campaign Ended</span>
                            </>
                        ) : !session ? (
                            <>
                                <FaLock className="w-4 h-4" />
                                <span>Login to Support</span>
                            </>
                        ) : (
                            <>
                                <FaHeart className="w-4 h-4" />
                                <span>Support This Campaign</span>
                            </>
                        )}
                    </button>

                    {/* Login Required Message */}
                    {!session && !isEnded && (
                        <div className="mt-3 text-center text-sm text-gray-400">
                            <p>🔒 You need to be logged in to support this campaign</p>
                        </div>
                    )}

                    {/* Trust Badges */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                                <FaFire className="w-3 h-3 text-orange-400" />
                                <span>Secure Payment</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <FaHeart className="w-3 h-3 text-red-400" />
                                <span>100% Safe</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                        <FaShare className="w-4 h-4" />
                        <span className="text-sm font-medium">Share</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                        <FaFlag className="w-4 h-4" />
                        <span className="text-sm font-medium">Report</span>
                    </button>
                </div>

                {/* Creator Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">About Creator</h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Total Raised</span>
                            <span className="font-semibold text-white">
                                {(creator.stats?.totalRaised || 0) >= 100000
                                    ? `₹${((creator.stats?.totalRaised || 0) / 1000).toFixed(1)}K`
                                    : `₹${(creator.stats?.totalRaised || 0).toLocaleString('en-IN')}`
                                }
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Supporters</span>
                            <span className="font-semibold text-white">
                                {creator.stats?.totalSupporters || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Campaigns</span>
                            <span className="font-semibold text-white">
                                {creator.stats?.campaignsCount || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Success Rate</span>
                            <span className="font-semibold text-green-400">
                                {creator.stats?.successRate || 0}%
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push(`/${creator.username}`)}
                        className="w-full mt-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all"
                    >
                        View Profile
                    </button>
                </div>
            </div>
        </>
    );
}
