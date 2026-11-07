import React, { useState, useEffect } from 'react';
import {
  Crown,
  Users,
  CreditCard,
  FileText,
  DollarSign,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Search,
  Lock,
  Unlock,
  PlusCircle,
  MinusCircle,
  Download,
  Printer,
  RefreshCw,
  X,
  Check,
  Ban,
  TrendingUp,
} from 'lucide-react';
import { User, PaymentTransaction, CitizenServiceApplication, ServicePriceConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  adminUser: User;
  onAdminUpdated?: (updatedAdmin: User) => void;
}

export const AdminPanelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  adminUser,
  onAdminUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'payments' | 'applications' | 'pricing' | 'security'
  >('overview');

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingPaymentsCount: 0,
    totalRevenue: 0,
    totalApplications: 0,
  });

  // Users State
  const [userList, setUserList] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [adjustingUserId, setAdjustingUserId] = useState<string | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number>(100);
  const [balanceAction, setBalanceAction] = useState<'add' | 'deduct'>('add');

  // Payments State
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [verifyingPaymentId, setVerifyingPaymentId] = useState<string | null>(null);

  // Applications State
  const [applications, setApplications] = useState<CitizenServiceApplication[]>([]);
  const [appFilter, setAppFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [previewApp, setPreviewApp] = useState<CitizenServiceApplication | null>(null);

  // Pricing State
  const [pricing, setPricing] = useState<ServicePriceConfig>({
    singleKhatian: 2,
    mouzaVolume: 350,
    mapsDrive: 100,
    urgentSla: 150,
    mutationCourtFee: 20,
    mutationNoticeFee: 50,
    mutationRecordFee: 1000,
  });
  const [pricingSaved, setPricingSaved] = useState(false);

  // Security / Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('babaland_token');
    if (!token) return;

    try {
      setLoading(true);

      // Overview
      const oRes = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const oData = await oRes.json();
      if (oData.success) {
        setStats(oData.stats);
      }

      // Users
      const uRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const uData = await uRes.json();
      if (uData.success) {
        setUserList(uData.users);
      }

      // Payments
      const pRes = await fetch('/api/admin/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pData = await pRes.json();
      if (pData.success) {
        setPayments(pData.payments);
      }

      // Applications
      const aRes = await fetch('/api/admin/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const aData = await aRes.json();
      if (aData.success) {
        setApplications(aData.applications);
      }

      // Pricing
      const prRes = await fetch('/api/admin/pricing', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const prData = await prRes.json();
      if (prData.success) {
        setPricing(prData.pricing);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle user block
  const handleToggleBlock = async (userId: string) => {
    const token = localStorage.getItem('babaland_token');
    try {
      const res = await fetch(`/api/admin/user/${userId}/toggle-block`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        fetchAdminData();
      } else {
        showToast(data.message || 'ব্যর্থ হয়েছে', 'error');
      }
    } catch {
      showToast('সার্ভার সংযোগে ত্রুটি', 'error');
    }
  };

  // Balance adjustment
  const handleAdjustBalance = async (userId: string) => {
    const token = localStorage.getItem('babaland_token');
    try {
      const res = await fetch(`/api/admin/user/${userId}/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: balanceAmount,
          action: balanceAction,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`ব্যালেন্স সফলভাবে আপডেট হয়েছে! নতুন ব্যালেন্স: ৳${data.newBalance}`);
        setAdjustingUserId(null);
        fetchAdminData();
      } else {
        showToast(data.message || 'ব্যর্থ হয়েছে', 'error');
      }
    } catch {
      showToast('সার্ভার সংযোগে ত্রুটি', 'error');
    }
  };

  // Payment Verification (Approve / Reject)
  const handleVerifyPayment = async (paymentId: string, status: 'APPROVED' | 'REJECTED') => {
    const token = localStorage.getItem('babaland_token');
    setVerifyingPaymentId(paymentId);
    try {
      const res = await fetch(`/api/admin/payment/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          adminNote: status === 'APPROVED' ? 'মোবাইল ব্যাংকিং ভেরিফাইড' : 'ভুল ট্রানজেকশন তথ্য',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          status === 'APPROVED'
            ? 'পেমেন্ট অনুমোদিত হয়েছে এবং নাগরিকের অ্যাকাউন্টে ব্যালেন্স যোগ করা হয়েছে!'
            : 'পেমেন্ট বাতিল করা হয়েছে।'
        );
        fetchAdminData();
      } else {
        showToast(data.message || 'ব্যর্থ হয়েছে', 'error');
      }
    } catch {
      showToast('সার্ভার সংযোগে সমস্যা হয়েছে', 'error');
    } finally {
      setVerifyingPaymentId(null);
    }
  };

  // Save Pricing
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('babaland_token');
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pricing),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPricingSaved(true);
        showToast('সেবামূল্য সফলভাবে সংরক্ষণ ও আপডেট করা হয়েছে!');
        setTimeout(() => setPricingSaved(false), 3000);
      }
    } catch {
      showToast('মূল্য সংরক্ষণে সমস্যা হয়েছে', 'error');
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'উভয় পাসওয়ার্ড একই হতে হবে।' });
      return;
    }

    const token = localStorage.getItem('babaland_token');
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwdMsg({ type: 'success', text: 'অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' });
        setNewPassword('');
        setConfirmPassword('');
        if (onAdminUpdated) {
          onAdminUpdated({ ...adminUser, passwordMustChange: false });
        }
      } else {
        setPwdMsg({ type: 'error', text: data.message || 'পাসওয়ার্ড পরিবর্তন করা যায়নি।' });
      }
    } catch {
      setPwdMsg({ type: 'error', text: 'সার্ভার সংযোগে সমস্যা হয়েছে।' });
    }
  };

  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch) ||
      u.id.includes(userSearch)
  );

  const filteredPayments = payments.filter((p) => {
    if (paymentFilter === 'ALL') return true;
    return p.status === paymentFilter;
  });

  const filteredApps = applications.filter((a) => {
    if (appFilter === 'ALL') return true;
    return a.status === appFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-purple-900/50 rounded-3xl shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-purple-900/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-xl shadow-md border border-purple-400/40">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  অ্যাডমিন কন্ট্রোল প্যানেল (Admin Panel)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ID: Admin
                </span>
                {adminUser.passwordMustChange && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    প্রাথমিক পাসওয়ার্ড পরিবর্তন জরুরি
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                babalandbd.com • ব্যবহারকারী, পেমেন্ট ও সেবা ব্যবস্থাপনা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-lg"
              title="বন্ধ করুন"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {toast && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center justify-between ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-300 border-b border-emerald-500/40'
                : 'bg-rose-950 text-rose-300 border-b border-rose-500/40'
            }`}
          >
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white ml-2">
              ✕
            </button>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>১. ওভারভিউ ও হিসাব</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>২. ব্যবহারকারী নিয়ন্ত্রণ</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all relative ${
              activeTab === 'payments'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>৩. পেমেন্ট অনুমোদন (০১৩২০৫০৭৩৮৩)</span>
            {stats.pendingPaymentsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {stats.pendingPaymentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'applications'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>৪. সেবার আবেদন ও PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'pricing'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>৫. সেবামূল্য নির্ধারণ</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'security'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>৬. পাসওয়ার্ড ও নিরাপত্তা</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    মোট নাগরিক ইউজার
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono">
                    {stats.totalUsers} জন
                  </div>
                  <span className="text-[10px] text-emerald-400">সক্রিয় ডাটাবেস প্রোফাইল</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    অপেক্ষমান পেমেন্ট
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 font-mono">
                    {stats.pendingPaymentsCount} টি
                  </div>
                  <span className="text-[10px] text-amber-300">যাচাইয়ের অপেক্ষায়</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    মোট গৃহীত রেভিনিউ
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
                    ৳{stats.totalRevenue}
                  </div>
                  <span className="text-[10px] text-emerald-400">অনুমোদিত মোবাইল ব্যাংকিং</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">
                    মোট সেবার আবেদন
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-1 font-mono">
                    {stats.totalApplications} টি
                  </div>
                  <span className="text-[10px] text-cyan-400">খতিয়ান, ভলিউম ও ম্যাপস</span>
                </div>
              </div>

              {/* Quick Actions & Receiver Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">
                    মোবাইল ব্যাংকিং রিসিভার নম্বর: <span className="font-mono text-emerald-400">01320507383</span>
                  </h4>
                  <p className="text-slate-300 mt-0.5">
                    বিকাশ, নগদ ও রকেটের মাধ্যমে গ্রাহকদের প্রেরিত টাকা "পেমেন্ট অনুমোদন" ট্যাব থেকে যাচাই ও ওয়ালেটে ক্রেডিট করুন।
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('payments')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white whitespace-nowrap cursor-pointer transition-colors"
                >
                  পেমেন্ট যাচাই করুন ({stats.pendingPaymentsCount})
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-bold text-sm text-white">
                  নিবন্ধিত নাগরিক তালিকা ({filteredUsers.length}):
                </h4>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
                    className="w-full h-9 pl-8 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">নাগরিকের নাম</th>
                      <th className="p-3">মোবাইল</th>
                      <th className="p-3">রোল</th>
                      <th className="p-3">ওয়ালেট ব্যালেন্স</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-white">
                          <div>{u.name}</div>
                          {u.fatherOrMotherName && (
                            <span className="text-[10px] text-slate-400">
                              পিতা/মাতা: {u.fatherOrMotherName}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-emerald-400">{u.phone}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          ৳{u.walletBalance}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'BLOCKED'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {u.status === 'BLOCKED' ? 'ব্লকড' : 'সক্রিয়'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Balance adjustment */}
                            <button
                              onClick={() => setAdjustingUserId(adjustingUserId === u.id ? null : u.id)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold transition-colors"
                            >
                              ব্যালেন্স
                            </button>

                            {/* Block / Unblock */}
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleBlock(u.id)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                                  u.status === 'BLOCKED'
                                    ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-500/30'
                                    : 'bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-500/30'
                                }`}
                              >
                                {u.status === 'BLOCKED' ? 'আনব্লক' : 'ব্লক'}
                              </button>
                            )}
                          </div>

                          {/* Inline balance adjustment drawer */}
                          {adjustingUserId === u.id && (
                            <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-700 text-left space-y-2">
                              <span className="text-[10px] text-slate-400 block font-bold">
                                {u.name}-এর ব্যালেন্স পরিবর্তন:
                              </span>
                              <div className="flex items-center gap-2">
                                <select
                                  value={balanceAction}
                                  onChange={(e) => setBalanceAction(e.target.value as any)}
                                  className="h-8 px-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                                >
                                  <option value="add">+ যোগ করুন</option>
                                  <option value="deduct">- কর্তন করুন</option>
                                </select>
                                <input
                                  type="number"
                                  value={balanceAmount}
                                  onChange={(e) => setBalanceAmount(Number(e.target.value))}
                                  min={1}
                                  className="w-20 h-8 px-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                                />
                                <button
                                  onClick={() => handleAdjustBalance(u.id)}
                                  className="h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                                >
                                  সংরক্ষণ
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT VERIFICATION */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    মোবাইল ব্যাংকিং পেমেন্ট অনুমোদন (নম্বর: ০১৩২০৫০৭৩৮৩)
                  </h4>
                  <p className="text-xs text-slate-400">
                    গ্রাহকদের বিকাশ, নগদ ও রকেট পেমেন্ট ট্রানজেকশন যাচাই করে অনুমোদন করুন
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setPaymentFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        paymentFilter === filter
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {filter === 'PENDING'
                        ? 'অপেক্ষমান'
                        : filter === 'APPROVED'
                        ? 'অনুমোদিত'
                        : filter === 'REJECTED'
                        ? 'বাতিল'
                        : 'সকল'}
                    </button>
                  ))}
                </div>
              </div>

              {filteredPayments.length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  এই ক্যাটাগরিতে কোনো পেমেন্ট রেকর্ড নেই।
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-bold text-sm">{p.trxId}</span>
                          <span className="uppercase text-[10px] px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-200">
                            {p.method}
                          </span>
                          <span className="text-slate-400">গ্রাহক: {p.userName}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1">
                          প্রেরক মোবাইল: <strong className="text-white font-mono">{p.senderPhone}</strong> • প্রাপক: <span className="font-mono text-emerald-400">{p.receiverNumber}</span> • তারিখ: {new Date(p.createdAt).toLocaleDateString('bn-BD')} {new Date(p.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="block font-mono font-extrabold text-base text-emerald-400">
                            ৳{p.amount}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : p.status === 'REJECTED'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300 animate-pulse'
                            }`}
                          >
                            {p.status === 'APPROVED'
                              ? 'অনুমোদিত'
                              : p.status === 'REJECTED'
                              ? 'বাতিল'
                              : 'অপেক্ষমান'}
                          </span>
                        </div>

                        {p.status === 'PENDING' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerifyPayment(p.id, 'APPROVED')}
                              disabled={verifyingPaymentId === p.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>অনুমোদন</span>
                            </button>
                            <button
                              onClick={() => handleVerifyPayment(p.id, 'REJECTED')}
                              disabled={verifyingPaymentId === p.id}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white text-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>বাতিল</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SERVICE APPLICATIONS & PDF */}
          {activeTab === 'applications' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">
                  নাগরিক সেবার আবেদন ও অফিশিয়াল PDF রেকর্ড ({filteredApps.length}):
                </h4>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {(['ALL', 'PENDING', 'APPROVED'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setAppFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        appFilter === filter ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {filter === 'ALL' ? 'সকল' : filter === 'PENDING' ? 'প্রক্রিয়াধীন' : 'অনুমোদিত'}
                    </button>
                  ))}
                </div>
              </div>

              {filteredApps.length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  কোনো আবেদন পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredApps.map((a) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{a.title}</span>
                          <span className="font-mono text-cyan-400 text-[10px]">
                            {a.certificateNo || a.id}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          আবেদনকারী: {a.applicantName} ({a.applicantPhone}) • {a.district}, {a.upazila} • মৌজা: {a.mouza} (জেএল: {a.jlNo})
                        </p>
                        <p className="text-slate-500 text-[10px]">
                          ফি: ৳{a.feePaid} • তারিখ: {new Date(a.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewApp(a)}
                          className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-purple-300 font-semibold border border-purple-500/40 flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF তৈরি ও প্রিন্ট</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PDF Preview Modal in Admin */}
              {previewApp && (
                <div className="p-4 rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-xl space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-sm">অফিশিয়াল পরচা / সনদ প্রিভিউ</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>প্রিন্ট / PDF</span>
                      </button>
                      <button
                        onClick={() => setPreviewApp(null)}
                        className="text-slate-500 hover:text-black font-bold text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="font-bold text-base">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h3>
                    <p className="text-xs text-slate-600">ডিজিটাল ভূমি সেবা পোর্টাল • babalandbd.com</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      সনদ নং: {previewApp.certificateNo} | আবেদনকারী: {previewApp.applicantName} | তারিখ: {previewApp.issueDate}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SERVICE PRICING MANAGEMENT */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white">
                  সেবামূল্য নির্ধারণ ও পরিবর্তন (Service Pricing Configuration)
                </h4>
                <p className="text-xs text-slate-400">
                  অ্যাডমিন এখান থেকে প্রতিটি সেবার মূল্য পরিবর্তন করতে পারবেন, যা তাৎক্ষণিকভাবে পুরো ওয়েবসাইটে কার্যকর হবে।
                </p>
              </div>

              {pricingSaved && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>সেবামূল্য সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে!</span>
                </div>
              )}

              <form onSubmit={handleSavePricing} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      একক খতিয়ান অফার ফি (৳)
                    </label>
                    <input
                      type="number"
                      value={pricing.singleKhatian}
                      onChange={(e) => setPricing({ ...pricing, singleKhatian: Number(e.target.value) })}
                      required
                      min={0}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500">ডিফল্ট স্পেশাল অফার: ২/- টাকা</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      ১ পুরো মৌজা তল্লাশি ও ভলিউম ফি (৳)
                    </label>
                    <input
                      type="number"
                      value={pricing.mouzaVolume}
                      onChange={(e) => setPricing({ ...pricing, mouzaVolume: Number(e.target.value) })}
                      required
                      min={0}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500">ডিফল্ট ফি: ৩৫০/- টাকা</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      সারাদেশের ম্যাপস ড্রাইভ ফি (৳)
                    </label>
                    <input
                      type="number"
                      value={pricing.mapsDrive}
                      onChange={(e) => setPricing({ ...pricing, mapsDrive: Number(e.target.value) })}
                      required
                      min={0}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500">ডিফল্ট ফি: ১০০/- টাকা</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      জরুরি ৩০ মি. SLA খতিয়ান তল্লাশি ফি (৳)
                    </label>
                    <input
                      type="number"
                      value={pricing.urgentSla}
                      onChange={(e) => setPricing({ ...pricing, urgentSla: Number(e.target.value) })}
                      required
                      min={0}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                    <span className="text-[10px] text-slate-500">ডিফল্ট ফি: ১৫০/- টাকা</span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      নামজারি কোর্ট ফি (৳)
                    </label>
                    <input
                      type="number"
                      value={pricing.mutationCourtFee}
                      onChange={(e) => setPricing({ ...pricing, mutationCourtFee: Number(e.target.value) })}
                      required
                      min={0}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      নামজারি নোটিশ ফি (৳)
                    </label>
                    <input
                      type="number"
                      value={pricing.mutationNoticeFee}
                      onChange={(e) => setPricing({ ...pricing, mutationNoticeFee: Number(e.target.value) })}
                      required
                      min={0}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>সেবামূল্য ডাটাবেসে সেভ ও কার্যকর করুন</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: ADMIN SECURITY & PASSWORD CHANGE */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-white">
                  অ্যাডমিন সিকিউরিটি ও পাসওয়ার্ড পরিবর্তন
                </h4>
                <p className="text-xs text-slate-400">
                  প্রাথমিক পাসওয়ার্ড (Admin68782800) পরিবর্তন করে একটি ব্যক্তিগত শক্তিশালী পাসওয়ার্ড নির্ধারণ করুন।
                </p>
              </div>

              {pwdMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    pwdMsg.type === 'success'
                      ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {pwdMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{pwdMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs max-w-md">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    বর্তমান অ্যাডমিন আইডি
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Admin"
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    নতুন শক্তিশালী পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড লিখুন"
                    required
                    minLength={8}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    নতুন পাসওয়ার্ড পুনরায় লিখুন
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                    required
                    minLength={8}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md"
                >
                  পাসওয়ার্ড আপডেট করুন
                </button>
              </form>

              {/* Encryption specs */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>এনক্রিপশন ও হ্যাশিং বিবরণ:</span>
                </div>
                <p className="text-[11px]">
                  পাসওয়ার্ডটি <strong>PBKDF2-HMAC-SHA512</strong> ক্রিপ্টোগ্রাফিক অ্যালগরিদম ও ৩২-বাইট ক্রিপ্টোগ্রাফিক সল্ট (Salt) সহযোগে সংরক্ষিত হয়।
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
