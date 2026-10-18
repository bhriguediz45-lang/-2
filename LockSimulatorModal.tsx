import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Lock,
  Unlock,
  Fingerprint,
  RotateCcw,
  ShieldAlert,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Info,
  Delete,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppItem, SecurityConfig, LockType } from '../types/applock';
import { getScrambledKeypad, getStandardKeypad, verifyPattern } from '../utils/crypto';

interface LockSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppItem;
  config: SecurityConfig;
  onIntruderCaptured: (appName: string, packageName: string, failedPin: string, photoDataUrl?: string) => void;
}

export const LockSimulatorModal: React.FC<LockSimulatorModalProps> = ({
  isOpen,
  onClose,
  app,
  config,
  onIntruderCaptured,
}) => {
  const [activeMode, setActiveMode] = useState<LockType>(app.lockType || 'pin');
  const [enteredPin, setEnteredPin] = useState('');
  const [keypadDigits, setKeypadDigits] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDecoyUnlocked, setIsDecoyUnlocked] = useState(false);

  // Pattern lock state
  const [patternPoints, setPatternPoints] = useState<number[]>([]);
  const [isDrawingPattern, setIsDrawingPattern] = useState(false);

  // Fake crash disguise state
  const [isFakeCrashVisible, setIsFakeCrashVisible] = useState(app.fakeCrashEnabled || activeMode === 'fake_crash');
  const [fakeCrashPressTimer, setFakeCrashPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Calculator disguise state
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);

  // Biometric animation state
  const [isScanningFingerprint, setIsScanningFingerprint] = useState(false);

  // Intruder camera ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Refresh keypad digits on open
  useEffect(() => {
    if (isOpen) {
      setIsUnlocked(false);
      setIsDecoyUnlocked(false);
      setEnteredPin('');
      setPatternPoints([]);
      setFailedAttempts(0);
      setStatusMessage(null);
      setIsFakeCrashVisible(app.fakeCrashEnabled || app.lockType === 'fake_crash');
      setActiveMode(app.lockType || 'pin');

      if (config.scrambleKeypad) {
        setKeypadDigits(getScrambledKeypad());
      } else {
        setKeypadDigits(getStandardKeypad());
      }

      // Initialize camera silently if intruder selfie is on
      if (config.intruderSelfieEnabled && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'user' }, audio: false })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              setCameraActive(true);
            }
          })
          .catch(() => {
            setCameraActive(false);
          });
      }
    } else {
      // Stop camera stream on close
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [isOpen, app, config]);

  if (!isOpen) return null;

  const triggerHaptic = () => {
    if (config.vibrationHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const captureIntruderPhoto = (): string | undefined => {
    if (cameraActive && videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', 0.7);
        }
      } catch {
        // Fallback
      }
    }
    // Return SVG canvas placeholder as fallback evidence
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 320, 240);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('[INTRUDER CAPTURE]', 60, 100);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText(`Target: ${app.name}`, 60, 130);
      ctx.fillText(`Time: ${new Date().toLocaleTimeString()}`, 60, 150);
      return canvas.toDataURL('image/jpeg');
    }
    return undefined;
  };

  const handleSuccessfulUnlock = (isDecoy = false) => {
    triggerHaptic();
    setIsUnlocked(true);
    setIsDecoyUnlocked(isDecoy);
    setStatusMessage(isDecoy ? 'DECOY SYSTEM UNLOCKED' : 'ACCESS GRANTED');

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: isDecoy ? ['#38bdf8', '#818cf8'] : ['#10b981', '#06b6d4', '#6ee7b7'],
    });

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleFailedAttempt = (attemptedValue: string) => {
    triggerHaptic();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);

    if (config.scrambleKeypad) {
      setKeypadDigits(getScrambledKeypad());
    }

    if (newAttempts >= config.maxFailedAttempts) {
      setStatusMessage(`SECURITY BREACH: ${newAttempts} FAILED ATTEMPTS!`);
      const snapshot = captureIntruderPhoto();
      onIntruderCaptured(app.name, app.packageName, attemptedValue, snapshot);
    } else {
      setStatusMessage(`Incorrect Code. ${config.maxFailedAttempts - newAttempts} attempts left.`);
    }

    setEnteredPin('');
    setPatternPoints([]);
  };

  // PIN Keypad Handlers
  const handleDigitPress = (digit: number) => {
    triggerHaptic();
    if (enteredPin.length >= 6) return;
    const updated = enteredPin + digit;
    setEnteredPin(updated);

    // Auto verify when 4 or 6 digits entered
    if (updated.length === config.masterPin.length || updated.length === 4) {
      if (updated === config.masterPin) {
        handleSuccessfulUnlock(false);
      } else if (config.decoyPin && updated === config.decoyPin) {
        handleSuccessfulUnlock(true);
      } else if (updated.length >= config.masterPin.length) {
        handleFailedAttempt(updated);
      }
    }
  };

  const handleDeleteDigit = () => {
    triggerHaptic();
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  // Biometric Handler
  const handleSimulateBiometric = (success: boolean) => {
    setIsScanningFingerprint(true);
    setStatusMessage('Scanning biometric fingerprint sensor...');
    setTimeout(() => {
      setIsScanningFingerprint(false);
      if (success) {
        handleSuccessfulUnlock(false);
      } else {
        handleFailedAttempt('BIOMETRIC_MISMATCH');
      }
    }, 900);
  };

  // Calculator Disguise Handlers
  const handleCalcDigit = (d: string) => {
    triggerHaptic();
    setCalcDisplay((prev) => (prev === '0' ? d : prev + d));
  };

  const handleCalcOp = (op: string) => {
    triggerHaptic();
    setCalcPrev(parseFloat(calcDisplay));
    setCalcOp(op);
    setCalcDisplay('0');
  };

  const handleCalcEquals = () => {
    triggerHaptic();
    // Check if secret passcode was typed
    if (calcDisplay === config.calculatorPasscode || calcDisplay === config.masterPin) {
      handleSuccessfulUnlock(false);
      return;
    }

    if (calcPrev !== null && calcOp) {
      const current = parseFloat(calcDisplay);
      let res = 0;
      if (calcOp === '+') res = calcPrev + current;
      if (calcOp === '-') res = calcPrev - current;
      if (calcOp === '×') res = calcPrev * current;
      if (calcOp === '÷') res = current !== 0 ? calcPrev / current : 0;
      setCalcDisplay(String(res));
      setCalcPrev(null);
      setCalcOp(null);
    }
  };

  // Fake Crash Long-press handler
  const handleFakeCrashPressStart = () => {
    const timer = setTimeout(() => {
      // Secret gesture: 2 seconds hold bypasses fake crash to show real PIN lock!
      setIsFakeCrashVisible(false);
      setStatusMessage('Disguise Bypassed. Enter Master PIN.');
    }, 1800);
    setFakeCrashPressTimer(timer);
  };

  const handleFakeCrashPressEnd = () => {
    if (fakeCrashPressTimer) {
      clearTimeout(fakeCrashPressTimer);
      setFakeCrashPressTimer(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Hidden camera element for real intruder capture */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />

      {/* Android Device Mockup Frame */}
      <div className="relative w-full max-w-sm rounded-[2.5rem] bg-slate-950 border-4 border-slate-800 shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col min-h-[640px] max-h-[92vh]">
        
        {/* Top Speaker & Camera Notch */}
        <div className="h-6 bg-slate-950 flex items-center justify-center shrink-0 border-b border-slate-900/40">
          <div className="w-16 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-800"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse"></div>
          </div>
        </div>

        {/* Android 13+ Status Bar */}
        <div className="px-6 py-2 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/60 shrink-0">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-emerald-400 font-bold">5G</span>
            <span className="w-2.5 h-2.5 rounded-full border border-slate-600 flex items-center justify-center">
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            </span>
            <span>94%</span>
          </div>
        </div>

        {/* Close Preview Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
          aria-label="Exit Lock Overlay"
        >
          <X className="w-4 h-4" />
        </button>

        {/* BODY CONTAINER */}
        <div className="flex-1 flex flex-col p-5 overflow-y-auto">
          {/* ============================================================
              1. FAKE CRASH CAMOUFLAGE SCREEN
             ============================================================ */}
          {isFakeCrashVisible ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">App has stopped</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-xs">
                Unfortunately, {app.name} ({app.packageName}) has encountered an unexpected runtime exception.
              </p>

              <div className="w-full mt-8 space-y-2">
                <button
                  onMouseDown={handleFakeCrashPressStart}
                  onMouseUp={handleFakeCrashPressEnd}
                  onTouchStart={handleFakeCrashPressStart}
                  onTouchEnd={handleFakeCrashPressEnd}
                  onClick={() => {
                    // Normal tap exits to home
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition cursor-pointer select-none active:scale-95"
                >
                  OK (Hold 2s for Secret Unlock)
                </button>
                <button
                  onClick={() => {
                    setIsFakeCrashVisible(false);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs font-mono transition cursor-pointer"
                >
                  Bypass Disguise (Reveal PIN Pad)
                </button>
              </div>

              <div className="mt-6 text-[10px] font-mono text-slate-600">
                Aegis Android 13+ Stealth Defense Active
              </div>
            </div>
          ) : activeMode === 'calculator' ? (
            /* ============================================================
               2. CALCULATOR CAMOUFLAGE MODE
               ============================================================ */
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-2">
                  <span>Aegis Calculator v2.4</span>
                  <span className="text-[10px] text-cyan-400">Passcode: {config.calculatorPasscode}=</span>
                </div>
                <div className="h-16 bg-slate-900/90 rounded-2xl border border-slate-800 px-4 flex items-center justify-end text-3xl font-mono text-emerald-400 overflow-x-auto">
                  {calcDisplay}
                </div>
              </div>

              {/* Calculator Keypad */}
              <div className="grid grid-cols-4 gap-2 my-auto pt-4">
                {['C', '±', '%', '÷'].map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      if (k === 'C') setCalcDisplay('0');
                      else if (k === '÷') handleCalcOp('÷');
                    }}
                    className="h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-sm font-bold active:scale-95 transition cursor-pointer"
                  >
                    {k}
                  </button>
                ))}
                {['7', '8', '9', '×'].map((k) => (
                  <button
                    key={k}
                    onClick={() => (k === '×' ? handleCalcOp('×') : handleCalcDigit(k))}
                    className="h-12 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-200 font-mono text-base font-semibold active:scale-95 transition cursor-pointer"
                  >
                    {k}
                  </button>
                ))}
                {['4', '5', '6', '-'].map((k) => (
                  <button
                    key={k}
                    onClick={() => (k === '-' ? handleCalcOp('-') : handleCalcDigit(k))}
                    className="h-12 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-200 font-mono text-base font-semibold active:scale-95 transition cursor-pointer"
                  >
                    {k}
                  </button>
                ))}
                {['1', '2', '3', '+'].map((k) => (
                  <button
                    key={k}
                    onClick={() => (k === '+' ? handleCalcOp('+') : handleCalcDigit(k))}
                    className="h-12 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-200 font-mono text-base font-semibold active:scale-95 transition cursor-pointer"
                  >
                    {k}
                  </button>
                ))}
                <button
                  onClick={() => handleCalcDigit('0')}
                  className="col-span-2 h-12 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-200 font-mono text-base font-semibold active:scale-95 transition cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={() => handleCalcDigit('.')}
                  className="h-12 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-200 font-mono text-base font-semibold active:scale-95 transition cursor-pointer"
                >
                  .
                </button>
                <button
                  onClick={handleCalcEquals}
                  className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-lg font-bold active:scale-95 transition cursor-pointer"
                >
                  =
                </button>
              </div>

              <div className="text-center text-[11px] font-mono text-slate-500">
                Type secret passcode & press = to unlock {app.name}
              </div>
            </div>
          ) : (
            /* ============================================================
               3. STANDARD AEGIS LOCK OVERLAY (PIN / PATTERN / BIOMETRIC)
               ============================================================ */
            <div className={`flex-1 flex flex-col justify-between ${isShaking ? 'animate-shake' : ''}`}>
              {/* App Lock Banner */}
              <div className="text-center pt-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
                  {isUnlocked ? <Unlock className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
                </div>

                <h2 className="text-base font-bold text-slate-100 flex items-center justify-center gap-1.5">
                  <span>{app.name}</span>
                </h2>
                <p className="text-[11px] font-mono text-slate-500 truncate max-w-xs mx-auto">
                  {app.packageName}
                </p>

                {/* Status Message or Warning */}
                {statusMessage ? (
                  <div
                    className={`mt-2.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium inline-flex items-center gap-1.5 ${
                      isUnlocked
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                        : failedAttempts >= config.maxFailedAttempts
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60 animate-pulse'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                    }`}
                  >
                    {isUnlocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>{statusMessage}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-2">
                    Enter master PIN or touch biometric scanner
                  </p>
                )}
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex justify-center gap-1 my-3 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveMode('pin')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition cursor-pointer ${
                    activeMode === 'pin' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400'
                  }`}
                >
                  PIN
                </button>
                <button
                  onClick={() => setActiveMode('pattern')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition cursor-pointer ${
                    activeMode === 'pattern' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400'
                  }`}
                >
                  Pattern
                </button>
                <button
                  onClick={() => setActiveMode('biometric')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition cursor-pointer ${
                    activeMode === 'biometric' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400'
                  }`}
                >
                  Biometric
                </button>
              </div>

              {/* MODE A: PIN ENTRY */}
              {activeMode === 'pin' && (
                <div className="space-y-4">
                  {/* PIN Dots Display */}
                  <div className="flex justify-center gap-3 py-2">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                          idx < enteredPin.length
                            ? 'bg-emerald-400 border-emerald-300 scale-110 shadow-sm shadow-emerald-400'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Scramble keypad indicator */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-2">
                    <span>Anti-Smudge: {config.scrambleKeypad ? 'SCRAMBLED' : 'STANDARD'}</span>
                    <button
                      onClick={() => setKeypadDigits(getScrambledKeypad())}
                      className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Reshuffle
                    </button>
                  </div>

                  {/* Numeric Keypad Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {keypadDigits.slice(0, 9).map((d) => (
                      <button
                        key={d}
                        onClick={() => handleDigitPress(d)}
                        className="h-12 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-lg font-bold font-mono text-slate-100 active:scale-95 transition cursor-pointer flex items-center justify-center"
                      >
                        {d}
                      </button>
                    ))}
                    {/* Bottom row: Fingerprint shortcut, 10th digit, backspace */}
                    <button
                      onClick={() => handleSimulateBiometric(true)}
                      className="h-12 rounded-xl bg-slate-900/40 hover:bg-slate-800 border border-slate-800/80 text-emerald-400 active:scale-95 transition cursor-pointer flex items-center justify-center"
                      title="Fingerprint quick unlock"
                    >
                      <Fingerprint className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDigitPress(keypadDigits[9] ?? 0)}
                      className="h-12 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-lg font-bold font-mono text-slate-100 active:scale-95 transition cursor-pointer flex items-center justify-center"
                    >
                      {keypadDigits[9] ?? 0}
                    </button>
                    <button
                      onClick={handleDeleteDigit}
                      className="h-12 rounded-xl bg-slate-900/40 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-white active:scale-95 transition cursor-pointer flex items-center justify-center"
                      title="Delete"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-center text-[10px] font-mono text-slate-500">
                    Master PIN: <span className="text-emerald-400">{config.masterPin}</span> | Decoy PIN:{' '}
                    <span className="text-cyan-400">{config.decoyPin}</span>
                  </div>
                </div>
              )}

              {/* MODE B: PATTERN LOCK */}
              {activeMode === 'pattern' && (
                <div className="space-y-4">
                  <div className="text-center text-xs font-mono text-slate-400">
                    Connect the 3x3 security grid dots
                  </div>

                  <div className="w-56 h-56 mx-auto grid grid-cols-3 gap-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                      const isSelected = patternPoints.includes(index);
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            triggerHaptic();
                            if (!patternPoints.includes(index)) {
                              const next = [...patternPoints, index];
                              setPatternPoints(next);
                              if (next.length >= config.masterPattern.length) {
                                if (verifyPattern(next, config.masterPattern)) {
                                  handleSuccessfulUnlock(false);
                                } else {
                                  handleFailedAttempt(next.join('-'));
                                }
                              }
                            }
                          }}
                          className="flex items-center justify-center focus:outline-none cursor-pointer"
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-300 scale-125 shadow-md shadow-emerald-400'
                                : 'bg-slate-800 border-slate-600 hover:border-slate-400'
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-slate-950"></div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setPatternPoints([])}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    >
                      Clear Pattern
                    </button>
                    <button
                      onClick={() => {
                        setPatternPoints(config.masterPattern);
                        handleSuccessfulUnlock(false);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-950 border border-emerald-700 text-emerald-300 cursor-pointer"
                    >
                      Autofill Pattern (0-1-2-5-8)
                    </button>
                  </div>
                </div>
              )}

              {/* MODE C: BIOMETRIC PROMPT */}
              {activeMode === 'biometric' && (
                <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                  <div className="relative mb-6">
                    <div
                      className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all ${
                        isScanningFingerprint
                          ? 'border-emerald-400 bg-emerald-500/20 shadow-xl shadow-emerald-500/30'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      <Fingerprint
                        className={`w-14 h-14 ${
                          isScanningFingerprint ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
                        }`}
                      />
                    </div>
                    {isScanningFingerprint && (
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-60"></div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-100">Android BiometricPrompt API</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Touch the fingerprint sensor or choose simulation response below:
                  </p>

                  <div className="flex gap-2.5 mt-6 w-full">
                    <button
                      onClick={() => handleSimulateBiometric(true)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition active:scale-95 cursor-pointer shadow-md shadow-emerald-950/40"
                    >
                      Simulate Valid Touch
                    </button>
                    <button
                      onClick={() => handleSimulateBiometric(false)}
                      className="flex-1 py-2.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold transition active:scale-95 cursor-pointer"
                    >
                      Simulate Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Android 13+ Bottom Navigation Pill Bar */}
        <div className="h-6 bg-slate-950 flex items-center justify-center shrink-0 border-t border-slate-900/60">
          <div className="w-32 h-1 bg-slate-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
