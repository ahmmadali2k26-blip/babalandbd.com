import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Layers,
  FileText,
  CreditCard,
  ShieldAlert,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  Volume2,
} from 'lucide-react';
import { AppNotification } from '../types';

interface Props {
  onNavigateTab: (tab: string, referenceId?: string) => void;
}

export const NotificationBell: React.FC<Props> = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'mutation_update' | 'khatian_order'>('ALL');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s for live alerts
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id?: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id } : { markAll: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.read) {
      handleMarkAsRead(item.id);
    }
    setIsOpen(false);
    if (item.actionTab) {
      onNavigateTab(item.actionTab, item.referenceId);
    }
  };

  const handleTriggerTest = async (type: 'mutation' | 'khatian') => {
    setLoading(true);
    try {
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.type === activeFilter;
  });

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'এইমাত্র';
    if (diffMins < 60) return `${diffMins} মিনিট আগে`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
    return new Date(isoString).toLocaleDateString('bn-BD');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/60 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm group cursor-pointer"
        title="নোটিফিকেশন ও স্ট্যাটাস আপডেট"
      >
        <Bell className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12 ${unreadCount > 0 ? 'text-amber-300' : 'text-slate-400'}`} />

        {/* Unread Glowing Pulse Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] px-1 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex items-center justify-center rounded-full h-4 sm:h-5 px-1 bg-rose-600 text-white text-[10px] font-black leading-none shadow-md">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 sm:right-0 mt-2 w-[310px] xs:w-[350px] sm:w-[410px] max-w-[94vw] bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 overflow-hidden text-slate-100 animate-fadeIn">
          {/* Header */}
          <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>বিজ্ঞপ্তি ও স্ট্যাটাস আপডেট</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {unreadCount}টি নতুন
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-slate-400">
                  ই-নামজারি ও খতিয়ান অর্ডারের লাইভ অগ্রগতি
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => handleMarkAsRead()}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/20"
                title="সবগুলো পড়া হয়েছে চিহ্নিত করুন"
              >
                <CheckCheck className="w-3 h-3" />
                <span className="hidden xs:inline">সব পড়া হয়েছে</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-3 pt-2.5 pb-2 bg-slate-950/50 border-b border-slate-800 flex gap-1.5 text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              সকল ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('mutation_update')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeFilter === 'mutation_update'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              নামজারি
            </button>
            <button
              onClick={() => setActiveFilter('khatian_order')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                activeFilter === 'khatian_order'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              খতিয়ান অর্ডার
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>কোনো নতুন বিজ্ঞপ্তি পাওয়া যায়নি</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isMutation = notif.type === 'mutation_update';
                const isKhatian = notif.type === 'khatian_order';
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3 sm:p-3.5 transition-colors cursor-pointer text-left flex items-start gap-2.5 group ${
                      notif.read ? 'bg-slate-900/60 hover:bg-slate-800/60' : 'bg-slate-800/40 hover:bg-slate-800/80 border-l-2 border-emerald-500'
                    }`}
                  >
                    {/* Type Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isMutation
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : isKhatian
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isMutation ? (
                        <Layers className="w-4 h-4" />
                      ) : isKhatian ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h5 className={`text-xs font-bold truncate ${notif.read ? 'text-slate-200' : 'text-white'}`}>
                          {notif.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 whitespace-nowrap">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatRelativeTime(notif.timestamp)}</span>
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mb-1.5">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        {notif.referenceId && (
                          <span className="font-mono text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {notif.referenceId}
                          </span>
                        )}
                        <span className="text-cyan-400 group-hover:underline font-semibold flex items-center gap-0.5 ml-auto">
                          <span>বিস্তারিত দেখুন</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>

                    {/* Unread Dot */}
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5 shadow-sm shadow-emerald-400"></span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Test Alert Simulator Footer */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>লাইভ টেস্ট অ্যালার্ট:</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleTriggerTest('mutation')}
                disabled={loading}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-semibold transition-colors cursor-pointer"
                title="টেস্ট নামজারি নোটিশ তৈরি করুন"
              >
                + নামজারি নোটিশ
              </button>

              <button
                type="button"
                onClick={() => handleTriggerTest('khatian')}
                disabled={loading}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-semibold transition-colors cursor-pointer"
                title="টেস্ট খতিয়ান অর্ডার তৈরি করুন"
              >
                + খতিয়ান আপডেট
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
