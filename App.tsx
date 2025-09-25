
import React, { useState, useCallback } from 'react';
import { generateAssessmentOptions, generateDetailedPlan } from './services/geminiService';
import type { AssessmentPlan, UserSelections } from './types';
import { Step } from './types';
import StepIndicator from './components/StepIndicator';
import Step1Field from './components/steps/Step1Field';
import Step2Level from './components/steps/Step2Level';
import Step3CLO from './components/steps/Step3CLO';
import Step4Options from './components/steps/Step4Options';
import Step5Plan from './components/steps/Step5Plan';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<Step>(Step.FIELD);
    const [userSelections, setUserSelections] = useState<UserSelections>({
        field: '',
        level: '',
        clos: ['', '', ''],
    });
    const [assessmentOptions, setAssessmentOptions] = useState<string[]>([]);
    const [selectedAssessment, setSelectedAssessment] = useState<string>('');
    const [detailedPlan, setDetailedPlan] = useState<AssessmentPlan | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleReset = () => {
        setCurrentStep(Step.FIELD);
        setUserSelections({ field: '', level: '', clos: ['', '', ''] });
        setAssessmentOptions([]);
        setSelectedAssessment('');
        setDetailedPlan(null);
        setError(null);
        setIsLoading(false);
    };

    const handleNextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 5));
    };

    const handlePrevStep = () => {
        setError(null);
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const updateSelections = (updates: Partial<UserSelections>) => {
        setUserSelections(prev => ({ ...prev, ...updates }));
    };

    const fetchAssessmentOptions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const options = await generateAssessmentOptions(userSelections);
            setAssessmentOptions(options);
            handleNextStep();
        } catch (e) {
            console.error(e);
            setError('Failed to generate assessment options. Please check your inputs and try again.');
        } finally {
            setIsLoading(false);
        }
    }, [userSelections]);

    const fetchDetailedPlan = useCallback(async (assessmentType: string) => {
        setSelectedAssessment(assessmentType);
        setIsLoading(true);
        setError(null);
        try {
            const plan = await generateDetailedPlan(userSelections, assessmentType);
            setDetailedPlan(plan);
            handleNextStep();
        } catch (e) {
            console.error(e);
            setError('Failed to generate the detailed plan. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [userSelections]);

    const renderStepContent = () => {
        if (isLoading) {
            return <LoadingSpinner message={currentStep === Step.CLO ? "Generating creative assessment ideas..." : "Crafting your detailed assessment plan..."} />;
        }
        if (error) {
            return <ErrorDisplay message={error} onRetry={currentStep === Step.CLO ? fetchAssessmentOptions : () => fetchDetailedPlan(selectedAssessment)} onBack={handlePrevStep} />;
        }
        switch (currentStep) {
            case Step.FIELD:
                return <Step1Field selections={userSelections} onUpdate={updateSelections} onNext={handleNextStep} />;
            case Step.LEVEL:
                return <Step2Level selections={userSelections} onUpdate={updateSelections} onNext={handleNextStep} onBack={handlePrevStep} />;
            case Step.CLO:
                return <Step3CLO selections={userSelections} onUpdate={updateSelections} onNext={fetchAssessmentOptions} onBack={handlePrevStep} />;
            case Step.OPTIONS:
                return <Step4Options options={assessmentOptions} onSelect={fetchDetailedPlan} onBack={handlePrevStep} />;
            case Step.PLAN:
                return <Step5Plan plan={detailedPlan} onReset={handleReset} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <header className="text-center mb-6">
                <h1 className="text-4xl font-bold text-teal-600">AI Assessment Designer</h1>
                <p className="text-gray-600 mt-2">Crafting effective engineering assessments with the power of AI.</p>
            </header>
            <main className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 transition-all duration-500">
                <StepIndicator currentStep={currentStep} />
                <div className="mt-8">
                    {renderStepContent()}
                </div>
            </main>
            <footer className="text-center mt-6 text-gray-500 text-sm">
                <p>Powered by UTP & Petronas Innovation</p>
            </footer>
        </div>
    );
};

export default App;
