import React, { useState } from 'react';
import {
  Search,
  Lock,
  Unlock,
  ShieldCheck,
  Fingerprint,
  AlertTriangle,
  Play,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  MessageSquare,
  Camera,
  Image,
  CreditCard,
  Coins,
  Send,
  Settings,
  Terminal,
  Globe,
  Folder,
  Mail,
  Calculator
} from 'lucide-react';
import { AppItem, LockType } from '../types/applock';

interface AppLockerTabProps {
  apps: AppItem[];
  onToggleLock: (id: string) => void;
  onUpdateAppLockType: (id: string, lockType: LockType) => void;
  onToggleFakeCrash: (id: string) => void;
  onLockAll: () => void;
  onUnlockAll: () => void;
  onLaunchLockTest: (app: AppItem) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  MessageSquare,
  Camera,
  Image,
  CreditCard,
  Coins,
  Send,
  Settings,
  Terminal,
  Globe,
  Folder,
  Mail,
  Calculator,
};

export const AppLockerTab: React.FC<AppLockerTabProps> = ({
  apps,
  onToggleLock,
  onUpdateAppLockType,
  onToggleFakeCrash,
  onLockAll,
  onUnlockAll,
  onLaunchLockTest,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.packageName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalLocked = apps.filter((a) => a.isLocked).length;
  const financeLocked = apps.filter((a) => a.category === 'finance' && a.isLocked).length;
  const totalFinance = apps.filter((a) => a.category === 'finance').length;
  const fakeCrashCount = apps.filter((a) => a.fakeCrashEnabled && a.isLocked).length;

  return (
    <div className="space-y-6">
      {/* Top Cyber Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Protected Apps</div>
            <div className="text-xl font-bold font-mono text-emerald-400 flex items-baseline gap-1 mt-0.5">
              <span>{totalLocked}</span>
              <span className="text-xs text-slate-500">/ {apps.length}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Financial Armor</div>
            <div className="text-xl font-bold font-mono text-cyan-400 flex items-baseline gap-1 mt-0.5">
              <span>{financeLocked}/{totalFinance}</span>
              <span className="text-[10px] text-emerald-400">100% OK</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Biometric Guard</div>
            <div className="text-xl font-bold font-mono text-purple-400 flex items-baseline gap-1 mt-0.5">
              <span>ACTIVE</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Fingerprint className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Fake Crash Disguise</div>
            <div className="text-xl font-bold font-mono text-amber-400 flex items-baseline gap-1 mt-0.5">
              <span>{fakeCrashCount} Apps</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search, Filter & Bulk Actions Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by app name or Android package (e.g. com.whatsapp)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['all', 'social', 'finance', 'media', 'system', 'utility'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase font-mono transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Bulk Lock / Unlock */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLockAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold rounded-xl transition cursor-pointer"
            title="Lock All Applications"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock All</span>
          </button>
          <button
            onClick={onUnlockAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold rounded-xl transition cursor-pointer"
            title="Unlock All Applications"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Unlock All</span>
          </button>
        </div>
      </div>

      {/* App List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredApps.map((app) => {
          const IconComponent = ICON_MAP[app.icon] || Lock;
          const isLocked = app.isLocked;

          return (
            <div
              key={app.id}
              className={`relative p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isLocked
                  ? 'bg-slate-900/90 border-slate-700/90 shadow-md shadow-emerald-950/10'
                  : 'bg-slate-950/70 border-slate-800/80 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* App details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      isLocked
                        ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-400 shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-100 truncate">{app.name}</h3>
                      {app.category === 'finance' && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 rounded">
                          FINANCE
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-500 truncate">{app.packageName}</p>
                  </div>
                </div>

                {/* Primary Lock Toggle Button */}
                <button
                  onClick={() => onToggleLock(app.id)}
                  aria-label={isLocked ? `Unlock ${app.name}` : `Lock ${app.name}`}
                  className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer p-0.5 shrink-0 ${
                    isLocked ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-slate-950 shadow-md transform transition-transform flex items-center justify-center ${
                      isLocked ? 'translate-x-5 text-emerald-400' : 'translate-x-0 text-slate-500'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </div>
                </button>
              </div>

              {/* Security features row */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Lock Mode Selector */}
                  <select
                    disabled={!isLocked}
                    value={app.lockType}
                    onChange={(e) => onUpdateAppLockType(app.id, e.target.value as LockType)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono disabled:opacity-40 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pin">PIN Protection</option>
                    <option value="pattern">Pattern Lock</option>
                    <option value="biometric">Biometrics / Fingerprint</option>
                    <option value="fake_crash">Fake Crash Camouflage</option>
                    <option value="calculator">Calculator Disguise</option>
                  </select>

                  {/* Fake Crash Toggle Pill */}
                  <button
                    disabled={!isLocked}
                    onClick={() => onToggleFakeCrash(app.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 border transition cursor-pointer disabled:opacity-30 ${
                      app.fakeCrashEnabled
                        ? 'bg-amber-950/80 text-amber-300 border-amber-600/60'
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                    title="Display fake crash error when opened"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Fake Crash: {app.fakeCrashEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {/* Instant Test Lock Overlay button */}
                <button
                  onClick={() => onLaunchLockTest(app)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  title="Launch live lock overlay simulation for this app"
                >
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>Test Lock</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
