import React from 'react';
import { AlertTriangle, ShieldCheck, ExternalLink, Server, Building2, Lock } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export const LegalDisclaimer: React.FC<Props> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>আইনি নোটিশ (Disclaimer):</span>
        </div>
        <p className="text-slate-300 text-[11px]">
          এটি বাংলাদেশ সরকারের কোনো অফিশিয়াল ওয়েবসাইট নয়। সরকারি মূল সেবার জন্য ভিজিট করুন{' '}
          <a
            href="https://eporcha.gov.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline font-semibold hover:text-cyan-300"
          >
            eporcha.gov.bd
          </a>{' '}
          বা{' '}
          <a
            href="https://land.gov.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline font-semibold hover:text-cyan-300"
          >
            land.gov.bd
          </a>
          ।
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 border border-amber-500/35 rounded-3xl p-5 sm:p-7 text-xs sm:text-sm text-slate-300 shadow-2xl backdrop-blur-md">
      {/* Title */}
      <div className="flex items-center gap-2 font-bold text-amber-400 mb-3 pb-2 border-b border-amber-500/20">
        <div className="p-1.5 bg-amber-500/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-extrabold text-white">
            ⚠️ আইনি নোটিশ, অ-বাণিজ্যিক রক্ষণাবেক্ষণ ও ডেটা সুরক্ষা নীতিমালা
          </h4>
          <span className="text-[11px] text-amber-400/90 font-medium">বেসরকারি অ-বাণিজ্যিক নাগরিক সেবা প্ল্যাটফর্ম</span>
        </div>
      </div>

      {/* Main Notice */}
      <p className="leading-relaxed mb-4 text-slate-200 text-xs sm:text-sm">
        <strong className="text-amber-300">এটি বাংলাদেশ সরকারের কোনো অফিশিয়াল ওয়েবসাইট নয়</strong> এবং গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের ভূমি মন্ত্রণালয়, ভূমি রেকর্ড ও জরিপ অধিদপ্তর (DLRS) বা অন্য কোনো সরকারি কর্তৃপক্ষের সাথে এর কোনো প্রাতিষ্ঠানিক সম্পৃক্ততা নেই। খতিয়ান ও জমি সংক্রান্ত সরকারি মূল রেকর্ড, হালনাগাদ পরচা ও অফিশিয়াল সার্টিফাইড কপির একমাত্র কর্তৃত্ব বাংলাদেশ সরকারের।
      </p>

      {/* 2 Feature policy blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-slate-800 text-xs">
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <Server className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>💡 সার্ভার হোস্টিং ও অ-বাণিজ্যিক ব্যয় নির্বাহের স্পষ্টীকরণ:</span>
          </div>
          <p className="text-slate-400 text-[11.5px] leading-relaxed">
            এই প্ল্যাটফর্মে নেওয়া নামমাত্র ফি কোনো সরকারি উপাত্তের বিক্রয়মূল্য বা বাণিজ্যিক ব্যবসা নয়। এটি সার্বক্ষণিক হাই-স্পিড ক্লাউড সার্ভার হোস্টিং, ব্যান্ডউইথ, অবকাঠামো ও ওয়েবসাইটের প্রযুক্তিগত রক্ষণাবেক্ষণ খরচ (Server Hosting & Maintenance Cost) নির্বাহের জন্য একটি ন্যূনতম সার্ভিস চার্জ।
          </p>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-cyan-400">
            <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>🔒 শতভাগ তথ্য এনক্রিপশন ও গ্রাহক গোপনীয়তার নিশ্চয়তা (Zero-Access Privacy):</span>
          </div>
          <p className="text-slate-400 text-[11.5px] leading-relaxed">
            নাগরিকদের যেকোনো অনুসন্ধান হিস্ট্রি, মোবাইল নম্বর বা অ্যাকাউন্ট উপাত্ত সার্ভারে শক্তিশালী এনক্রিপশন (Encryption) দ্বারা সুরক্ষিত। এই সমস্ত উপাত্ত অ্যাডমিন, ডেভেলপার বা অন্য কোনো ব্যবহারকারীর দেখার বা এক্সেস করার কোনো সুযোগ নেই। কোনো তথ্য বাণিজ্যিক উদ্দেশ্যে কোনো তৃতীয় পক্ষের কাছে হস্তান্তর বা ব্যবহার করা হয় না।
          </p>
        </div>
      </div>

      {/* Official Government Links */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-300">
          <span className="font-semibold text-slate-400">সরকারি মূল ও আইনানুগ সেবার জন্য সরাসরি ভিজিট করুন:</span>
          <a
            href="https://eporcha.gov.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold inline-flex items-center gap-1 border border-slate-700 transition-colors"
          >
            🏛️ eporcha.gov.bd <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://land.gov.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold inline-flex items-center gap-1 border border-slate-700 transition-colors"
          >
            🏛️ land.gov.bd <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          © ২০২৬ babalandbd.com | সকল স্বত্ব সংরক্ষিত (একটি স্বাধীন অ-বাণিজ্যিক প্রযুক্তি উদ্যোগ)
        </span>
      </div>
    </div>
  );
};
