import React, { createContext, useContext, useState } from 'react';
import { DeviceMobile, Monitor, ArrowsClockwise } from '@phosphor-icons/react';
import { mockApi } from '../../lib/mockApi';

interface DeviceModeContextType {
  mode: 'responsive' | 'mobile';
  setMode: (mode: 'responsive' | 'mobile') => void;
  resetDemoData: () => Promise<void>;
  isResetting: boolean;
}

const DeviceModeContext = createContext<DeviceModeContextType>({
  mode: 'responsive',
  setMode: () => {},
  resetDemoData: async () => {},
  isResetting: false,
});

export const useDeviceMode = () => useContext(DeviceModeContext);

export const DeviceModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'responsive' | 'mobile'>('responsive');
  const [isResetting, setIsResetting] = useState(false);

  const resetDemoData = async () => {
    setIsResetting(true);
    await mockApi.resetAllData();
    setIsResetting(false);
    window.location.reload();
  };

  return (
    <DeviceModeContext.Provider value={{ mode, setMode, resetDemoData, isResetting }}>
      <div className="min-h-[100dvh] flex flex-col bg-slate-100">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">CleanCraft v2.1.0 Mock System</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-400">Pilih mode tampilan untuk melihat versi Mobile & Desktop:</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setMode('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  mode === 'mobile'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Buka dalam frame ukuran layar smartphone (390px)"
              >
                <DeviceMobile weight="bold" className="w-3.5 h-3.5" />
                <span>Mode Mobile (390px)</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('responsive')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  mode === 'responsive'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Buka dalam resolusi penuh (Desktop / Responsif Otomatis)"
              >
                <Monitor weight="bold" className="w-3.5 h-3.5" />
                <span>Mode Desktop Penuh</span>
              </button>
            </div>

            <button
              type="button"
              onClick={resetDemoData}
              disabled={isResetting}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
              title="Reset data mock demo ke data awal"
            >
              <ArrowsClockwise weight="bold" className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Reset Mock Data</span>
            </button>
          </div>
        </div>

        {/* Device Frame Wrapper */}
        {mode === 'mobile' ? (
          <div className="flex-1 flex items-center justify-center p-2 sm:p-6 bg-slate-800/90 overflow-x-hidden">
            <div className="w-full max-w-[400px] h-[850px] max-h-[92vh] bg-white rounded-[40px] shadow-2xl border-[8px] border-slate-900 overflow-hidden flex flex-col relative">
              {/* Phone Notch/Island */}
              <div className="bg-white h-7 w-full flex items-center justify-center shrink-0 border-b border-slate-100 z-50">
                <div className="w-24 h-4 bg-slate-900 rounded-full"></div>
              </div>
              {/* Content viewport */}
              <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col bg-slate-50">
                {children}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-50">{children}</div>
        )}
      </div>
    </DeviceModeContext.Provider>
  );
};
