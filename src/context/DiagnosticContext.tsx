'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type DiagnosticState = {
  answers: Record<number, number>;
  currentStep: number;
  setAnswer: (questionId: number, score: number) => void;
  setStep: (step: number) => void;
  resetDiagnostic: () => void;
  isComplete: boolean;
};

const DiagnosticContext = createContext<DiagnosticState | undefined>(undefined);

export const DiagnosticProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    let savedAnswersObj = {};
    let savedStepNum = 0;

    const savedAnswers = localStorage.getItem('zax-diagnostic-answers');
    const savedStep = localStorage.getItem('zax-diagnostic-step');

    if (savedAnswers) {
      try {
        savedAnswersObj = JSON.parse(savedAnswers);
      } catch (e) {
        console.error("Failed to parse saved answers", e);
      }
    }
    if (savedStep) {
      savedStepNum = parseInt(savedStep, 10);
      if (isNaN(savedStepNum)) savedStepNum = 0;
    }

    setAnswers(savedAnswersObj);
    setCurrentStep(savedStepNum);
    setIsInitialized(true);
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('zax-diagnostic-answers', JSON.stringify(answers));
    localStorage.setItem('zax-diagnostic-step', currentStep.toString());
  }, [answers, currentStep, isInitialized]);

  const setAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const setStep = (step: number) => {
    setCurrentStep(step);
  };

  const resetDiagnostic = () => {
    setAnswers({});
    setCurrentStep(0);
    localStorage.removeItem('zax-diagnostic-answers');
    localStorage.removeItem('zax-diagnostic-step');
  };

  const isComplete = Object.keys(answers).length >= 50; // Assuming 50 questions

  return (
    <DiagnosticContext.Provider value={{ answers, currentStep, setAnswer, setStep, resetDiagnostic, isComplete }}>
      {children}
    </DiagnosticContext.Provider>
  );
};

export const useDiagnostic = () => {
  const context = useContext(DiagnosticContext);
  if (context === undefined) {
    throw new Error('useDiagnostic must be used within a DiagnosticProvider');
  }
  return context;
};
