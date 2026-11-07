import React from 'react';
import { FileSearch, Layers, Calculator, Map, Clock, User as UserIcon, Crown } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  onOpenDashboard?: () => void;
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
}

export const MobileBottomNav: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  isLoggedIn,
  onOpenAuth,
  onOpenDashboard,
  onOpenAdmin,
  isAdmin,
}) => {
  const tabs = [
    { id: 'khatian', label: 'খতিয়ান', icon: FileSearch },
    { id: 'tracker', label: 'ট্র্যাকার', icon: Clock },
    { id: 'mutation', label: 'নামজারি', icon: Layers },
    { id: 'tax', label: 'খাজনা কর', icon: Calculator },
    { id: 'map', label: 'মৌজা ম্যাপ', icon: Map },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1.5 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <div className={`grid ${isLoggedIn ? 'grid-cols-6' : 'grid-cols-5'} gap-1 max-w-md mx-auto`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-emerald-400 bg-emerald-950/40 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400 stroke-[2.4]' : 'text-slate-400'}`} />
              <span className="text-[10px] leading-tight tracking-tight truncate w-full text-center">
                {tab.label}
              </span>
            </button>
          );
        })}

        {isLoggedIn && (
          <button
            onClick={() => {
              if (isAdmin && onOpenAdmin) {
                onOpenAdmin();
              } else if (onOpenDashboard) {
                onOpenDashboard();
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              isAdmin
                ? 'text-purple-400 bg-purple-950/30 font-bold'
                : 'text-emerald-300 bg-emerald-950/30 font-bold'
            }`}
          >
            {isAdmin ? (
              <Crown className="w-5 h-5 mb-0.5 text-purple-400 stroke-[2.2]" />
            ) : (
              <UserIcon className="w-5 h-5 mb-0.5 text-emerald-400 stroke-[2.2]" />
            )}
            <span className="text-[10px] leading-tight tracking-tight truncate w-full text-center">
              {isAdmin ? 'অ্যাডমিন' : 'ড্যাশবোর্ড'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
