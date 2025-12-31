
import React from 'react';
import { MOCK_HEALTH_DATA, MOCK_DRIFT_DATA } from '../constants';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { AuditResult, DriftPoint } from '../types.ts';

interface DashboardProps {
  analysis: AuditResult | null;
  history?: DriftPoint[];
  onOpenHistory: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis, history = [], onOpenHistory }) => {
  const getTrustPercentage = (score: number): number => {
    const val = score <= 1 && score > 0 ? score * 100 : score;
    return Math.min(100, Math.max(0, Math.round(val)));
  };

  const rawTrustScore = analysis ? analysis.trustScore : MOCK_HEALTH_DATA.overallTrustScore;
  const trustPercentage = getTrustPercentage(rawTrustScore);

  const chartData = history.length > 0 
    ? history.map(p => ({ time: p.timestamp, confidence: p.confidence, errors: p.errorRate }))
    : MOCK_DRIFT_DATA;
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Trust Score</span>
            <ShieldCheck className="text-indigo-600" size={20} />
          </div>
          <div className="text-4xl font-black text-slate-900 relative z-10">
            {trustPercentage} <span className="text-slate-300 text-2xl">/ 100</span>
          </div>
          <div className={`mt-2 text-sm font-bold relative z-10 flex items-center gap-1.5 ${analysis?.status === 'live' ? 'text-indigo-600' : 'text-green-600'}`}>
            {analysis?.status === 'live' ? <><Zap size={14} fill="currentColor" /> Live Feed Active</> : '↑ 2.4% from baseline'}
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-500" />
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Drift Alerts</span>
            <AlertTriangle className="text-amber-500" size={20} />
          </div>
          <div className="text-4xl font-black text-slate-900">
            {history.length > 0 ? history.filter(p => p.anomalyDetected).length : MOCK_HEALTH_DATA.driftAlerts}
          </div>
          <div className="mt-2 text-sm text-slate-500 font-medium uppercase text-[10px] font-bold">Session findings</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Audits</span>
            <CheckCircle className="text-emerald-500" size={20} />
          </div>
          <div className="text-4xl font-black text-slate-900">
            {history.length > 0 ? history.length : MOCK_HEALTH_DATA.totalAudits.toLocaleString()}
          </div>
          <div className="mt-2 text-sm text-slate-500 font-medium uppercase text-[10px] font-bold">Buffer Depth</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Confidence Mean</span>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <div className="text-4xl font-black text-slate-900">
            {history.length > 0 
              ? `${(history.reduce((acc, p) => acc + p.confidence, 0) / history.length * 100).toFixed(1)}%`
              : '91.4%'}
          </div>
          <div className="mt-2 text-sm text-slate-500 font-medium uppercase text-[10px] font-bold">Stability Index</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
            <h3 className="font-bold text-slate-900 text-lg">Infrastructure Health Monitor</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Buffer: Last 20 Ticks</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="confidence" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorConf)" name="Confidence" animationDuration={200} isAnimationActive={history.length === 0} />
                <Area type="monotone" dataKey="errors" stroke="#f43f5e" strokeWidth={2} fillOpacity={0.05} strokeDasharray="5 5" fill="#f43f5e" name="Drift/Error" animationDuration={200} isAnimationActive={history.length === 0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Intelligence Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6 text-lg border-b border-slate-50 pb-4">Audit Intelligence</h3>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {analysis ? (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border ${analysis.status === 'fallback' ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'}`}>
                  <p className={`text-[10px] font-black uppercase mb-1 ${analysis.status === 'fallback' ? 'text-amber-700' : 'text-indigo-700'}`}>
                    {analysis.status === 'fallback' ? 'Heuristic Snapshot' : 'Mirror Snapshot'}
                  </p>
                  <p className={`text-xs leading-snug ${analysis.status === 'fallback' ? 'text-amber-900' : 'text-indigo-900'}`}>{analysis.explanations.simple}</p>
                </div>
                {analysis.riskIndicators.slice(0, 2).map((risk, i) => (
                  <div key={i} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{risk.category}</span>
                      <span className={`text-[8px] font-black px-1 rounded ${risk.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{risk.severity}</span>
                    </div>
                    <p className="text-[11px] text-slate-800 leading-snug">{risk.finding}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 opacity-40">
                <ShieldCheck size={32} className="mb-2 text-slate-300" />
                <p className="text-[11px] font-medium">Awaiting live synchronization...</p>
              </div>
            )}
          </div>
          <button 
            onClick={onOpenHistory}
            className="w-full mt-6 py-3 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest"
          >
            Full Session Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
