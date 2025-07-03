import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import useAppStore from '../store/useAppStore';
import ConfigureStep from '../components/sessionSetupComponents/ConfigureStep';
import WindowsStep from '../components/sessionSetupComponents/WindowsStep';
import SummaryStep from '../components/sessionSetupComponents/SummaryStep';

const SessionSetup = () => {
    const { setCurrentPage } = useAppStore();
    const [currentStep, setCurrentStep] = useState(0);

    const [sessionData, setSessionData] = useState({
        sessionName: '',
        totalTime: 60,
        isTimeBound: true,
        isSessionTime: true,
        breakType: 'regular',
        regularBreaks: {
            breakDuration: 5,
            numberOfBreaks: 3
        },
        customBreaks: [],
        focusWindows: [],
        breakWindows: []
    });

    const nextStep = () => {
        if (currentStep < 2) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goHome = () => {
        setCurrentPage('home');
    };

    const startSession = (sessionConfig) => {
        // Save to Zustand store
        const { saveSessionConfig, startSession: startActiveSession } = useAppStore.getState();

        console.log('Starting session with config:', sessionConfig);

        // Save configuration and start the session
        saveSessionConfig(sessionConfig);
        startActiveSession(sessionConfig);

        // Navigate to active session page
        setCurrentPage('session');
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <ConfigureStep
                        sessionData={sessionData}
                        setSessionData={setSessionData}
                        onNext={nextStep}
                        onPrev={goHome} // Go back to home from first step
                    />
                );
            case 1:
                return (
                    <WindowsStep
                        sessionData={sessionData}
                        setSessionData={setSessionData}
                        onNext={nextStep}
                        onPrev={prevStep}
                    />
                );
            case 2:
                return (
                    <SummaryStep
                        sessionData={sessionData}
                        onStart={startSession}
                        onPrev={prevStep}
                    />
                );
            default:
                return (
                    <ConfigureStep
                        sessionData={sessionData}
                        setSessionData={setSessionData}
                        onNext={nextStep}
                        onPrev={goHome}
                    />
                );
        }
    };

    return (
        <AnimatePresence mode="wait">
            <div key={currentStep}>
                {renderStep()}
            </div>
        </AnimatePresence>
    );
};

export default SessionSetup;