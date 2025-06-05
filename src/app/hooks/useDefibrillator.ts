import { useState } from "react";
import { NotificationService } from "../services/NotificationService";

export type DisplayMode = "DAE" | "ARRET" | "Moniteur" | "Stimulateur" | "Manuel";

export interface DefibrillatorState {
  // Display
  displayMode: DisplayMode;
  manualFrequency: number;
  
  // Charging and shock
  isCharging: boolean;
  chargeProgress: number;
  shockCount: number;
  isCharged: boolean;
  
  // UI animations
  isChargeButtonPressed: boolean;
  isShockButtonPressed: boolean;
  
  // Channel selection
  selectedChannel: number;
}

export const useDefibrillator = () => {
  const [state, setState] = useState<DefibrillatorState>({
    displayMode: "ARRET",
    manualFrequency: 60,
    isCharging: false,
    chargeProgress: 0,
    shockCount: 0,
    isCharged: false,
    isChargeButtonPressed: false,
    isShockButtonPressed: false,
    selectedChannel: 1,
  });

  const updateState = (updates: Partial<DefibrillatorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Actions
  const setDisplayMode = (mode: DisplayMode) => {
    updateState({ displayMode: mode });
  };

  const setManualFrequency = (frequency: number) => {
    updateState({ manualFrequency: frequency });
    // Auto switch to Manuel mode
    if (state.displayMode !== "Manuel") {
      setDisplayMode("Manuel");
    }
  };

  const startCharging = () => {
    if (state.isCharging || state.isCharged) return;

    // Button animation
    updateState({ isChargeButtonPressed: true });
    setTimeout(() => updateState({ isChargeButtonPressed: false }), 300);

    updateState({
      isCharging: true,
      chargeProgress: 0,
      isCharged: false,
    });

    // Charging animation (5 seconds)
    const chargeInterval = setInterval(() => {
      setState(prev => {
        const newProgress = prev.chargeProgress + 2;
        if (newProgress >= 100) {
          clearInterval(chargeInterval);
          return {
            ...prev,
            chargeProgress: 100,
            isCharging: false,
            isCharged: true,
          };
        }
        return { ...prev, chargeProgress: newProgress };
      });
    }, 100);
  };

  const deliverShock = () => {
    if (!state.isCharged) return;

    // Button animation
    updateState({ isShockButtonPressed: true });
    setTimeout(() => updateState({ isShockButtonPressed: false }), 500);

    const newShockCount = state.shockCount + 1;
    updateState({
      shockCount: newShockCount,
      isCharged: false,
      chargeProgress: 0,
    });

    console.log(`Choc délivré ! Total: ${newShockCount}`);

    // Show notification
    NotificationService.showShockDelivered({
      energy: state.manualFrequency,
      shockNumber: newShockCount,
      patientName: "Dupont, Samuel",
      frequency: state.manualFrequency,
    });
  };

  const setSelectedChannel = (channel: number) => {
    updateState({ selectedChannel: channel });
  };

  return {
    // State
    ...state,
    
    // Actions
    setDisplayMode,
    setManualFrequency,
    startCharging,
    deliverShock,
    setSelectedChannel,
  };
}; 