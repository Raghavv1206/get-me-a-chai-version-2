// components/campaign/CampaignBuilderWizard.js
"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BasicInfoStep from './BasicInfoStep';
import AIStoryStep from './AIStoryStep';
import MilestonesStep from './MilestonesStep';
import RewardsStep from './RewardsStep';
import MediaStep from './MediaStep';
import FAQsStep from './FAQsStep';
import PreviewStep from './PreviewStep';

const STEPS = [
    { id: 1, name: 'Basic Info', component: BasicInfoStep },
    { id: 2, name: 'AI Story', component: AIStoryStep },
    { id: 3, name: 'Milestones', component: MilestonesStep },
    { id: 4, name: 'Rewards', component: RewardsStep },
    { id: 5, name: 'Media', component: MediaStep },
    { id: 6, name: 'FAQs', component: FAQsStep },
    { id: 7, name: 'Preview', component: PreviewStep },
];

export default function CampaignBuilderWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [campaignData, setCampaignData] = useState({
        // Basic Info
        category: '',
        projectType: '',
        goal: '',
        duration: 30,
        location: '',

        // Story
        brief: '',
        title: '',
        hook: '',
        story: '',

        // Milestones
        milestones: [],

        // Rewards
        rewards: [],

        // Media
        coverImage: '',
        gallery: [],
        videoUrl: '',

        // FAQs
        faqs: [],
    });

    const CurrentStepComponent = STEPS[currentStep - 1].component;

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDataUpdate = (data) => {
        setCampaignData(prev => ({ ...prev, ...data }));
    };

    const handleSaveDraft = async () => {
        try {
            const response = await fetch('/api/campaigns/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...campaignData, status: 'draft' }),
            });

            if (response.ok) {
                const { campaignId } = await response.json();
                alert('Draft saved successfully!');
                router.push(`/dashboard/campaigns`);
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft');
        }
    };

    const handlePublish = async () => {
        try {
            const response = await fetch('/api/campaigns/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...campaignData, status: 'active' }),
            });

            if (response.ok) {
                const { campaignId } = await response.json();
                alert('Campaign published successfully!');
                router.push(`/dashboard/campaigns`);
            }
        } catch (error) {
            console.error('Error publishing campaign:', error);
            alert('Failed to publish campaign');
        }
    };

    const progress = (currentStep / STEPS.length) * 100;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Create Your Campaign with AI ✨
                </h1>
                <p className="text-gray-400">
                    Let AI help you build a compelling campaign in minutes
                </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {STEPS.map((step) => (
                        <div
                            key={step.id}
                            className={`flex items-center ${step.id < STEPS.length ? 'flex-1' : ''
                                }`}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step.id === currentStep
                                        ? 'bg-purple-600 text-white scale-110'
                                        : step.id < currentStep
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-700 text-gray-400'
                                    }`}
                            >
                                {step.id < currentStep ? '✓' : step.id}
                            </div>
                            {step.id < STEPS.length && (
                                <div
                                    className={`h-1 flex-1 mx-2 rounded transition-all ${step.id < currentStep ? 'bg-green-600' : 'bg-gray-700'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                    {STEPS.map((step) => (
                        <span
                            key={step.id}
                            className={`${step.id === currentStep ? 'text-purple-400 font-semibold' : ''
                                }`}
                        >
                            {step.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800 min-h-[500px]">
                <CurrentStepComponent
                    data={campaignData}
                    onUpdate={handleDataUpdate}
                    onNext={handleNext}
                    onBack={handleBack}
                />
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex justify-between items-center">
                <button
                    onClick={handleSaveDraft}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all"
                >
                    💾 Save as Draft
                </button>

                <div className="flex gap-4">
                    {currentStep > 1 && (
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all"
                        >
                            ← Back
                        </button>
                    )}
                    {currentStep < STEPS.length ? (
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={handlePublish}
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/50 transition-all hover:scale-105"
                        >
                            🚀 Publish Campaign
                        </button>
                    )}
                </div>
            </div>

            {/* Exit Confirmation */}
            <div className="mt-4 text-center">
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to exit? Unsaved changes will be lost.')) {
                            router.push('/dashboard');
                        }
                    }}
                    className="text-sm text-gray-500 hover:text-gray-300"
                >
                    Exit without saving
                </button>
            </div>
        </div>
    );
}
