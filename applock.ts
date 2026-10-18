export type LockType = 'pin' | 'pattern' | 'biometric' | 'calculator' | 'fake_crash';

export interface AppItem {
  id: string;
  name: string;
  packageName: string;
  category: 'social' | 'finance' | 'system' | 'media' | 'utility';
  icon: string;
  isLocked: boolean;
  lockType: LockType;
  biometricAllowed: boolean;
  fakeCrashEnabled: boolean;
  camouflageCalculator: boolean;
  lastLockedAt?: number;
}

export interface SecurityConfig {
  masterPin: string;
  masterPattern: number[]; // indices 0-8
  decoyPin: string;
  activeLockType: LockType;
  scrambleKeypad: boolean;
  lockDelaySeconds: number; // 0 = immediate, 30, 60, etc.
  fakeCrashEnabled: boolean;
  intruderSelfieEnabled: boolean;
  maxFailedAttempts: number;
  antiUninstallKnox: boolean;
  stealthModeNotification: boolean;
  vibrationHaptics: boolean;
  calculatorPasscode: string;
}

export interface IntruderLog {
  id: string;
  timestamp: number;
  appName: string;
  packageName: string;
  failedPinEntered?: string;
  photoUrl?: string; // data URL or simulated snap
  attemptsCount: number;
  locationLabel: string;
}

export interface VaultItem {
  id: string;
  title: string;
  category: 'note' | 'credentials' | 'secret';
  content: string; // Plaintext when decrypted
  encryptedData?: string; // Simulated encrypted blob
  createdAt: number;
  isDecoy: boolean;
}

export interface AndroidPermission {
  id: string;
  title: string;
  apiLevel: string;
  permissionName: string;
  description: string;
  importance: 'CRITICAL' | 'REQUIRED' | 'RECOMMENDED';
  status: 'granted' | 'pending';
  adbCommand: string;
}
