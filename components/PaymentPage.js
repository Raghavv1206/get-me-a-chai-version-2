// C:\Users\ragha\project\get-me-a-chai\components\PaymentPage.js
"use client"
import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import { useSession } from 'next-auth/react'
import { fetchuser, fetchpayments, initiate } from '@/actions/useractions'
import { useSearchParams } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useRouter } from 'next/navigation'
import { notFound } from "next/navigation"

const PaymentPage = ({ username }) => {

  // const { data: session } = useSession()

  const [paymentform, setPaymentform] = useState({ name: "", message: "", amount: "" })
  const [currentUser, setcurrentUser] = useState({})
  const [payments, setPayments] = useState([])
  const [stars, setStars] = useState([]); // Hydration-safe star field
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Only generate stars on client
    const generatedStars = Array.from({ length: 120 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      background: `rgba(255,255,255,${Math.random() * 0.7 + 0.3})`,
      opacity: Math.random() * 0.7 + 0.3,
      filter: 'blur(0.5px)'
    }));
    setStars(generatedStars);
  }, []);

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
        "name": "Get Me A Chai", //your business name
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
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
        "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
          "name": paymentform.name || "Supporter", //your customer's name
          "email": "supporter@example.com",
          "contact": "9000090000" //Provide the customer's phone number for better conversion rates 
        },
        "notes": {
          "address": "Razorpay Corporate Office"
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
    <>
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#111]">
        {/* Starry Night Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Star field */}
          <div className="absolute inset-0">
            {stars.map((star, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={star}
              ></div>
            ))}
          </div>
          {/* Subtle nebula shapes */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-800/30 rounded-full blur-3xl"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gray-900/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gray-700/30 rounded-full blur-2xl"></div>
        </div>
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


        <div className="cover w-full relative">
          {(currentUser.coverpic || "/images/default-coverpic.jpg") && (
            <img
              className="object-cover w-full h-48 md:h-[350px] shadow-blue-700 shadow-sm"
              src={currentUser.coverpic || "/images/default-coverpic.jpg"}
              alt="coverimg"
            />
          )}
          <div className="absolute -bottom-20 right-[33%] md:right-[46%] border-white overflow-hidden border-2 rounded-full size-36">
            {(currentUser.profilepic || "/images/default-profilepic.jpg") && (
              <img
                className="rounded-full object-cover size-36"
                width={128}
                height={128}
                src={currentUser.profilepic || "/images/default-profilepic.jpg"}
                alt="profileimg"
              />
            )}
          </div>
        </div>

        <div className="info flex justify-center items-center my-24 mb-32 flex-col gap-2 relative z-10">
          <div className="font-bold text-2xl text-white tracking-wide">@{username}</div>
          <div className="text-gray-400 text-lg">Lets help {username} get a chai!</div>
          <div className="text-gray-400 text-lg">{payments.length} Payments · ₹{payments.reduce((a, b) => a + b.amount, 0)} raised</div>

          <div className="payment flex gap-8 w-full max-w-5xl mt-11 flex-col md:flex-row">
            <div className="supporters w-full md:w-1/2 bg-gray-900/80 rounded-2xl text-white px-2 md:p-10 shadow-xl border border-gray-800 backdrop-blur-md">
              <h2 className="text-2xl font-bold my-5 text-gray-100">Top 10 Supporters</h2>
              <ul className="mx-5 text-lg">
                {payments.length == 0 && <li className="text-gray-500">No payments yet</li>}
                {payments.map((p, i) => (
                  <li key={i} className="my-4 flex gap-3 items-center">
                    <img width={40} className="rounded-full grayscale border border-gray-700" src="avatar.gif" alt="user avatar" />
                    <span className="text-gray-200">
                      {p.name} donated <span className="font-bold text-gray-100">₹{p.amount}</span> with a message &quot;{p.message}&quot;
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="makePayment w-full md:w-1/2 bg-gray-900/80 rounded-2xl text-white px-2 md:p-10 shadow-xl border border-gray-800 backdrop-blur-md">
              <h2 className="text-2xl font-bold my-5 text-gray-100">Make a Payment</h2>
              <div className="flex gap-4 flex-col">
                <input onChange={handleChange} value={paymentform.name} name="name" type="text" className="w-full p-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600" placeholder="Enter Name" />
                <input onChange={handleChange} value={paymentform.message} name="message" type="text" className="w-full p-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600" placeholder="Enter Message" />
                <input onChange={handleChange} value={paymentform.amount} name="amount" type="number" min="1" className="w-full p-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600" placeholder="Enter Amount (₹)" />
                <button onClick={() => {
                  const amount = Number.parseInt(paymentform.amount);
                  if (!paymentform.amount || isNaN(amount) || amount < 1) {
                    toast.error('Please enter a valid amount (minimum ₹1)', {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      theme: "dark",
                      transition: Bounce,
                    });
                    return;
                  }
                  pay(amount * 100);
                }} type="button" className="text-gray-100 bg-gray-800 hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-600 font-medium rounded-lg text-base px-5 py-2.5 text-center mb-2 border border-gray-700 transition-all duration-150 disabled:bg-slate-600 disabled:from-purple-100" disabled={paymentform.name?.length < 3 || paymentform.message?.length < 4 || paymentform.amount?.length < 1}>Pay</button>
              </div>
              <div className="flex flex-col md:flex-row gap-3 mt-5">
                <button className="bg-gray-800 text-gray-100 p-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition" onClick={() => {
                  if (!paymentform.name || paymentform.name.trim().length < 1) {
                    toast.error('Please fill your name before making a payment!', {
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
                    return;
                  }
                  if (!paymentform.message || paymentform.message.trim().length < 1) {
                    toast.error('Please fill your message before making a payment!', {
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
                    return;
                  }
                  pay(1000);
                }}>Pay ₹10</button>
                <button className="bg-gray-800 text-gray-100 p-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition" onClick={() => {
                  if (!paymentform.name || paymentform.name.trim().length < 1) {
                    toast.error('Please fill your name before making a payment!', {
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
                    return;
                  }
                  if (!paymentform.message || paymentform.message.trim().length < 1) {
                    toast.error('Please fill your message before making a payment!', {
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
                    return;
                  }
                  pay(2000);
                }}>Pay ₹20</button>
                <button className="bg-gray-800 text-gray-100 p-3 rounded-lg border border-gray-700 hover:bg-gray-700 transition" onClick={() => {
                  if (!paymentform.name || paymentform.name.trim().length < 1) {
                    toast.error('Please fill your name before making a payment!', {
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
                    return;
                  }
                  if (!paymentform.message || paymentform.message.trim().length < 1) {
                    toast.error('Please fill your message before making a payment!', {
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
                    return;
                  }
                  pay(3000);
                }}>Pay ₹30</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PaymentPage
