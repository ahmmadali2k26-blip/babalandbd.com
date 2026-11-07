import React, { useState } from 'react';
import {
  Map,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { SAMPLE_MOUZA_MAP, MapPlotItem } from '../data/mouzaMapData';

interface Props {
  onOpenKhatianNumber: (khatianNo: string) => void;
}

export const MouzaMapViewer: React.FC<Props> = ({ onOpenKhatianNumber }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedPlot, setSelectedPlot] = useState<MapPlotItem>(SAMPLE_MOUZA_MAP.plots[4]); // default 1205

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border border-cyan-500/25 p-4 sm:p-7 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 mb-2">
            <Map className="w-3.5 h-3.5 text-cyan-400" />
            <span>স্মার্ট ডিজিটাল মৌজা ম্যাপ ও দাগ সূচি</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
            ইন্টারেক্টিভ ক্যাডাস্ট্রাল মৌজা ম্যাপ
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            মৌজার যেকোনো দাগে (Plot) টাচ বা ক্লিক করে সাথে সাথেই মালিকানা রেকর্ড, জমির দাগের আয়তন এবং সংশ্লিষ্ট খতিয়ানের সংযোগ পরীক্ষা করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SVG Map Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-3 sm:p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px]">
          {/* Map Controls & Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 z-10 bg-slate-900/90 p-2 sm:px-3 rounded-2xl border border-slate-800 backdrop-blur-md mb-2">
            <div className="text-xs">
              <span className="font-bold text-white">মৌজা: {SAMPLE_MOUZA_MAP.mouzaName}</span>
              <span className="text-slate-400 text-[11px] ml-2">
                জেএল: {SAMPLE_MOUZA_MAP.jlNo} • শিট নং: {SAMPLE_MOUZA_MAP.sheetNo}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleZoomIn}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors text-sm"
                title="জুম ইন"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors text-sm"
                title="জুম আউট"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors text-sm"
                title="রিসেট"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Map viewport */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-2">
            <div
              className="transition-transform duration-200 origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg
                viewBox="0 0 520 440"
                className="w-[300px] xs:w-[380px] sm:w-[480px] max-w-full drop-shadow-2xl select-none"
              >
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path
                      d="M 30 0 L 0 0 0 30"
                      fill="none"
                      stroke="rgba(255,255,255,0.04)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="520" height="440" fill="#09101d" rx="16" />
                <rect width="520" height="440" fill="url(#grid)" />

                {/* Road / River simulated curve */}
                <path
                  d="M 20 20 C 120 180, 420 120, 500 250"
                  stroke="#1e293b"
                  strokeWidth="16"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 20 C 120 180, 420 120, 500 250"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  fill="none"
                />
                <text x="35" y="45" fill="#64748b" fontSize="9" fontWeight="bold">
                  খাল / সরকারি রাস্তা
                </text>

                {/* Cadastral Plots */}
                {SAMPLE_MOUZA_MAP.plots.map((plot) => {
                  const isSelected = selectedPlot?.dagNo === plot.dagNo;
                  return (
                    <g
                      key={plot.dagNo}
                      onClick={() => setSelectedPlot(plot)}
                      className="cursor-pointer group"
                    >
                      <polygon
                        points={plot.points}
                        fill={
                          isSelected
                            ? 'rgba(16, 185, 129, 0.45)'
                            : 'rgba(30, 41, 59, 0.75)'
                        }
                        stroke={isSelected ? '#34d399' : '#475569'}
                        strokeWidth={isSelected ? '3' : '1.5'}
                        className="transition-all duration-150 group-hover:fill-emerald-900/50 group-hover:stroke-emerald-400"
                      />
                      {/* Plot label */}
                      <text
                        x={plot.labelX}
                        y={plot.labelY}
                        fill={isSelected ? '#ffffff' : '#cbd5e1'}
                        fontSize="13"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pointer-events-none drop-shadow"
                      >
                        {plot.dagNo}
                      </text>
                      <text
                        x={plot.labelX}
                        y={plot.labelY + 15}
                        fill={isSelected ? '#6ee7b7' : '#94a3b8'}
                        fontSize="8.5"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {plot.areaDecimal} শতক
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] text-slate-400 pt-2 border-t border-slate-900">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> নামজারি সম্পন্ন
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> নির্ভেজাল রেকর্ড
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> কর বা খাজনা বকেয়া
            </span>
          </div>
        </div>

        {/* Selected Plot Dossier (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>দাগের তথ্যাবলী</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                সক্রিয় দাগ
              </span>
            </div>

            {selectedPlot ? (
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">নির্বাচিত দাগ নম্বর</span>
                  <span className="text-2xl font-black text-white font-mono">
                    দাগ নং {selectedPlot.dagNo}
                  </span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">সংশ্লিষ্ট খতিয়ান:</span>
                    <span className="font-bold text-white font-mono">খতিয়ান {selectedPlot.khatianNo}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">রেকর্ডীয় মালিক:</span>
                    <span className="font-semibold text-emerald-300">{selectedPlot.owner}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">জমির শ্রেণি:</span>
                    <span className="font-semibold text-white">{selectedPlot.landClass}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                    <span className="text-slate-400">জমির আয়তন:</span>
                    <span className="font-bold text-cyan-300 font-mono">
                      {selectedPlot.areaDecimal} শতাংশ
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">আইনি অবস্থা:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{selectedPlot.status === 'MUTATED' ? 'নামজারি সম্পন্ন' : 'নথিভুক্ত'}</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">ম্যাপের যেকোনো দাগে ক্লিক করে বিবরণ দেখুন।</p>
            )}
          </div>

          {selectedPlot && (
            <div className="mt-5 pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => onOpenKhatianNumber(selectedPlot.khatianNo)}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
              >
                <span>এই দাগের খতিয়ান খুলুন ({selectedPlot.khatianNo})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
