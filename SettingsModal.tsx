import React, { useState } from 'react';
import {
  X,
  Shield,
  Key,
  Smartphone,
  Eye,
  Camera,
  Vibrate,
  AlertTriangle,
  RotateCcw,
  Check,
  Save,
  Lock
} from 'lucide-react';
import { SecurityConfig } from '../types/applock';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SecurityConfig;
  onSaveConfig: (updated: SecurityConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<SecurityConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">AppLock Security Architecture</h2>
              <p className="text-[11px] font-mono text-slate-400">Military-Grade Defense Settings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Master PIN and Decoy PIN */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Authentication Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Master Security PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={formData.masterPin}
                  onChange={(e) =>
                    setFormData({ ...formData, masterPin: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-sm tracking-widest focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Primary code to unlock apps and encrypted vault
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Decoy / Duress PIN (Coercion Defense)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.decoyPin}
                  onChange={(e) =>
                    setFormData({ ...formData, decoyPin: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 font-mono text-sm tracking-widest focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Unlocks fake empty apps & decoy harmless safe
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Calculator Camouflage Passcode
              </label>
              <input
                type="text"
                maxLength={6}
                value={formData.calculatorPasscode}
                onChange={(e) =>
                  setFormData({ ...formData, calculatorPasscode: e.target.value.replace(/\D/g, '') })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-sm tracking-widest focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Type this passcode followed by = in the calculator to unlock
              </span>
            </div>
          </div>

          {/* Hardened Protections */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Advanced Anti-Intrusion Controls
            </h3>

            {/* Scramble keypad toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Anti-Smudge Scramble Keypad
                </div>
                <div className="text-[11px] text-slate-400">
                  Shuffles keypad numbers on every launch to prevent finger smudge analysis
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.scrambleKeypad}
                onChange={(e) =>
                  setFormData({ ...formData, scrambleKeypad: e.target.checked })
                }
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Intruder selfie toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Intruder Selfie Radar
                </div>
                <div className="text-[11px] text-slate-400">
                  Silently capture front camera snapshot on repeated wrong attempts
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.intruderSelfieEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, intruderSelfieEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Anti-uninstall Knox protection */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Anti-Uninstall Device Admin Shield
                </div>
                <div className="text-[11px] text-slate-400">
                  Prevents intruders from deleting the app via Android Settings
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.antiUninstallKnox}
                onChange={(e) =>
                  setFormData({ ...formData, antiUninstallKnox: e.target.checked })
                }
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* Vibration haptics */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Tactile Haptic Feedback
                </div>
                <div className="text-[11px] text-slate-400">
                  Subtle vibration on keypad input and alert pulse on wrong attempts
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.vibrationHaptics}
                onChange={(e) =>
                  setFormData({ ...formData, vibrationHaptics: e.target.checked })
                }
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Save Button */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition active:scale-95 shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? 'Saved!' : 'Save Security Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
