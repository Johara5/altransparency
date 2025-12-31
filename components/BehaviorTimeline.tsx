
import React from 'react';
import { MOCK_DRIFT_DATA } from '../constants.tsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { History, Activity, AlertCircle, Zap, Search, ChevronRight } from 'lucide-react';
import { DriftPoint, AuditRecord } from '../types.ts';

interface BehaviorTimelineProps {
  history?: DriftPoint[];
  auditHistory?: AuditRecord[];
}

const BehaviorTimeline: React.FC<BehaviorTimelineProps> = ({ history, auditHistory = [] }) => {
  const getTrustPercentage = (score: number): number => {
    const val = score <= 1 && score > 0 ? score * 100 : score;
    return Math.min(100, Math.max(0, Math.round(val)));
  };

  const chartData = history 
    ? history.map(p => ({ time: p.timestamp, confidence: p.confidence, errors: p.errorRate, anomaly: p.anomalyDetected }))
    : MOCK_DRIFT_DATA;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">System Behavior Timeline</h2>
            <p className="text-slate-500 text-sm mt-1">Audit trail of model confidence and prediction stability over time.</p>
          </div>
          <div className="flex items-center gap-2">
            {history && history.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold animate-pulse">
                <Zap size={14} fill="currentColor" /> LIVE FEED
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">
              <Activity size={18} /> Drift Detection: Active
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
              <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                cursor={{ stroke: '#4f46e5', strokeWidth: 1 }}
              />
              <Line type="monotone" dataKey="confidence" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', r: 3 }} activeDot={{ r: 5 }} animationDuration={300} isAnimationActive={!history} />
              <Line type="monotone" dataKey="errors" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={false} animationDuration={300} isAnimationActive={!history} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
            <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <History size={16} className="text-slate-400" /> Recorded Audit Snapshots
            </h4>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
              {auditHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 opacity-60">
                  <Search size={32} className="mb-2" />
                  <p className="text-xs">No snapshots recorded yet.</p>
                </div>
              ) : (
                auditHistory.map((record) => (
                  <div key={record.auditId} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400">{new Date(record.timestamp).toLocaleTimeString()}</span>
                      <span className="text-[11px] font-black text-slate-800 uppercase">Trust Score: {getTrustPercentage(record.result.trustScore)} / 100</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        record.riskFindings.driftDetected ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {record.riskFindings.driftDetected ? 'Drift Alert' : 'Stable'}
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 h-fit">
            <h4 className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2">
              <AlertCircle size={16} /> Timeline Insight Engine
            </h4>
            <div className="space-y-4">
              <p className="text-xs text-amber-700 leading-relaxed">
                {auditHistory.length > 0 && auditHistory[0].riskFindings.driftDetected 
                  ? "CRITICAL ALERT: Audit history confirms recurring drift patterns in the current session. Model confidence is non-linear and showing sensitivity to small income fluctuations."
                  : "Stability report: Current timeline indicates high linear consistency. Feature weights are remaining within the 95th percentile of expected performance envelopes."}
              </p>
              
              <div className="pt-4 border-t border-amber-200/50">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">Session Integrity</span>
                  <span className="text-[10px] font-bold text-amber-800">92%</span>
                </div>
                <div className="h-1.5 w-full bg-amber-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[92%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorTimeline;
