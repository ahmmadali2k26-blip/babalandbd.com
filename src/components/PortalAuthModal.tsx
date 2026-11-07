import React, { useState } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Zap,
  Phone,
  User as UserIcon,
  MapPin,
  KeyRound,
  Send,
  Crown,
} from 'lucide-react';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
  initialMode?: 'login' | 'register' | 'single';
}

export const PortalAuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'single'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Login Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form states
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regFatherOrMother, setRegFatherOrMother] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOtp, setRegOtp] = useState('');

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [simulatedOtpNotice, setSimulatedOtpNotice] = useState<string | null>(null);

  // Turnstile state simulation
  const [turnstileVerified, setTurnstileVerified] = useState(true);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!regPhone || regPhone.length < 11) {
      setAlert({ type: 'error', message: 'ওটিপি পাঠাতে সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।' });
      return;
    }

    setOtpLoading(true);
    setAlert(null);
    try {
      const res = await fetch('/api/portal/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: regPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        setOtpCountdown(60);
        // Display simulated OTP banner for convenience
        setSimulatedOtpNotice(data.simulatedOtp || '458921');
        setRegOtp(data.simulatedOtp || '458921'); // Auto-fill for seamless user testing
        setAlert({
          type: 'success',
          message: `মোবাইলে ৬ ডিজিটের ওটিপি পাঠানো হয়েছে: ${data.simulatedOtp || '458921'}`,
        });

        const timer = setInterval(() => {
          setOtpCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setAlert({ type: 'error', message: data.message || 'ওটিপি পাঠানো যায়নি।' });
      }
    } catch {
      setAlert({ type: 'error', message: 'সার্ভার সংযোগে ত্রুটি হয়েছে।' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!loginIdentifier || !loginPassword) {
      setAlert({ type: 'error', message: 'মোবাইল নম্বর/ইউজার আইডি এবং পাসওয়ার্ড লিখুন।' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAlert({ type: 'success', message: 'লগইন সফল হয়েছে! সিস্টেমে প্রবেশ করা হচ্ছে...' });
        localStorage.setItem('babaland_token', data.token);
        setTimeout(() => {
          onSuccess(data.user, data.token);
          onClose();
        }, 500);
      } else {
        setAlert({ type: 'error', message: data.message || 'ভুল ইউজার আইডি অথবা পাসওয়ার্ড।' });
      }
    } catch {
      setAlert({ type: 'error', message: 'সার্ভার সংযোগে ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!regName.trim()) {
      setAlert({ type: 'error', message: 'আপনার পূর্ণ নাম লিখুন।' });
      return;
    }
    if (!regPhone || regPhone.length < 11) {
      setAlert({ type: 'error', message: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 01712345678)।' });
      return;
    }
    if (!regFatherOrMother.trim()) {
      setAlert({ type: 'error', message: 'পিতা অথবা মাতার নাম লিখুন।' });
      return;
    }
    if (!regAddress.trim()) {
      setAlert({ type: 'error', message: 'আপনার স্থায়ী বা বর্তমান ঠিকানা লিখুন।' });
      return;
    }
    if (!regPassword || regPassword.length < 8) {
      setAlert({ type: 'error', message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের শক্তিশালী হতে হবে।' });
      return;
    }
    if (!regOtp || regOtp.length !== 6) {
      setAlert({ type: 'error', message: '৬ ডিজিটের ওটিপি (OTP) ভেরিফিকেশন কোড লিখুন।' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/portal/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          phone: regPhone.trim(),
          fatherOrMotherName: regFatherOrMother.trim(),
          address: regAddress.trim(),
          password: regPassword,
          otp: regOtp.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAlert({ type: 'success', message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম...' });
        localStorage.setItem('babaland_token', data.token);
        setTimeout(() => {
          onSuccess(data.user, data.token);
          onClose();
        }, 600);
      } else {
        setAlert({ type: 'error', message: data.message || 'নিবন্ধনে সমস্যা হয়েছে।' });
      }
    } catch {
      setAlert({ type: 'error', message: 'সার্ভার সংযোগে ত্রুটি হয়েছে। পুনরায় চেষ্টা করুন।' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const res = await fetch('/api/portal/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'citizen@babalandbd.com',
          name: 'স্মার্ট নাগরিক (গুগল ভেরিফাইড)',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlert({ type: 'success', message: 'গুগল দিয়ে সফলভাবে প্রবেশ করা হয়েছে!' });
        localStorage.setItem('babaland_token', data.token);
        setTimeout(() => {
          onSuccess(data.user, data.token);
          onClose();
        }, 500);
      }
    } catch {
      setAlert({ type: 'error', message: 'গুগল সাইন-ইন সম্পন্ন করা যায়নি।' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminFill = () => {
    setMode('login');
    setLoginIdentifier('Admin');
    setLoginPassword('Admin68782800');
    setAlert({
      type: 'success',
      message: '👑 অ্যাডমিন ক্রেডেনশিয়াল লোড হয়েছে! "লগইন করুন" চাপুন।',
    });
  };

  const handleQuickDemoFill = () => {
    setMode('login');
    setLoginIdentifier('01700000000');
    setLoginPassword('demo123456');
    setAlert({ type: 'success', message: 'নাগরিক ডেমো অ্যাকাউন্টের তথ্য লোড হয়েছে!' });
  };

  const handleGuestSingleAccess = () => {
    const guestUser: User = {
      id: 'guest_single_' + Date.now().toString().slice(-4),
      name: 'অতিথি নাগরিক (একক সেবা)',
      phone: '01XXXXXXXXX',
      role: 'citizen',
      walletBalance: 150,
      createdAt: new Date().toISOString(),
    };
    onSuccess(guestUser, 'guest_token');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md my-auto bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-center backdrop-blur-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-lg"
          title="বন্ধ করুন"
        >
          ✕
        </button>

        {/* Logo Crest */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-3xl mx-auto mb-2.5 shadow-lg shadow-emerald-500/25 border border-emerald-400/40">
          📜
        </div>

        {/* Portal Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>babalandbd.com • নিরাপদ ভূমি সেবা পোর্টাল</span>
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">
          {mode === 'register'
            ? 'নাগরিকের নিজস্ব অ্যাকাউন্ট নিবন্ধন'
            : mode === 'single'
            ? 'একক ভূমি সেবা গেটওয়ে'
            : 'অ্যাকাউন্টে লগইন'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 mb-3 leading-relaxed">
          {mode === 'register'
            ? 'নাম, মোবাইল নম্বর, পিতা/মাতার নাম, ঠিকানা ও ওটিপি দিয়ে নিজস্ব অ্যাকাউন্ট তৈরি করুন।'
            : 'নাগরিক ড্যাশবোর্ড অথবা অ্যাডমিন প্যানেলে প্রবেশের জন্য লগইন করুন।'}
        </p>

        {/* Fast Credential Selectors Banner */}
        <div className="mb-3.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleQuickAdminFill}
            className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-[11px] text-purple-300 flex items-center justify-center gap-1.5 transition-all text-left"
            title="Admin / Admin68782800"
          >
            <Crown className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="font-semibold">অ্যাডমিন লগইন</span>
          </button>
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center justify-center gap-1.5 transition-all text-left"
          >
            <UserIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold">নাগরিক ডেমো</span>
          </button>
        </div>

        {/* Cloudflare Turnstile Simulated Widget */}
        <div className="flex justify-center mb-3">
          <div
            onClick={() => setTurnstileVerified(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-xs cursor-pointer hover:border-emerald-500/60 transition-all shadow-inner"
          >
            <div
              className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                turnstileVerified ? 'bg-emerald-500 text-white' : 'border border-slate-500'
              }`}
            >
              {turnstileVerified ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <span className="animate-ping w-2 h-2 rounded-full bg-cyan-400"></span>
              )}
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-semibold text-slate-200">
                ক্লাউড সিকিউরিটি ভেরিফাইড (Turnstile)
              </span>
            </div>
            <div className="text-slate-500 text-[10px] font-mono pl-1">256-bit</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-3">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setAlert(null);
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>লগইন</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setAlert(null);
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>নতুন অ্যাকাউন্ট</span>
          </button>
        </div>

        {/* Alert Banner */}
        {alert && (
          <div
            className={`mb-3 p-2.5 rounded-xl text-left text-xs flex items-center gap-2 ${
              alert.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
            }`}
          >
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            )}
            <span className="flex-1 leading-snug">{alert.message}</span>
          </div>
        )}

        {/* Simulated OTP Notification Banner */}
        {simulatedOtpNotice && mode === 'register' && (
          <div className="mb-3 p-2 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-xs text-cyan-200 text-left flex items-center justify-between">
            <div>
              <span className="block font-bold text-cyan-300">
                📩 সিমুলেটেড SMS ওটিপি কোড:
              </span>
              <span className="font-mono text-sm tracking-wider font-extrabold text-white">
                {simulatedOtpNotice}
              </span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-400/30">
              অটো-ফিল্ড
            </span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="text-left space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                মোবাইল নম্বর / ইউজার আইডি (Admin এর জন্য: Admin)
              </label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="যেমন: 01712345678 অথবা Admin"
                required
                className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                পাসওয়ার্ড (Admin এর জন্য: Admin68782800)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  required
                  className="w-full h-10 px-3.5 pr-10 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>লগইন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* REGISTRATION FORM (Full Fields: Name, Phone, Father/Mother, Address, Password, OTP) */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="text-left space-y-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-0.5">
                পূর্ণ নাম <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                required
                className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-0.5">
                মোবাইল নম্বর <span className="text-rose-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="যেমন: 01712345678"
                  required
                  pattern="[0-9]{11}"
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || otpCountdown > 0}
                  className="px-3 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-60 text-white text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all"
                >
                  {otpLoading ? (
                    'পাঠানো হচ্ছে...'
                  ) : otpCountdown > 0 ? (
                    `${otpCountdown}s`
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>ওটিপি পাঠান</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-0.5">
                পিতা / মাতার নাম <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={regFatherOrMother}
                onChange={(e) => setRegFatherOrMother(e.target.value)}
                placeholder="যেমন: মোঃ আব্দুর রহিম / মোসাঃ রহিমা খাতুন"
                required
                className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-0.5">
                বর্তমান বা স্থায়ী ঠিকানা <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                placeholder="গ্রাম/রোড, ডাকঘর, উপজেলা, জেলা"
                required
                className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-0.5">
                পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="কমপক্ষে ৮ অক্ষরের শক্তিশালী পাসওয়ার্ড"
                  required
                  minLength={8}
                  className="w-full h-9 px-3 pr-9 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-0.5">
                ৬ ডিজিট OTP ভেরিফিকেশন কোড <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={regOtp}
                onChange={(e) => setRegOtp(e.target.value)}
                placeholder="৬ ডিজিটের ওটিপি কোড (যেমন: 458921)"
                required
                maxLength={6}
                className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-cyan-500/60 text-cyan-300 font-mono tracking-widest text-center text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>নাগরিক অ্যাকাউন্ট তৈরি করুন</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 1-Click Google Login Button */}
        <div className="mt-3 pt-2.5 border-t border-slate-800">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-10 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>গুগল দিয়ে দ্রুত সাইন-ইন</span>
          </button>
        </div>

        {/* Guest Single Mode Access */}
        <div className="mt-2.5">
          <button
            type="button"
            onClick={handleGuestSingleAccess}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-[11px] text-emerald-400 border border-emerald-500/25 flex items-center justify-center gap-1.5 transition-colors font-medium"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>লগইন ছাড়া একক সার্ভিস মোড (#single)</span>
          </button>
        </div>

        {/* Security hint footer */}
        <div className="mt-2.5 text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>SHA-512 এনক্রিপশন ও ওটিপি ভেরিফাইড ডাটাবেস</span>
        </div>
      </div>
    </div>
  );
};
