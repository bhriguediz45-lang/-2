import { Lock, Eye, Camera, ShieldCheck, Terminal, Vault } from 'lucide-react';

export type ActiveTab = 'apps' | 'simulator' | 'radar' | 'vault' | 'shield' | 'termux';

interface TabsNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  lockedCount: number;
  intruderCount: number;
}

export const TabsNav: React.FC<TabsNavProps> = ({
  activeTab,
  onChangeTab,
  lockedCount,
  intruderCount,
}) => {
  const tabs = [
    {
      id: 'apps' as ActiveTab,
      label: 'Apps & Locks',
      icon: Lock,
      badge: lockedCount > 0 ? `${lockedCount}` : undefined,
    },
    {
      id: 'simulator' as ActiveTab,
      label: 'Lock Simulator',
      icon: Eye,
      sublabel: 'Android 13+ Overlay',
    },
    {
      id: 'radar' as ActiveTab,
      label: 'Intruder Radar',
      icon: Camera,
      badge: intruderCount > 0 ? `${intruderCount}` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    },
    {
      id: 'vault' as ActiveTab,
      label: 'Encrypted Vault',
      icon: Vault,
      sublabel: 'AES-256-GCM',
    },
    {
      id: 'shield' as ActiveTab,
      label: 'Android 13+ Shield',
      icon: ShieldCheck,
      sublabel: 'Kernel Hooks',
    },
    {
      id: 'termux' as ActiveTab,
      label: 'Termux APK Studio',
      icon: Terminal,
      sublabel: 'Mobile Compiler',
      highlight: true,
    },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-slate-800/90 text-emerald-400 border border-slate-700 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              } ${tab.highlight && !isActive ? 'border border-cyan-800/40 text-cyan-300' : ''}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : tab.highlight ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="font-medium">{tab.label}</span>

              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full border ${
                    tab.badgeColor || 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
