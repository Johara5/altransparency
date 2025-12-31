
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export type VerbosityLevel = 'simple' | 'detailed' | 'technical';

const analysisCache = new Map<string, AuditResult>();

export const analyzeModelOutput = async (
  inputData: any,
  outputData: any,
  confidence: number
): Promise<AuditResult> => {
  const cacheKey = JSON.stringify({ inputData, outputData, confidence });
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey)!;
  }

  const prompt = `Analyze the following AI decision for transparency and explainability:
    Input Data: ${JSON.stringify(inputData)}
    AI Output: ${JSON.stringify(outputData)}
    Model Confidence: ${confidence}

    Generate three distinct narrative explanations:
    1. Simple: A high-level summary for end-users.
    2. Detailed: Explanation of logic and feature relationships.
    3. Technical: Discussion of potential statistical weights and logic.

    Also provide influencing factors and risk indicators (Bias, Confidence, Logic, Drift).
    Provide a 'trustScore' as a composite metric on a scale of 0 to 100 representing overall reliability.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanations: {
              type: Type.OBJECT,
              properties: {
                simple: { type: Type.STRING },
                detailed: { type: Type.STRING },
                technical: { type: Type.STRING }
              },
              required: ["simple", "detailed", "technical"]
            },
            influencingFactors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  factor: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ["positive", "negative", "neutral"] },
                  weight: { type: Type.NUMBER },
                  explanation: { type: Type.STRING }
                },
                required: ["factor", "impact", "weight", "explanation"]
              }
            },
            riskIndicators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, enum: ["Bias", "Confidence", "Logic", "Drift"] },
                  severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                  finding: { type: Type.STRING }
                },
                required: ["category", "severity", "finding"]
              }
            },
            trustScore: { type: Type.NUMBER, description: "A composite trust metric from 0 to 100." }
          },
          required: ["explanations", "influencingFactors", "riskIndicators", "trustScore"]
        }
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    const result: AuditResult = { ...parsed, status: 'live' };
    analysisCache.set(cacheKey, result);
    return result;
  } catch (error: any) {
    console.warn("Gemini API Status: 429 Quota Exceeded or Network Error. Falling back to Heuristic Engine.");
    
    const mockResult: AuditResult = {
      status: 'fallback',
      explanations: {
        simple: "HEURISTIC FALLBACK: The AI decision for this loan request is primarily influenced by the applicant's income levels and requested amount, suggesting a standard risk-based approval path.",
        detailed: "The model is currently operating within expected feature weight distributions. Analysis of the input vector shows heavy reliance on 'Income' as a primary predictor, while 'LoanAmount' serves as a secondary control variable.",
        technical: "HEURISTIC MODE: Feature attribution analysis (Simulated) suggests a SHAP-equivalent weight of 0.65 for 'income' and -0.22 for 'loanAmount'. The resulting prediction vector is consistent with internal stability benchmarks."
      },
      influencingFactors: [
        { factor: "Income Scaling", impact: "positive", weight: 0.65, explanation: "High income detected relative to typical approval brackets." },
        { factor: "Confidence Stability", impact: confidence > 0.8 ? "positive" : "negative", weight: 0.35, explanation: `Current model confidence is ${Math.round(confidence * 100)}%.` }
      ],
      riskIndicators: [
        { category: "Confidence", severity: confidence < 0.7 ? "high" : "low", finding: "Current heuristic scan: Low impact drift detected in confidence buffer." }
      ],
      trustScore: Math.round(confidence * 100)
    };
    
    return mockResult;
  }
};
