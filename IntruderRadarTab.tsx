import React, { useState } from 'react';
import {
  Camera,
  ShieldAlert,
  AlertTriangle,
  Volume2,
  VolumeX,
  Trash2,
  Download,
  Calendar,
  Clock,
  ExternalLink,
  Info,
  Radio,
  Sparkles
} from 'lucide-react';
import { IntruderLog } from '../types/applock';

interface IntruderRadarTabProps {
  logs: IntruderLog[];
  onClearLogs: () => void;
  onSimulateIntruder: () => void;
}

export const IntruderRadarTab: React.FC<IntruderRadarTabProps> = ({
  logs,
  onClearLogs,
  onSimulateIntruder,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Web Audio API siren alert
  const toggleSiren = () => {
    if (isSirenActive) {
      if (audioCtx) {
        audioCtx.close();
        setAudioCtx(null);
      }
      setIsSirenActive(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        // Loop siren modulation
        const interval = setInterval(() => {
          if (ctx.state === 'closed') {
            clearInterval(interval);
            return;
          }
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.4);
        }, 500);

        setAudioCtx(ctx);
        setIsSirenActive(true);
      } catch {
        setIsSirenActive(false);
      }
    }
  };

  const exportIncidentReport = () => {
    const reportData = {
      app: 'AegisLock Android 13+ Security Guard',
      generatedAt: new Date().toISOString(),
      totalBreachAttempts: logs.length,
      incidents: logs,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegis-security-breach-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Intruder Radar Status Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Intruder Radar & Stealth Camera</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-800 rounded">
                  ARMED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Automatically snaps a high-resolution photo using the front camera when someone enters the wrong PIN or pattern 3 times.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onSimulateIntruder}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition active:scale-95 cursor-pointer shadow-md shadow-rose-950/50"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Simulate Intruder Snap</span>
            </button>

            <button
              onClick={toggleSiren}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                isSirenActive
                  ? 'bg-rose-500 text-white border-rose-400 animate-bounce'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {isSirenActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSirenActive ? 'Stop Siren' : 'Test Audio Siren'}</span>
            </button>

            {logs.length > 0 && (
              <>
                <button
                  onClick={exportIncidentReport}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  title="Export Incident JSON"
                  aria-label="Export Incident JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onClearLogs}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                  title="Clear All Logs"
                  aria-label="Clear All Logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Incident Log Cards */}
      {logs.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No Security Breaches Detected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Your protected apps are currently secure. Click "Simulate Intruder Snap" or test the lock overlay with wrong credentials to view logs here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{log.appName}</h4>
                    <p className="text-[11px] font-mono text-slate-500">{log.packageName}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  {log.attemptsCount} Failed Attempts
                </span>
              </div>

              {/* Snapshot evidence preview */}
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                {log.photoUrl ? (
                  <img
                    src={log.photoUrl}
                    alt="Intruder snapshot"
                    onClick={() => setSelectedPhoto(log.photoUrl!)}
                    className="w-16 h-14 rounded-lg object-cover border border-rose-500/40 cursor-pointer hover:opacity-80 transition shrink-0"
                  />
                ) : (
                  <div className="w-16 h-14 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 shrink-0">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span className="text-[8px] font-mono">NO PHOTO</span>
                  </div>
                )}

                <div className="text-xs space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Failed Input:{' '}
                    <span className="text-rose-400 font-mono font-semibold">
                      {log.failedPinEntered || 'REJECTED'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Sensor: {log.locationLabel}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Snapshot Enlarge Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200">Intruder Snapshot Evidence</h4>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                Close [ESC]
              </button>
            </div>
            <img src={selectedPhoto} alt="Full Intruder Evidence" className="w-full rounded-xl border border-slate-800" />
            <p className="text-xs text-slate-400 font-mono">
              Captured via Front-facing Camera Sensor with timestamp verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
