import React from 'react';
import { Shield, ShieldAlert, Cpu, Lock, Settings as SettingsIcon, Smartphone } from 'lucide-react';
import { SecurityScoreResult } from '../utils/crypto';

interface HeaderProps {
  securityScore: SecurityScoreResult;
  onOpenSettings: () => void;
  onLaunchSimulatedLock: () => void;
  onOpenAudit: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  securityScore,
  onOpenSettings,
  onLaunchSimulatedLock,
  onOpenAudit,
}) => {
  const isMilitary = securityScore.rating === 'MILITARY_GRADE';
  const isHigh = securityScore.rating === 'HIGH';

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Kernel Hook Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AEGIS <span className="text-emerald-400">LOCK</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                ANDROID 13+
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-900 text-slate-400 border border-slate-800">
                <Cpu className="w-2.5 h-2.5 text-cyan-400" /> API 34 HOOKED
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Kernel Watchdog: <span className="text-emerald-400 font-medium">Armed</span></span>
              <span className="text-slate-600">•</span>
              <span className="hidden xs:inline">Termux APK Ready</span>
            </p>
          </div>
        </div>

        {/* Security Score Badge & Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between md:justify-end">
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-emerald-500/60 transition group cursor-pointer"
            title="Click to view full security audit breakdown"
          >
            {isMilitary || isHigh ? (
              <Shield className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            )}
            <div className="text-left">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Security Score</div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <span className={isMilitary ? 'text-emerald-400' : isHigh ? 'text-cyan-400' : 'text-amber-400'}>
                  {securityScore.score}/100
                </span>
                <span className="text-[10px] text-slate-500">({securityScore.rating})</span>
              </div>
            </div>
          </button>

          <button
            onClick={onLaunchSimulatedLock}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 transition shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulate Lock Overlay</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="AppLock Security Settings"
            aria-label="AppLock Security Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
