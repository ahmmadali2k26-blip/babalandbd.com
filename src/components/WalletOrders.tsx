import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  PlusCircle,
  FileCheck,
  Download,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Shield,
  X,
} from 'lucide-react';
import { User, OrderItem } from '../types';

interface Props {
  user: User | null;
  onOpenAuth: () => void;
  onRechargeSuccess: (newBalance: number) => void;
}

export const WalletOrders: React.FC<Props> = ({ user, onOpenAuth, onRechargeSuccess }) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [rechargeAmount, setRechargeAmount] = useState<number>(200);
  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [isRecharging, setIsRecharging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('babaland_token');
      const res = await fetch('/api/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleRecharge = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setIsRecharging(true);
    try {
      const token = localStorage.getItem('babaland_token');
      const res = await fetch('/api/wallet/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: rechargeAmount,
          method: selectedMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onRechargeSuccess(data.newBalance);
        setMessage(`৳${rechargeAmount} সফলভাবে রিচার্জ হয়েছে!`);
        setShowModal(false);
      }
    } catch {
      alert('রিচার্জে সমস্যা হয়েছে।');
    } finally {
      setIsRecharging(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border border-emerald-500/25 p-4 sm:p-7 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 mb-2">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>গ্রাহক ওয়ালেট ও ডিজিটাল রেকর্ড ভল্ট</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
            অর্ডার হিস্ট্রি ও ব্যালেন্স রিচার্জ
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            আপনার অ্যাকাউন্টে সংরক্ষিত পূর্ববর্তী খতিয়ানের কপি, নামজারি আবেদন ও ভূমি উন্নয়ন করের দাখিলা যেকোনো সময় পুনরায় ডাউনলোড ও প্রিন্ট করুন।
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Wallet Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 border border-emerald-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              বর্তমান ওয়ালেট ব্যালেন্স
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
              ৳{user ? user.walletBalance : 0}
            </span>
            <p className="text-[11px] text-slate-400 mt-2">
              একক খতিয়ান অফার ফি: ২/- টাকা • অনলাইন সার্ভিস চার্জ মুক্ত
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) onOpenAuth();
              else setShowModal(true);
            }}
            className="mt-4 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ব্যালেন্স রিচার্জ করুন</span>
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              মোট সংগৃহীত রেকর্ড
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">
              {orders.length} টি
            </span>
            <p className="text-[11px] text-slate-400 mt-2">
              সকল ইস্যুকৃত ডিজিটাল খতিয়ান সার্টিফাইড কপি ক্লাউডে আজীবন সংরক্ষিত থাকে।
            </p>
          </div>

          <div className="mt-4 text-xs text-slate-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>২৫৬-বিট ক্লাউড এনক্রিপ্টেড ব্যাকআপ</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              গ্রাহক অ্যাকাউন্ট ধরন
            </span>
            <span className="text-xl font-bold text-white block mt-1">
              {user ? user.name : 'অতিথি মোড'}
            </span>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300">
              {user?.role === 'entrepreneur' ? 'উদ্যোক্তা অ্যাকাউন্ট (UDC)' : 'নাগরিক সেবা প্রোফাইল'}
            </span>
          </div>

          {!user && (
            <button
              onClick={onOpenAuth}
              className="mt-4 w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              লগইন করে রেকর্ড সংরক্ষণ করুন
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>সংরক্ষিত রেকর্ড ও অর্ডার ভল্ট</span>
        </h3>

        {orders.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <p className="text-sm">এখনও কোনো সার্টিফাইড কপি বা দাখিলা অর্ডার করা হয়নি।</p>
            <p className="text-xs">খতিয়ান অনুসন্ধান ট্যাব থেকে যেকোনো খতিয়ান সার্টিফাইড কপি সংগ্রহ করতে পারেন।</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                    রেফারেন্স: {order.referenceNo}
                  </span>
                  <h4 className="font-bold text-white text-sm">{order.title}</h4>
                  <p className="text-slate-400 text-[11px]">
                    তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')} | ফি: ৳{order.amount}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                    সম্পন্ন
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ডাউনলোড / প্রিন্ট</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recharge Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">ওয়ালেট ব্যালেন্স রিচার্জ</h3>
            <p className="text-xs text-slate-400 mb-4">
              মোবাইল ব্যাংকিংয়ের মাধ্যমে সরাসরি আপনার babalandbd.com ওয়ালেটে টাকা যোগ করুন।
            </p>

            <label className="block text-xs font-semibold text-slate-300 mb-2">
              রিচার্জের পরিমাণ নির্ধারণ করুন:
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[100, 200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setRechargeAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    rechargeAmount === amt
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-slate-950 border border-slate-800 text-slate-300'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold text-slate-300 mb-2">
              পেমেন্ট মাধ্যম:
            </label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { id: 'bKash', name: 'বিকাশ' },
                { id: 'Nagad', name: 'নগদ' },
                { id: 'Rocket', name: 'রকেট' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id as any)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedMethod === m.id
                      ? 'bg-emerald-700 text-white ring-2 ring-emerald-400'
                      : 'bg-slate-950 border border-slate-800 text-slate-400'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleRecharge}
              disabled={isRecharging}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRecharging ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>৳{rechargeAmount} রিচার্জ সম্পন্ন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
