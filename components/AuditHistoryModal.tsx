
import React, { useState, useMemo } from 'react';
import { X, Clock, TrendingUp, TrendingDown, Minus, ShieldAlert, Zap, Scale, Filter, ArrowUpDown, Calendar, ChevronDown, ChevronUp, Database, Layout } from 'lucide-react';
import { AuditRecord } from '../types.ts';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AuditRecord[];
}

type SortOption = 'newest' | 'oldest' | 'confidence-high' | 'confidence-low';
type RiskLevelFilter = 'all' | 'high' | 'medium' | 'low' | 'none';
type CategoryFilter = 'all' | 'bias' | 'drift' | 'logic';

const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({ isOpen, onClose, history }) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [riskFilter, setRiskFilter] = useState<RiskLevelFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
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

  const filteredAndSortedHistory = useMemo(() => {
    let result = [...history];

    if (categoryFilter !== 'all') {
      result = result.filter(record => {
        if (categoryFilter === 'bias') return record.result.riskIndicators.some(r => r.category === 'Bias');
        if (categoryFilter === 'drift') return record.result.riskIndicators.some(r => r.category === 'Drift');
        if (categoryFilter === 'logic') return record.result.riskIndicators.some(r => r.category === 'Logic');
        return true;
      });
    }

    if (riskFilter !== 'all') {
      result = result.filter(record => {
        return record.result.riskIndicators.some(r => r.severity === riskFilter);
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
  }, [history, sortBy, riskFilter, categoryFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white">
              <Clock size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Comprehensive Audit Log</h3>
              <p className="text-slate-500 text-xs font-medium">Historical timeline of model transparency snapshots</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="px-6 py-4 bg-white border-b border-slate-50 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Filters:</span>
          </div>
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Categories</option>
            <option value="bias">Bias Risks</option>
            <option value="drift">Drift Risks</option>
            <option value="logic">Logic Risks</option>
          </select>

          <select 
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevelFilter)}
            className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>

          <div className="h-4 w-px bg-slate-200 mx-2 hidden md:block" />

          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sort:</span>
          </div>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="confidence-high">Confidence: High to Low</option>
            <option value="confidence-low">Confidence: Low to High</option>
          </select>

          <div className="ml-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {filteredAndSortedHistory.length} of {history.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          {filteredAndSortedHistory.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <Filter size={32} />
              </div>
              <p className="text-slate-500 font-medium">No audit records match your current filters.</p>
              <button 
                onClick={() => {setRiskFilter('all'); setCategoryFilter('all');}}
                className="text-indigo-600 text-xs font-bold mt-2 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedHistory.map((record, index) => {
                const originalChronological = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                const originalIndex = originalChronological.findIndex(r => r.auditId === record.auditId);
                const previousInTime = originalIndex > 0 ? originalChronological[originalIndex - 1] : null;
                const delta = previousInTime ? record.confidenceScore - previousInTime.confidenceScore : 0;
                
                const inputExpanded = expandedInputs.has(record.auditId);
                const outputExpanded = expandedOutputs.has(record.auditId);
                
                return (
                  <div 
                    key={record.auditId} 
                    className="group flex flex-col p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Timestamp & Basic Info */}
                      <div className="w-full md:w-48 shrink-0">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Snapshot</div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-300" />
                          {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Confidence & Delta */}
                      <div className="w-full md:w-40 shrink-0">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</div>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-black text-slate-900 leading-none">
                            {Math.round(record.confidenceScore * 100)}%
                          </span>
                          {previousInTime && (
                            <div className={`flex items-center gap-0.5 text-[11px] font-bold mb-0.5 ${
                              delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-slate-400'
                            }`}>
                              {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                              {Math.abs(Math.round(delta * 100))}%
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Badges Container */}
                      <div className="flex-1 flex flex-wrap items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight ${
                          record.riskFindings.biasLevel === 'None' ? 'bg-slate-50 text-slate-500 border-slate-100' :
                          record.riskFindings.biasLevel === 'Low' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          record.riskFindings.biasLevel === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          <Scale size={12} />
                          Bias: {record.riskFindings.biasLevel}
                        </div>

                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight ${
                          !record.riskFindings.driftDetected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          <Zap size={12} fill={record.riskFindings.driftDetected ? "currentColor" : "none"} />
                          Drift: {record.riskFindings.driftDetected ? 'Detected' : 'Stable'}
                        </div>

                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight ${
                          record.riskFindings.logicConsistency === 'Stable' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          record.riskFindings.logicConsistency === 'Warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          <ShieldAlert size={12} />
                          Logic: {record.riskFindings.logicConsistency}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleInput(record.auditId)}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                            inputExpanded ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Database size={12} />
                          Input
                          {inputExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>

                        <button 
                          onClick={() => toggleOutput(record.auditId)}
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                            outputExpanded ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Layout size={12} />
                          Output
                          {outputExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>
                        
                        <div className="hidden lg:block text-right ml-2">
                          <div className="text-[9px] font-mono text-slate-300 uppercase leading-none">UID</div>
                          <div className="text-[9px] font-mono text-slate-400">{record.auditId.slice(-8)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Input Snapshot */}
                    {inputExpanded && (
                      <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner ring-1 ring-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Inference Input Payload</span>
                            <span className="text-[9px] font-mono text-slate-500">JSON</span>
                          </div>
                          <pre className="text-[11px] font-mono text-slate-300 custom-scrollbar">
                            {JSON.stringify(record.inputSnapshot, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Collapsible Output Snapshot */}
                    {outputExpanded && (
                      <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner ring-1 ring-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Model Prediction Output</span>
                            <span className="text-[9px] font-mono text-slate-500">JSON</span>
                          </div>
                          <pre className="text-[11px] font-mono text-slate-300 custom-scrollbar">
                            {JSON.stringify(record.outputSnapshot, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-medium ml-2">
            Archive synchronized with Enterprise Infrastructure MM-V2
          </span>
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditHistoryModal;
