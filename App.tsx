/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { TabsNav, ActiveTab } from './components/TabsNav';
import { AppLockerTab } from './components/AppLockerTab';
import { LockSimulatorModal } from './components/LockSimulatorModal';
import { IntruderRadarTab } from './components/IntruderRadarTab';
import { EncryptedVaultTab } from './components/EncryptedVaultTab';
import { Android13ShieldTab } from './components/Android13ShieldTab';
import { TermuxStudioTab } from './components/TermuxStudioTab';
import { SettingsModal } from './components/SettingsModal';
import { SecurityAuditModal } from './components/SecurityAuditModal';

import {
  INITIAL_APPS,
  INITIAL_SECURITY_CONFIG,
  ANDROID_13_PERMISSIONS,
  INITIAL_INTRUDER_LOGS,
  INITIAL_VAULT_ITEMS,
  DECOY_VAULT_ITEMS,
} from './data/initialData';
import { AppItem, SecurityConfig, LockType, IntruderLog, VaultItem } from './types/applock';
import { calculateSecurityScore } from './utils/crypto';

export default function App() {
  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
  const [config, setConfig] = useState<SecurityConfig>(INITIAL_SECURITY_CONFIG);
  const [permissions, setPermissions] = useState(ANDROID_13_PERMISSIONS);
  const [intruderLogs, setIntruderLogs] = useState<IntruderLog[]>(INITIAL_INTRUDER_LOGS);
  const [realVaultItems, setRealVaultItems] = useState<VaultItem[]>(INITIAL_VAULT_ITEMS);
  const [decoyVaultItems, setDecoyVaultItems] = useState<VaultItem[]>(DECOY_VAULT_ITEMS);

  const [activeTab, setActiveTab] = useState<ActiveTab>('apps');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedAppForSimulator, setSelectedAppForSimulator] = useState<AppItem>(INITIAL_APPS[0]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Real-time security score calculation
  const securityScore = useMemo(() => {
    return calculateSecurityScore(config, apps, permissions);
  }, [config, apps, permissions]);

  // App lock toggle handlers
  const handleToggleLock = (id: string) => {
    setApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, isLocked: !app.isLocked } : app))
    );
  };

  const handleUpdateAppLockType = (id: string, lockType: LockType) => {
    setApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, lockType } : app))
    );
  };

  const handleToggleFakeCrash = (id: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, fakeCrashEnabled: !app.fakeCrashEnabled } : app
      )
    );
  };

  const handleLockAll = () => {
    setApps((prev) => prev.map((app) => ({ ...app, isLocked: true })));
  };

  const handleUnlockAll = () => {
    setApps((prev) => prev.map((app) => ({ ...app, isLocked: false })));
  };

  const handleLaunchLockTest = (app: AppItem) => {
    setSelectedAppForSimulator(app);
    setIsSimulatorOpen(true);
  };

  // Intruder capture handler
  const handleIntruderCaptured = (
    appName: string,
    packageName: string,
    failedPin: string,
    photoDataUrl?: string
  ) => {
    const newLog: IntruderLog = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      appName,
      packageName,
      failedPinEntered: failedPin,
      photoUrl: photoDataUrl,
      attemptsCount: config.maxFailedAttempts,
      locationLabel: 'Front Camera Frontal Sensor / Intruder Hook',
    };
    setIntruderLogs((prev) => [newLog, ...prev]);
  };

  // Permission toggle handler
  const handleTogglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.map((perm) =>
        perm.id === id
          ? { ...perm, status: perm.status === 'granted' ? 'pending' : 'granted' }
          : perm
      )
    );
  };

  // Vault item handlers
  const handleAddVaultItem = (item: VaultItem) => {
    if (item.isDecoy) {
      setDecoyVaultItems((prev) => [item, ...prev]);
    } else {
      setRealVaultItems((prev) => [item, ...prev]);
    }
  };

  const handleDeleteVaultItem = (id: string) => {
    setRealVaultItems((prev) => prev.filter((i) => i.id !== id));
    setDecoyVaultItems((prev) => prev.filter((i) => i.id !== id));
  };

  const lockedAppsCount = apps.filter((a) => a.isLocked).length;

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Cyber Security Header */}
      <Header
        securityScore={securityScore}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLaunchSimulatedLock={() => {
          setSelectedAppForSimulator(apps.find((a) => a.isLocked) || apps[0]);
          setIsSimulatorOpen(true);
        }}
        onOpenAudit={() => setIsAuditOpen(true)}
      />

      {/* Cyber Tab Navigation */}
      <TabsNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        lockedCount={lockedAppsCount}
        intruderCount={intruderLogs.length}
      />

      {/* Main Tab Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-20">
        {activeTab === 'apps' && (
          <AppLockerTab
            apps={apps}
            onToggleLock={handleToggleLock}
            onUpdateAppLockType={handleUpdateAppLockType}
            onToggleFakeCrash={handleToggleFakeCrash}
            onLockAll={handleLockAll}
            onUnlockAll={handleUnlockAll}
            onLaunchLockTest={handleLaunchLockTest}
          />
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-100">Live Lock Screen Simulation Studio</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any target application and launch the Android 13+ floating window overlay.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedAppForSimulator.id}
                  onChange={(e) => {
                    const found = apps.find((a) => a.id === e.target.value);
                    if (found) setSelectedAppForSimulator(found);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                >
                  {apps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.lockType.toUpperCase()})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-emerald-950/40"
                >
                  Open Lock Overlay
                </button>
              </div>
            </div>

            <div className="flex justify-center py-6">
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="group relative p-8 rounded-3xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition flex flex-col items-center text-center max-w-md cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition">
                  Simulate {selectedAppForSimulator.name} Launch
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  Click to launch the authentic Android 13+ lock screen with scramble keypad, pattern lock, biometric verification, and stealth intruder snapshot.
                </p>
                <span className="mt-4 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 font-mono text-xs border border-emerald-700/60 font-semibold">
                  Launch Interactive Simulator →
                </span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'radar' && (
          <IntruderRadarTab
            logs={intruderLogs}
            onClearLogs={() => setIntruderLogs([])}
            onSimulateIntruder={() => {
              handleIntruderCaptured(
                'Instagram',
                'com.instagram.android',
                '0000',
                undefined
              );
            }}
          />
        )}

        {activeTab === 'vault' && (
          <EncryptedVaultTab
            realItems={realVaultItems}
            decoyItems={decoyVaultItems}
            config={config}
            onAddItem={handleAddVaultItem}
            onDeleteItem={handleDeleteVaultItem}
          />
        )}

        {activeTab === 'shield' && (
          <Android13ShieldTab
            permissions={permissions}
            onTogglePermission={handleTogglePermission}
          />
        )}

        {activeTab === 'termux' && <TermuxStudioTab />}
      </main>

      {/* Interactive Android 13+ Lock Screen Modal */}
      <LockSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        app={selectedAppForSimulator}
        config={config}
        onIntruderCaptured={handleIntruderCaptured}
      />

      {/* Security Architecture Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={setConfig}
      />

      {/* Posture Audit Breakdown Modal */}
      <SecurityAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        auditResult={securityScore}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShield={() => setActiveTab('shield')}
      />
    </div>
  );
}
