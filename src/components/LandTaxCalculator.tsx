import React, { useState, useEffect } from 'react';
import {
  Calculator,
  CreditCard,
  CheckCircle,
  Download,
  Printer,
  Sparkles,
  QrCode,
  FileCheck,
  Shield,
  Layers,
  ArrowRight,
  X,
} from 'lucide-react';
import { TaxDakhilaReceipt } from '../types';

export const LandTaxCalculator: React.FC = () => {
  const [landType, setLandType] = useState<'agricultural' | 'residential' | 'commercial' | 'industrial'>('agricultural');
  const [unit, setUnit] = useState<'decimal' | 'katha' | 'acre'>('decimal');
  const [areaInput, setAreaInput] = useState<string>('30');
  const [dueYears, setDueYears] = useState<number>(1);
  const [holdingNo, setHoldingNo] = useState<string>('হোল্ডিং-৪১৮/খ');
  const [payerName, setPayerName] = useState<string>('মোঃ তারিকুল ইসলাম');
  const [payerMobile, setPayerMobile] = useState<string>('01712345678');

  // Calculation output
  const [assessment, setAssessment] = useState<{
    areaDecimal: number;
    currentYearTax: number;
    arrearsTax: number;
    interest: number;
    totalPayable: number;
  }>({
    areaDecimal: 30,
    currentYearTax: 15,
    arrearsTax: 0,
    interest: 0,
    totalPayable: 15,
  });

  const [calcLoading, setCalcLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Upay'>('bKash');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [dakhilaReceipt, setDakhilaReceipt] = useState<TaxDakhilaReceipt | null>(null);

  // Recalculate on parameter change
  const calculateTax = async () => {
    let decimals = parseFloat(areaInput) || 0;
    if (unit === 'katha') {
      decimals = decimals * 1.65; // 1 katha = 1.65 decimal approx
    } else if (unit === 'acre') {
      decimals = decimals * 100; // 1 acre = 100 decimal
    }

    setCalcLoading(true);
    try {
      const res = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landType,
          areaDecimal: decimals,
          dueYears,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAssessment(data.assessment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalcLoading(false);
    }
  };

  useEffect(() => {
    calculateTax();
  }, [landType, unit, areaInput, dueYears]);

  const handlePayTax = async () => {
    setIsProcessingPayment(true);
    try {
      const res = await fetch('/api/tax/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdingNo,
          payerName,
          payerMobile,
          paidAmount: assessment.totalPayable,
          paymentMethod,
          mouza: 'বিরুলিয়া (১০২)',
          jlNo: '১০২',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDakhilaReceipt(data.receipt);
        setShowPaymentModal(false);
      }
    } catch {
      alert('পেমেন্ট প্রক্রিয়াকরণে ত্রুটি হয়েছে।');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/50 to-slate-900 border border-amber-500/25 p-4 sm:p-7 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300 mb-2">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>স্মার্ট ভূমি উন্নয়ন কর (খাজনা) ক্যালকুলেটর ও দাখিলা</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
            ভূমি উন্নয়ন কর হিসাব ও তাৎক্ষণিক অনলাইন দাখিলা
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            সরকারি আইন ও পরিপত্র অনুযায়ী কৃষি ও অকৃষি জমির হোল্ডিংভিত্তিক খাজনা হিসাব করুন এবং বিকাশ/নগদে পরিশোধ করে ডিজিটাল কিউআর কোডযুক্ত দাখিলা (Dakhila) সংগ্রহ করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Input Form: 7 cols */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>জমির বিবরণ ও হোল্ডিং তথ্য দিন:</span>
          </h3>

          {/* Land Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              জমির শ্রেণি / ব্যবহারের ধরন:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'agricultural', label: '🌾 কৃষি জমি', desc: 'ধানী, নাল, বাগান' },
                { id: 'residential', label: '🏡 আবাসিক', desc: 'বসতভিটা, বাড়ি' },
                { id: 'commercial', label: '🏢 বাণিজ্যিক', desc: 'দোকান, মার্কেট' },
                { id: 'industrial', label: '🏭 শিল্প কারখানা', desc: 'মিল, কারখানা' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLandType(item.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    landType === item.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-xs font-semibold">{item.label}</span>
                  <span className="block text-[10px] text-slate-500">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Area & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                জমির পরিমাণ
              </label>
              <input
                type="number"
                step="0.01"
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                placeholder="যেমন: ৩০"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">পরিমাপের একক</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 h-11">
                {[
                  { id: 'decimal', label: 'শতাংশ' },
                  { id: 'katha', label: 'কাঠা' },
                  { id: 'acre', label: 'একর' },
                ].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUnit(u.id as any)}
                    className={`rounded-lg text-xs font-semibold transition-colors ${
                      unit === u.id ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Holding and Years */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                হোল্ডিং নম্বর
              </label>
              <input
                type="text"
                value={holdingNo}
                onChange={(e) => setHoldingNo(e.target.value)}
                placeholder="যেমন: হোল্ডিং-৪১৮/খ"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                কত বছরের কর বকেয়া?
              </label>
              <select
                value={dueYears}
                onChange={(e) => setDueYears(parseInt(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
              >
                <option value={1}>চলতি বছর (১ বছর)</option>
                <option value={2}>২ বছর (১ বছর বকেয়াসহ)</option>
                <option value={3}>৩ বছর (২ বছর বকেয়াসহ)</option>
                <option value={5}>৫ বছর (৪ বছর বকেয়াসহ)</option>
              </select>
            </div>
          </div>

          {/* Payer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                মালিক / করদাতার নাম
              </label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                করদাতার মোবাইল নম্বর
              </label>
              <input
                type="tel"
                value={payerMobile}
                onChange={(e) => setPayerMobile(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Right Cost Assessment Card: 5 cols */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                স্বয়ংক্রিয় কর মূল্যায়ন বিবরণী
              </span>
              <span className="text-[11px] text-slate-400">অর্থবছর: ২০২৫-২০২৬</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-slate-300">
                <span>মোট জমির রূপান্তর:</span>
                <span className="font-mono font-bold text-white">
                  {assessment.areaDecimal.toFixed(2)} শতাংশ
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>চলতি অর্থবছরের মূল কর:</span>
                <span className="font-mono font-bold text-white">
                  ৳{assessment.currentYearTax}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>বিগত বছরের বকেয়া কর:</span>
                <span className="font-mono text-slate-300">৳{assessment.arrearsTax}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>আইনগত বিলম্ব সুদ (৬.২৫%):</span>
                <span className="font-mono text-slate-300">৳{assessment.interest}</span>
              </div>

              {landType === 'agricultural' && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-300">
                  ✓ ২৫ বিঘা (৮২৫ শতাংশ) পর্যন্ত কৃষি জমির কর আইনানুযায়ী মওকুফ সুবিধায় নামমাত্র চার্জ প্রযোজ্য।
                </div>
              )}
            </div>

            {/* Total Highlight */}
            <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-center">
              <span className="block text-xs font-semibold text-amber-300 mb-1">
                সর্বমোট প্রদেয় ভূমি উন্নয়ন কর:
              </span>
              <span className="block text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">
                ৳{assessment.totalPayable}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-950 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>অনলাইনে কর পরিশোধ ও দাখিলা সংগ্রহ</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              বিকাশ, নগদ বা রকেটের মাধ্যমে তাৎক্ষণিক পরিশোধযোগ্য
            </p>
          </div>
        </div>
      </div>

      {/* Online Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">অনলাইন পেমেন্ট গেটওয়ে</h3>
            <p className="text-xs text-slate-400 mb-4">
              ভূমি উন্নয়ন কর: <strong className="text-amber-400 text-sm">৳{assessment.totalPayable}</strong> | হোল্ডিং: {holdingNo}
            </p>

            <label className="block text-xs font-semibold text-slate-300 mb-2">
              মোবাইল ব্যাংকিং নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { id: 'bKash', name: 'বিকাশ (bKash)', color: 'border-pink-500 bg-pink-950/20' },
                { id: 'Nagad', name: 'নগদ (Nagad)', color: 'border-orange-500 bg-orange-950/20' },
                { id: 'Rocket', name: 'রকেট (Rocket)', color: 'border-purple-500 bg-purple-950/20' },
                { id: 'Upay', name: 'উপায় (Upay)', color: 'border-amber-500 bg-amber-950/20' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaymentMethod(p.id as any)}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    paymentMethod === p.id
                      ? `${p.color} text-white ring-2 ring-amber-400`
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 mb-4 space-y-1">
              <div className="flex justify-between">
                <span>করদাতা:</span>
                <span className="font-semibold text-white">{payerName}</span>
              </div>
              <div className="flex justify-between">
                <span>মোবাইল:</span>
                <span className="font-mono text-slate-200">{payerMobile}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-300 pt-1 border-t border-slate-800">
                <span>মোট কর্তন হবে:</span>
                <span>৳{assessment.totalPayable}</span>
              </div>
            </div>

            <button
              onClick={handlePayTax}
              disabled={isProcessingPayment}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>পরিশোধ নিশ্চিত করুন</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Official Tax Dakhila Receipt Modal */}
      {dakhilaReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-amber-50 border-2 border-amber-900/60 rounded-2xl p-5 sm:p-8 text-black shadow-2xl my-auto">
            <button
              onClick={() => setDakhilaReceipt(null)}
              className="absolute top-4 right-4 text-amber-950 hover:text-black font-bold text-lg"
            >
              ✕
            </button>

            {/* Official Dakhila Header */}
            <div className="text-center border-b-2 border-amber-900/40 pb-3 mb-4">
              <p className="text-xs font-bold tracking-widest text-amber-950">
                বাংলাদেশ ফরম নং ১০৭৭ (সংশোধিত)
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950">
                ভূমি উন্নয়ন কর পরিশোধের ইলেকট্রনিক দাখিলা (রসিদ)
              </h3>
              <p className="text-xs text-amber-900 font-semibold">
                ভূমি সংস্কার বোর্ড • গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত ডিজিটাল চালান
              </p>
            </div>

            {/* Dakhila particulars */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-amber-100/70 p-3 rounded-lg border border-amber-900/30">
              <div>
                <span className="font-bold text-amber-950">দাখিলা নং: </span>
                <span className="font-mono font-bold text-emerald-900">{dakhilaReceipt.dakhilaNo}</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">হোল্ডিং নম্বর: </span>
                <span className="font-bold">{dakhilaReceipt.holdingNo}</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">করদাতার নাম: </span>
                <span>{dakhilaReceipt.payerName}</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">মোবাইল: </span>
                <span className="font-mono">{dakhilaReceipt.payerMobile}</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">মৌজা ও জেএল: </span>
                <span>{dakhilaReceipt.mouza}</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">অর্থবছর: </span>
                <span>{dakhilaReceipt.financialYear}</span>
              </div>
            </div>

            <div className="border border-amber-900/40 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-amber-200 text-amber-950 font-bold">
                  <tr>
                    <th className="p-2 border-r border-amber-900/30">বিবরণ</th>
                    <th className="p-2 border-r border-amber-900/30">পেমেন্ট মেথড</th>
                    <th className="p-2 border-r border-amber-900/30">ট্রানজেকশন আইডি</th>
                    <th className="p-2 text-right">পরিশোধিত টাকা</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-amber-900/20">
                    <td className="p-2 border-r border-amber-900/30 font-semibold">ভূমি উন্নয়ন কর ও বকেয়া দাখিলা</td>
                    <td className="p-2 border-r border-amber-900/30">{dakhilaReceipt.paymentMethod}</td>
                    <td className="p-2 border-r border-amber-900/30 font-mono">{dakhilaReceipt.transactionId}</td>
                    <td className="p-2 text-right font-bold font-mono text-emerald-950">৳{dakhilaReceipt.paidAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* QR verification */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-900/40 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 bg-slate-900 text-white rounded p-1 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-600">
                  <p className="font-bold text-amber-950">অনলাইন দাখিলা ভেরিফাইড</p>
                  <p>babalandbd.com/verify?d={dakhilaReceipt.dakhilaNo}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={() => setDakhilaReceipt(null)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                >
                  সম্পন্ন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
