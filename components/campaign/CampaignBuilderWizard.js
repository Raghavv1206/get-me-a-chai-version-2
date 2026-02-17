// components/campaign/CampaignBuilderWizard.js
"use client"
import { useState, useEffect } from 'react';
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

const STORAGE_KEY = 'campaign_builder_draft';

export default function CampaignBuilderWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [autoSaving, setAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
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

    // Load saved data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setCampaignData(parsed.data);
                setCurrentStep(parsed.step || 1);
                setLastSaved(new Date(parsed.timestamp));
                console.log('Loaded saved campaign data from localStorage');
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }, []);

    // Auto-save to localStorage whenever campaignData changes
    useEffect(() => {
        if (Object.values(campaignData).some(val => val !== '' && val !== 30 && (Array.isArray(val) ? val.length > 0 : true))) {
            setAutoSaving(true);
            const saveData = {
                data: campaignData,
                step: currentStep,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
            setLastSaved(new Date());

            // Hide auto-saving indicator after 1 second
            const timer = setTimeout(() => setAutoSaving(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [campaignData, currentStep]);

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
                // Clear localStorage after successful save
                localStorage.removeItem(STORAGE_KEY);
                alert('✅ Draft saved successfully! You can continue editing or view it in your campaigns dashboard.');
                // Don't redirect - keep user on current page
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Failed to save draft: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft. Please try again.');
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
                // Clear localStorage after successful publish
                localStorage.removeItem(STORAGE_KEY);
                alert('Campaign published successfully!');
                router.push(`/dashboard/campaigns`);
            }
        } catch (error) {
            console.error('Error publishing campaign:', error);
            alert('Failed to publish campaign');
        }
    };

    const handleClearDraft = () => {
        if (confirm('Are you sure you want to clear all saved data and start fresh?')) {
            localStorage.removeItem(STORAGE_KEY);
            setCampaignData({
                category: '',
                projectType: '',
                goal: '',
                duration: 30,
                location: '',
                brief: '',
                title: '',
                hook: '',
                story: '',
                milestones: [],
                rewards: [],
                coverImage: '',
                gallery: [],
                videoUrl: '',
                faqs: [],
            });
            setCurrentStep(1);
            setLastSaved(null);
            alert('Draft cleared successfully!');
        }
    };

    const progress = (currentStep / STEPS.length) * 100;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Create Your Campaign with AI ✨
                        </h1>
                        <p className="text-gray-400">
                            Let AI help you build a compelling campaign in minutes
                        </p>
                    </div>
                    {/* Auto-save Indicator */}
                    <div className="flex items-center gap-2">
                        {autoSaving && (
                            <span className="flex items-center gap-2 text-sm text-green-400 animate-pulse">
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </span>
                        )}
                        {!autoSaving && lastSaved && (
                            <span className="text-sm text-gray-500">
                                Auto-saved {new Date(lastSaved).toLocaleTimeString()}
                            </span>
                        )}
                        {lastSaved && (
                            <button
                                onClick={handleClearDraft}
                                className="text-sm text-red-400 hover:text-red-300 underline"
                                title="Clear saved draft"
                            >
                                Clear Draft
                            </button>
                        )}
                    </div>
                </div>
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
