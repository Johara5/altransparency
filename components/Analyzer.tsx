
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyzeModelOutput, VerbosityLevel } from '../services/geminiService.ts';
import { AuditResult } from '../types.ts';
import { Loader2, Send, Info, ChevronRight, AlertCircle, ShieldCheck, Zap, ZapOff, Clock, Terminal, User, BookOpen, Database } from 'lucide-react';

interface AnalyzerProps {
  initialInput: string;
  initialOutput: string;
  initialConfidence: number;
  initialResult: AuditResult | null;
  onUpdate: (input: string, output: string, confidence: number) => void;
  onAuditComplete: (result: AuditResult, input: any, output: any, confidence: number) => void;
}

const Analyzer: React.FC<AnalyzerProps> = ({ 
  initialInput, 
  initialOutput, 
  initialConfidence, 
  initialResult,
  onUpdate,
  onAuditComplete
}) => {
  const [inputData, setInputData] = useState(initialInput);
  const [outputData, setOutputData] = useState(initialOutput);
  const [confidence, setConfidence] = useState(initialConfidence);
  const [verbosity, setVerbosity] = useState<VerbosityLevel>('detailed');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(initialResult);
  const [error, setError] = useState<string | null>(null);
  
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);
  
  const debounceTimer = useRef<any>(null);

  const getTrustPercentage = (score: number): number => {
    const val = score <= 1 && score > 0 ? score * 100 : score;
    return Math.min(100, Math.max(0, Math.round(val)));
  };

  useEffect(() => {
    setInputData(initialInput);
    setConfidence(initialConfidence);
    if (initialResult) setResult(initialResult);
  }, [initialInput, initialConfidence, initialResult]);

  const handleAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsedInput = JSON.parse(inputData);
      const parsedOutput = JSON.parse(outputData);
      const audit = await analyzeModelOutput(parsedInput, parsedOutput, confidence);
      setResult(audit);
      setLastAnalyzed(new Date().toLocaleTimeString());
      onUpdate(inputData, outputData, confidence);
      onAuditComplete(audit, parsedInput, parsedOutput, confidence);
    } catch (err: any) {
      setError(err.message || 'Validation error. Please check your JSON format.');
    } finally {
      setLoading(false);
    }
  }, [inputData, outputData, confidence, onUpdate, onAuditComplete]);

  useEffect(() => {
    if (isLiveMode) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        handleAnalyze();
      }, 2000);
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputData, outputData, confidence, isLiveMode, handleAnalyze]);

  const verbosityOptions: { level: VerbosityLevel; icon: any; label: string }[] = [
    { level: 'simple', icon: User, label: 'Simple' },
    { level: 'detailed', icon: BookOpen, label: 'Detailed' },
    { level: 'technical', icon: Terminal, label: 'Technical' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
              isLiveMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isLiveMode ? <Zap size={16} fill="currentColor" /> : <ZapOff size={16} />}
            {isLiveMode ? 'Live Monitoring Active' : 'Enable Live Watch'}
          </button>
          
          {result?.status === 'fallback' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase border border-amber-100">
              <Database size={12} /> Heuristic Mode (Quota Exhausted)
            </div>
          )}
        </div>
        {lastAnalyzed && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Clock size={14} /> Last Audit: {lastAnalyzed}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 flex flex-col">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><Info size={16} /> Black-Box Observation</h3>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">System Inputs (JSON)</label>
              <textarea
                className="w-full h-32 p-3 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Model Output (JSON)</label>
              <textarea
                className="w-full h-32 p-3 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={outputData}
                onChange={(e) => setOutputData(e.target.value)}
              />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Recorded Confidence ({Math.round(confidence * 100)}%)</label>
                <input type="range" min="0" max="1" step="0.01" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" value={confidence} onChange={(e) => setConfidence(parseFloat(e.target.value))} />
              </div>
              {!isLiveMode && (
                <button onClick={handleAnalyze} disabled={loading} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg transition-all">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} Run Audit
                </button>
              )}
            </div>
          </div>
          {error && <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700 text-sm"><AlertCircle size={18} /> {error}</div>}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-slate-900">Mirror Explanation</h3>
              {result?.status === 'live' && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded uppercase">API Verified</span>}
            </div>
            {result && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Trust Score</span>
                <div className={`px-2 py-1 rounded text-sm font-bold ${getTrustPercentage(result.trustScore) > 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {getTrustPercentage(result.trustScore)} <span className="opacity-50">/ 100</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto min-h-[500px] custom-scrollbar">
            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="text-sm font-bold text-slate-800">Near Real-time Audit in Progress</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Narrative View</h4>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      {verbosityOptions.map((opt) => (
                        <button
                          key={opt.level}
                          onClick={() => setVerbosity(opt.level)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                            verbosity === opt.level ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <opt.icon size={12} /> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`p-5 rounded-xl border-l-4 ${
                    verbosity === 'simple' ? 'bg-blue-50/50 border-blue-400 text-slate-800' : 
                    verbosity === 'technical' ? 'bg-slate-900 text-slate-100 font-mono text-sm border-slate-600' : 
                    'bg-indigo-50/30 border-indigo-400 text-slate-700'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{result.explanations[verbosity]}</p>
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Key Influencing Factors</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {result.influencingFactors.map((factor, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${factor.impact === 'positive' ? 'bg-green-500' : factor.impact === 'negative' ? 'bg-red-500' : 'bg-slate-400'}`} />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-slate-800 text-sm">{factor.factor}</span>
                            <span className="text-[10px] font-mono text-slate-400">{(factor.weight * 100).toFixed(0)}% Weight</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-snug">{factor.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Audit Risks</h4>
                  <div className="space-y-2">
                    {result.riskIndicators.map((risk, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-white shadow-sm">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          risk.severity === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}><AlertCircle size={20} /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">{risk.category}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                               risk.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>{risk.severity}</span>
                          </div>
                          <p className="text-xs text-slate-500">{risk.finding}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40"><ShieldCheck size={48} className="mb-4 text-slate-300" /> Waiting for input analysis.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyzer;
