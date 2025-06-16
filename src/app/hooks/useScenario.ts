import { useState, useRef } from 'react';
import type { RhythmType } from '../components/graphsdata/ECGRhythms';

export interface ScenarioStep {
  title: string;
  description: string;
}

export interface ScenarioState {
  currentScenario: string | null;
  currentStep: number;
  showScenarioComplete: boolean;
  showStepHelp: boolean;
  showScenarioModal: boolean;
  selectedScenarioForModal: string | null;
  currentRhythm: RhythmType;
}

export const useScenario = () => {
  const [state, setState] = useState<ScenarioState>({
    currentScenario: null,
    currentStep: 0,
    showScenarioComplete: false,
    showStepHelp: false,
    showScenarioModal: false,
    selectedScenarioForModal: null,
    currentRhythm: 'sinus',
  });

  const scenarioTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rhythmTransitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  //étapes du scénario 1
  const scenario1Steps: ScenarioStep[] = [
    {
      title: "Allumer le défibrillateur en position moniteur",
      description: "Tournez la mollette verte pour passer du mode ARRÊT au mode Moniteur",
    },
    {
      title: "Lire le rythme",
      description: "Observez le tracé ECG sur l'écran pendant quelques secondes",
    },
    {
      title: "Analyser le rythme",
      description: "Arrêter le massage pour analyser le rythme: Fibrillation ventriculaire détectée",
    },
    {
      title: "Positionner la mollette sur 150 joules",
      description: "Tournez la mollette verte pour sélectionner une énergie de 150J",
    },
    {
      title: "Appuyer sur le bouton charge (jaune)",
      description: "Pressez le bouton jaune marqué 'Charge' pour charger le défibrillateur",
    },
    {
      title: "Délivrer le choc (bouton orange)",
      description: "Pressez le bouton orange marqué 'Choc' pour délivrer l'énergie",
    },
  ];

  //étapes du scénario 2
  const scenario2Steps: ScenarioStep[] = [
    {
      title: "Allumer le défibrillateur en mode DAE",
      description: "Tournez la mollette verte pour passer du mode ARRÊT au mode DAE",
    },
    {
      title: "Connecter les électrodes et vérifier le positionnement",
      description: "Placez les électrodes selon l'image affichée et validez",
    },
    {
      title: "Laisser le DAE analyser le rythme",
      description: "Attendez que l'analyse du rythme soit terminée",
    },
    {
      title: "Choc recommandé - Charge automatique",
      description: "Le DAE charge automatiquement à 150 joules",
    },
    {
      title: "Délivrer le choc (bouton orange)",
      description: "Pressez le bouton orange clignotant pour délivrer le choc",
    },
  ];

  const updateState = (updates: Partial<ScenarioState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const validateScenarioStep = (stepNumber: number) => {
    const currentSteps = state.currentScenario === "scenario_1" ? scenario1Steps : scenario2Steps;
    
    if ((state.currentScenario === "scenario_1" || state.currentScenario === "scenario_2") && state.currentStep === stepNumber) {
      const newStep = stepNumber + 1;
      updateState({ currentStep: newStep });
      
      // Étape finale terminée (choc délivré) : déclencher le changement de rythme
      if (stepNumber === currentSteps.length - 1) {
        triggerRhythmTransition();
      }
      
      if (newStep >= currentSteps.length) {
        // Scénario terminé - nettoyer les timers
        if (scenarioTimeoutRef.current) {
          clearTimeout(scenarioTimeoutRef.current);
          scenarioTimeoutRef.current = null;
        }
        
        updateState({ showScenarioComplete: true });
        setTimeout(() => {
          updateState({
            currentScenario: null,
            currentStep: 0,
            showScenarioComplete: false,
            currentRhythm: 'sinus',
          });
        }, 3000);
      }
    }
  };

  const triggerRhythmTransition = () => {
    // Nettoyer tout timer de transition existant
    if (rhythmTransitionTimeoutRef.current) {
      clearTimeout(rhythmTransitionTimeoutRef.current);
    }
    
    // Phase 1: Passage immédiat en asystolie après le choc
    updateState({ currentRhythm: 'asystole' });
    
    // Phase 2: Retour au rythme sinusal après 2.5 secondes d'asystolie
    rhythmTransitionTimeoutRef.current = setTimeout(() => {
      updateState({ currentRhythm: 'sinus' });
    }, 2500);
  };

  const handleManualValidation = () => {
    if (state.currentScenario === "scenario_1") {
      if (state.currentStep === 1 || state.currentStep === 2) {
        validateScenarioStep(state.currentStep);
      }
    } else if (state.currentScenario === "scenario_2") {
      if (state.currentStep === 1 || state.currentStep === 3) {
        validateScenarioStep(state.currentStep);
      }
    }
  };

  const startScenario = (scenarioId: string) => {
    if (scenarioId === "scenario_1") {
      updateState({
        currentScenario: scenarioId,
        currentStep: 0,
        showScenarioComplete: false,
        currentRhythm: 'fibrillation',
      });
    } else if (scenarioId === "scenario_2") {
      updateState({
        currentScenario: scenarioId,
        currentStep: 0,
        showScenarioComplete: false,
        currentRhythm: 'fibrillation', 
      });
    }
  };

  const handleScenarioSelect = (scenarioId: string) => {
    updateState({
      selectedScenarioForModal: scenarioId,
      showScenarioModal: true,
      currentScenario: null,
      currentStep: 0,
      showScenarioComplete: false,
    });
  };

  const handleStartScenarioFromModal = (scenarioId: string) => {
    startScenario(scenarioId);
    updateState({
      showScenarioModal: false,
      selectedScenarioForModal: null,
    });
  };

  const toggleStepHelp = () => {
    updateState({ showStepHelp: !state.showStepHelp });
  };

  const closeScenarioModal = () => {
    updateState({
      showScenarioModal: false,
      selectedScenarioForModal: null,
    });
  };

  // Nettoyage des timers
  const cleanup = () => {
    if (scenarioTimeoutRef.current) {
      clearTimeout(scenarioTimeoutRef.current);
      scenarioTimeoutRef.current = null;
    }
    if (rhythmTransitionTimeoutRef.current) {
      clearTimeout(rhythmTransitionTimeoutRef.current);
      rhythmTransitionTimeoutRef.current = null;
    }
  };

  const getCurrentScenarioSteps = () => {
    if (state.currentScenario === "scenario_1") return scenario1Steps;
    if (state.currentScenario === "scenario_2") return scenario2Steps;
    return [];
  };

  return {
    // State
    ...state,
    scenario1Steps,
    scenario2Steps, 
    
    // Actions
    validateScenarioStep,
    handleManualValidation,
    startScenario,
    handleScenarioSelect,
    handleStartScenarioFromModal,
    toggleStepHelp,
    closeScenarioModal,
    triggerRhythmTransition,
    cleanup,
    getCurrentScenarioSteps, 
  };
};