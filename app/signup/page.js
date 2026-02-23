// app/signup/page.js
"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Palette, Heart } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'creator' // creator or supporter
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    document.title = "Sign Up - Get Me A Chai";
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.accountType // Mapping accountType to role
        })
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        setErrors({ submit: data.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black selection:bg-purple-500/30 py-12 px-4">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-purple-600/20 blur-[130px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[130px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <div className="relative z-10 w-full max-w-md">

        {/* Form Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          {/* Glossy overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

          <div className="flex flex-col items-center mb-8 relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 group mb-4 hover:opacity-80 transition-opacity">
              <img src="/tea.gif" alt="Chai" className="w-10 h-10 drop-shadow-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Get Me A Chai
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
            <p className="text-gray-400 text-sm mt-1">Join our community of creators today</p>
          </div>

          {/* Error Alert */}
          {errors.submit && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.submit}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl bg-black/40 text-white placeholder-gray-500 border ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500/50'} focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1.5 ml-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl bg-black/40 text-white placeholder-gray-500 border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500/50'} focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1.5 ml-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-black/40 text-white placeholder-gray-500 border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500/50'} focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1.5 ml-1 text-xs text-red-400">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-black/40 text-white placeholder-gray-500 border ${errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500/50'} focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="mt-1.5 ml-1 text-xs text-red-400">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">I want to be a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, accountType: 'creator' }))}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${formData.accountType === 'creator'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-900/20'
                    : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Palette className="w-4 h-4 inline-block mr-1" /> Creator
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, accountType: 'supporter' }))}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${formData.accountType === 'supporter'
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                    : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Heart className="w-4 h-4 inline-block mr-1" /> Supporter
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-black/50 backdrop-blur-xl text-gray-500 rounded-full">
                Already have an account?{' '}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold hover:underline decoration-2 underline-offset-4 transition-all ml-1">
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;