import React, { useState } from 'react';
import {
  Terminal,
  Download,
  Copy,
  Check,
  Play,
  FileCode,
  FolderTree,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { TERMUX_FILES, generateTermuxZipBundle, TermuxFileDescriptor } from '../utils/termuxKit';

export const TermuxStudioTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<TermuxFileDescriptor>(TERMUX_FILES[0]);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedBashOneLiner, setCopiedBashOneLiner] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Termux interactive terminal simulation state
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'aegis@termux:~$ uname -a',
    'Linux localhost 5.15.78-android13 #1 SMP PREEMPT aarch64 Android',
    'aegis@termux:~$ # Ready to build APK on device. Click "Simulate Termux Build" below.',
  ]);

  const copyFileContent = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const copyTermuxQuickCommand = () => {
    const quickCmd = `pkg update -y && pkg install -y openjdk-17 nodejs-lts git gradle aapt zipalign apksigner && termux-setup-storage`;
    navigator.clipboard.writeText(quickCmd);
    setCopiedBashOneLiner(true);
    setTimeout(() => setCopiedBashOneLiner(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      const blob = await generateTermuxZipBundle();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aegis-applock-termux-build.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExportingZip(false);
    }
  };

  const runSimulatedBuild = () => {
    setIsTerminalRunning(true);
    setTerminalLogs([
      'aegis@termux:~$ bash termux-build-apk.sh',
      '====================================================',
      '    AEGIS LOCK 13+ | MOBILE TERMUX APK BUILDER     ',
      '====================================================',
      '[1/6] Auditing and updating Termux environment...',
      'Hit:1 https://packages.termux.dev/apt/termux-main stable InRelease',
      'openjdk-17-jdk is already the newest version (17.0.9).',
      'nodejs-lts is already the newest version (v20.11.1).',
      '[✓] Termux build toolchain initialized: Java 17.0.9 (build 17.0.9+9-Debian)',
      '[2/6] Compiling Vite & React PWA UI assets...',
      'vite v8.3.0 building for production...',
      '✓ 142 modules transformed.',
      'dist/index.html                   1.48 kB',
      'dist/assets/index-D7b39.js       184.21 kB │ gzip: 56.12 kB',
      '[✓] Production Web Assets built in ./dist',
      '[3/6] Syncing Capacitor & Android Native Platform...',
      '✔ Updating Android plugins in 22.4ms',
      '[4/6] Injecting Android 13+ (API 33/34) Kernel & Accessibility hooks...',
      'Writing AppLockAccessibilityService.kt to android/.../services',
      'Writing AndroidManifest.xml (targetSdkVersion 34, POST_NOTIFICATIONS)',
      '[5/6] Invoking Gradle Daemon for compilation (arm64-v8a / universal)...',
      '> Task :app:compileReleaseKotlin UP-TO-DATE',
      '> Task :app:compileReleaseJavaWithJavac',
      '> Task :app:packageRelease',
      '> Task :app:assembleRelease SUCCESS',
      '[6/6] Finalizing APK Signature with v2/v3 Signing Scheme...',
      'Signing with self-contained RSA-2048 key (aegis-release-key.jks)...',
      '====================================================',
      '  SUCCESS: APK BUILT & SIGNED SUCCESSFULLY IN TERMUX!',
      '  Output: /data/data/com.termux/files/home/AegisLock-v1.0-Android13-Release.apk',
      '====================================================',
      'To install directly on this Android device, run:',
      '  termux-open AegisLock-v1.0-Android13-Release.apk',
    ]);
    setTimeout(() => {
      setIsTerminalRunning(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner for Termux APK Mobile Builder */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-700/50 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Termux Mobile APK Compilation Suite</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-700 rounded font-bold">
                  STANDALONE ON-DEVICE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Compile this modern Android 13+ App Locker directly inside Termux on your Android phone—without needing a PC or Android Studio. Includes ready-to-run bash script, Gradle configuration, AndroidManifest.xml, and Kotlin Accessibility services.
              </p>
            </div>
          </div>

          {/* 1-Click Download ZIP Button */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {isExportingZip ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isExportingZip ? 'Packaging Zip...' : 'Download Termux Build Bundle (.zip)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Step Mobile Termux Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center mb-2">
            1
          </div>
          <h4 className="text-xs font-bold text-slate-200">Install Termux & Setup Storage</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Install Termux (from F-Droid or GitHub). Run <code className="text-cyan-400 font-mono">termux-setup-storage</code> to allow file access.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center mb-2">
            2
          </div>
          <h4 className="text-xs font-bold text-slate-200">Unzip Build Bundle</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Download the bundle zip on phone, then run: <br />
            <code className="text-cyan-400 font-mono text-[10px]">unzip ~/storage/downloads/aegis-applock-termux-build.zip</code>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-mono font-bold text-xs flex items-center justify-center mb-2">
            3
          </div>
          <h4 className="text-xs font-bold text-slate-200">Execute & Install APK</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Run <code className="text-emerald-400 font-mono">bash termux-build-apk.sh</code>. When finished, install via <code className="text-emerald-400 font-mono">termux-open AegisLock-v1.0-Android13-Release.apk</code>!
          </p>
        </div>
      </div>

      {/* Interactive Termux Shell Terminal Simulator */}
      <div className="rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2">Termux Console — aarch64</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runSimulatedBuild}
              disabled={isTerminalRunning}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono text-xs font-bold rounded-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-slate-950" />
              <span>{isTerminalRunning ? 'Building APK...' : 'Simulate Termux Build'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 font-mono text-xs text-slate-300 max-h-72 overflow-y-auto space-y-1 bg-slate-950">
          {terminalLogs.map((line, idx) => (
            <div
              key={idx}
              className={`${
                line.includes('SUCCESS') || line.includes('[✓]')
                  ? 'text-emerald-400 font-bold'
                  : line.startsWith('aegis@termux')
                  ? 'text-cyan-400'
                  : line.includes('warning')
                  ? 'text-amber-400'
                  : 'text-slate-300'
              }`}
            >
              {line}
            </div>
          ))}
          {isTerminalRunning && (
            <div className="text-emerald-400 animate-pulse flex items-center gap-2">
              <span>Compiling native Android 13 APK...</span>
            </div>
          )}
        </div>
      </div>

      {/* File Inspector & Source Code Viewer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-emerald-400" />
            <span>Native Project & Termux Build Files</span>
          </h3>

          <button
            onClick={copyFileContent}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition cursor-pointer"
          >
            {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Current File</span>
          </button>
        </div>

        {/* Tab pills for files */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TERMUX_FILES.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition cursor-pointer ${
                selectedFile.path === file.path
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {file.path.split('/').pop()}
            </button>
          ))}
        </div>

        {/* Code display */}
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-500 text-[11px]">
            <span>Path: {selectedFile.path}</span>
            <span>{selectedFile.description}</span>
          </div>
          <pre className="text-slate-300 leading-relaxed max-h-96 overflow-y-auto">
            {selectedFile.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
