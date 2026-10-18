/**
 * Crypto and Security utility functions for AegisLock Android 13+
 */
import type { SecurityConfig, AppItem, AndroidPermission } from '../types/applock.ts';

/**
 * Generates a randomized scramble of digits 0 through 9
 * Used to prevent shoulder surfing and smudge attack pattern recognition.
 */
export function getScrambledKeypad(seedRandom?: () => number): number[] {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const rng = seedRandom || (() => Math.random());
  
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}

/**
 * Standard numeric keypad layout [1..9, blank, 0, delete]
 */
export function getStandardKeypad(): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
}

/**
 * Simple synchronous hash for PIN matching & decoy check in memory
 */
export function hashPin(pin: string, salt = 'aegis_android13_salt'): string {
  let hash = 0;
  const str = pin + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Converts a pattern array (indices 0..8) to a string representation
 */
export function patternToString(pattern: number[]): string {
  return pattern.join('-');
}

/**
 * Verifies if entered pattern matches the target pattern
 */
export function verifyPattern(entered: number[], target: number[]): boolean {
  if (entered.length !== target.length) return false;
  return entered.every((val, idx) => val === target[idx]);
}

export interface SecurityScoreResult {
  score: number;
  rating: 'CRITICAL_RISK' | 'MODERATE' | 'HIGH' | 'MILITARY_GRADE';
  passedChecks: string[];
  recommendations: string[];
}

/**
 * Evaluates the device security posture according to Android 13/14 best practices
 */
export function calculateSecurityScore(
  config: SecurityConfig,
  apps: AppItem[],
  permissions: AndroidPermission[]
): SecurityScoreResult {
  let score = 0;
  const passed: string[] = [];
  const recs: string[] = [];

  // 1. PIN Strength (up to 20 pts)
  if (config.masterPin.length >= 6) {
    score += 20;
    passed.push('6+ Digit Master PIN configured');
  } else if (config.masterPin.length >= 4) {
    score += 12;
    passed.push('4-digit Master PIN active');
    recs.push('Upgrade to a 6-digit PIN for quantum resistance');
  } else {
    recs.push('Configure a strong Master PIN');
  }

  // 2. Anti-Smudge Scramble Keypad (15 pts)
  if (config.scrambleKeypad) {
    score += 15;
    passed.push('Anti-Smudge Scramble Keypad enabled');
  } else {
    recs.push('Enable Scramble Keypad to defeat screen smudge analysis');
  }

  // 3. Decoy / Duress PIN (15 pts)
  if (config.decoyPin && config.decoyPin !== config.masterPin) {
    score += 15;
    passed.push('Decoy Duress PIN configured (Coercion Defense)');
  } else {
    recs.push('Set up a Decoy PIN to protect against forced unlock');
  }

  // 4. Intruder Selfie Guard (15 pts)
  if (config.intruderSelfieEnabled) {
    score += 15;
    passed.push('Intruder Snapshot & Radar active');
  } else {
    recs.push('Enable Intruder Selfie to capture unauthorized access attempts');
  }

  // 5. Android 13+ Permissions (20 pts)
  const criticalPerms = permissions.filter((p) => p.importance === 'CRITICAL');
  const grantedCritical = criticalPerms.filter((p) => p.status === 'granted');
  if (grantedCritical.length === criticalPerms.length) {
    score += 20;
    passed.push('All Android 13+ Critical Permissions granted');
  } else {
    const diff = (grantedCritical.length / criticalPerms.length) * 20;
    score += Math.round(diff);
    recs.push('Grant missing Android 13+ background watchdog permissions');
  }

  // 6. Sensitive App Coverage (15 pts)
  const financialApps = apps.filter((a) => a.category === 'finance');
  const lockedFinancial = financialApps.filter((a) => a.isLocked);
  if (financialApps.length > 0 && lockedFinancial.length === financialApps.length) {
    score += 15;
    passed.push('100% of Financial & Banking apps protected');
  } else if (lockedFinancial.length > 0) {
    score += 8;
    recs.push('Lock all banking and financial payment apps');
  } else {
    recs.push('Protect sensitive financial & payment applications');
  }

  // Determine overall badge
  let rating: SecurityScoreResult['rating'] = 'CRITICAL_RISK';
  if (score >= 90) rating = 'MILITARY_GRADE';
  else if (score >= 70) rating = 'HIGH';
  else if (score >= 45) rating = 'MODERATE';

  return {
    score: Math.min(100, Math.max(0, score)),
    rating,
    passedChecks: passed,
    recommendations: recs,
  };
}

/**
 * Derives a simulated AES-256 encryption string for secure vault storage
 */
export function simulateAes256Encrypt(text: string, pin: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const pinCode = pin.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  
  // XOR scramble with IV simulation
  const iv = Array.from({ length: 12 }, () => Math.floor(Math.random() * 256));
  const encryptedBytes = Array.from(data).map((b, i) => b ^ ((pinCode + iv[i % iv.length]) % 256));
  
  const b64Iv = btoa(String.fromCharCode(...iv));
  const b64Data = btoa(String.fromCharCode(...encryptedBytes));
  return `AEGIS-AES256-GCM:${b64Iv}:${b64Data}`;
}

export function simulateAes256Decrypt(payload: string, pin: string): string | null {
  try {
    if (!payload.startsWith('AEGIS-AES256-GCM:')) return null;
    const parts = payload.split(':');
    if (parts.length !== 3) return null;
    
    const ivStr = atob(parts[1]);
    const dataStr = atob(parts[2]);
    
    const iv = Array.from(ivStr).map((c) => c.charCodeAt(0));
    const encryptedBytes = Array.from(dataStr).map((c) => c.charCodeAt(0));
    
    const pinCode = pin.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const decryptedBytes = encryptedBytes.map((b, i) => b ^ ((pinCode + iv[i % iv.length]) % 256));
    
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(decryptedBytes));
  } catch {
    return null;
  }
}
