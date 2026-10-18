import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getScrambledKeypad,
  getStandardKeypad,
  hashPin,
  verifyPattern,
  calculateSecurityScore,
  simulateAes256Encrypt,
  simulateAes256Decrypt,
} from './crypto.ts';
import type { SecurityConfig, AppItem, AndroidPermission } from '../types/applock.ts';

test('getStandardKeypad returns all 10 digits in standard order', () => {
  const pad = getStandardKeypad();
  assert.equal(pad.length, 10);
  assert.deepEqual(pad, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
});

test('getScrambledKeypad always contains exactly digits 0-9 without duplicates', () => {
  const scrambled = getScrambledKeypad();
  assert.equal(scrambled.length, 10);
  const sorted = [...scrambled].sort((a, b) => a - b);
  assert.deepEqual(sorted, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('hashPin returns consistent 8-character hex for same PIN', () => {
  const hash1 = hashPin('7890');
  const hash2 = hashPin('7890');
  const hash3 = hashPin('1234');
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
  assert.equal(hash1.length, 8);
});

test('verifyPattern accurately matches pattern sequences', () => {
  assert.equal(verifyPattern([0, 1, 2, 4], [0, 1, 2, 4]), true);
  assert.equal(verifyPattern([0, 1, 2], [0, 1, 2, 4]), false);
  assert.equal(verifyPattern([0, 1, 2, 5], [0, 1, 2, 4]), false);
});

test('calculateSecurityScore assesses high security when hardened', () => {
  const mockConfig: SecurityConfig = {
    masterPin: '984210',
    masterPattern: [0, 1, 4, 7, 8],
    decoyPin: '111111',
    activeLockType: 'pin',
    scrambleKeypad: true,
    lockDelaySeconds: 0,
    fakeCrashEnabled: true,
    intruderSelfieEnabled: true,
    maxFailedAttempts: 3,
    antiUninstallKnox: true,
    stealthModeNotification: true,
    vibrationHaptics: true,
    calculatorPasscode: '7777',
  };

  const mockApps: AppItem[] = [
    {
      id: '1',
      name: 'Mobile Banking',
      packageName: 'com.bank.app',
      category: 'finance',
      icon: 'landmark',
      isLocked: true,
      lockType: 'pin',
      biometricAllowed: true,
      fakeCrashEnabled: true,
      camouflageCalculator: false,
    },
  ];

  const mockPermissions: AndroidPermission[] = [
    {
      id: 'overlay',
      title: 'Overlay Window',
      apiLevel: 'API 33+',
      permissionName: 'SYSTEM_ALERT_WINDOW',
      description: 'Overlay',
      importance: 'CRITICAL',
      status: 'granted',
      adbCommand: 'pm grant ...',
    },
  ];

  const result = calculateSecurityScore(mockConfig, mockApps, mockPermissions);
  assert.ok(result.score >= 80, `Expected score >= 80, got ${result.score}`);
  assert.ok(result.rating === 'HIGH' || result.rating === 'MILITARY_GRADE');
});

test('simulateAes256Encrypt & simulateAes256Decrypt roundtrip succeeds with correct PIN', () => {
  const secret = 'My Secret Vault Password #999';
  const pin = '5678';
  const encrypted = simulateAes256Encrypt(secret, pin);
  assert.ok(encrypted.startsWith('AEGIS-AES256-GCM:'));

  const decrypted = simulateAes256Decrypt(encrypted, pin);
  assert.equal(decrypted, secret);

  const wrongDecrypted = simulateAes256Decrypt(encrypted, '0000');
  assert.notEqual(wrongDecrypted, secret);
});
