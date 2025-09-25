import { GoogleGenAI, Type } from "@google/genai";
import type { UserSelections, AssessmentPlan } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateAssessmentOptions(selections: UserSelections): Promise<string[]> {
  const { field, level, clos } = selections;
  const filledCLOs = clos.filter(clo => clo.trim() !== "").join("; ");

  const prompt = `You are an expert curriculum designer for university-level engineering programs.
  Given the field of study: ${field}, student level: ${level}, and the following course learning outcomes: ${filledCLOs},
  suggest three innovative assessment types. Return only the names of the assessments.`;

  const result = await ai.generate({
    model: "gemini-1.5-flash",
    input: prompt,
    output: { type: Type.TEXT }
  });

  return result.outputText.split("\n").map(s => s.trim()).filter(Boolean);
}

export async function generateDetailedPlan(selections: UserSelections, assessmentType: string): Promise<AssessmentPlan> {
  const { field, level, clos } = selections;
  const filledCLOs = clos.filter(clo => clo.trim() !== "").join("; ");

  const prompt = `You are an expert curriculum designer for university-level engineering programs.
  Field of study: ${field}
  Student level: ${level}
  CLOs: ${filledCLOs}
  Assessment chosen: ${assessmentType}
  
  Please provide a structured assessment plan including:
  - Objective
  - Instructions
  - Deliverables
  - Evaluation criteria`;

  const result = await ai.generate({
    model: "gemini-1.5-flash",
    input: prompt,
    output: { type: Type.TEXT }
  });

  return { type: assessmentType, details: result.outputText };
}
