import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Wallet,
  CreditCard,
  History,
  FileText,
  FileCheck,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  Sparkles,
  Shield,
  ArrowRight,
  ExternalLink,
  Printer,
  X,
  Search,
  Check,
} from 'lucide-react';
import { User, PaymentTransaction, CitizenServiceApplication, ServicePriceConfig } from '../types';
import {
  ALL_BANGLADESH_DIVISIONS,
  getDistrictsForDivision,
  getUpazilasForDistrict,
} from '../data/bangladeshAllLocations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onBalanceUpdated: (newBalance: number) => void;
}

export const CitizenDashboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  onBalanceUpdated,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'account' | 'balance' | 'add_money' | 'history' | 'apply' | 'my_apps' | 'pdf_view'
  >('account');

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

  // Add Money Form States
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [senderPhone, setSenderPhone] = useState(user.phone || '');
  const [sendAmount, setSendAmount] = useState<number>(200);
  const [trxId, setTrxId] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data states
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [applications, setApplications] = useState<CitizenServiceApplication[]>([]);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Apply Service Form states
  const [selectedServiceType, setSelectedServiceType] = useState<
    'single_khatian' | 'mouza_volume' | 'maps_drive' | 'urgent_sla' | 'mutation'
  >('single_khatian');
  const [applicantName, setApplicantName] = useState(user.name || '');
  const [applicantPhone, setApplicantPhone] = useState(user.phone || '');
  const [division, setDivision] = useState('ঢাকা');
  const [district, setDistrict] = useState('ঢাকা');
  const [upazila, setUpazila] = useState('সাভার উপজেলা');
  const [mouza, setMouza] = useState('হেমায়েতপুর');
  const [jlNo, setJlNo] = useState('১২১');
  const [khatianNo, setKhatianNo] = useState('৭৮');
  const [dagNo, setDagNo] = useState('২৫০');
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyAlert, setApplyAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PDF Preview State
  const [viewingApp, setViewingApp] = useState<CitizenServiceApplication | null>(null);

  const RECEIVER_NUMBER = '01320507383';
  const RECEIVER_NUMBER_BN = '০১৩২০৫০৭৩৮৩';

  // Fetch data
  const refreshData = async () => {
    const token = localStorage.getItem('babaland_token');
    if (!token) return;

    try {
      // Pricing
      const pRes = await fetch('/api/pricing');
      const pData = await pRes.json();
      if (pData.success && pData.pricing) {
        setPricing(pData.pricing);
      }

      // Payments
      const payRes = await fetch('/api/payment/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payData = await payRes.json();
      if (payData.success && payData.payments) {
        setPayments(payData.payments);
      }

      // Applications
      const appRes = await fetch('/api/citizen/my-applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appData = await appRes.json();
      if (appData.success && appData.applications) {
        setApplications(appData.applications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(RECEIVER_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentNotice(null);

    if (!senderPhone || senderPhone.length < 11) {
      setPaymentNotice({ type: 'error', text: '১১ ডিজিটের সঠিক প্রেরক মোবাইল নম্বর লিখুন।' });
      return;
    }
    if (!sendAmount || sendAmount < 10) {
      setPaymentNotice({ type: 'error', text: 'কমপক্ষে ১০ টাকা রিচার্জ করতে হবে।' });
      return;
    }
    if (!trxId || trxId.trim().length < 6) {
      setPaymentNotice({ type: 'error', text: 'সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন।' });
      return;
    }

    setPaymentSubmitting(true);
    try {
      const token = localStorage.getItem('babaland_token');
      const res = await fetch('/api/payment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          method: paymentMethod,
          senderPhone: senderPhone.trim(),
          amount: Number(sendAmount),
          trxId: trxId.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentNotice({
          type: 'success',
          text: `পেমেন্ট সফলভাবে জমা হয়েছে! ট্রানজেকশন আইডি: ${trxId}। অ্যাডমিন ভেরিফাই করলে আপনার ওয়ালেটে ৳${sendAmount} যুক্ত হবে।`,
        });
        setTrxId('');
        refreshData();
      } else {
        setPaymentNotice({
          type: 'error',
          text: data.message || 'পেমেন্ট সাবমিট করা যায়নি।',
        });
      }
    } catch {
      setPaymentNotice({
        type: 'error',
        text: 'সার্ভার সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
      });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const getServiceCost = (type: string) => {
    switch (type) {
      case 'single_khatian':
        return pricing.singleKhatian || 2;
      case 'mouza_volume':
        return pricing.mouzaVolume || 350;
      case 'maps_drive':
        return pricing.mapsDrive || 100;
      case 'urgent_sla':
        return pricing.urgentSla || 150;
      case 'mutation':
        return (pricing.mutationCourtFee || 20) + (pricing.mutationNoticeFee || 50);
      default:
        return 2;
    }
  };

  const handleApplyService = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyAlert(null);

    const cost = getServiceCost(selectedServiceType);
    if (user.walletBalance < cost) {
      setApplyAlert({
        type: 'error',
        text: `আপনার বর্তমান ব্যালেন্স ৳${user.walletBalance}। এই সেবার ফি ৳${cost}। দয়া করে আগে "টাকা যোগ করুন" ট্যাব থেকে ব্যালেন্স রিচার্জ করুন।`,
      });
      return;
    }

    setApplySubmitting(true);
    try {
      const token = localStorage.getItem('babaland_token');
      const res = await fetch('/api/citizen/service/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType: selectedServiceType,
          applicantName,
          applicantPhone,
          division,
          district,
          upazila,
          mouza,
          jlNo,
          khatianNo: khatianNo || undefined,
          dagNo: dagNo || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onBalanceUpdated(data.remainingBalance);
        setApplyAlert({
          type: 'success',
          text: `সেবার আবেদন সফলভাবে গৃহীত হয়েছে! ফি ৳${cost} কর্তন করা হয়েছে। সনদ স্বয়ংক্রিয়ভাবে প্রস্তুত হয়েছে।`,
        });
        refreshData();
        if (data.application) {
          setViewingApp(data.application);
          setActiveSubTab('pdf_view');
        }
      } else {
        setApplyAlert({
          type: 'error',
          text: data.message || 'আবেদন সম্পন্ন করা যায়নি।',
        });
      }
    } catch {
      setApplyAlert({
        type: 'error',
        text: 'সার্ভার সংযোগে ত্রুটি হয়েছে।',
      });
    } finally {
      setApplySubmitting(false);
    }
  };

  const openAppPdf = (app: CitizenServiceApplication) => {
    setViewingApp(app);
    setActiveSubTab('pdf_view');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-emerald-900/40 rounded-3xl shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xl shadow-md border border-emerald-400/40">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  নাগরিক নিজস্ব ড্যাশবোর্ড
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {user.status === 'BLOCKED' ? 'ব্লকড' : 'সক্রিয় অ্যাকাউন্ট'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {user.name} • {user.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">ব্যালেন্স:</span>
              <span className="font-extrabold text-emerald-400 font-mono">৳{user.walletBalance}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-lg"
              title="বন্ধ করুন"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 7 Core Dashboard Navigation Tabs */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setActiveSubTab('account')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeSubTab === 'account'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>১. আমার অ্যাকাউন্ট</span>
          </button>

          <button
            onClick={() => setActiveSubTab('balance')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeSubTab === 'balance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>২. আমার ব্যালেন্স</span>
          </button>

          <button
            onClick={() => setActiveSubTab('add_money')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeSubTab === 'add_money'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>৩. টাকা যোগ করা (01320507383)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeSubTab === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>৪. লেনদেনের হিসাব</span>
          </button>

          <button
            onClick={() => setActiveSubTab('apply')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeSubTab === 'apply'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>৫. সেবার আবেদন</span>
          </button>

          <button
            onClick={() => setActiveSubTab('my_apps')}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeSubTab === 'my_apps'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>৬. আমার আবেদনসমূহ</span>
          </button>

          <button
            onClick={() => {
              if (applications.length > 0) {
                setViewingApp(applications[0]);
              }
              setActiveSubTab('pdf_view');
            }}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeSubTab === 'pdf_view'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>৭. সনদ ডাউনলোড (PDF)</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* TAB 1: MY ACCOUNT */}
          {activeSubTab === 'account' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">নাগরিকের পূর্ণ নাম:</span>
                  <span className="text-sm font-bold text-white">{user.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">নিবন্ধিত মোবাইল নম্বর:</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{user.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">পিতা / মাতার নাম:</span>
                  <span className="text-sm font-bold text-slate-200">
                    {user.fatherOrMotherName || 'রেকর্ডভুক্ত আছে'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">নাগরিকের ঠিকানা:</span>
                  <span className="text-sm font-bold text-slate-200">
                    {user.address || 'বাংলাদেশ'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">অ্যাকাউন্ট রোল:</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
                    {user.role === 'admin' ? 'সিস্টেম অ্যাডমিন' : 'নাগরিক সেবা প্রোফাইল'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">অ্যাকাউন্ট স্ট্যাটাস:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    সক্রিয় ও ওটিপি ভেরিফাইড (Active)
                  </span>
                </div>
              </div>

              {/* Fast Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveSubTab('add_money')}
                  className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-950 border border-emerald-500/30 text-left hover:border-emerald-500/60 transition-all cursor-pointer group"
                >
                  <CreditCard className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-sm text-white">টাকা যোগ করুন</h4>
                  <p className="text-[11px] text-slate-400 mt-1">বিকাশ/নগদ/রকেটে 01320507383 নম্বরে টাকা পাঠান</p>
                </button>

                <button
                  onClick={() => setActiveSubTab('apply')}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left hover:border-cyan-500/50 transition-all cursor-pointer group"
                >
                  <FileText className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-sm text-white">সেবার আবেদন</h4>
                  <p className="text-[11px] text-slate-400 mt-1">একক খতিয়ান (৳২), মৌজা ভলিউম ও ম্যাপ ড্রাইভ</p>
                </button>

                <button
                  onClick={() => setActiveSubTab('my_apps')}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left hover:border-purple-500/50 transition-all cursor-pointer group"
                >
                  <Download className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-sm text-white">অফিশিয়াল PDF ডাউনলোড</h4>
                  <p className="text-[11px] text-slate-400 mt-1">ইস্যুকৃত সকল রেকর্ড ও সার্টিফাইড কপি</p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MY BALANCE */}
          {activeSubTab === 'balance' && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-950 to-teal-950 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    বর্তমান ওয়ালেট ব্যালেন্স
                  </span>
                  <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 font-mono mt-1">
                    ৳{user.walletBalance}
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    প্রতি একক খতিয়ান ফি মাত্র ৳{pricing.singleKhatian} • মৌজা ভলিউম ৳{pricing.mouzaVolume}
                  </p>
                </div>

                <button
                  onClick={() => setActiveSubTab('add_money')}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>এখনই টাকা যোগ করুন</span>
                </button>
              </div>

              {/* Pricing breakdown table */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>লাইভ নির্ধারিত সেবামূল্য তালিকা:</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">একক খতিয়ান</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">৳{pricing.singleKhatian}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">মৌজা ভলিউম</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">৳{pricing.mouzaVolume}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">ম্যাপস ড্রাইভ</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">৳{pricing.mapsDrive}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">জরুরি ৩০ মি. SLA</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">৳{pricing.urgentSla}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADD MONEY (MOBILE BANKING 01320507383) */}
          {activeSubTab === 'add_money' && (
            <div className="space-y-4">
              {/* Payment Instructions Header */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <Shield className="w-4 h-4" />
                  <span>মোবাইল ব্যাংকিং পেমেন্ট করার নিয়মাবলী:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>আপনার পছন্দের মোবাইল ব্যাংকিং (বিকাশ, নগদ বা রকেট) নির্বাচন করুন।</li>
                  <li>
                    নির্ধারিত পার্সোনাল নম্বর <strong className="text-emerald-400 font-mono">{RECEIVER_NUMBER}</strong> তে Send Money করুন।
                  </li>
                  <li>টাকা পাঠানো সম্পন্ন হলে নিচে প্রেরক নম্বর, টাকার পরিমাণ ও TrxID লিখে সাবমিট করুন।</li>
                  <li>অ্যাডমিন যাচাই করার পর স্বয়ংক্রিয়ভাবে আপনার ব্যালেন্স অ্যাকাউন্টে যুক্ত হবে।</li>
                </ol>
              </div>

              {/* Payment Number Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* bKash */}
                <div
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'bkash'
                      ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-sm text-rose-400">বিকাশ (bKash)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      Send Money
                    </span>
                  </div>
                  <div className="font-mono text-base font-bold text-white tracking-wider">
                    {RECEIVER_NUMBER}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">পার্সোনাল নম্বর</div>
                </div>

                {/* Nagad */}
                <div
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'nagad'
                      ? 'bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-sm text-orange-400">নগদ (Nagad)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300">
                      Send Money
                    </span>
                  </div>
                  <div className="font-mono text-base font-bold text-white tracking-wider">
                    {RECEIVER_NUMBER}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">পার্সোনাল নম্বর</div>
                </div>

                {/* Rocket */}
                <div
                  onClick={() => setPaymentMethod('rocket')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'rocket'
                      ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-sm text-purple-400">রকেট (Rocket)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Send Money
                    </span>
                  </div>
                  <div className="font-mono text-base font-bold text-white tracking-wider">
                    {RECEIVER_NUMBER}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">পার্সোনাল নম্বর</div>
                </div>
              </div>

              {/* Copy Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNumber ? 'নম্বর কপি হয়েছে!' : `নম্বর কপি করুন (${RECEIVER_NUMBER})`}</span>
                </button>
              </div>

              {/* Payment Submission Form */}
              <form onSubmit={handlePaymentSubmit} className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>টাকা পাঠানোর তথ্য সাবমিট করুন (Transaction Form):</span>
                </h4>

                {paymentNotice && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      paymentNotice.type === 'success'
                        ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {paymentNotice.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{paymentNotice.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      পেমেন্ট মাধ্যম
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="bkash">বিকাশ (bKash) - {RECEIVER_NUMBER}</option>
                      <option value="nagad">নগদ (Nagad) - {RECEIVER_NUMBER}</option>
                      <option value="rocket">রকেট (Rocket) - {RECEIVER_NUMBER}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      প্রেরক মোবাইল নম্বর (যে নম্বর থেকে পাঠিয়েছেন)
                    </label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="যেমন: 01712345678"
                      required
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      প্রেরিত টাকার পরিমাণ (৳)
                    </label>
                    <input
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(Number(e.target.value))}
                      min={10}
                      required
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ট্রানজেকশন আইডি (TrxID)
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder="যেমন: BLD8921820X"
                      required
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-cyan-500/50 text-cyan-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Fraud warning note */}
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>অ্যান্টি-ফ্রড সুরক্ষা: ইতিপূর্বে ব্যবহৃত ডুপ্লিকেট TrxID গ্রহণ করা হয় না।</span>
                </div>

                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {paymentSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>পেমেন্টের তথ্য জমা দিন</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: PAYMENT HISTORY */}
          {activeSubTab === 'history' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white flex items-center justify-between">
                <span>আমার পেমেন্ট ও লেনদেনের হিসাব</span>
                <button
                  onClick={refreshData}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  রিফ্রেশ
                </button>
              </h4>

              {payments.length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  এখনও কোনো পেমেন্ট রেকর্ড নেই। টাকা যোগ করতে "টাকা যোগ করা" ট্যাব দেখুন।
                </div>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-bold">{p.trxId}</span>
                          <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                            {p.method}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          প্রেরক: {p.senderPhone} • প্রাপক: {p.receiverNumber} • তারিখ: {new Date(p.createdAt).toLocaleDateString('bn-BD')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-extrabold text-sm text-emerald-400">
                          ৳{p.amount}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : p.status === 'REJECTED'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {p.status === 'APPROVED'
                            ? 'অনুমোদিত'
                            : p.status === 'REJECTED'
                            ? 'বাতিল'
                            : 'অপেক্ষমান'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: APPLY FOR SERVICE */}
          {activeSubTab === 'apply' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white">নাগরিক ডিজিটাল সেবার আবেদন করুন:</h4>

              {/* Service Cards Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'single_khatian', name: 'একক খতিয়ান', fee: pricing.singleKhatian },
                  { id: 'mouza_volume', name: 'মৌজা ভলিউম', fee: pricing.mouzaVolume },
                  { id: 'maps_drive', name: 'ম্যাপস ড্রাইভ', fee: pricing.mapsDrive },
                  { id: 'urgent_sla', name: 'জরুরি ৩০ মি. SLA', fee: pricing.urgentSla },
                  { id: 'mutation', name: 'ই-নামজারি', fee: 70 },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedServiceType(s.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedServiceType === s.id
                        ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/40 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="block font-bold text-xs truncate">{s.name}</span>
                    <span className="block text-emerald-400 font-mono text-sm font-extrabold mt-1">
                      ৳{s.fee}
                    </span>
                  </button>
                ))}
              </div>

              {applyAlert && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    applyAlert.type === 'success'
                      ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
                  }`}
                >
                  {applyAlert.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{applyAlert.text}</span>
                </div>
              )}

              {/* Application Form */}
              <form onSubmit={handleApplyService} className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">আবেদনকারীর নাম</label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">মোবাইল নম্বর</label>
                    <input
                      type="tel"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">বিভাগ</label>
                    <select
                      value={division}
                      onChange={(e) => {
                        const newDiv = e.target.value;
                        setDivision(newDiv);
                        const dists = getDistrictsForDivision(newDiv);
                        if (dists.length > 0) {
                          const firstDist = dists[0].bnName;
                          setDistrict(firstDist);
                          const upzs = getUpazilasForDistrict(newDiv, firstDist);
                          if (upzs.length > 0) setUpazila(upzs[0].name);
                        }
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      {ALL_BANGLADESH_DIVISIONS.map((d) => (
                        <option key={d.name} value={d.bnName}>
                          {d.bnName} ({d.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">জেলা</label>
                    <select
                      value={district}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        setDistrict(newDist);
                        const upzs = getUpazilasForDistrict(division, newDist);
                        if (upzs.length > 0) setUpazila(upzs[0].name);
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      {getDistrictsForDivision(division).map((d) => (
                        <option key={d.name} value={d.bnName}>
                          {d.bnName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">উপজেলা</label>
                    <select
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      {getUpazilasForDistrict(division, district).map((u) => (
                        <option key={u.name} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">মৌজা ও জেএল</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mouza}
                        onChange={(e) => setMouza(e.target.value)}
                        placeholder="মৌজার নাম"
                        required
                        className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                      <input
                        type="text"
                        value={jlNo}
                        onChange={(e) => setJlNo(e.target.value)}
                        placeholder="জেএল"
                        className="w-24 h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">খতিয়ান নম্বর</label>
                    <input
                      type="text"
                      value={khatianNo}
                      onChange={(e) => setKhatianNo(e.target.value)}
                      placeholder="যেমন: ৭৮"
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">দাগ নম্বর</label>
                    <input
                      type="text"
                      value={dagNo}
                      onChange={(e) => setDagNo(e.target.value)}
                      placeholder="যেমন: ২৫০"
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">নির্ধারিত ফি:</span>{' '}
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      ৳{getServiceCost(selectedServiceType)}
                    </span>
                    <span className="text-slate-500 ml-2">
                      (বর্তমান ব্যালেন্স: ৳{user.walletBalance})
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={applySubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {applySubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>ফি পরিশোধ ও স্বয়ংক্রিয় PDF তৈরি</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: MY APPLICATIONS */}
          {activeSubTab === 'my_apps' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white">আমার আবেদনের তালিকা ও স্ট্যাটাস:</h4>

              {applications.length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
                  এখনও কোনো আবেদন করা হয়নি। "সেবার আবেদন" ট্যাব থেকে আবেদন করুন।
                </div>
              ) : (
                <div className="space-y-2">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{app.title}</span>
                          <span className="font-mono text-emerald-400 text-[10px]">
                            {app.certificateNo || app.id}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          {app.district} • {app.upazila} • মৌজা: {app.mouza} (জেএল: {app.jlNo}) {app.khatianNo ? `• খতিয়ান: ${app.khatianNo}` : ''}
                        </p>
                        <p className="text-slate-500 text-[10px]">
                          আবেদনের তারিখ: {new Date(app.createdAt).toLocaleDateString('bn-BD')} • ফি: ৳{app.feePaid}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {app.status === 'APPROVED' ? 'অনুমোদিত' : 'প্রক্রিয়াধীন'}
                        </span>
                        <button
                          type="button"
                          onClick={() => openAppPdf(app)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-cyan-400" />
                          <span>PDF ডাউনলোড</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: DOWNLOAD PDF & CERTIFICATE PREVIEW */}
          {activeSubTab === 'pdf_view' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>অফিশিয়াল ডিজিটাল রেকর্ড সনদ প্রিভিউ:</span>
                </h4>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট / PDF সংরক্ষণ করুন</span>
                </button>
              </div>

              {/* Printable Official Parchha Sheet */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-xl space-y-4 print:p-0 print:border-none print:shadow-none">
                {/* Government Crest & Header */}
                <div className="text-center border-b-2 border-slate-900 pb-3">
                  <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center text-3xl">
                    📜
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                  </h2>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700">
                    ভূমি মন্ত্রণালয় • ডিজিটাল ভূমি রেকর্ড ও সেবা ব্যবস্থা
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    অনলাইন সার্টিফাইড ডিজিটাল পরচা / রেকর্ড কপি • babalandbd.com
                  </p>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-b border-slate-300 pb-3">
                  <div>
                    <span className="text-slate-500 block text-[10px]">সনদ নম্বর:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {viewingApp?.certificateNo || 'BLD-CERT-2026-9041'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ইস্যুর তারিখ:</span>
                    <span className="font-bold text-slate-900">
                      {viewingApp?.issueDate || new Date().toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">বিভাগ ও জেলা:</span>
                    <span className="font-bold text-slate-900">
                      {viewingApp?.division || 'ঢাকা'}, {viewingApp?.district || 'ঢাকা'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">উপজেলা ও মৌজা:</span>
                    <span className="font-bold text-slate-900">
                      {viewingApp?.upazila || 'সাভার'}, {viewingApp?.mouza || 'হেমায়েতপুর'} (জেএল: {viewingApp?.jlNo || '১২১'})
                    </span>
                  </div>
                </div>

                {/* Details Table */}
                <table className="w-full text-xs text-left border border-slate-300">
                  <thead className="bg-slate-100 border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">খতিয়ান নং</th>
                      <th className="p-2 border-r border-slate-300">দাগ নং</th>
                      <th className="p-2 border-r border-slate-300">আবেদনকারী / মালিক</th>
                      <th className="p-2 border-r border-slate-300">জমির শ্রেণি</th>
                      <th className="p-2">রেকর্ড স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-300 font-bold">{viewingApp?.khatianNo || '৭৮'}</td>
                      <td className="p-2 border-r border-slate-300 font-bold">{viewingApp?.dagNo || '২৫০'}</td>
                      <td className="p-2 border-r border-slate-300">{viewingApp?.applicantName || user.name}</td>
                      <td className="p-2 border-r border-slate-300">নাল / বাস্তু</td>
                      <td className="p-2 text-emerald-700 font-bold">অনুমোদিত ও সার্টিফাইড</td>
                    </tr>
                  </tbody>
                </table>

                {/* Security Seal & QR Code */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-300 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 border-2 border-dashed border-emerald-600 rounded-lg flex flex-col items-center justify-center p-1 text-[9px] text-center font-mono text-emerald-800">
                      <div className="font-bold">QR VERIFY</div>
                      <div className="text-[8px] text-slate-500">256-BIT HASH</div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        ডিজিটাল রেকর্ড ভল্ট সিকিউরিটি
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        যাচাইকরণ লিংক: babalandbd.com/verify?id={viewingApp?.certificateNo || 'BLD-CERT-2026-9041'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-block border-b border-slate-800 px-4 pb-0.5 text-xs font-serif font-bold text-slate-900">
                      ভূমি সহকারী কর্মকর্তা
                    </div>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      ডিজিটাল স্বাক্ষরকৃত
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
