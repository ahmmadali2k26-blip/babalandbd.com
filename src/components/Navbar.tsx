import React, { useState } from 'react';
import {
  Shield,
  PhoneCall,
  Wallet,
  User as UserIcon,
  LogOut,
  Sparkles,
  Menu,
  X,
  Activity,
  Layers,
  FileSearch,
  CheckCircle,
  Clock,
  Crown,
  LayoutDashboard,
} from 'lucide-react';
import { User } from '../types';
import { NotificationBell } from './NotificationBell';

interface Props {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenRecharge: () => void;
  onOpenAdminPanel?: () => void;
  onOpenCitizenDashboard?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  serverStatus: { dbLatency: number; isSecure: boolean };
}

export const Navbar: React.FC<Props> = ({
  user,
  onOpenAuth,
  onLogout,
  onOpenRecharge,
  onOpenAdminPanel,
  onOpenCitizenDashboard,
  activeTab,
  setActiveTab,
  serverStatus,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navItems = [
    { id: 'khatian', label: 'খতিয়ান অনুসন্ধান', icon: FileSearch },
    { id: 'tracker', label: 'ই-নামজারি ট্র্যাকার', icon: Clock },
    { id: 'mutation', label: 'নামজারি আবেদন', icon: Layers },
    { id: 'tax', label: 'ভূমি উন্নয়ন কর', icon: Wallet },
    { id: 'map', label: 'মৌজা ম্যাপ', icon: Sparkles },
    { id: 'security', label: 'সিকিউরিটি', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-emerald-900/30 shadow-lg text-slate-100">
      {/* Top micro info bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-teal-950 px-3 sm:px-6 py-1 border-b border-emerald-500/10 text-[11px] sm:text-xs text-slate-300 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            লাইভ সার্ভার: {serverStatus.dbLatency}ms (অতি দ্রুত)
          </span>
          <span className="hidden md:inline-block text-slate-500">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-400">
            <Shield className="w-3 h-3 text-cyan-400" /> এনক্রিপশন: SHA-512 & AES-256
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:16122"
            className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-amber-400" />
            <span>হেল্পলাইন: ১৬১২২</span>
          </a>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400/90 font-mono text-[10px] sm:text-[11px]">
            babalandbd.com v3.2
          </span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2">
        {/* Logo */}
        <div
          onClick={() => setActiveTab('khatian')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-xl sm:text-2xl shadow-md shadow-emerald-500/20 border border-emerald-300/40 group-hover:scale-105 transition-transform">
            📜
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-xl text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                babaland<span className="text-emerald-400">bd.com</span>
              </span>
              <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                PRO
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400">
              বাংলাদেশ ভূমি রেকর্ড ও সেবা পোর্টাল
            </p>
          </div>
        </div>

        {/* Desktop Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Panel Button (If Admin) */}
          {user?.role === 'admin' && onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md group cursor-pointer"
              title="অ্যাডমিন প্যানেলে প্রবেশ করুন"
            >
              <Crown className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">অ্যাডমিন প্যানেল</span>
            </button>
          )}

          {/* Citizen Dashboard Button (If Logged In) */}
          {user && onOpenCitizenDashboard && (
            <button
              onClick={onOpenCitizenDashboard}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm group cursor-pointer"
              title="আমার নাগরিক ড্যাশবোর্ড"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">নাগরিক ড্যাশবোর্ড</span>
            </button>
          )}

          {/* Notification Bell Icon & Status Alerts */}
          <NotificationBell
            onNavigateTab={(tab) => {
              if (tab === 'mutation') {
                setActiveTab('tracker');
              } else {
                setActiveTab(tab);
              }
            }}
          />

          {user ? (
            <>
              {/* Wallet Widget */}
              <button
                onClick={onOpenRecharge}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 transition-all text-left shadow-sm group"
                title="ব্যালেন্স রিচার্জ করুন"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-[9px] sm:text-[10px] text-slate-400 font-medium leading-none">
                    ওয়ালেট ব্যালেন্স
                  </span>
                  <span className="block text-xs sm:text-sm font-bold text-emerald-400 group-hover:text-emerald-300">
                    ৳{user.walletBalance}
                  </span>
                </div>
                <span className="hidden sm:inline-block text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  + রিচার্জ
                </span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-semibold max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 text-xs animate-fadeIn">
                    <div className="p-2 border-b border-slate-800 mb-1">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <p className="text-slate-400 text-[11px]">{user.phone}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                        {user.role === 'admin'
                          ? '👑 সিস্টেম অ্যাডমিন'
                          : user.role === 'entrepreneur'
                          ? 'উদ্যোক্তা অ্যাকাউন্ট'
                          : 'নাগরিক অ্যাকাউন্ট'}
                      </span>
                    </div>

                    {onOpenCitizenDashboard && (
                      <button
                        onClick={() => {
                          onOpenCitizenDashboard();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 flex items-center gap-2 font-semibold"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>আমার নাগরিক ড্যাশবোর্ড</span>
                      </button>
                    )}

                    {user.role === 'admin' && onOpenAdminPanel && (
                      <button
                        onClick={() => {
                          onOpenAdminPanel();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-purple-300 hover:text-white hover:bg-purple-950/60 flex items-center gap-2 font-semibold"
                      >
                        <Crown className="w-3.5 h-3.5 text-purple-400" />
                        <span>অ্যাডমিন প্যানেল</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab('orders');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>আমার অর্ডার ও ডাউনলোড</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('security');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>সিকিউরিটি ও সেশন তথ্য</span>
                    </button>

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>লগআউট করুন</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>লগইন / নিবন্ধন</span>
            </button>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="মেনু"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-2 animate-fadeIn">
          {user && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {onOpenCitizenDashboard && (
                <button
                  onClick={() => {
                    onOpenCitizenDashboard();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>নাগরিক ড্যাশবোর্ড</span>
                </button>
              )}

              {user.role === 'admin' && onOpenAdminPanel && (
                <button
                  onClick={() => {
                    onOpenAdminPanel();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 bg-purple-950/60 border border-purple-500/40 text-purple-300"
                >
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span>অ্যাডমিন প্যানেল</span>
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold flex items-center gap-2 border transition-all ${
                    isActive
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
            <span>হেল্পলাইন: ১৬১২২</span>
            <span className="text-emerald-400">babalandbd.com</span>
          </div>
        </div>
      )}
    </header>
  );
};
