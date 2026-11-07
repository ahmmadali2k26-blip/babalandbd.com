import React, { useState } from 'react';
import {
  Layers,
  FileCheck2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileText,
  CreditCard,
} from 'lucide-react';
import { MutationApplication } from '../types';
import { ALL_BANGLADESH_DIVISIONS, getMouzasForLocation } from '../data/bangladeshAllLocations';

interface Props {
  onGoToTracker?: (trackingId?: string) => void;
}

export const MutationSection: React.FC<Props> = ({ onGoToTracker }) => {
  const [activeSubTab, setActiveSubTab] = useState<'track' | 'apply'>('track');

  // Location states for all 64 districts (1. বিভাগ, 2. জেলা, 3. উপজেলা, 4. ইউনিয়ন, 5. মৌজা, 6. মৌজার JL নম্বর)
  const [appDivision, setAppDivision] = useState<string>('ঢাকা বিভাগ');
  const [appDistrict, setAppDistrict] = useState<string>('ঢাকা জেলা');
  const [appUpazila, setAppUpazila] = useState<string>('সাভার উপজেলা');
  const [appUnion, setAppUnion] = useState<string>('বিরুলিয়া ইউনিয়ন');
  const [appMouza, setAppMouza] = useState<string>('বিরুলিয়া');
  const [appJlNo, setAppJlNo] = useState<string>('১০২');

  const currentDiv =
    ALL_BANGLADESH_DIVISIONS.find((d) => d.bnName === appDivision || d.name === appDivision) ||
    ALL_BANGLADESH_DIVISIONS[0];
  const appDistricts = currentDiv.districts;
  const currentDist =
    appDistricts.find((d) => d.bnName === appDistrict || d.name === appDistrict) || appDistricts[0];
  const appUpazilas = currentDist.upazilas;
  const currentUpz = appUpazilas.find((u) => u.name === appUpazila) || appUpazilas[0];
  const appUnions = currentUpz?.unions || [];
  const currentUn = appUnions.find((u) => u.name === appUnion);
  const appMouzas = appUnion && currentUn
    ? currentUn.mouzas
    : getMouzasForLocation(currentDiv.bnName, currentDist.bnName, currentUpz?.name || '');

  const handleDivChange = (divBn: string) => {
    setAppDivision(divBn);
    const d = ALL_BANGLADESH_DIVISIONS.find((item) => item.bnName === divBn);
    if (d && d.districts.length > 0) {
      setAppDistrict(d.districts[0].bnName);
      if (d.districts[0].upazilas.length > 0) {
        const u = d.districts[0].upazilas[0];
        setAppUpazila(u.name);
        setAppUnion(u.unions[0]?.name || '');
        setAppMouza(u.unions[0]?.mouzas[0]?.name || '');
        setAppJlNo(u.unions[0]?.mouzas[0]?.jlNo || '');
      }
    }
  };

  const handleDistChange = (distBn: string) => {
    setAppDistrict(distBn);
    const d = appDistricts.find((item) => item.bnName === distBn);
    if (d && d.upazilas.length > 0) {
      const u = d.upazilas[0];
      setAppUpazila(u.name);
      setAppUnion(u.unions[0]?.name || '');
      setAppMouza(u.unions[0]?.mouzas[0]?.name || '');
      setAppJlNo(u.unions[0]?.mouzas[0]?.jlNo || '');
    }
  };

  const handleUpzChange = (upzName: string) => {
    setAppUpazila(upzName);
    const u = appUpazilas.find((item) => item.name === upzName);
    if (u) {
      setAppUnion(u.unions[0]?.name || '');
      setAppMouza(u.unions[0]?.mouzas[0]?.name || '');
      setAppJlNo(u.unions[0]?.mouzas[0]?.jlNo || '');
    }
  };

  const handleUnChange = (unName: string) => {
    setAppUnion(unName);
    const un = appUnions.find((item) => item.name === unName);
    if (un && un.mouzas.length > 0) {
      setAppMouza(un.mouzas[0].name);
      setAppJlNo(un.mouzas[0].jlNo);
    }
  };

  const handleMouzaChange = (mName: string) => {
    setAppMouza(mName);
    const m = appMouzas.find((item) => item.name === mName);
    if (m) setAppJlNo(m.jlNo);
  };

  // Tracking states
  const [trackingId, setTrackingId] = useState('MUT-2026-9041');
  const [trackingPhone, setTrackingPhone] = useState('01711223344');
  const [trackedMutation, setTrackedMutation] = useState<MutationApplication | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Application Form states
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantNid, setApplicantNid] = useState('');
  const [formerKhatianNo, setFormerKhatianNo] = useState('');
  const [proposedDagNo, setProposedDagNo] = useState('');
  const [proposedArea, setProposedArea] = useState('12.5');
  const [deedNo, setDeedNo] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState<MutationApplication | null>(null);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    setTrackLoading(true);

    try {
      const res = await fetch(
        `/api/mutation/track?trackingId=${encodeURIComponent(trackingId.trim())}&phone=${encodeURIComponent(
          trackingPhone.trim()
        )}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setTrackedMutation(data.mutation);
      } else {
        setTrackError(data.message || 'আবেদন খুঁজে পাওয়া যায়নি।');
        setTrackedMutation(null);
      }
    } catch {
      setTrackError('সার্ভার সংযোগে ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setTrackLoading(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone || !applicantNid || !formerKhatianNo || !proposedDagNo) {
      alert('সকল আবশ্যক তথ্য পূরণ করুন।');
      return;
    }

    setApplyLoading(true);
    try {
      const res = await fetch('/api/mutation/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName,
          applicantPhone,
          applicantNid,
          formerKhatianNo,
          proposedDagNo,
          proposedAreaDecimal: Number(proposedArea),
          deedNo: deedNo || '৯৮৭৬/২০২৬',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApplySuccess(data.application);
        setTrackedMutation(data.application);
      } else {
        alert(data.message || 'আবেদন গ্রহণে সমস্যা হয়েছে।');
      }
    } catch {
      alert('সার্ভার সংযোগে সমস্যা হয়েছে।');
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/70 to-slate-900 border border-teal-500/25 p-4 sm:p-7 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 border border-teal-500/30 text-teal-300 mb-2">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>ডিজিটাল ই-নামজারি ও জমাভাগ সেবা</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
            অনলাইন ই-নামজারি আবেদন ও লাইভ ট্র্যাকিং
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            জমির মালিকানা পরিবর্তনের পর নির্ভুল নামজারি আবেদন দাখিল করুন অথবা ট্র্যাকিং নম্বর দিয়ে এসিল্যান্ড অফিসের শুনানির অগ্রগতি ও অনুমোদনের লাইভ স্ট্যাটাস দেখুন।
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-2xl mx-auto">
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 flex-1 max-w-md">
          <button
            onClick={() => setActiveSubTab('track')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'track'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>আবেদন ট্র্যাকিং</span>
          </button>

          <button
            onClick={() => setActiveSubTab('apply')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'apply'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>নতুন নামজারি আবেদন</span>
          </button>
        </div>

        {onGoToTracker && (
          <button
            type="button"
            onClick={() => onGoToTracker(trackingId)}
            className="px-4 py-2.5 rounded-2xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4 text-teal-400" />
            <span>৪-ধাপ লাইভ টাইমলাইন ভিউ ➔</span>
          </button>
        )}
      </div>

      {/* TRACKING TAB */}
      {activeSubTab === 'track' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl max-w-2xl mx-auto">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>আবেদনের বর্তমান অবস্থা ট্র্যাক করুন</span>
            </h3>

            <form onSubmit={handleTrackSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ট্র্যাকিং / আবেদন নম্বর
                  </label>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="যেমন: MUT-2026-9041"
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    আবেদনকারীর মোবাইল নম্বর
                  </label>
                  <input
                    type="tel"
                    value={trackingPhone}
                    onChange={(e) => setTrackingPhone(e.target.value)}
                    placeholder="যেমন: 01711223344"
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>ডেমো টেস্ট:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackingId('MUT-2026-9041');
                      setTrackingPhone('01711223344');
                    }}
                    className="text-emerald-400 underline font-medium hover:text-emerald-300"
                  >
                    MUT-2026-9041 (শুনানি পর্যায়)
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTrackingId('MUT-2026-7712');
                      setTrackingPhone('01899887766');
                    }}
                    className="text-cyan-400 underline font-medium hover:text-cyan-300"
                  >
                    MUT-2026-7712 (অনুমোদিত)
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={trackLoading}
                  className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {trackLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>ট্র্যাক করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {trackError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{trackError}</span>
              </div>
            )}
          </div>

          {/* Timeline Output */}
          {trackedMutation && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-xl max-w-3xl mx-auto space-y-5 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                    আবেদন নম্বর: {trackedMutation.applicationNo}
                  </span>
                  <h3 className="text-base sm:text-xl font-bold text-white">
                    {trackedMutation.applicantName} (মোবাইল: {trackedMutation.applicantPhone})
                  </h3>
                  <p className="text-xs text-slate-400">
                    মৌজা: {trackedMutation.mouza} (জেএল: {trackedMutation.jlNo}) | উপজেলা: {trackedMutation.upazila}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      trackedMutation.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {trackedMutation.status === 'APPROVED' ? '✓ নামজারি অনুমোদিত' : 'প্রক্রিয়াধীন'}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-1">
                    দাখিল: {trackedMutation.submissionDate}
                  </span>
                </div>
              </div>

              {/* Graphical 5-Stage Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ই-নামজারি লাইভ অগ্রগতি টাইমলাইন:</span>
                </h4>

                <div className="space-y-4 relative before:absolute before:left-3 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {trackedMutation.stages.map((stage) => (
                    <div key={stage.stageNumber} className="relative flex items-start gap-3 sm:gap-4 group">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors ${
                          stage.completed
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-950'
                            : 'bg-slate-800 border-2 border-slate-700 text-slate-400'
                        }`}
                      >
                        {stage.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs font-bold font-mono">{stage.stageNumber}</span>
                        )}
                      </div>

                      <div
                        className={`flex-1 p-3 rounded-2xl border transition-all ${
                          stage.completed
                            ? 'bg-slate-950/80 border-emerald-500/30 text-slate-200'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                          <h5
                            className={`text-xs sm:text-sm font-bold ${
                              stage.completed ? 'text-white' : 'text-slate-400'
                            }`}
                          >
                            ধাপ {stage.stageNumber}: {stage.title}
                          </h5>
                          {stage.date && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20">
                              {stage.date}
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed">{stage.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case particulars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">সাবেক খতিয়ান:</span>
                  <span className="font-bold text-white">{trackedMutation.formerKhatianNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">প্রস্তাবিত দাগ:</span>
                  <span className="font-bold text-cyan-300">{trackedMutation.proposedDagNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">জমির পরিমাণ:</span>
                  <span className="font-bold text-emerald-400">
                    {trackedMutation.proposedAreaDecimal} শতাংশ
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ডিসিআর ফি (DCR):</span>
                  <span className="font-bold text-amber-300">
                    {trackedMutation.dcrFeePaid ? '১,১০০/- পরিশোধিত' : 'অপেক্ষমান'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* APPLY TAB */}
      {activeSubTab === 'apply' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-xl max-w-3xl mx-auto">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>ই-নামজারি (জমাভাগ / খারিজ) অনলাইন আবেদন ফরম</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              সাব-রেজিস্ট্রি দলিলের তথ্যানুযায়ী সঠিক সাবেক খতিয়ান ও দাগ নম্বর প্রদান করুন।
            </p>
          </div>

          {applySuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <h4 className="text-lg font-bold text-white">আবেদন সফলভাবে গৃহীত হয়েছে!</h4>
              <p className="text-xs text-slate-300">
                আপনার ই-নামজারি ট্র্যাকিং নম্বর:{' '}
                <strong className="text-emerald-400 text-sm font-mono">{applySuccess.applicationNo}</strong>
              </p>
              <p className="text-xs text-slate-400">
                মোবাইল নম্বর ({applySuccess.applicantPhone}) এ এসএমএস নিশ্চিতকরণ প্রেরণ করা হয়েছে।
              </p>
              <button
                onClick={() => {
                  setApplySuccess(null);
                  setActiveSubTab('track');
                }}
                className="mt-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                আবেদনের লাইভ টাইমলাইন দেখুন
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    আবেদনকারীর নাম *
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="যেমন: মোঃ জহিরুল হক"
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    মোবাইল নম্বর (১১ ডিজিট) *
                  </label>
                  <input
                    type="tel"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="যেমন: 01712345678"
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    এনআইডি (NID) নম্বর *
                  </label>
                  <input
                    type="text"
                    value={applicantNid}
                    onChange={(e) => setApplicantNid(e.target.value)}
                    placeholder="১০, ১৩ বা ১৭ ডিজিট"
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* 6-Level Geographic Hierarchy (1. বিভাগ, 2. জেলা, 3. উপজেলা, 4. ইউনিয়ন, 5. মৌজা, 6. মৌজার JL নম্বর) */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400">
                    জমির ভৌগোলিক অবস্থান ও রেকর্ড পরিচিতি (৬ স্তর বিশিষ্ট)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">জেএল কোডসহ</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* ১. বিভাগ */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">১. বিভাগ *</label>
                    <select
                      value={appDivision}
                      onChange={(e) => handleDivChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {ALL_BANGLADESH_DIVISIONS.map((d) => (
                        <option key={d.name} value={d.bnName}>
                          {d.bnName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ২. জেলা */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">২. জেলা *</label>
                    <select
                      value={appDistrict}
                      onChange={(e) => handleDistChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {appDistricts.map((d) => (
                        <option key={d.name} value={d.bnName}>
                          {d.bnName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ৩. উপজেলা */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">৩. উপজেলা *</label>
                    <select
                      value={appUpazila}
                      onChange={(e) => handleUpzChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {appUpazilas.map((u) => (
                        <option key={u.name} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ৪. ইউনিয়ন */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">৪. ইউনিয়ন *</label>
                    <select
                      value={appUnion}
                      onChange={(e) => handleUnChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {appUnions.map((u) => (
                        <option key={u.name} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ৫. মৌজা */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">৫. মৌজা *</label>
                    <select
                      value={appMouza}
                      onChange={(e) => handleMouzaChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {appMouzas.map((m) => (
                        <option key={`${m.name}-${m.jlNo}`} value={m.name}>
                          {m.name} (জেএল: {m.jlNo})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ৬. মৌজার JL নম্বর */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>৬. মৌজার JL নম্বর *</span>
                      <span className="text-[10px] text-cyan-400 font-mono">জেএল কোড</span>
                    </label>
                    <input
                      type="text"
                      value={appJlNo}
                      onChange={(e) => setAppJlNo(e.target.value)}
                      placeholder="যেমন: ১০২"
                      required
                      className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">দলিল নম্বর</label>
                  <input
                    type="text"
                    value={deedNo}
                    onChange={(e) => setDeedNo(e.target.value)}
                    placeholder="যেমন: ৪৫০২/২০২৬"
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    সাবেক খতিয়ান নম্বর *
                  </label>
                  <input
                    type="text"
                    value={formerKhatianNo}
                    onChange={(e) => setFormerKhatianNo(e.target.value)}
                    placeholder="যেমন: ৫০৪ বা ১০৪২"
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    প্রস্তাবিত দাগ নম্বর *
                  </label>
                  <input
                    type="text"
                    value={proposedDagNo}
                    onChange={(e) => setProposedDagNo(e.target.value)}
                    placeholder="যেমন: ১২০৫ বা ৩১৮"
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    জমির পরিমাণ (শতাংশ) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={proposedArea}
                    onChange={(e) => setProposedArea(e.target.value)}
                    placeholder="১০.৫"
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>আবেদন ফি তথ্য (বাংলাদেশ সরকার নির্ধারিত):</span>
                </div>
                <p>
                  কোর্ট ফি: ২০/- টাকা • নোটিশ জারি ফি: ৫০/- টাকা • রেকর্ড সংশোধন ফি: ১,০০০/- টাকা • মোট ফি: ১,১০০/- টাকা (শুনানি মঞ্জুরের সময় প্রদেয়)।
                </p>
              </div>

              <button
                type="submit"
                disabled={applyLoading}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer disabled:opacity-50"
              >
                {applyLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>ই-নামজারি আবেদন দাখিল করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
