import React, { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  MapPin,
  Eye,
  Download,
  Sparkles,
  Zap,
  Lock,
  Layers,
  BookOpen,
  Map,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  X,
  CreditCard,
} from 'lucide-react';
import { ALL_BANGLADESH_DIVISIONS, getMouzasForLocation, MouzaItem, UnionItem } from '../data/bangladeshAllLocations';
import { KhatianRecord, SurveyType } from '../types';

interface Props {
  onSelectKhatian: (khatian: KhatianRecord) => void;
  onOrderCertified: (khatian: KhatianRecord) => void;
  onNavigateTab?: (tab: string) => void;
}

export const KhatianSearch: React.FC<Props> = ({ onSelectKhatian, onOrderCertified, onNavigateTab }) => {
  // Cascading Selection (1. বিভাগ, 2. জেলা, 3. উপজেলা, 4. ইউনিয়ন, 5. মৌজা, 6. মৌজার JL নম্বর)
  const [selectedDivision, setSelectedDivision] = useState<string>('ঢাকা বিভাগ');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ঢাকা জেলা');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('ধানমন্ডি (Dhanmondi)');
  const [selectedUnion, setSelectedUnion] = useState<string>('');
  const [selectedMouza, setSelectedMouza] = useState<string>('');
  const [selectedJlNo, setSelectedJlNo] = useState<string>('১২');

  // Filters & Query
  const [selectedSurveyType, setSelectedSurveyType] = useState<string>('ALL');
  const [selectedKhatianDropdown, setSelectedKhatianDropdown] = useState<string>('');
  const [directKhatianNo, setDirectKhatianNo] = useState<string>('');
  const [dagOrOwnerQuery, setDagOrOwnerQuery] = useState<string>('');

  // Results & stats
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(true);
  const [results, setResults] = useState<KhatianRecord[]>([]);
  const [latencyMs, setLatencyMs] = useState<number>(0.12);

  // Modals for special offer packages
  const [activeSpecialModal, setActiveSpecialModal] = useState<'mouza_volume' | 'urgent_search' | 'maps_drive' | null>(null);
  const [specialOrderSuccess, setSpecialOrderSuccess] = useState<string | null>(null);

  // Derived location dropdown options from all 64 districts
  const currentDivisionData =
    ALL_BANGLADESH_DIVISIONS.find((d) => d.bnName === selectedDivision || d.name === selectedDivision) ||
    ALL_BANGLADESH_DIVISIONS[0];

  const districts = currentDivisionData.districts;
  const currentDistrictData =
    districts.find((d) => d.bnName === selectedDistrict || d.name === selectedDistrict) || districts[0];

  const upazilas = currentDistrictData.upazilas;
  const currentUpazilaData = upazilas.find((u) => u.name === selectedUpazila) || upazilas[0];

  // Derived Unions for selected Upazila
  const unions: UnionItem[] = currentUpazilaData?.unions || [];
  const currentUnionData = unions.find((u) => u.name === selectedUnion);

  // Get Mouzas dynamically (filtered by Union if selected)
  const mouzas: MouzaItem[] = selectedUnion && currentUnionData
    ? currentUnionData.mouzas
    : getMouzasForLocation(
        currentDivisionData.bnName,
        currentDistrictData.bnName,
        currentUpazilaData?.name || ''
      );

  // Handlers for cascading selects
  const handleDivisionChange = (divBn: string) => {
    setSelectedDivision(divBn);
    const divObj = ALL_BANGLADESH_DIVISIONS.find((d) => d.bnName === divBn);
    if (divObj && divObj.districts.length > 0) {
      const firstDist = divObj.districts[0];
      setSelectedDistrict(firstDist.bnName);
      if (firstDist.upazilas.length > 0) {
        setSelectedUpazila(firstDist.upazilas[0].name);
        setSelectedUnion('');
        setSelectedMouza('');
        setSelectedJlNo('');
        setSelectedKhatianDropdown('');
      }
    }
  };

  const handleDistrictChange = (distBn: string) => {
    setSelectedDistrict(distBn);
    const distObj = districts.find((d) => d.bnName === distBn);
    if (distObj && distObj.upazilas.length > 0) {
      setSelectedUpazila(distObj.upazilas[0].name);
      setSelectedUnion('');
      setSelectedMouza('');
      setSelectedJlNo('');
      setSelectedKhatianDropdown('');
    }
  };

  const handleUpazilaChange = (upzName: string) => {
    setSelectedUpazila(upzName);
    setSelectedUnion('');
    setSelectedMouza('');
    setSelectedJlNo('');
    setSelectedKhatianDropdown('');
  };

  const handleUnionChange = (unionName: string) => {
    setSelectedUnion(unionName);
    setSelectedMouza('');
    setSelectedJlNo('');
  };

  const handleMouzaChange = (mouzaName: string) => {
    setSelectedMouza(mouzaName);
    const found = mouzas.find((m) => m.name === mouzaName);
    if (found) {
      setSelectedJlNo(found.jlNo);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (selectedDivision) params.append('division', selectedDivision);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedUpazila) params.append('upazila', selectedUpazila);
      if (selectedMouza) params.append('mouza', selectedMouza);
      if (selectedJlNo) params.append('jlNo', selectedJlNo);
      if (selectedSurveyType && selectedSurveyType !== 'ALL') params.append('surveyType', selectedSurveyType);

      // Prefer direct khatian number or dropdown or dag/owner
      const queryCombined = directKhatianNo || selectedKhatianDropdown || dagOrOwnerQuery;
      if (queryCombined) params.append('query', queryCombined);

      const res = await fetch(`/api/khatian/search?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.khatians);
        setLatencyMs(data.queryTimeMs || 0.14);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [selectedDivision, selectedDistrict, selectedUpazila, selectedUnion, selectedMouza, selectedJlNo, selectedSurveyType]);

  const surveyTypes: { id: string; label: string }[] = [
    { id: 'ALL', label: '-- সকল জরিপ --' },
    { id: 'BS', label: 'বিএস (BS)' },
    { id: 'RS', label: 'আরএস (RS)' },
    { id: 'CS', label: 'সিএস (CS)' },
    { id: 'SA', label: 'এসএ (SA)' },
    { id: 'City', label: 'সিটি জরিপ' },
    { id: 'Mutation', label: 'নামজারি' },
  ];

  const handleSpecialPackageOrder = async (title: string, fee: number) => {
    try {
      const token = localStorage.getItem('babaland_token');
      const res = await fetch('/api/khatian/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          khatianId: 'kh-dhaka-1042',
          copyType: fee === 350 ? 'mouza_volume' : 'maps_drive',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSpecialOrderSuccess(`${title} অর্ডার সম্পন্ন হয়েছে (ফি: ৳${fee})!`);
        setTimeout(() => {
          setActiveSpecialModal(null);
          setSpecialOrderSuccess(null);
        }, 1500);
      } else {
        alert(data.message || 'অর্ডারে সমস্যা হয়েছে। ওয়ালেট ব্যালেন্স চেক করুন।');
      }
    } catch {
      setActiveSpecialModal(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* 1. গ্রাহক স্পেশাল অফার ব্যানার */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/40 p-4 sm:p-7 shadow-2xl">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span>📜 গ্রাহক স্পেশাল অফার</span>
            </div>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>তাৎক্ষণিক অফিশিয়াল PDF ডাউনলোড</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-1">
            সারাদেশের যেকোনো একক খতিয়ান মাত্র <span className="text-emerald-400 underline decoration-emerald-500">৳২</span>, পুরো মৌজা তল্লাশি <span className="text-cyan-400">৳৩৫০</span>, এবং সারাদেশের ম্যাপস ড্রাইভ মাত্র <span className="text-amber-400">৳১০০</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            হাই-স্পিড ক্লাউড ডাটাবেস ও সার্বক্ষণিক এন্টারপ্রাইজ এনক্রিপশন সহ ডিজিটাল বাংলাদেশ ভূমি সেবা।
          </p>

          {/* 3 Price Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-4">
            <div
              onClick={() => {
                const el = document.getElementById('search-form-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-emerald-950/70 border border-emerald-500/50 hover:border-emerald-400 rounded-2xl p-2.5 sm:p-4 text-center cursor-pointer transition-all hover:scale-102 shadow-lg group"
            >
              <span className="block text-[11px] sm:text-xs font-bold text-slate-300 group-hover:text-white">
                একক খতিয়ান
              </span>
              <span className="block text-xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5">
                ৳২
              </span>
              <span className="block text-[10px] text-emerald-300/80 mt-0.5">তাৎক্ষণিক PDF</span>
            </div>

            <div
              onClick={() => setActiveSpecialModal('mouza_volume')}
              className="bg-cyan-950/70 border border-cyan-500/50 hover:border-cyan-400 rounded-2xl p-2.5 sm:p-4 text-center cursor-pointer transition-all hover:scale-102 shadow-lg group"
            >
              <span className="block text-[11px] sm:text-xs font-bold text-slate-300 group-hover:text-white">
                ১ মৌজা তল্লাশি
              </span>
              <span className="block text-xl sm:text-3xl font-black text-cyan-400 font-mono mt-0.5">
                ৳৩৫০
              </span>
              <span className="block text-[10px] text-cyan-300/80 mt-0.5">পুরো ভলিউম বই</span>
            </div>

            <div
              onClick={() => setActiveSpecialModal('maps_drive')}
              className="bg-amber-950/70 border border-amber-500/50 hover:border-amber-400 rounded-2xl p-2.5 sm:p-4 text-center cursor-pointer transition-all hover:scale-102 shadow-lg group"
            >
              <span className="block text-[11px] sm:text-xs font-bold text-slate-300 group-hover:text-white">
                ম্যাপস ড্রাইভ
              </span>
              <span className="block text-xl sm:text-3xl font-black text-amber-400 font-mono mt-0.5">
                ৳১০০
              </span>
              <span className="block text-[10px] text-amber-300/80 mt-0.5">সারাদেশের ম্যাপ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Feature Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div
          onClick={() => setActiveSpecialModal('mouza_volume')}
          className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
            📚
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              পুরো খতিয়ান বই
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">মৌজা ভলিউম (৳৩৫০)</p>
          </div>
        </div>

        <div
          onClick={() => {
            const el = document.getElementById('search-form-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer transition-all group ring-1 ring-emerald-500/30"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
            🔍
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              একক খতিয়ান
            </h4>
            <p className="text-[10px] sm:text-[11px] text-emerald-400 font-bold truncate">অনুসন্ধান ও লাইভ PDF (৳২)</p>
          </div>
        </div>

        <div
          onClick={() => setActiveSpecialModal('urgent_search')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
            🔎
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              খতিয়ান তল্লাশি
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">জরুরি ৩০ মি. SLA</p>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab && onNavigateTab('orders')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
            📜
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              অর্ডার হিস্ট্রি
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">ডাউনলোড রেকর্ড ভল্ট</p>
          </div>
        </div>
      </div>

      {/* 3. নাম বা নম্বর দিয়ে একক খতিয়ান অনুসন্ধান Form */}
      <div
        id="search-form-section"
        className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl backdrop-blur-xl relative"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-xl font-extrabold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" />
              <span>🔍 নাম বা নম্বর দিয়ে একক খতিয়ান অনুসন্ধান</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              বিভাগ, জেলা ও উপজেলা সিলেক্ট করে সরাসরি খতিয়ান নম্বর বা মালিকের নাম দিয়ে অনুসন্ধান করুন
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            প্রতি একক খতিয়ান মাত্র ৳২.০০
          </span>
        </div>

        {/* 6-Level Geographic Hierarchy (1. বিভাগ, 2. জেলা, 3. উপজেলা, 4. ইউনিয়ন, 5. মৌজা, 6. মৌজার JL নম্বর) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 mb-4">
          {/* ১. বিভাগ */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>১. বিভাগ</span>
              <span className="text-[10px] text-emerald-400 font-mono">৮টি বিভাগ</span>
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">-- বিভাগ নির্বাচন করুন --</option>
              {ALL_BANGLADESH_DIVISIONS.map((d) => (
                <option key={d.name} value={d.bnName} className="bg-slate-900">
                  {d.bnName} ({d.name})
                </option>
              ))}
            </select>
          </div>

          {/* ২. জেলা */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>২. জেলা</span>
              <span className="text-[10px] text-emerald-400 font-mono">{districts.length}টি জেলা</span>
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">-- জেলা নির্বাচন করুন --</option>
              {districts.map((d) => (
                <option key={d.name} value={d.bnName} className="bg-slate-900">
                  {d.bnName}
                </option>
              ))}
            </select>
          </div>

          {/* ৩. উপজেলা */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>৩. উপজেলা</span>
              <span className="text-[10px] text-emerald-400 font-mono">{upazilas.length}টি উপজেলা</span>
            </label>
            <select
              value={selectedUpazila}
              onChange={(e) => handleUpazilaChange(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {upazilas.length === 0 ? (
                <option value="">আগে জেলা নির্বাচন করুন</option>
              ) : (
                upazilas.map((u) => (
                  <option key={u.name} value={u.name} className="bg-slate-900">
                    {u.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* ৪. ইউনিয়ন */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>৪. ইউনিয়ন</span>
              <span className="text-[10px] text-slate-400 font-mono">{unions.length}টি ইউনিয়ন</span>
            </label>
            <select
              value={selectedUnion}
              onChange={(e) => handleUnionChange(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">সকল ইউনিয়ন (বা নির্দিষ্ট ইউনিয়ন বাছুন)</option>
              {unions.map((u) => (
                <option key={u.name} value={u.name} className="bg-slate-900">
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* ৫. মৌজা */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>৫. মৌজা</span>
              <span className="text-[10px] text-slate-400 font-mono">{mouzas.length}টি মৌজা</span>
            </label>
            <select
              value={selectedMouza}
              onChange={(e) => handleMouzaChange(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">সকল মৌজা (বা নির্দিষ্ট মৌজা বাছুন)</option>
              {mouzas.map((m) => (
                <option key={`${m.name}-${m.jlNo}`} value={m.name} className="bg-slate-900">
                  {m.name} (জেএল: {m.jlNo})
                </option>
              ))}
            </select>
          </div>

          {/* ৬. মৌজার JL নম্বর */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>৬. মৌজার JL নম্বর</span>
              <span className="text-[10px] text-cyan-400 font-mono">জেএল কোড</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedJlNo}
                onChange={(e) => setSelectedJlNo(e.target.value)}
                placeholder="যেমন: ১২ বা ১০২"
                className="w-full h-11 px-3.5 pr-20 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-semibold font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
              />
              {selectedJlNo && (
                <span className="absolute right-2 top-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  জেএল #{selectedJlNo}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ৭. জরিপ ও ৮. খতিয়ান নির্বাচন Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-4 pt-3 border-t border-slate-800">
          {/* ৭. জরিপ রেকর্ড ধরন (ঐচ্ছিক) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              ৭. জরিপ রেকর্ড ধরন (ঐচ্ছিক)
            </label>
            <select
              value={selectedSurveyType}
              onChange={(e) => setSelectedSurveyType(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {surveyTypes.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* ৮. খতিয়ান নম্বর নির্বাচন বা লিখুন */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              ৮. খতিয়ান নম্বর নির্বাচন বা সরাসরি লিখুন
            </label>
            <div className="space-y-1.5">
              <select
                value={selectedKhatianDropdown}
                onChange={(e) => {
                  setSelectedKhatianDropdown(e.target.value);
                  if (e.target.value) setDirectKhatianNo(e.target.value);
                }}
                className="w-full h-11 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">-- খতিয়ান ড্রপডাউন (মৌজা বাছুন) --</option>
                <option value="১০৪২">খতিয়ান ১০৪২ (ধানমন্ডি)</option>
                <option value="৫০৪">খতিয়ান ৫০৪ (সাভার)</option>
                <option value="২১০৫">খতিয়ান ২১০৫ (মিরপুর)</option>
                <option value="৩১২">খতিয়ান ৩১২ (পাঁচলাইশ)</option>
                <option value="৮৮">খতিয়ান ৮৮ (বোয়ালিয়া)</option>
              </select>
              <input
                type="text"
                value={directKhatianNo}
                onChange={(e) => setDirectKhatianNo(e.target.value)}
                placeholder="অথবা সরাসরি খতিয়ান নং লিখুন (যেমন: ১৯৫ বা ১০৪২)"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* ৯. দাগ নং বা মালিকের নাম & Action Button */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-800 items-end">
          <div className="sm:col-span-8">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              ৯. দাগ নং বা মালিকের নাম
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={dagOrOwnerQuery}
                onChange={(e) => setDagOrOwnerQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                placeholder="যেমন: আনোয়ার বা ৫১২ বা আফজাল হোসেন..."
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <button
              type="button"
              onClick={performSearch}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-950 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>⚡ খতিয়ান খুঁজুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. অনুসন্ধান ফলাফল Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>📋 অনুসন্ধান ফলাফল</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {results.length}টি রেকর্ড
              </span>
            </h3>
          </div>

          <span className="text-[11px] font-mono text-emerald-400">
            ল্যাটেন্সি: {latencyMs} ms
          </span>
        </div>

        {/* Security / Privacy Warning Banner */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>🔒 গোপনীয়তা সুরক্ষা:</strong> অনুসন্ধান ফলাফলে শুধুমাত্র নাম ও খতিয়ান নম্বর নিশ্চিতকরণের জন্য উন্মুক্ত রাখা হয়েছে। সম্পূর্ণ দাগ নম্বর ও সরকারি অফিশিয়াল কপি পেতে ডাউনলোড করুন (প্রতি রেকর্ড মাত্র ৳২)।
          </p>
        </div>

        {/* Results Table */}
        {results.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-xl text-slate-500">
              🔍
            </div>
            <p className="text-sm font-semibold text-slate-300">
              উপরে খতিয়ান নম্বর বা মালিকের নাম লিখে অনুসন্ধান বাটনে চাপুন।
            </p>
            <p className="text-xs text-slate-400">
              সারাদেশের যেকোনো একক খতিয়ান রেকর্ড অনুসন্ধান করতে পারেন।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3 whitespace-nowrap">খতিয়ান নং</th>
                  <th className="p-3 whitespace-nowrap">রেকর্ড জরিপ</th>
                  <th className="p-3 whitespace-nowrap">মৌজা ও জেলা</th>
                  <th className="p-3 whitespace-nowrap">মালিকের নাম</th>
                  <th className="p-3 whitespace-nowrap">দাগ নম্বর ও জমির হিস্যা</th>
                  <th className="p-3 text-center whitespace-nowrap">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                {results.map((khatian) => (
                  <tr key={khatian.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-400 text-sm whitespace-nowrap">
                      {khatian.khatianNo}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {khatian.surveyType}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200 whitespace-nowrap">
                      <div className="font-semibold">{khatian.mouza}</div>
                      <div className="text-[10px] text-slate-400">
                        {khatian.upazila}, {khatian.district} (জেএল: {khatian.jlNo})
                      </div>
                    </td>
                    <td className="p-3 text-slate-100 max-w-[180px]">
                      {khatian.owners.map((o, idx) => (
                        <div key={idx} className="truncate font-medium">
                          {o.name} <span className="text-[10px] text-slate-400">({o.fatherOrSpouse})</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-3 text-slate-300">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="font-bold text-cyan-300">
                          দাগ {khatian.plots.map((p) => p.dagNo).join(', ')}
                        </span>
                        <span className="text-slate-400">({khatian.totalLandDecimal} শতক)</span>
                      </div>
                      <div className="text-[10px] text-amber-300 flex items-center gap-1 mt-0.5">
                        <Lock className="w-2.5 h-2.5 text-amber-400" />
                        <span>অফিশিয়াল সিলসহ ভেরিফাইড</span>
                      </div>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectKhatian(khatian)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="প্রিভিউ দেখুন"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="hidden sm:inline">প্রিভিউ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOrderCertified(khatian)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>⚡ ডাউনলোড PDF (৳২)</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Special Offer Modals */}
      {activeSpecialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setActiveSpecialModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {activeSpecialModal === 'mouza_volume' && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl mx-auto">
                  📚
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">১ মৌজা তল্লাশি (পুরো খতিয়ান বই ভলিউম)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    একটি সম্পূর্ণ মৌজার সকল সিএস, এসএ, আরএস ও বিএস খতিয়ানসমূহ একসাথে ডিজিটাল বাইন্ডার ভলিউমে পান।
                  </p>
                  <span className="inline-block mt-2 text-2xl font-black text-cyan-400 font-mono">
                    অফার ফি: ৳৩৫০
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>নির্বাচিত এলাকা:</span>
                    <span className="font-bold text-white">{selectedMouza || selectedUpazila}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভারি সময়:</span>
                    <span className="text-emerald-400 font-semibold">তাৎক্ষণিক ডিজিটাল ডাউনলোড</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSpecialPackageOrder('১ মৌজা তল্লাশি', 350)}
                  className="w-full h-11 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>৳৩৫০ দিয়ে ভলিউম বই ডাউনলোড করুন</span>
                </button>
              </div>
            )}

            {activeSpecialModal === 'urgent_search' && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mx-auto">
                  🔎
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">জরুরি খতিয়ান তল্লাশি (৩০ মিনিট SLA)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    অ-তালিকাভুক্ত বা দুর্লভ পুরোনো খতিয়ানের ক্ষেত্রে বিশেষ আর্কাইভ ম্যানুয়াল তল্লাশি সেবা।
                  </p>
                  <span className="inline-block mt-2 text-2xl font-black text-amber-400 font-mono">
                    জরুরি ফি: ৳১৫০
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>গ্যারান্টিড SLA:</span>
                    <span className="text-amber-400 font-bold">৩০ মিনিটের মধ্যে সমাধান</span>
                  </div>
                  <div className="flex justify-between">
                    <span>এসএমএস অ্যালার্ট:</span>
                    <span className="text-emerald-400 font-semibold">সরাসরি মোবাইলে পাঠানো হবে</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSpecialPackageOrder('জরুরি খতিয়ান তল্লাশি', 150)}
                  className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>জরুরি তল্লাশি রিকোয়েস্ট পাঠান (৳১৫০)</span>
                </button>
              </div>
            )}

            {activeSpecialModal === 'maps_drive' && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
                  🗺️
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">সারাদেশের ম্যাপস ড্রাইভ কালেকশন</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    বাংলাদেশের ৬৪ জেলার সকল মৌজা সিট ও ক্যাডাস্ট্রাল ভেক্টর ম্যাপের গুগল ড্রাইভ এক্সেস।
                  </p>
                  <span className="inline-block mt-2 text-2xl font-black text-emerald-400 font-mono">
                    অফার ফি: ৳১০০
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSpecialPackageOrder('ম্যাপস ড্রাইভ', 100)}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>৳১০০ দিয়ে ড্রাইভ এক্সেস নিন</span>
                </button>
              </div>
            )}

            {specialOrderSuccess && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold">
                ✓ {specialOrderSuccess}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
