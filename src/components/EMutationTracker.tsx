import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  UserCheck,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  Download,
  Printer,
  FileCheck2,
  Phone,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { MutationApplication } from '../types';

interface Props {
  initialTrackingId?: string;
  onOpenKhatian?: (khatianNo: string) => void;
}

export const EMutationTracker: React.FC<Props> = ({ initialTrackingId = 'MUT-2026-9041', onOpenKhatian }) => {
  const [trackingInput, setTrackingInput] = useState(initialTrackingId);
  const [phoneInput, setPhoneInput] = useState('01711223344');
  const [activeMutation, setActiveMutation] = useState<MutationApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [showOrderSheet, setShowOrderSheet] = useState(false);

  // 4 Core Stages requested
  const STAGE_DEFS = [
    {
      id: 1,
      key: 'SUBMITTED',
      titleEn: 'Application Submitted',
      titleBn: 'আবেদন দাখিল সম্পন্ন',
      desc: 'অনলাইনে আবেদনপত্র ও দলিলের কপি দাখিল হয়েছে। সিস্টেমে ট্র্যাকিং নম্বর সক্রিয়।',
      officer: 'সিস্টেম অটোমেশন / গ্রহণ শাখা',
    },
    {
      id: 2,
      key: 'VERIFIED',
      titleEn: 'Verification',
      titleBn: 'কাগজপত্র ও রেকর্ড যাচাই',
      desc: 'উপজেলা সহকারী কমিশনার (ভূমি) কর্তৃক মূল রেকর্ড, সাবেক খতিয়ান ও সাব-রেজিস্ট্রি দলিলের বৈধতা যাচাই।',
      officer: 'সহকারী কমিশনার (ভূমি) / কানুনগো',
    },
    {
      id: 3,
      key: 'FIELD_INQUIRY',
      titleEn: 'Field Inquiry & Hearing',
      titleBn: 'সরেজমিন তদন্ত ও শুনানি',
      desc: 'ইউনিয়ন ভূমি সহকারী কর্মকর্তা কর্তৃক সরেজমিন সীমানা ও দখল তদন্ত প্রতিবেদন দাখিল এবং শুনানির নোটিশ জারি।',
      officer: 'ইউনিয়ন ভূমি সহকারী কর্মকর্তা (নায়েব)',
    },
    {
      id: 4,
      key: 'APPROVAL',
      titleEn: 'Approval & DCR',
      titleBn: 'চূড়ান্ত অনুমোদন ও খতিয়ান সৃজন',
      desc: 'শুনানি অন্তে নামজারি আবেদন মঞ্জুর, ১,১০০/- টাকা ডিসিআর ফি পরিশোধ ও নয়া খতিয়ান তৈরি।',
      officer: 'সহকারী কমিশনার (ভূমি)',
    },
  ];

  const handleSearch = async (targetId?: string, targetPhone?: string) => {
    const idToSearch = (targetId || trackingInput).trim();
    if (!idToSearch) {
      setErrorMsg('অনুগ্রহ করে সঠিক আবেদন ট্র্যাকিং নম্বর লিখুন।');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const qPhone = targetPhone !== undefined ? targetPhone : phoneInput;
      const res = await fetch(
        `/api/mutation/track?trackingId=${encodeURIComponent(idToSearch)}&phone=${encodeURIComponent(qPhone.trim())}`
      );
      const data = await res.json();
      if (res.ok && data.success && data.mutation) {
        setActiveMutation(data.mutation);
      } else {
        // Fallback demo matching
        if (idToSearch.toUpperCase().includes('9041')) {
          setActiveMutation({
            id: 'mut-2026-9041',
            applicationNo: 'MUT-2026-9041',
            applicantName: 'মোঃ জামান হোসেন',
            applicantPhone: '01711223344',
            applicantNid: '19875412365478901',
            division: 'ঢাকা (Dhaka)',
            district: 'ঢাকা (Dhaka)',
            upazila: 'সাভার (Savar)',
            mouza: 'বিরুলিয়া (Birulia)',
            jlNo: '১০২',
            deedNo: '৪৫০২/২০২৬',
            deedDate: '২০২৬-০২-১৫',
            formerKhatianNo: '৫০৪',
            proposedDagNo: '১২০৫',
            proposedAreaDecimal: 15.0,
            submissionDate: '২০২৬-০৩-০১',
            status: 'HEARING_SCHEDULED',
            hearingDate: '২০২৬-১১-১৫',
            dcrFeePaid: true,
            stages: [
              { stageNumber: 1, title: 'Application Submitted (আবেদন দাখিল)', description: 'আবেদনপত্র সিস্টেমে সফলভাবে গৃহীত হয়েছে।', completed: true, date: '০১ মার্চ ২০২৬ ১০:৩০ AM' },
              { stageNumber: 2, title: 'Verification (রেকর্ড যাচাই)', description: 'সাবেক খতিয়ান নং ৫০৪ ও দলিলের মিল যাচাই সম্পন্ন।', completed: true, date: '০৪ মার্চ ২০২৬ ০২:১৫ PM' },
              { stageNumber: 3, title: 'Field Inquiry & Hearing (তদন্ত ও শুনানি)', description: 'তদন্ত প্রতিবেদন দাখিল। শুনানির তারিখ: ১৫ নভেম্বর ২০২৬।', completed: true, date: '১০ মার্চ ২০২৬ ১১:০০ AM' },
              { stageNumber: 4, title: 'Approval (অনুমোদন ও খতিয়ান সৃজন)', description: 'শুনানি ও নয়া নামজারি খতিয়ান প্রিন্ট প্রক্রিয়াধীন।', completed: false },
            ],
          });
        } else if (idToSearch.toUpperCase().includes('7712')) {
          setActiveMutation({
            id: 'mut-2026-7712',
            applicationNo: 'MUT-2026-7712',
            applicantName: 'রোকেয়া বেগম',
            applicantPhone: '01899887766',
            applicantNid: '19921234567890123',
            division: 'ঢাকা (Dhaka)',
            district: 'ঢাকা (Dhaka)',
            upazila: 'ধানমন্ডি (Dhanmondi)',
            mouza: 'ধানমন্ডি আবাসিক (Dhanmondi)',
            jlNo: '১২',
            deedNo: '১২৮০/২০২৫',
            deedDate: '২০২৫-১২-১০',
            formerKhatianNo: '১০৪২',
            proposedDagNo: '৩১৮',
            proposedAreaDecimal: 6.0,
            submissionDate: '২০২৬-০১-১২',
            status: 'APPROVED',
            hearingDate: '২০২৬-০১-৩০',
            dcrFeePaid: true,
            stages: [
              { stageNumber: 1, title: 'Application Submitted', description: 'আবেদন দাখিল সম্পন্ন।', completed: true, date: '১২ জানুয়ারি ২০২৬' },
              { stageNumber: 2, title: 'Verification', description: 'দলিল ও স্বত্বলিপি যাচাই ইতিবাচক।', completed: true, date: '১৬ জানুয়ারি ২০২৬' },
              { stageNumber: 3, title: 'Field Inquiry', description: 'সরেজমিন দখল রিপোর্ট অনুকূলে।', completed: true, date: '২২ জানুয়ারি ২০২৬' },
              { stageNumber: 4, title: 'Approval', description: 'চূড়ান্ত নামজারি অনুমোদিত। নয়া খতিয়ান নং ৯৮২০ তৈরি।', completed: true, date: '০২ ফেব্রুয়ারি ২০২৬' },
            ],
          });
        } else {
          setErrorMsg(data.message || 'এই ট্র্যাকিং নম্বরে কোনো ই-নামজারি আবেদন পাওয়া যায়নি।');
          setActiveMutation(null);
        }
      }
    } catch {
      setErrorMsg('সার্ভার সংযোগে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch('MUT-2026-9041', '01711223344');
  }, []);

  const handleSimulateProgress = async () => {
    if (!activeMutation) return;
    setSimulating(true);

    setTimeout(async () => {
      // Advance to next incomplete stage
      const updatedStages = activeMutation.stages.map((st, idx) => {
        if (!st.completed) {
          return {
            ...st,
            completed: true,
            date: `${new Date().toLocaleDateString('bn-BD')} ${new Date().toLocaleTimeString('bn-BD')}`,
          };
        }
        return st;
      });

      const isAllDone = updatedStages.every((s) => s.completed);
      const updatedMutation: MutationApplication = {
        ...activeMutation,
        status: isAllDone ? 'APPROVED' : 'HEARING_SCHEDULED',
        stages: updatedStages,
      };

      setActiveMutation(updatedMutation);
      setSimulating(false);

      // Trigger test notification
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'mutation' }),
      }).catch(() => {});

      alert('ই-নামজারি অগ্রগতি সফলভাবে আপডেট হয়েছে এবং নোটিফিকেশন অ্যালার্ট পাঠানো হয়েছে!');
    }, 600);
  };

  // Determine stage progress level (1 to 4)
  const getCompletedCount = () => {
    if (!activeMutation) return 0;
    return activeMutation.stages.filter((s) => s.completed).length;
  };

  const completedCount = getCompletedCount();
  const progressPercent = Math.min(100, Math.round((completedCount / 4) * 100));

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950/70 to-slate-900 border border-teal-500/25 p-4 sm:p-7 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 border border-teal-500/30 text-teal-300 mb-2.5">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span>স্মার্ট ই-নামজারি ট্র্যাকার • বাংলাদেশ ভূমি সেবা</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
            ই-নামজারি লাইভ ট্র্যাকার (E-Mutation Progress Tracker)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            আপনার আবেদন ট্র্যাকিং নম্বর দিয়ে ৪টি মূল ধাপে (Application Submitted ➔ Verification ➔ Field Inquiry ➔ Approval) সহকারী কমিশনার (ভূমি) অফিসের শুনানির অগ্রগতি ও অনুমোদনের রিয়েল-টাইম টাইমলাইন দেখুন।
          </p>
        </div>
      </div>

      {/* Tracker Search Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-xl">
        <h3 className="text-sm sm:text-base font-bold text-white mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-400" />
          <span>আবেদন নম্বর ও মোবাইল দিয়ে অনুসন্ধান করুন:</span>
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                আবেদন ট্র্যাকিং নম্বর (Tracking ID) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="যেমন: MUT-2026-9041 বা MUT-2026-7712"
                  required
                  className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm uppercase focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                আবেদনকারীর মোবাইল নম্বর *
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="যেমন: 01711223344"
                className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Quick Demo Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 text-[11px]">ডেমো কেস:</span>
              <button
                type="button"
                onClick={() => {
                  setTrackingInput('MUT-2026-9041');
                  setPhoneInput('01711223344');
                  handleSearch('MUT-2026-9041', '01711223344');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-[11px] transition-colors"
              >
                MUT-2026-9041 (শুনানি পর্যায়)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrackingInput('MUT-2026-7712');
                  setPhoneInput('01899887766');
                  handleSearch('MUT-2026-7712', '01899887766');
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-[11px] transition-colors"
              >
                MUT-2026-7712 (অনুমোদিত)
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
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

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Visual Timeline & Case Dossier Section */}
      {activeMutation && (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn">
          {/* Main Timeline Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Top Case Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {activeMutation.applicationNo}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                      activeMutation.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {activeMutation.status === 'APPROVED' ? '✓ চূড়ান্ত নামজারি অনুমোদিত' : 'প্রক্রিয়াধীন (শুনানি পর্যায়)'}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white">
                  {activeMutation.applicantName}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>মোবাইল: {activeMutation.applicantPhone}</span>
                  <span>•</span>
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    মৌজা: {activeMutation.mouza} (জেএল: {activeMutation.jlNo}) | উপজেলা: {activeMutation.upazila}
                  </span>
                </p>
              </div>

              {/* Action Buttons: Order Sheet & Simulate */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderSheet(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>আদেশনামা ও রসিদ</span>
                </button>

                {activeMutation.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={handleSimulateProgress}
                    disabled={simulating}
                    className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{simulating ? 'অগ্রগতি হচ্ছে...' : 'ধাপ অগ্রগতি সিমুলেট করুন'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center text-xs text-slate-300 font-semibold mb-2">
                <span>মোট নামজারি অগ্রগতি সম্পন্ন: {completedCount} / ৪ ধাপ</span>
                <span className="text-emerald-400 font-mono font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* 4-Stage Horizontal/Vertical Visual Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 relative">
              {STAGE_DEFS.map((stage, idx) => {
                const stageData = activeMutation.stages[idx];
                const isCompleted = stageData ? stageData.completed : idx < completedCount;
                const isCurrent = !isCompleted && (idx === 0 || activeMutation.stages[idx - 1]?.completed);

                return (
                  <div
                    key={stage.id}
                    className={`rounded-2xl p-4 border transition-all flex flex-col justify-between relative ${
                      isCompleted
                        ? 'bg-slate-950/80 border-emerald-500/40 text-slate-200 shadow-md shadow-emerald-950/20'
                        : isCurrent
                        ? 'bg-slate-950 border-amber-500/50 text-slate-200 ring-2 ring-amber-500/20'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div>
                      {/* Stage Number & Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCompleted
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-amber-500 text-slate-950 animate-pulse'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : stage.id}
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isCurrent
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800/50 text-slate-500'
                          }`}
                        >
                          {isCompleted ? 'সম্পন্ন ✓' : isCurrent ? 'চলমান...' : 'অপেক্ষমান'}
                        </span>
                      </div>

                      {/* Stage Titles */}
                      <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">
                        {stage.titleEn}
                      </span>
                      <h4
                        className={`text-sm sm:text-base font-bold mb-2 leading-tight ${
                          isCompleted ? 'text-white' : isCurrent ? 'text-amber-200' : 'text-slate-400'
                        }`}
                      >
                        {stage.titleBn}
                      </h4>

                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        {stageData?.description || stage.desc}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-800/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>দায়িত্বপ্রাপ্ত:</span>
                        <span className="font-semibold text-slate-300 truncate max-w-[130px]">
                          {stage.officer}
                        </span>
                      </div>
                      {stageData?.date && (
                        <div className="flex items-center justify-between text-emerald-400 font-mono text-[10px]">
                          <span>নিষ্পত্তি:</span>
                          <span>{stageData.date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Special Hearing Banner if Hearing stage active */}
            {activeMutation.hearingDate && activeMutation.status !== 'APPROVED' && (
              <div className="mt-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg flex-shrink-0">
                    🏛️
                  </div>
                  <div>
                    <h5 className="font-bold text-amber-300 text-sm">
                      শুনানির নোটিশ: আগামী {activeMutation.hearingDate} ইং
                    </h5>
                    <p className="text-slate-300 text-[11px]">
                      উপজেলা সহকারী কমিশনার (ভূমি) কার্যালয়ে মূল দলিল ও পর্চাসহ উপস্থিত থাকতে হবে।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-950/70 text-emerald-300 font-bold border border-emerald-500/30">
                    ডিসিআর ফি ১,১০০/- টাকা পরিশোধিত
                  </span>
                </div>
              </div>
            )}

            {/* Approved Khatian Banner if Approved */}
            {activeMutation.status === 'APPROVED' && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg flex-shrink-0">
                    📜
                  </div>
                  <div>
                    <h5 className="font-bold text-emerald-300 text-sm">
                      নামজারি মঞ্জুর ও খতিয়ান প্রস্তুত!
                    </h5>
                    <p className="text-slate-300 text-[11px]">
                      সাবেক খতিয়ান নং {activeMutation.formerKhatianNo} হতে কর্তনপূর্বক নতুন নামজারি খতিয়ান নং ৯৮২০ অনুমোদন সাপেক্ষে সক্রিয় হয়েছে।
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenKhatian && onOpenKhatian('১০৪২')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>অনুমোদিত খতিয়ান দেখুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Case Particulars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Applicant & Deed Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 pb-2 border-b border-slate-800">
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                <span>আবেদনকারী ও সাব-রেজিস্ট্রি দলিলের বিবরণ:</span>
              </h4>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">আবেদনকারীর নাম:</span>
                  <span className="font-bold text-white">{activeMutation.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">মোবাইল নম্বর:</span>
                  <span className="font-mono text-slate-200">{activeMutation.applicantPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">জাতীয় পরিচয়পত্র (NID):</span>
                  <span className="font-mono text-slate-200">{activeMutation.applicantNid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">রেজিস্ট্রিকৃত সাব-কবলা দলিল:</span>
                  <span className="font-bold text-amber-300 font-mono">দলিল নং {activeMutation.deedNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">রেজিস্ট্রেশনের তারিখ:</span>
                  <span className="text-slate-300">{activeMutation.deedDate}</span>
                </div>
              </div>
            </div>

            {/* Land & Plot Details Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2 pb-2 border-b border-slate-800">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>প্রস্তাবিত জমি ও দাগের বিবরণ:</span>
              </h4>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">বিভাগ ও জেলা:</span>
                  <span className="font-semibold text-white">
                    {activeMutation.division}, {activeMutation.district}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">উপজেলা ও মৌজা:</span>
                  <span className="font-semibold text-emerald-300">
                    {activeMutation.upazila}, {activeMutation.mouza} (জেএল: {activeMutation.jlNo})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">সাবেক মূল খতিয়ান:</span>
                  <span className="font-mono font-bold text-white">খতিয়ান নং {activeMutation.formerKhatianNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">প্রস্তাবিত কর্তন দাগ:</span>
                  <span className="font-mono font-bold text-cyan-400">দাগ নং {activeMutation.proposedDagNo}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                  <span className="text-slate-400 font-normal">নামজারিকৃত মোট জমি:</span>
                  <span className="text-emerald-400 font-mono text-sm">
                    {activeMutation.proposedAreaDecimal} শতাংশ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Order Sheet / Hearing Notice Modal */}
      {showOrderSheet && activeMutation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-amber-50 border-2 border-amber-900/60 rounded-3xl p-6 sm:p-8 text-black shadow-2xl my-auto font-serif">
            <button
              onClick={() => setShowOrderSheet(false)}
              className="absolute top-4 right-4 text-amber-950 hover:text-black font-bold text-lg"
            >
              ✕
            </button>

            {/* Official Order Header */}
            <div className="text-center border-b-2 border-amber-900/40 pb-3 mb-4">
              <p className="text-xs font-bold tracking-widest text-amber-950">
                গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950">
                সহকারী কমিশনার (ভূমি) এর কার্যালয়, {activeMutation.upazila}
              </h3>
              <p className="text-xs text-amber-900 font-semibold mt-0.5">
                ই-নামজারি কেস আদেশনামা ও শুনানি বিজ্ঞপ্তি
              </p>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-800 mb-6">
              <div className="bg-amber-100/60 p-2.5 rounded-lg border border-amber-900/30 flex justify-between font-bold">
                <span>কেস নং: {activeMutation.applicationNo}</span>
                <span>তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
              </div>

              <p>
                <strong>আবেদনকারী:</strong> {activeMutation.applicantName}, পিতা/স্বামী: মোস্তাফিজুর রহমান, মোবাইল: {activeMutation.applicantPhone}।
              </p>

              <p>
                <strong>বিষয়:</strong> {activeMutation.district} জেলার {activeMutation.upazila} উপজেলাধীন {activeMutation.mouza} মৌজার (জেএল: {activeMutation.jlNo}) সাবেক খতিয়ান নং {activeMutation.formerKhatianNo} এর প্রস্তাবিত দাগ নং {activeMutation.proposedDagNo} হতে {activeMutation.proposedAreaDecimal} শতাংশ নাল জমির জমাভাগ ও নামজারি মঞ্জুর সংক্রান্ত।
              </p>

              <div className="border border-amber-900/40 p-3 rounded-lg bg-amber-50">
                <h5 className="font-bold text-amber-950 mb-1">আদেশ / কার্যবিবরণী:</h5>
                <p>
                  ১. ইউনিয়ন ভূমি সহকারী কর্মকর্তার দাখিলকৃত সরেজমিন তদন্ত প্রতিবেদন ও সাব-রেজিস্ট্রি দলিলের সাবেক খতিয়ানের স্বত্বলিপির মিল পরিলক্ষিত হয়।
                </p>
                <p>
                  ২. প্রস্তাবিত জমিতে আবেদনকারীর আইনানুগ খাস দখল বিদ্যমান রহিয়াছে।
                </p>
                <p>
                  ৩. সরকার নির্ধারিত মোট ১,১০০/- টাকা ডিসিআর (DCR) ফি ট্রেজারি চালানের মাধ্যমে সরকারি কোষাগারে জমাকৃত।
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t-2 border-amber-900/40 text-xs">
              <div>
                <p className="font-bold text-emerald-950">সহকারী কমিশনার (ভূমি)</p>
                <p className="text-slate-600 text-[11px]">{activeMutation.upazila}, {activeMutation.district}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>প্রিন্ট আদেশনামা</span>
                </button>
                <button
                  onClick={() => setShowOrderSheet(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
