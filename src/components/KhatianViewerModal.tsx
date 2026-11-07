import React, { useRef } from 'react';
import { Printer, Download, X, CheckCircle, ShieldCheck, FileText, QrCode } from 'lucide-react';
import { KhatianRecord } from '../types';

interface Props {
  khatian: KhatianRecord | null;
  onClose: () => void;
  onOrderCertified: (khatian: KhatianRecord) => void;
  isPurchased?: boolean;
}

export const KhatianViewerModal: React.FC<Props> = ({
  khatian,
  onClose,
  onOrderCertified,
  isPurchased = false,
}) => {
  if (!khatian) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl my-auto bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header Actions */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 text-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>{khatian.surveyType} খতিয়ান নং {khatian.khatianNo}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  অনলাইন ভেরিফাইড
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                মৌজা: {khatian.mouza} (জেএল: {khatian.jlNo}) | উপজেলা: {khatian.upazila}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              title="খতিয়ান প্রিন্ট করুন"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">প্রিন্ট কপি</span>
            </button>

            <button
              onClick={() => onOrderCertified(khatian)}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isPurchased ? 'পুনরায় ডাউনলোড' : 'সার্টিফাইড কপি (৳২)'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Parchha Document Container */}
        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-950 text-slate-900">
          <div
            id="printable-khatian"
            className="bg-amber-50/95 border-2 border-amber-900/40 rounded-xl p-4 sm:p-8 text-black shadow-lg relative font-serif"
            style={{ fontFamily: "'Hind Siliguri', serif" }}
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span className="text-8xl font-black text-amber-950 rotate-[-25deg] select-none">
                babalandbd.com
              </span>
            </div>

            {/* Official Header */}
            <div className="text-center border-b-2 border-amber-900/50 pb-4 mb-4 relative">
              <p className="text-xs font-bold tracking-widest text-amber-950">
                বাংলাদেশ ফরম নং ১০৭৭ (সংশোধিত)
              </p>
              <div className="w-12 h-12 mx-auto my-1 rounded-full border-2 border-emerald-800 flex items-center justify-center text-emerald-800 font-bold text-xs bg-emerald-50">
                স্মার্ট ভূমি
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-emerald-950">
                {khatian.surveyType} খতিয়ান (স্বত্বলিপি)
              </h2>
              <p className="text-xs text-amber-900 font-semibold mt-0.5">
                ভূমি রেকর্ড ও জরিপ অধিদপ্তর • ভূমি মন্ত্রণালয় অনুমোদিত ডিজিটাল রেকর্ড প্রতিলিপি
              </p>
            </div>

            {/* Top Geographic Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-amber-900/30 p-2.5 rounded-lg bg-amber-100/50 mb-4">
              <div>
                <span className="font-bold text-amber-950">বিভাগ: </span>
                <span>{khatian.division}</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">জেলা: </span>
                <span>{khatian.district}</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">থানা / উপজেলা: </span>
                <span>{khatian.upazila}</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">মৌজা ও জেএল: </span>
                <span className="font-semibold">{khatian.mouza} (জেএল: {khatian.jlNo})</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">খতিয়ান নং: </span>
                <span className="font-bold text-emerald-900 text-sm">{khatian.khatianNo}</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">তৌজি নম্বর: </span>
                <span>{khatian.toujiNo}</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">পরগনা: </span>
                <span>{khatian.pargana || 'প্রযোজ্য নহে'}</span>
              </div>
              <div>
                <span className="font-bold text-amber-950">ইস্যুর তারিখ: </span>
                <span>{khatian.issueDate}</span>
              </div>
            </div>

            {/* Owners Table */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span>১. মালিক, অত্র খতিয়ানের স্বত্বাধিকারী ও অংশ বিবরণ:</span>
              </h4>
              <div className="overflow-x-auto border border-amber-900/40 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-amber-200/70 border-b border-amber-900/40 text-amber-950">
                    <tr>
                      <th className="p-2 border-r border-amber-900/30 w-10 text-center">নং</th>
                      <th className="p-2 border-r border-amber-900/30">মালিকের নাম</th>
                      <th className="p-2 border-r border-amber-900/30">পিতা / স্বামীর নাম</th>
                      <th className="p-2 border-r border-amber-900/30 text-center">অংশ (হিস্যা)</th>
                      <th className="p-2 text-center">এনআইডি যাচাই</th>
                    </tr>
                  </thead>
                  <tbody>
                    {khatian.owners.map((owner, idx) => (
                      <tr key={idx} className="border-b border-amber-900/20 hover:bg-amber-100/40">
                        <td className="p-2 border-r border-amber-900/30 text-center font-bold">{idx + 1}</td>
                        <td className="p-2 border-r border-amber-900/30 font-bold text-slate-900">{owner.name}</td>
                        <td className="p-2 border-r border-amber-900/30 text-slate-700">{owner.fatherOrSpouse}</td>
                        <td className="p-2 border-r border-amber-900/30 text-center font-mono font-bold text-emerald-950">{owner.share}</td>
                        <td className="p-2 text-center text-[11px] text-emerald-800">
                          {owner.nidLast4 ? `ভেরিফাইড (শেষ ৪: ${owner.nidLast4})` : 'যাচাইকৃত'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Plots / Dag Table */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
                ২. দাগ সূচি, জমির শ্রেণি ও পরিমাপ:
              </h4>
              <div className="overflow-x-auto border border-amber-900/40 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-amber-200/70 border-b border-amber-900/40 text-amber-950">
                    <tr>
                      <th className="p-2 border-r border-amber-900/30 text-center">দাগ নং</th>
                      <th className="p-2 border-r border-amber-900/30">জমির শ্রেণি</th>
                      <th className="p-2 border-r border-amber-900/30 text-right">দাগের মোট জমি (একর)</th>
                      <th className="p-2 border-r border-amber-900/30 text-right">দাগে অত্র খতিয়ানের অংশ (শতাংশ)</th>
                      <th className="p-2 text-right">ধার্যকৃত কর (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {khatian.plots.map((plot, pIdx) => (
                      <tr key={pIdx} className="border-b border-amber-900/20 hover:bg-amber-100/40">
                        <td className="p-2 border-r border-amber-900/30 text-center font-bold text-blue-900">{plot.dagNo}</td>
                        <td className="p-2 border-r border-amber-900/30 font-medium">{plot.landClass}</td>
                        <td className="p-2 border-r border-amber-900/30 text-right font-mono">{plot.totalAreaAcre.toFixed(2)}</td>
                        <td className="p-2 border-r border-amber-900/30 text-right font-mono font-bold text-emerald-900">{plot.shareAreaDecimal.toFixed(2)} শতাংশ</td>
                        <td className="p-2 text-right font-mono">৳{plot.annualTax}</td>
                      </tr>
                    ))}
                    <tr className="bg-amber-200/50 font-bold border-t border-amber-900/50">
                      <td colSpan={3} className="p-2 border-r border-amber-900/30 text-right">অত্র খতিয়ানের মোট জমির পরিমাণ:</td>
                      <td className="p-2 border-r border-amber-900/30 text-right font-mono text-emerald-950">{khatian.totalLandDecimal} শতাংশ</td>
                      <td className="p-2 text-right font-mono">৳{khatian.totalAnnualTax}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Kistibandi & Official Verification Seal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t-2 border-amber-900/40 text-xs items-center">
              <div>
                <p className="font-bold text-amber-950">কিস্তিবন্দি ও রাজস্ব নিয়ম:</p>
                <p className="text-slate-700 text-[11px]">{khatian.kistibandi}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  ডিজিটাল রেফারেন্স কোড: <strong>BBLD-{khatian.id.toUpperCase()}</strong>
                </p>
              </div>

              {/* QR Verification */}
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/70 border border-amber-900/30 text-center">
                <div className="w-16 h-16 bg-slate-900 text-white rounded p-1 flex items-center justify-center mb-1">
                  <QrCode className="w-12 h-12 text-emerald-400" />
                </div>
                <span className="text-[9px] font-mono text-slate-600">অনলাইন সত্যতা যাচাই QR</span>
              </div>

              {/* Digital Seal */}
              <div className="text-right flex flex-col items-end">
                <div className="w-24 h-24 border-2 border-dashed border-emerald-800 rounded-full flex flex-col items-center justify-center text-center p-1 text-emerald-900 transform -rotate-12 bg-emerald-50/50">
                  <CheckCircle className="w-4 h-4 text-emerald-700 mb-0.5" />
                  <span className="text-[9px] font-black leading-tight">ডিজিটাল রেকর্ড কপি</span>
                  <span className="text-[8px] font-mono">babalandbd.com</span>
                  <span className="text-[7.5px] text-slate-500">অনুমোদিত প্রতিলিপি</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">সহকারী সেটেলমেন্ট অফিসার স্বাক্ষরযুক্ত</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 text-center text-xs text-slate-400">
          আইনি সুরক্ষার্থে সার্টিফাইড কপির হার্ড কপি ইউনিয়ন বা উপজেলা ভূমি অফিস হতে সংগ্রহ করা যেতে পারে।
        </div>
      </div>
    </div>
  );
};
