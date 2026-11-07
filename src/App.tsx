/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PortalAuthModal } from './components/PortalAuthModal';
import { CitizenDashboardModal } from './components/CitizenDashboardModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { KhatianSearch } from './components/KhatianSearch';
import { KhatianViewerModal } from './components/KhatianViewerModal';
import { MutationSection } from './components/MutationSection';
import { EMutationTracker } from './components/EMutationTracker';
import { LandTaxCalculator } from './components/LandTaxCalculator';
import { MouzaMapViewer } from './components/MouzaMapViewer';
import { WalletOrders } from './components/WalletOrders';
import { SecuritySystemMonitor } from './components/SecuritySystemMonitor';
import { LegalDisclaimer } from './components/LegalDisclaimer';
import { User, KhatianRecord } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('khatian');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'single'>('login');
  const [trackerInitialId, setTrackerInitialId] = useState<string>('MUT-2026-9041');

  // New Modals for Citizen & Admin
  const [citizenDashboardOpen, setCitizenDashboardOpen] = useState<boolean>(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState<boolean>(false);

  const [selectedKhatian, setSelectedKhatian] = useState<KhatianRecord | null>(null);
  const [viewerModalOpen, setViewerModalOpen] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState({ dbLatency: 0.12, isSecure: true });

  // Check URL hash or query params on load (e.g. #single or /portal#single)
  useEffect(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;

    if (hash === '#single' || path.includes('portal')) {
      // User specifically navigated to /portal#single
      setAuthInitialMode('single');
      setAuthModalOpen(true);
    }

    // Try restoring user session
    const token = localStorage.getItem('babaland_token');
    if (token && token !== 'guest_token') {
      fetch('/api/portal/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
          }
        })
        .catch((err) => console.log('Session restore error', err));
    }
  }, []);

  const handleAuthSuccess = (authenticatedUser: User, token: string) => {
    setUser(authenticatedUser);
    setAuthModalOpen(false);
    if (authenticatedUser.role === 'admin') {
      setAdminPanelOpen(true);
    } else {
      setCitizenDashboardOpen(true);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('babaland_token');
    if (token) {
      await fetch('/api/portal/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem('babaland_token');
    setUser(null);
    setCitizenDashboardOpen(false);
    setAdminPanelOpen(false);
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'single' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectKhatian = (khatian: KhatianRecord) => {
    setSelectedKhatian(khatian);
    setViewerModalOpen(true);
  };

  const handleOrderCertified = async (khatian: KhatianRecord) => {
    const token = localStorage.getItem('babaland_token');
    try {
      const res = await fetch('/api/khatian/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ khatianId: khatian.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.remainingBalance !== undefined && user) {
          setUser({ ...user, walletBalance: data.remainingBalance });
        }
        setSelectedKhatian(khatian);
        setViewerModalOpen(true);
      } else {
        // If low balance, open Citizen Dashboard to recharge
        if (user) {
          setCitizenDashboardOpen(true);
        } else {
          handleOpenAuth('login');
        }
      }
    } catch {
      setSelectedKhatian(khatian);
      setViewerModalOpen(true);
    }
  };

  const handleOpenKhatianByNumber = async (khatianNo: string) => {
    try {
      const res = await fetch(`/api/khatian/search?query=${encodeURIComponent(khatianNo)}`);
      const data = await res.json();
      if (data.success && data.khatians.length > 0) {
        setSelectedKhatian(data.khatians[0]);
        setViewerModalOpen(true);
      } else {
        setActiveTab('khatian');
      }
    } catch {
      setActiveTab('khatian');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-20 lg:pb-8">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => handleOpenAuth('login')}
        onLogout={handleLogout}
        onOpenRecharge={() => {
          if (user) {
            setCitizenDashboardOpen(true);
          } else {
            handleOpenAuth('login');
          }
        }}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
        onOpenCitizenDashboard={() => setCitizenDashboardOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Dynamic Active Tab Content */}
        {activeTab === 'khatian' && (
          <KhatianSearch
            onSelectKhatian={handleSelectKhatian}
            onOrderCertified={handleOrderCertified}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'tracker' && (
          <EMutationTracker
            initialTrackingId={trackerInitialId}
            onOpenKhatian={handleOpenKhatianByNumber}
          />
        )}

        {activeTab === 'mutation' && (
          <MutationSection
            onGoToTracker={(id) => {
              if (id) setTrackerInitialId(id);
              setActiveTab('tracker');
            }}
          />
        )}

        {activeTab === 'tax' && <LandTaxCalculator />}

        {activeTab === 'map' && (
          <MouzaMapViewer onOpenKhatianNumber={handleOpenKhatianByNumber} />
        )}

        {activeTab === 'orders' && (
          <WalletOrders
            user={user}
            onOpenAuth={() => handleOpenAuth('login')}
            onRechargeSuccess={(newBalance) => {
              if (user) setUser({ ...user, walletBalance: newBalance });
            }}
          />
        )}

        {activeTab === 'security' && <SecuritySystemMonitor />}

        {/* Global Legal Disclaimer Banner at bottom */}
        <LegalDisclaimer />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 mt-12 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-sm">
              📜
            </div>
            <div>
              <span className="font-bold text-white text-sm">
                babaland<span className="text-emerald-400">bd.com</span>
              </span>
              <p className="text-[11px] text-slate-400">
                আধুনিক ও নিরাপদ বাংলাদেশ ডিজিটাল ভূমি রেকর্ড সেবা
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {user?.role === 'admin' && (
              <button
                onClick={() => setAdminPanelOpen(true)}
                className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer font-bold"
              >
                👑 অ্যাডমিন প্যানেল (Admin)
              </button>
            )}
            {user && (
              <button
                onClick={() => setCitizenDashboardOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-bold"
              >
                👤 নাগরিক ড্যাশবোর্ড
              </button>
            )}
            <button
              onClick={() => handleOpenAuth('single')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              একক গ্রাহক পোর্টাল (#single)
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className="hover:text-emerald-300 transition-colors cursor-pointer"
            >
              সিকিউরিটি ও ডাটাবেস
            </button>
            <a
              href="tel:16122"
              className="text-amber-400 hover:text-amber-300 transition-colors font-semibold"
            >
              ভূমি সেবা কল সেন্টার: ১৬১২২
            </a>
          </div>

          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} babalandbd.com. সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (1-Thumb Intuitive Phone UI) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoggedIn={!!user}
        isAdmin={user?.role === 'admin'}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenDashboard={() => setCitizenDashboardOpen(true)}
        onOpenAdmin={() => setAdminPanelOpen(true)}
      />

      {/* Portal Auth Modal (Faithful to vumisheba.site/portal#single with OTP & Admin login) */}
      <PortalAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
      />

      {/* Citizen Personal Dashboard Modal (7 Core Functions) */}
      {user && (
        <CitizenDashboardModal
          isOpen={citizenDashboardOpen}
          onClose={() => setCitizenDashboardOpen(false)}
          user={user}
          onBalanceUpdated={(newBalance) => {
            setUser({ ...user, walletBalance: newBalance });
          }}
        />
      )}

      {/* Dedicated Admin Panel Modal (Admin ID: Admin / Admin68782800) */}
      {user?.role === 'admin' && (
        <AdminPanelModal
          isOpen={adminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
          adminUser={user}
          onAdminUpdated={(updatedAdmin) => {
            setUser(updatedAdmin);
          }}
        />
      )}

      {/* Khatian Viewer & Certified Print Modal */}
      <KhatianViewerModal
        khatian={selectedKhatian}
        onClose={() => setViewerModalOpen(false)}
        onOrderCertified={handleOrderCertified}
      />
    </div>
  );
}
