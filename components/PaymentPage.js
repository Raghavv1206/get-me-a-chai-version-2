// components/PaymentPage.js
"use client"
import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import { fetchuser, fetchpayments, initiate } from '@/actions/useractions'
import { useSearchParams } from 'next/navigation'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation'

const PaymentPage = ({ username }) => {

  const [paymentform, setPaymentform] = useState({ name: "", message: "", amount: "" })
  const [currentUser, setcurrentUser] = useState({})
  const [payments, setPayments] = useState([])
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    if (searchParams.get("paymentdone") == "true") {
      toast('Thanks for your donation!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      // Only redirect after payment
      router.push(`/${username}`)
    }
  }, [searchParams, username])


  const handleChange = (e) => {
    setPaymentform({ ...paymentform, [e.target.name]: e.target.value })
  }

  const getData = async () => {
    let u = await fetchuser(username)
    setcurrentUser(u)
    let dbpayments = await fetchpayments(username)
    setPayments(dbpayments)
  }


  const pay = async (amount) => {
    try {
      // Get the order Id 
      let a = await initiate(amount, username, paymentform)
      let orderId = a.id
      var options = {
        "key": currentUser.razorpayid, // Enter the Key ID generated from the Dashboard
        "amount": amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Get Me A Chai",
        "description": `Support ${currentUser.name || username}`,
        "image": currentUser.profilepic || "/images/logo.png",
        "order_id": orderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
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
              // Show success toast
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

              // Redirect to profile page after a short delay
              setTimeout(() => {
                router.push(`/${username}?paymentdone=true`);
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
          "name": paymentform.name || "Supporter",
          "email": session?.user?.email || "",
          "contact": ""
        },
        "notes": {
          "message": paymentform.message || ""
        },
        "theme": {
          "color": "#3399cc"
        },
        "modal": {
          "ondismiss": function () {
            // User closed the payment modal
            toast.info('Payment cancelled', {
              position: "top-right",
              autoClose: 2000,
              theme: "dark",
              transition: Bounce,
            });
          }
        }
      }

      var rzp1 = new Razorpay(options);
      rzp1.open();
    } catch (error) {
      // Catch errors from initiate() function
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
  }


  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Background Ambient Effects - Same as Dashboard */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-0 left-20 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none z-0" />

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
        theme="light" />
      <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>


      <div className="relative z-10">
        <div className="cover w-full relative">
          {(currentUser.coverpic || "/images/default-coverpic.jpg") && (
            <div className="w-full h-48 md:h-[350px] overflow-hidden relative">
              <img
                className="object-cover w-full h-full"
                src={currentUser.coverpic || "/images/default-coverpic.jpg"}
                alt="coverimg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            </div>
          )}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 border-4 border-black overflow-hidden rounded-full w-32 h-32 md:w-40 md:h-40 shadow-2xl shadow-purple-900/50">
            {(currentUser.profilepic || "/images/default-profilepic.svg") && (
              <img
                className="rounded-full object-cover w-full h-full bg-black"
                width={160}
                height={160}
                src={currentUser.profilepic || "/images/default-profilepic.svg"}
                alt="profileimg"
              />
            )}
          </div>
        </div>

        <div className="info flex flex-col items-center mt-20 mb-8 gap-2 px-4 text-center">
          <div className="font-bold text-3xl text-white tracking-tight flex items-center gap-2">
            @{username}
            {currentUser.verified && <span className="text-blue-500 text-xl" title="Verified">✓</span>}
          </div>
          <div className="text-gray-400 text-lg font-light">Lets help {username} get a chai!</div>
          <div className="text-purple-400 font-medium bg-purple-900/20 px-4 py-1 rounded-full border border-purple-500/20">
            {payments.length} Payments · ₹{payments.reduce((a, b) => a + b.amount, 0)} raised
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex flex-col md:flex-row gap-6">

            {/* Supporters List */}
            <div className="w-full md:w-1/2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 hover:bg-white/10 transition-all duration-300">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <span>🏆</span> Top Supporters
              </h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {payments.length === 0 && (
                  <div className="text-center py-10 text-gray-500 italic bg-black/20 rounded-xl border border-white/5">
                    No payments yet. Be the first to support!
                  </div>
                )}
                {payments.map((p, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 rounded-xl bg-black/20 border border-white/5 hover:border-purple-500/30 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-white truncate">{p.name || 'Anonymous'}</span>
                        <span className="font-bold text-green-400 whitespace-nowrap">₹{p.amount}</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1 leading-relaxed break-words">
                        &quot;{p.message}&quot;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Make Payment Form */}
            <div className="w-full md:w-1/2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 sticky top-24 h-fit hover:bg-white/10 transition-all duration-300">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <span>⚡</span> Make a Payment
              </h2>
              <div className="flex gap-4 flex-col">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1 ml-1">Name</label>
                  <input
                    onChange={handleChange}
                    value={paymentform.name}
                    name="name"
                    type="text"
                    className="w-full p-4 rounded-xl bg-black/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1 ml-1">Message</label>
                  <input
                    onChange={handleChange}
                    value={paymentform.message}
                    name="message"
                    type="text"
                    className="w-full p-4 rounded-xl bg-black/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600"
                    placeholder="Say something nice..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1 ml-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input
                      onChange={handleChange}
                      value={paymentform.amount}
                      name="amount"
                      type="number"
                      min="1"
                      className="w-full p-4 pl-8 rounded-xl bg-black/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-600"
                      placeholder="Enter Amount"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 my-2">
                  {[100, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button" // Prevent form submission if in form
                      className="py-2 px-3 bg-white/5 hover:bg-purple-600/20 text-gray-300 hover:text-purple-300 border border-white/10 hover:border-purple-500/50 rounded-lg text-sm transition-all"
                      onClick={() => {
                        setPaymentform({ ...paymentform, amount: amt })
                        pay(amt * 100);
                      }}
                    >
                      Pay ₹{amt}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const amount = Number.parseInt(paymentform.amount);
                    if (!paymentform.amount || isNaN(amount) || amount < 1) {
                      toast.error('Please enter a valid amount (minimum ₹1)', {
                        position: "top-right",
                        autoClose: 3000,
                        theme: "dark",
                        transition: Bounce,
                      });
                      return;
                    }
                    pay(amount * 100);
                  }}
                  type="button"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl text-lg px-5 py-4 text-center mt-2 shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={paymentform.name?.length < 3 || paymentform.message?.length < 3 || !paymentform.amount}
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
