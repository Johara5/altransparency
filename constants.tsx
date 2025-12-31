
import React from 'react';
import { LayoutDashboard, History, ShieldAlert, Settings, Zap } from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'timeline', label: 'Behavior Timeline', icon: <History size={20} /> },
  { id: 'risk', label: 'Risk & Bias', icon: <ShieldAlert size={20} /> },
  { id: 'analyzer', label: 'Live Analyzer', icon: <Zap size={20} /> },
  { id: 'settings', label: 'Configuration', icon: <Settings size={20} /> },
];

export const MOCK_DRIFT_DATA = [
  { time: '09:00', confidence: 0.98, errors: 0.02, anomaly: false },
  { time: '10:00', confidence: 0.97, errors: 0.03, anomaly: false },
  { time: '11:00', confidence: 0.92, errors: 0.08, anomaly: false },
  { time: '12:00', confidence: 0.75, errors: 0.25, anomaly: true, notes: "Sudden shift in input demographics." },
  { time: '13:00', confidence: 0.88, errors: 0.12, anomaly: false },
  { time: '14:00', confidence: 0.95, errors: 0.05, anomaly: false },
  { time: '15:00', confidence: 0.96, errors: 0.04, anomaly: false },
];

export const MOCK_HEALTH_DATA = {
  modelId: "CreditRisk-v2.1",
  overallTrustScore: 88,
  uptime: "99.94%",
  totalAudits: 14502,
  driftAlerts: 3
};
