import React from 'react';
import { X, Shield, ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { SecurityScoreResult } from '../utils/crypto';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditResult: SecurityScoreResult;
  onOpenSettings: () => void;
  onOpenShield: () => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({
  isOpen,
  onClose,
  auditResult,
  onOpenSettings,
  onOpenShield,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Aegis Security Posture Audit</h2>
              <p className="text-[11px] font-mono text-slate-400">Android 13+ Threat Model Evaluation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Score card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400">Defensive Rating</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1 flex items-baseline gap-2">
                <span>{auditResult.score} / 100</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {auditResult.rating}
                </span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-7 h-7" />
            </div>
          </div>

          {/* Passed Checks */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hardened Security Controls ({auditResult.passedChecks.length})</span>
            </h3>
            <div className="space-y-1.5">
              {auditResult.passedChecks.map((check, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 font-mono flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {auditResult.recommendations.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Recommended Hardening Actions ({auditResult.recommendations.length})</span>
              </h3>
              <div className="space-y-2">
                {auditResult.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-slate-300 flex items-center justify-between gap-2"
                  >
                    <span>{rec}</span>
                    <button
                      onClick={() => {
                        onClose();
                        if (rec.includes('PIN') || rec.includes('Scramble') || rec.includes('Decoy')) {
                          onOpenSettings();
                        } else {
                          onOpenShield();
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-mono shrink-0 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Fix</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
