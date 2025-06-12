"use client";

import React, { useRef, useState, useCallback } from "react";
import {
  FlagTriangleRight,
  Triangle,
  CopyMinus,
  Printer,
  Zap,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import ButtonComponent from "./components/buttons/ButtonComponent";
import MonitorDisplay from "./components/ScreenDisplay/MonitorDisplay";
import DAEDisplay from "./components/ScreenDisplay/DAEDisplay";
import ARRETDisplay from "./components/ScreenDisplay/ARRETDisplay";
import StimulateurDisplay from "./components/ScreenDisplay/StimulateurDisplay";
import ManuelDisplay from "./components/ScreenDisplay/ManuelDisplay";
import Joystick from "./components/buttons/Joystick";
import RotativeKnob from "./components/buttons/RotativeKnob";
import DropdownMenu from "./components/DropdownMenu";
import { useDefibrillator } from "./hooks/useDefibrillator";
import { useResponsiveScale } from "./hooks/useResponsiveScale";
import { RotaryMappingService } from "./services/RotaryMappingService";
import ScenarioModal from "./components/modals/ScenarioModal";
import { useScenario } from "./hooks/useScenario";
import Synchro from "./components/buttons/Synchro";

import type { DisplayMode } from "./hooks/useDefibrillator";

const DefibInterface: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = useResponsiveScale();
  const defibrillator = useDefibrillator();
  const scenario = useScenario();

  // État pour la synchronisation avec le DAE
  const [daePhase, setDaePhase] = useState<
    "placement" | "preparation" | "analyse" | "charge" | "attente_choc" | null
  >(null);
  const [daeShockFunction, setDaeShockFunction] = useState<(() => void) | null>(
    null,
  );

  // État pour l'écran de démarrage
  const [isBooting, setIsBooting] = useState(false);
  const [targetMode, setTargetMode] = useState<DisplayMode | null>(null);
  const [bootProgress, setBootProgress] = useState(0);

  // Références pour les timers de boot
  const bootTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepValidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scenarioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour gérer la progression automatique après passage en mode Moniteur
  const startMonitoringSteps = () => {
    // Nettoyer tout timer existant
    if (scenarioTimeoutRef.current) {
      clearTimeout(scenarioTimeoutRef.current);
    }
  };

  // gère changement de mode avec écran de démarrage
  const handleModeChange = (newMode: DisplayMode) => {
    // Si on bascule vers ARRET, arrêter immédiatement toute animation de démarrage
    if (newMode === "ARRET") {
      // Annuler tous les timers en cours
      if (bootTimeoutRef.current) {
        clearTimeout(bootTimeoutRef.current);
        bootTimeoutRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (scenarioTimeoutRef.current) {
        clearTimeout(scenarioTimeoutRef.current);
        scenarioTimeoutRef.current = null;
      }

      setIsBooting(false);
      setTargetMode(null);
      setBootProgress(0);
      defibrillator.setDisplayMode(newMode);
      return;
    }

    if (defibrillator.displayMode === "ARRET") {
      //mode ARRET à un autre mode = afficher l'écran de démarrage
      setIsBooting(true);
      setTargetMode(newMode);
      setBootProgress(0);

      progressIntervalRef.current = setInterval(() => {
        setBootProgress((prev) => {
          const newProgress = prev + 2; // 2% toutes les 100ms = 5 secondes
          if (newProgress >= 100) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          }
          return Math.min(newProgress, 100);
        });
      }, 100);

      // Après 5 secondes, passer au mode ciblé
      bootTimeoutRef.current = setTimeout(() => {
        defibrillator.setDisplayMode(newMode);
        setIsBooting(false);
        setTargetMode(null);
        setBootProgress(0);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        bootTimeoutRef.current = null;

        // Validation scénario 1 - étape 1 : allumer en position moniteur
        if (
          scenario.currentScenario === "scenario_1" &&
          newMode === "Moniteur"
        ) {
          scenario.validateScenarioStep(0);
          startMonitoringSteps();
        }
      }, 5000);
    } else {
      // Changement de mode normaleme,t
      defibrillator.setDisplayMode(newMode);

      // Validation scénario 1 - étape 1 : allumer en position moniteur (changement direct)
      if (
        scenario.currentScenario === "scenario_1" &&
        newMode === "Moniteur" &&
        defibrillator.displayMode !== "Moniteur"
      ) {
        scenario.validateScenarioStep(0);
        startMonitoringSteps();
      }
    }
  };

  const handleJoystickPositionChange = (
    position: "center" | "up" | "down" | "left" | "right",
  ) => {
    console.log("Joystick position:", position);
    // space to add logic about position changes
  };

  const handleRotaryValueChange = (value: number) => {
    const newValue = RotaryMappingService.mapRotaryToValue(value);

    // Gère les modes d'affichage directs
    if (newValue === "DAE") {
      handleModeChange("DAE");
    } else if (newValue === "ARRET") {
      handleModeChange("ARRET");
    } else if (newValue === "Moniteur") {
      handleModeChange("Moniteur");
    } else if (newValue === "Stimulateur") {
      handleModeChange("Stimulateur");
    } else {
      // Pour les valeurs numériques, passer en mode Manuel
      defibrillator.setManualFrequency(newValue, handleModeChange);

      // Validation scénario 1 - étape 4 : position 150J
      if (scenario.currentScenario === "scenario_1" && newValue === "150") {
        scenario.validateScenarioStep(3);
      }
    }
  };

  const handleChargeButtonClick = () => {
    defibrillator.setSelectedChannel(2);
    if (defibrillator.displayMode === "Manuel") {
      defibrillator.startCharging();

      // Validation scénario 1 - étape 5 : appui bouton charge
      if (scenario.currentScenario === "scenario_1") {
        scenario.validateScenarioStep(4);
      }
    }
  };

  const handleShockButtonClick = () => {
    defibrillator.setSelectedChannel(3);

    if (defibrillator.displayMode === "DAE") {
      // En mode DAE, utiliser la fonction de choc du DAE si disponible
      if (daePhase === "attente_choc" && daeShockFunction) {
        daeShockFunction();
      }
    } else if (defibrillator.displayMode === "Manuel") {
      // En mode Manuel, utiliser la logique existante
      defibrillator.deliverShock();

      // Validation scénario 1 - étape 6 : délivrer le choc
      if (
        scenario.currentScenario === "scenario_1" &&
        defibrillator.chargeProgress === 100
      ) {
        scenario.validateScenarioStep(5);
      }
    }
  };

  // Callbacks pour le DAE
  const handleDaePhaseChange = useCallback(
    (
      phase:
        | "placement"
        | "preparation"
        | "analyse"
        | "charge"
        | "attente_choc",
    ) => {
      setDaePhase(phase);
    },
    [],
  );

  const handleDaeShockReady = useCallback(
    (shockFunction: (() => void) | null) => {
      setDaeShockFunction(() => shockFunction);
    },
    [],
  );

  // Gestionnaires pour le menu déroulant
  const handleMenuItemSelect = async (action: string) => {
    console.log("Menu action:", action);
  };

  const renderScreenContent = () => {
    if (isBooting) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-black text-white">
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-green-400 mb-4">MARIUS</h1>
              <div className="text-sm text-gray-400">Efficia DFM100</div>
            </div>

            {/* Barre de progression */}
            <div className="w-64 h-2 bg-gray-700 rounded">
              <div
                className="h-full bg-green-500 rounded transition-all duration-100"
                style={{ width: `${bootProgress}%` }}
              ></div>
            </div>

            {/* Message de démarrage */}
            <div className="text-center text-sm text-gray-300">
              <div>Démarrage en cours...</div>
              <div className="mt-2">Passage en mode {targetMode}</div>
            </div>
          </div>
        </div>
      );
    }

    switch (defibrillator.displayMode) {
      case "ARRET":
        return <ARRETDisplay />;
      case "DAE":
        return (
          <DAEDisplay
            frequency={defibrillator.manualFrequency}
            chargeProgress={defibrillator.chargeProgress}
            shockCount={defibrillator.shockCount}
            isCharging={defibrillator.isCharging}
            onPhaseChange={handleDaePhaseChange}
            onShockReady={handleDaeShockReady}
          />
        );
      case "Moniteur":
        return (
          <div className="relative w-full h-full">
            <MonitorDisplay rhythmType={scenario.currentRhythm} />
            <div className="absolute top-[52.5%] right-4 text-xs font-bold text-green-400">
              <span>
                {scenario.currentRhythm === "fibrillation"
                  ? "Fibrillation ventriculaire"
                  : "Rythme sinusal"}
              </span>
            </div>
          </div>
        );
      case "Stimulateur":
        return <StimulateurDisplay />;
      case "Manuel":
        return (
          <ManuelDisplay
            frequency={defibrillator.manualFrequency}
            chargeProgress={defibrillator.chargeProgress}
            shockCount={defibrillator.shockCount}
            isCharging={defibrillator.isCharging}
            rhythmType={scenario.currentRhythm}
          />
        );
      default:
        return <MonitorDisplay rhythmType={scenario.currentRhythm} />;
    }
  };

  return (
    <div className="min-h-screen bg-#0B1222 flex items-center justify-center p-20 relative">
      {/* Menu déroulant dans le coin supérieur droit */}
      <div className="absolute top-6 right-6 z-50">
        <DropdownMenu
          onMenuItemSelect={handleMenuItemSelect}
          onScenarioSelect={scenario.handleScenarioSelect}
        />
      </div>

      {/* Popup de scénario en attente */}
      <ScenarioModal
        isOpen={scenario.showScenarioModal}
        onClose={() => scenario.closeScenarioModal()}
        scenarioId={scenario.selectedScenarioForModal}
        onStartScenario={scenario.handleStartScenarioFromModal}
      />

      {/* Popup de scénario */}
      {scenario.currentScenario && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-40 bg-white rounded-lg shadow-lg p-3 w-72">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-gray-800">
              Scénario 1 - Étape {scenario.currentStep}/
              {scenario.scenario1Steps.length}
            </h2>
            <button
              onClick={() => scenario.toggleStepHelp()}
              className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
            >
              <HelpCircle size={14} />
            </button>
          </div>

          <div className="mb-2">
            <h3 className="font-medium text-gray-700 text-xs mb-1">
              {scenario.scenario1Steps[scenario.currentStep]?.title}
            </h3>

            {scenario.showStepHelp && (
              <div className="bg-blue-50 border-l-2 border-blue-400 p-2 rounded text-xs">
                <p className="text-blue-800">
                  {scenario.scenario1Steps[scenario.currentStep]?.description}
                </p>
              </div>
            )}
          </div>

          {/* Bouton Valider pour les étapes 2 et 3 */}
          {(scenario.currentStep === 1 || scenario.currentStep === 2) && (
            <div className="mb-2">
              <button
                onClick={scenario.handleManualValidation}
                className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded transition-colors"
              >
                Valider cette étape
              </button>
            </div>
          )}

          {/* Barre de progression */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${(scenario.currentStep / scenario.scenario1Steps.length) * 100}%`,
              }}
            ></div>
          </div>

          <div className="text-xs text-gray-500">
            {scenario.currentStep}/{scenario.scenario1Steps.length} étapes
            complétées
          </div>
        </div>
      )}

      {/* Popup de fin de scénario */}
      {scenario.showScenarioComplete && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-green-500 text-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Félicitations !</h2>
          <p className="text-lg">Scénario 1 terminé avec succès</p>
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
        className="bg-gray-800 p-8 rounded-3xl"
      >
        <div className="flex gap-8">
          {/* Section principale */}
          <div className="flex-1">
            {/* screen */}
            <div className="bg-black rounded-xl border-4 border-gray-600 h-90 mb-8 relative overflow-hidden">
              {renderScreenContent()}
            </div>

            {/* Container pour boutons + joystick */}
            <div className="flex items-center gap-10 mb-6">
              {/* Colonnes de boutons */}
              <div className="flex-1">
                <div className="flex gap-4 mb-6 items-center justify-center">
                  {[...Array(4)].map((_, i) => (
                    <button
                      key={i}
                      className="w-28 h-14 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 p-4 rounded-lg border-2 border-gray-500 transition-all touch-manipulation"
                    ></button>
                  ))}
                </div>

                {/* 4 boutons du bas */}
                <div className="flex gap-4 items-center justify-center">
                  <button className="w-28 h-14 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 p-4 rounded-lg border-2 border-gray-500 transition-all flex items-center justify-center touch-manipulation">
                    <Triangle className="w-7 h-7 text-white" />
                  </button>
                  <button className="w-28 h-14 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 p-4 rounded-lg border-2 border-gray-500 transition-all flex items-center justify-center touch-manipulation">
                    <FlagTriangleRight className="w-7 h-7 text-white" />
                  </button>
                  <button className="w-28 h-14 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 p-4 rounded-lg border-2 border-gray-500 transition-all flex items-center justify-center touch-manipulation">
                    <CopyMinus className="w-6 h-6 text-white" />
                  </button>
                  <button className="w-28 h-14 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 p-4 rounded-lg border-2 border-gray-500 transition-all flex items-center justify-center touch-manipulation">
                    <Printer className="w-7 h-7 text-white" />
                  </button>
                </div>
              </div>

              {/* Joystick */}
              <Joystick onPositionChange={handleJoystickPositionChange} />
            </div>
          </div>

          {/* Côté droit */}
          <div className="w-80 bg-gray-700 rounded-xl p-4">
            {/* Bouton rotatif */}
            <div className="relative flex flex-col items-center">
              <div className="-mt-0">
                <RotativeKnob
                  initialValue={0}
                  onValueChange={handleRotaryValueChange}
                />
              </div>
            </div>

            {/* Boutons colorés */}
            <div className="space-y-4 mt-18">
              {/* white */}
              <Synchro/>

              {/* Jaune - Charge */}
              <div className="flex items-center gap-4">
                <span className="text-white text-2xl font-bold">2</span>
                <button
                  className={`flex-1 h-16 rounded-lg transition-all touch-manipulation transform ${
                    defibrillator.isChargeButtonPressed
                      ? "scale-95 bg-yellow-300 border-yellow-200"
                      : defibrillator.selectedChannel === 2
                        ? "bg-yellow-400 border-yellow-300 shadow-lg"
                        : "bg-yellow-500 border-yellow-400 hover:bg-yellow-400 active:bg-yellow-300"
                  }`}
                  onClick={handleChargeButtonClick}
                >
                  <div
                    className={`w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-md flex items-center justify-center relative transition-all ${
                      defibrillator.isChargeButtonPressed
                        ? "from-yellow-300 to-yellow-400"
                        : ""
                    }`}
                  >
                    <div className="absolute left-2">
                      <span className="text-black text-xs font-bold">
                        Charge
                      </span>
                    </div>
                    <div className="w-10 h-10 border-3 border-yellow-800 rounded-lg"></div>
                  </div>
                </button>
              </div>

              {/* Orange - Choc */}
              <div className="flex items-center gap-4">
                <span className="text-white text-2xl font-bold">3</span>
                <button
                  className={`flex-1 h-16 rounded-lg transition-all touch-manipulation transform ${
                    defibrillator.isShockButtonPressed
                      ? "scale-95 bg-orange-300 border-orange-200"
                      : defibrillator.selectedChannel === 3
                        ? "bg-orange-400 border-orange-300 shadow-lg"
                        : defibrillator.displayMode === "DAE" &&
                            daePhase === "attente_choc"
                          ? "bg-orange-500 border-orange-400 hover:bg-orange-400 active:bg-orange-300 animate-pulse shadow-lg shadow-orange-500/50"
                          : defibrillator.displayMode === "DAE" &&
                              daePhase !== "attente_choc"
                            ? "bg-gray-500 border-gray-400 cursor-not-allowed opacity-50"
                            : "bg-orange-500 border-orange-400 hover:bg-orange-400 active:bg-orange-300"
                  }`}
                  onClick={handleShockButtonClick}
                  disabled={
                    defibrillator.displayMode === "DAE" &&
                    daePhase !== "attente_choc"
                  }
                >
                  <div
                    className={`w-full h-full bg-gradient-to-r rounded-md flex items-center justify-center relative transition-all ${
                      defibrillator.isShockButtonPressed
                        ? "from-orange-300 to-orange-400"
                        : defibrillator.displayMode === "DAE" &&
                            daePhase === "attente_choc"
                          ? "from-orange-400 to-orange-500"
                          : defibrillator.displayMode === "DAE" &&
                              daePhase !== "attente_choc"
                            ? "from-gray-400 to-gray-500"
                            : "from-orange-400 to-orange-500"
                    }`}
                  >
                    <div className="absolute left-2">
                      <span
                        className={`text-xs font-bold ${
                          defibrillator.displayMode === "DAE" &&
                          daePhase !== "attente_choc"
                            ? "text-gray-300"
                            : "text-black"
                        }`}
                      >
                        Choc
                      </span>
                    </div>
                    <div
                      className={`w-10 h-10 border-3 rounded-full flex items-center justify-center ${
                        defibrillator.displayMode === "DAE" &&
                        daePhase !== "attente_choc"
                          ? "border-gray-700"
                          : "border-orange-800"
                      }`}
                    >
                      <Zap
                        className={`w-6 h-6 ${
                          defibrillator.displayMode === "DAE" &&
                          daePhase !== "attente_choc"
                            ? "text-gray-300"
                            : "text-white"
                        }`}
                      />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefibInterface;
