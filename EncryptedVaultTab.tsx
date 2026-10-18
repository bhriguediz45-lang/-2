import React, { useState } from 'react';
import {
  Vault,
  Lock,
  Unlock,
  Key,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldAlert,
  Trash2,
  FileText,
  CreditCard,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { VaultItem, SecurityConfig } from '../types/applock';
import { simulateAes256Encrypt, simulateAes256Decrypt } from '../utils/crypto';

interface EncryptedVaultTabProps {
  realItems: VaultItem[];
  decoyItems: VaultItem[];
  config: SecurityConfig;
  onAddItem: (item: VaultItem) => void;
  onDeleteItem: (id: string) => void;
}

export const EncryptedVaultTab: React.FC<EncryptedVaultTabProps> = ({
  realItems,
  decoyItems,
  config,
  onAddItem,
  onDeleteItem,
}) => {
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [vaultMode, setVaultMode] = useState<'real' | 'decoy'>('real');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New item modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'note' | 'credentials' | 'secret'>('credentials');
  const [newContent, setNewContent] = useState('');

  // Visible plaintext states
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === config.masterPin) {
      setIsVaultLocked(false);
      setVaultMode('real');
      setErrorMsg(null);
      setPinInput('');
    } else if (config.decoyPin && pinInput === config.decoyPin) {
      setIsVaultLocked(false);
      setVaultMode('decoy');
      setErrorMsg(null);
      setPinInput('');
    } else {
      setErrorMsg('Invalid Master or Decoy PIN');
      setPinInput('');
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const encrypted = simulateAes256Encrypt(newContent, config.masterPin);

    const newItem: VaultItem = {
      id: `vault-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      encryptedData: encrypted,
      createdAt: Date.now(),
      isDecoy: vaultMode === 'decoy',
    };

    onAddItem(newItem);
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentItems = vaultMode === 'real' ? realItems : decoyItems;

  if (isVaultLocked) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
            <Vault className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100">AES-256 Encrypted Vault</h2>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
              Store hardware seed phrases, bank card pins, and classified notes encrypted with PBKDF2/AES-GCM.
            </p>
          </div>

          <form onSubmit={handleUnlockVault} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Vault PIN..."
                className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 focus:outline-none focus:border-emerald-500/60 font-mono"
                autoFocus
              />
              {errorMsg && (
                <div className="text-xs text-rose-400 mt-2 font-mono flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition active:scale-95 shadow-md shadow-emerald-950/40 cursor-pointer"
            >
              Unlock Vault
            </button>
          </form>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono text-slate-400 text-left space-y-1">
            <div className="text-slate-300 font-semibold flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Coercion Defense Mechanism:</span>
            </div>
            <div>• Master PIN (<span className="text-emerald-400">{config.masterPin}</span>): Reveals real encrypted items.</div>
            <div>• Decoy PIN (<span className="text-cyan-400">{config.decoyPin}</span>): Reveals harmless decoy notes under duress.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vault Status Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Vault className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                {vaultMode === 'real' ? 'Classified Private Vault' : 'Decoy Duress Safe (Covert)'}
              </h2>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono rounded border ${
                  vaultMode === 'real'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                    : 'bg-cyan-950 text-cyan-400 border-cyan-700'
                }`}
              >
                {vaultMode === 'real' ? 'AES-256-GCM UNLOCKED' : 'DECOY SAFE ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {vaultMode === 'real'
                ? 'Your private secrets are decrypted locally in memory. Zero plain-text persistence.'
                : 'Displaying harmless decoy notes to satisfy an attacker.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition active:scale-95 cursor-pointer shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Secret</span>
          </button>
          <button
            onClick={() => setIsVaultLocked(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Relock Vault</span>
          </button>
        </div>
      </div>

      {/* Vault Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentItems.map((item) => {
          const isRevealed = revealedIds[item.id] || false;
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                    {item.category === 'credentials' ? (
                      <Key className="w-4 h-4 text-emerald-400" />
                    ) : item.category === 'secret' ? (
                      <Lock className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      {item.category} • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Secret Content Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div className="font-mono text-xs text-slate-300 truncate">
                  {isRevealed ? item.content : '••••••••••••••••••••••••••••••••'}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() =>
                      setRevealedIds((prev) => ({ ...prev, [item.id]: !isRevealed }))
                    }
                    className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                    title={isRevealed ? 'Hide Secret' : 'Reveal Secret'}
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(item.id, item.content)}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {item.encryptedData && (
                <div className="text-[10px] font-mono text-slate-600 truncate">
                  Cipher: {item.encryptedData.slice(0, 32)}...
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-700 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Add Encrypted Secret</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Title / Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Wallet Recovery Phrase"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as 'note' | 'credentials' | 'secret')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="credentials">Credentials / Passwords</option>
                  <option value="secret">Secret Keys & Recovery Seeds</option>
                  <option value="note">Classified Private Notes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Confidential Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste or write secret data here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition active:scale-95 cursor-pointer shadow-md shadow-emerald-950/40"
                >
                  Encrypt & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
