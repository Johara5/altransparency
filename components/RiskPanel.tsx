
import React, { useState, useMemo } from 'react';
import { ShieldAlert, Fingerprint, Scale, Zap, Info, X, Clock, ChevronRight, AlertCircle, Filter, ArrowUpDown, ChevronDown, ChevronUp, Database, Layout } from 'lucide-react';
import { AuditResult, AuditRecord } from '../types.ts';

interface RiskPanelProps {
  analysis: AuditResult | null;
  auditHistory: AuditRecord[];
}

type SortOption = 'newest' | 'oldest' | 'confidence-high' | 'confidence-low';
type SeverityFilter = 'all' | 'high' | 'medium' | 'low' | 'none';

const RiskPanel: React.FC<RiskPanelProps> = ({ analysis, auditHistory }) => {
  const [selectedHistoryType, setSelectedHistoryType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [expandedInputs, setExpandedInputs] = useState<Set<string>>(new Set());
  const [expandedOutputs, setExpandedOutputs] = useState<Set<string>>(new Set());

  const toggleInput = (id: string) => {
    const next = new Set(expandedInputs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedInputs(next);
  };

  const toggleOutput = (id: string) => {
    const next = new Set(expandedOutputs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedOutputs(next);
  };

  const staticRisks = [
    { id: 'demographic', category: 'Demographic Bias', level: 'Medium', desc: 'Slight correlation found between loan approval and applicant region.', icon: Scale, color: 'text-amber-600 bg-amber-50' },
    { id: 'drift', category: 'Confidence Drift', level: 'Low', desc: 'Predictive stability remains within standard deviation thresholds.', icon: Zap, color: 'text-blue-600 bg-blue-50' },
    { id: 'logic', category: 'Logic Consistency', level: 'High', desc: 'Potential contradiction in multi-agent logic for high-income bracket.', icon: ShieldAlert, color: 'text-red-600 bg-red-50' },
    { id: 'identity', category: 'Identity Proxy', level: 'None', desc: 'No proxy variables for protected classes detected.', icon: Fingerprint, color: 'text-emerald-600 bg-emerald-50' },
  ];

  const filteredAudits = useMemo(() => {
    if (!selectedHistoryType) return [];

    let result = auditHistory.filter(record => {
      if (selectedHistoryType === 'Demographic Bias') return true; 
      if (selectedHistoryType === 'Confidence Drift') return record.riskFindings.driftDetected;
      if (selectedHistoryType === 'Logic Consistency') return record.riskFindings.logicConsistency !== 'Stable';
      return true;
    });

    if (severityFilter !== 'all') {
      result = result.filter(record => {
        const matchingRisk = record.result.riskIndicators.find(r => 
          (selectedHistoryType === 'Demographic Bias' && r.category === 'Bias') ||
          (selectedHistoryType === 'Confidence Drift' && r.category === 'Drift') ||
          (selectedHistoryType === 'Logic Consistency' && r.category === 'Logic')
        );
        return matchingRisk ? matchingRisk.severity === severityFilter : (severityFilter === 'none');
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (sortBy === 'confidence-high') return b.confidenceScore - a.confidenceScore;
      if (sortBy === 'confidence-low') return a.confidenceScore - b.confidenceScore;
      return 0;
    });

    return result;
  }, [auditHistory, selectedHistoryType, sortBy, severityFilter]);

  const renderHistoryModal = () => {
    if (!selectedHistoryType) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedHistoryType} History</h3>
                <p className="text-slate-500 text-xs">Viewing {filteredAudits.length} recorded audit snapshots</p>
              </div>
            </div>
            <button onClick={() => setSelectedHistoryType(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Mini Filters */}
          <div className="px-6 py-3 bg-white border-b border-slate-50 flex items-center gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
              <Filter size={12} className="text-slate-400" />
              <select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
                className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none"
              >
                <option value="all">All Severities</option>
                <option value="high">High Only</option>
                <option value="medium">Medium Only</option>
                <option value="low">Low Only</option>
              </select>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown size={12} className="text-slate-400" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="confidence-high">Confidence ↓</option>
                <option value="confidence-low">Confidence ↑</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {filteredAudits.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Info size={32} />
                </div>
                <h4 className="font-bold text-slate-800">No matching records</h4>
                <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                  Try adjusting your filters or run more audits to see historical patterns.
                </p>
              </div>
            ) : (
              filteredAudits.map((record, i) => {
                const originalChronological = [...auditHistory].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                const originalIndex = originalChronological.findIndex(r => r.auditId === record.auditId);
                const previousInTime = originalIndex > 0 ? originalChronological[originalIndex - 1] : null;
                const delta = previousInTime ? record.confidenceScore - previousInTime.confidenceScore : 0;
                
                const inputExpanded = expandedInputs.has(record.auditId);
                const outputExpanded = expandedOutputs.has(record.auditId);
                
                return (
                  <div key={record.auditId} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {new Date(record.timestamp).toLocaleString()}
                        </span>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          record.riskFindings.logicConsistency === 'Stable' ? 'bg-emerald-100 text-emerald-700' : 
                          record.riskFindings.logicConsistency === 'Warning' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.riskFindings.logicConsistency}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900">{Math.round(record.confidenceScore * 100)}%</div>
                        {previousInTime && delta !== 0 && (
                          <div className={`text-[10px] font-bold ${delta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {delta > 0 ? '↑' : '↓'} {Math.abs(Math.round(delta * 100))}%
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-[11px] border-t border-slate-50 pt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-400 uppercase tracking-tighter">Income Factor</p>
                        <p className="text-slate-800">${record.inputSnapshot.income?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-400 uppercase tracking-tighter">Loan Amount</p>
                        <p className="text-slate-800">${record.inputSnapshot.loanAmount?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-2">
                      <button 
                        onClick={() => toggleInput(record.auditId)}
                        className={`flex items-center gap-1.5 text-[9px] font-black uppercase transition-all px-2 py-1 rounded ${
                          inputExpanded ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        <Database size={10} />
                        Input
                        {inputExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </button>

                      <button 
                        onClick={() => toggleOutput(record.auditId)}
                        className={`flex items-center gap-1.5 text-[9px] font-black uppercase transition-all px-2 py-1 rounded ${
                          outputExpanded ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        <Layout size={10} />
                        Output
                        {outputExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </button>

                      {inputExpanded && (
                        <div className="w-full mt-2 bg-slate-900 rounded-lg p-3 overflow-x-auto shadow-inner ring-1 ring-slate-800 animate-in slide-in-from-top-1 duration-200">
                          <p className="text-[8px] font-black text-indigo-400 uppercase mb-1">Raw Input Snapshot</p>
                          <pre className="text-[10px] font-mono text-slate-400 custom-scrollbar leading-tight">
                            {JSON.stringify(record.inputSnapshot, null, 2)}
                          </pre>
                        </div>
                      )}

                      {outputExpanded && (
                        <div className="w-full mt-2 bg-slate-900 rounded-lg p-3 overflow-x-auto shadow-inner ring-1 ring-slate-800 animate-in slide-in-from-top-1 duration-200">
                          <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">Raw Output Snapshot</p>
                          <pre className="text-[10px] font-mono text-slate-400 custom-scrollbar leading-tight">
                            {JSON.stringify(record.outputSnapshot, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button 
              onClick={() => setSelectedHistoryType(null)}
              className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all"
            >
              Close History View
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {renderHistoryModal()}

      {/* Live Scan Results Section */}
      {analysis && (
        <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-lg font-bold">Real-time Trust Analysis</h3>
            </div>
            <div className="px-3 py-1 bg-indigo-800 rounded-full text-[10px] font-black tracking-widest uppercase">
              Live Buffer Scan
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.riskIndicators.map((risk, idx) => (
              <div key={idx} className="bg-white/10 border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold uppercase text-indigo-200">{risk.category}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    risk.severity === 'high' ? 'bg-red-500 text-white' : 'bg-indigo-300 text-indigo-900'
                  }`}>{risk.severity}</span>
                </div>
                <p className="text-xs text-white leading-relaxed">{risk.finding}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staticRisks.map((risk, i) => {
          const historyCount = auditHistory.length;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${risk.color}`}>
                  <risk.icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">{risk.category}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      risk.level === 'High' ? 'bg-red-100 text-red-700' : 
                      risk.level === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-100 text-slate-600'
                    }`}>{risk.level} Risk</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 tracking-tight">Enterprise Infrastructure ID #MM-0{i+1}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                {risk.desc}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <button 
                  onClick={() => setSelectedHistoryType(risk.category)}
                  className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded transition-all"
                >
                  <Clock size={12} /> View History
                </button>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Points</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(d => <div key={d} className={`w-1 h-1 rounded-full ${historyCount >= d ? 'bg-indigo-600' : 'bg-slate-200'}`} />)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
        <Fingerprint className="mx-auto text-slate-200 mb-4" size={48} />
        <h3 className="text-slate-900 font-bold mb-2">Automated Bias Mitigation</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">System is actively monitoring active inference pipelines. Protected class proxies are scanned every 4 minutes.</p>
        <div className="flex items-center justify-center gap-4 max-w-xs mx-auto">
          <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-3/4 rounded-full" />
          </div>
          <span className="text-[10px] font-black text-slate-400">75% SECURE</span>
        </div>
      </div>
    </div>
  );
};

export default RiskPanel;
