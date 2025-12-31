
import React from 'react';
import { Settings, Play, Pause, Zap, Clock, Shield, Info } from 'lucide-react';

interface ConfigurationPanelProps {
  simulationInterval: number;
  setSimulationInterval: (val: number) => void;
  mode: 'manual' | 'live' | 'simulation';
  setMode: (mode: 'manual' | 'live' | 'simulation') => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ 
  simulationInterval, 
  setSimulationInterval, 
  mode, 
  setMode 
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
        <Settings className="text-indigo-600" size={24} />
        <div>
          <h2 className="text-xl font-bold text-slate-900">Infrastructure Configuration</h2>
          <p className="text-slate-500 text-sm">Configure system monitoring parameters and ingestion modes.</p>
        </div>
      </div>
      
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Operation Mode */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">System Operation Mode</label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'manual', label: 'Manual Audit', icon: Shield, desc: 'Highest quota efficiency. Manually trigger audits as needed.' },
                { id: 'live', label: 'Live Monitoring', icon: Zap, desc: 'Real-time audits for every data change.' },
                { id: 'simulation', label: 'Continuous Simulation', icon: Play, desc: 'Optimized loop with intelligent API throttling.' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMode(opt.id as any)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    mode === opt.id 
                      ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    mode === opt.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <opt.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${mode === opt.id ? 'text-indigo-900' : 'text-slate-800'}`}>{opt.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Simulation Settings */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-6">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} /> Update Cadence
              </label>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Interval</span>
                  <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{simulationInterval}s</span>
                </div>
                <input 
                  type="range" 
                  min={5} 
                  max={60} 
                  step={5}
                  value={simulationInterval} 
                  onChange={(e) => setSimulationInterval(Number(e.target.value))}
                  disabled={mode === 'manual'}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-30"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 uppercase tracking-tighter">
                  <span>Fast (5s)</span>
                  <span>Quota-Safe (30s)</span>
                  <span>Passive (60s)</span>
                </div>
              </div>

              <div className="pt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 items-start">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-snug">
                  <strong>Quota Optimization:</strong> ModelMirror uses a result cache and intelligent throttling. Even in Simulation mode, heavy Gemini API calls are spaced to avoid 429 errors.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-4">
              <Shield className="text-emerald-600 mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-emerald-800 text-sm">Automated Quota Protection</h4>
                <p className="text-xs text-emerald-700/80 leading-relaxed mt-1">
                  The Transparency Engine automatically falls back to heuristic explanations if API limits are reached.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
