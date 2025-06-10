// MenuDropdown Modals Hooks

import { useState } from 'react';

export const useModals = () => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showScenariosListModal, setShowScenariosListModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const openAbout = () => setShowAboutModal(true);
  const closeAbout = () => setShowAboutModal(false);

  const openSettings = () => setShowSettingsModal(true);
  const closeSettings = () => setShowSettingsModal(false);

  const openScenariosList = () => setShowScenariosListModal(true);
  const closeScenarioslist = () => setShowScenariosListModal(false);

  const openScenario = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setShowScenarioModal(true);
  };
  const closeScenario = () => setShowScenarioModal(false);

  return {
    // States
    showAboutModal,
    showSettingsModal,
    showScenariosListModal,
    showScenarioModal,
    selectedScenario,
    
    // Actions
    openAbout,
    closeAbout,
    openSettings,
    closeSettings,
    openScenariosList,
    closeScenarioslist,
    openScenario,
    closeScenario
  };
}; 