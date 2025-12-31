
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Analyzer from './components/Analyzer.tsx';
import BehaviorTimeline from './components/BehaviorTimeline.tsx';
import RiskPanel from './components/RiskPanel.tsx';
import ConfigurationPanel from './components/ConfigurationPanel.tsx';
import AuditHistoryModal from './components/AuditHistoryModal.tsx';
import { analyzeModelOutput } from './services/geminiService.ts';
import { AuditResult, DriftPoint, AuditRecord, UserContext } from './types.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // User Identity State with dynamic resolution
  const [user, setUser] = useState<UserContext>({
    displayName: "Resolving...",
    role: "Auditor",
    tier: "Demo",
    authProvider: "Session"
  });

  useEffect(() => {
    // Attempt to resolve identity
    const resolveUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const demoUser: UserContext = {
        displayName: "Johara Shaikh",
        role: "Admin",
        tier: "Enterprise",
        authProvider: "Session"
      };
      setUser(demoUser);
    };
    resolveUser();
  }, []);

  const [simulationInterval, setSimulationInterval] = useState(30);
  const [mode, setMode] = useState<'manual' | 'live' | 'simulation'>('manual');
  
  const [currentInput, setCurrentInput] = useState({
    age: 28,
    income: 75000,
    creditScore: 680,
    loanAmount: 25000
  });
  const [currentOutput, setCurrentOutput] = useState({
    decision: "Approved",
    interestRate: 0.054
  });
  const [confidence, setConfidence] = useState(0.87);
  
  const [lastAnalysis, setLastAnalysis] = useState<AuditResult | null>(null);
  const [history, setHistory] = useState<DriftPoint[]>([]);
  const [auditHistory, setAuditHistory] = useState<AuditRecord[]>([]);
  const tickCount = useRef(0);

  const stateRef = useRef({ currentInput, currentOutput, confidence });
  useEffect(() => {
    stateRef.current = { currentInput, currentOutput, confidence };
  }, [currentInput, currentOutput, confidence]);

  const recordAudit = useCallback((result: AuditResult, input: any, output: any, conf: number) => {
    const biasRisk = result.riskIndicators.find(r => r.category === 'Bias');
    const driftRisk = result.riskIndicators.find(r => r.category === 'Drift');
    const logicRisk = result.riskIndicators.find(r => r.category === 'Logic');
    
    const biasLevel = (biasRisk?.severity.charAt(0).toUpperCase() + biasRisk?.severity.slice(1)) as any || "None";
    
    const newRecord: AuditRecord = {
      auditId: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      inputSnapshot: input,
      outputSnapshot: output,
      confidenceScore: conf,
      result: result,
      riskFindings: {
        biasLevel: biasLevel === "Low" ? "Low" : biasLevel === "Medium" ? "Medium" : biasLevel === "High" ? "High" : "None",
        driftDetected: conf < 0.7 || driftRisk?.severity === 'high',
        logicConsistency: logicRisk?.severity === 'high' ? 'Risk' : logicRisk?.severity === 'medium' ? 'Warning' : 'Stable'
      }
    };
    
    setAuditHistory(prev => [newRecord, ...prev].slice(0, 50));
    setLastAnalysis(result);
  }, []);

  const runAnalysis = useCallback(async () => {
    const { currentInput: inp, currentOutput: out, confidence: conf } = stateRef.current;
    const result = await analyzeModelOutput(inp, out, conf);
    recordAudit(result, inp, out, conf);
  }, [recordAudit]);

  const analysisRef = useRef(runAnalysis);
  useEffect(() => {
    analysisRef.current = runAnalysis;
  }, [runAnalysis]);

  useEffect(() => {
    if (mode === 'manual') return;

    const tick = () => {
      tickCount.current += 1;
      const isSimulation = mode === 'simulation';
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      let nextConf = stateRef.current.confidence;

      if (isSimulation) {
        const incomeShift = (Math.random() - 0.5) * 2000;
        const loanShift = (Math.random() - 0.5) * 1000;
        const confShift = (Math.random() - 0.5) * 0.04;

        nextConf = Math.min(1, Math.max(0.4, stateRef.current.confidence + confShift));
        setConfidence(parseFloat(nextConf.toFixed(2)));
        
        setCurrentInput(prev => ({
          ...prev,
          income: Math.max(20000, Math.floor(prev.income + incomeShift)),
          loanAmount: Math.max(5000, Math.floor(prev.loanAmount + loanShift))
        }));

        if (tickCount.current % 3 === 0 || nextConf < 0.68) {
          analysisRef.current();
        }
      } else if (mode === 'live') {
          analysisRef.current();
      }

      setHistory(prev => {
        const newPoint: DriftPoint = {
          timestamp: timeStr,
          confidence: nextConf,
          errorRate: 1 - nextConf,
          anomalyDetected: nextConf < 0.7
        };
        const updated = [...prev, newPoint];
        return updated.slice(-20);
      });
    };

    const intervalId = setInterval(tick, simulationInterval * 1000);
    return () => clearInterval(intervalId);
  }, [mode, simulationInterval]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard analysis={lastAnalysis} history={history} onOpenHistory={() => setIsHistoryModalOpen(true)} />;
      case 'analyzer':
        return (
          <Analyzer 
            initialInput={JSON.stringify(currentInput, null, 2)}
            initialOutput={JSON.stringify(currentOutput, null, 2)}
            initialConfidence={confidence}
            initialResult={lastAnalysis}
            onUpdate={(inp, out, conf) => {
              try {
                const pInp = JSON.parse(inp);
                const pOut = JSON.parse(out);
                setCurrentInput(pInp);
                setCurrentOutput(pOut);
                setConfidence(conf);
              } catch (e) {
                console.warn("Invalid JSON in manual update");
              }
            }}
            onAuditComplete={(result, inp, out, conf) => {
              recordAudit(result, inp, out, conf);
            }}
          />
        );
      case 'timeline':
        return <BehaviorTimeline history={history} auditHistory={auditHistory} />;
      case 'risk':
        return <RiskPanel analysis={lastAnalysis} auditHistory={auditHistory} />;
      case 'settings':
        return (
          <ConfigurationPanel 
            simulationInterval={simulationInterval}
            setSimulationInterval={setSimulationInterval}
            mode={mode}
            setMode={setMode}
          />
        );
      default:
        return <Dashboard analysis={lastAnalysis} history={history} onOpenHistory={() => setIsHistoryModalOpen(true)} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user}>
      {renderContent()}
      <AuditHistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        history={auditHistory}
      />
    </Layout>
  );
};

export default App;
