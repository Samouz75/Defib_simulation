"use client";

import React, { useRef, useState } from "react";
import {
  FlagTriangleRight,
  Triangle,
  CopyMinus,
  Printer,
  Zap,
} from "lucide-react";
import ButtonComponent from "./components/buttons/ButtonComponent";
import MonitorDisplay from "./components/ScreenDisplay/MonitorDisplay";
import DAEDisplay from "./components/ScreenDisplay/DAEDisplay";
import ARRETDisplay from "./components/ScreenDisplay/ARRETDisplay";
import StimulateurDisplay from "./components/ScreenDisplay/StimulateurDisplay";
import ManuelDisplay from "./components/ScreenDisplay/ManuelDisplay";
import Joystick from "./components/buttons/Joystick";
import RotativeKnob from "./components/buttons/RotativeKnob";
import { useDefibrillator } from "./hooks/useDefibrillator";
import { useResponsiveScale } from "./hooks/useResponsiveScale";
import { RotaryMappingService } from "./services/RotaryMappingService";

const DefibInterface: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = useResponsiveScale();
  const defibrillator = useDefibrillator();

  // État pour la synchronisation avec le DAE
  const [daePhase, setDaePhase] = useState<'placement' | 'analyse' | 'charge' | 'attente_choc' | null>(null);
  const [daeShockFunction, setDaeShockFunction] = useState<(() => void) | null>(null);

  // Event handlers
  const handleJoystickPositionChange = (
    position: "center" | "up" | "down" | "left" | "right",
  ) => {
    console.log("Joystick position:", position);
    // space to add logic about position changes
  };

  const handleRotaryValueChange = (value: number) => {
    console.log("Rotary value:", value);
    
    const newFrequency = RotaryMappingService.mapRotaryToFrequency(value);
    defibrillator.setManualFrequency(newFrequency);
    
    console.log(`Rotary: ${value}° -> Frequency: ${newFrequency} BPM`);
  };

  const handleChargeButtonClick = () => {
    defibrillator.setSelectedChannel(2);
    if (defibrillator.displayMode === "Manuel") {
      defibrillator.startCharging();
    }
  };

  const handleShockButtonClick = () => {
    defibrillator.setSelectedChannel(3);
    
    if (defibrillator.displayMode === "DAE") {
      // En mode DAE, utiliser la fonction de choc du DAE si disponible
      if (daePhase === 'attente_choc' && daeShockFunction) {
        daeShockFunction();
      }
    } else if (defibrillator.displayMode === "Manuel") {
      // En mode Manuel, utiliser la logique existante
      defibrillator.deliverShock();
    }
  };

  // Callbacks pour le DAE
  const handleDaePhaseChange = (phase: 'placement' | 'analyse' | 'charge' | 'attente_choc') => {
    setDaePhase(phase);
  };

  const handleDaeShockReady = (shockFunction: (() => void) | null) => {
    setDaeShockFunction(() => shockFunction);
  };

  const renderScreenContent = () => {
    switch (defibrillator.displayMode) {
      case "ARRET":
        return <ARRETDisplay />;
      case "DAE":
        return <DAEDisplay 
          frequency={defibrillator.manualFrequency} 
          chargeProgress={defibrillator.chargeProgress} 
          shockCount={defibrillator.shockCount} 
          isCharging={defibrillator.isCharging}
          onPhaseChange={handleDaePhaseChange}
          onShockReady={handleDaeShockReady}
        />;
      case "Moniteur":
        return (
          <div className="relative w-full h-full">
            <MonitorDisplay />
            <div className="absolute top-[52.5%] right-4 text-xs font-bold text-green-400">
              <span>Rythme sinusal</span>
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
          />
        );
      default:
        return <MonitorDisplay />;
    }
  };

  return (
    <div className="min-h-screen bg-#0B1222 flex items-center justify-center p-20">
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
          <div className="w-100 bg-gray-700 rounded-xl p-4">
            {/* Bouton rotatif */}
            <div className="relative flex flex-col items-center">
              <ButtonComponent
                onButton1Click={() => defibrillator.setDisplayMode("DAE")}
                onButton2Click={() => defibrillator.setDisplayMode("ARRET")}
                onButton3Click={() => defibrillator.setDisplayMode("Moniteur")}
                onButton4Click={() => defibrillator.setDisplayMode("Stimulateur")}
                selectedMode={
                  defibrillator.displayMode as "DAE" | "ARRET" | "Moniteur" | "Stimulateur"
                }
              />
              <RotativeKnob
                initialValue={-90}
                onValueChange={handleRotaryValueChange}
              />
            </div>

            {/* Boutons colorés */}
            <div className="space-y-4 mt-26">
              {/* white */}
              <div className="flex items-center gap-4">
                <div className="flex-row">
                  <div className="ml-8 bg-white rounded-md flex center-left w-8 h-6 rounded-lg"></div>
                </div>
                <span className="text-white text-xs font-bold">Synchro</span>
              </div>

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
                        : defibrillator.displayMode === "DAE" && daePhase === 'attente_choc'
                          ? "bg-orange-500 border-orange-400 hover:bg-orange-400 active:bg-orange-300 animate-pulse shadow-lg shadow-orange-500/50"
                          : defibrillator.displayMode === "DAE" && daePhase !== 'attente_choc'
                            ? "bg-gray-500 border-gray-400 cursor-not-allowed opacity-50"
                            : "bg-orange-500 border-orange-400 hover:bg-orange-400 active:bg-orange-300"
                  }`}
                  onClick={handleShockButtonClick}
                  disabled={defibrillator.displayMode === "DAE" && daePhase !== 'attente_choc'}
                >
                  <div
                    className={`w-full h-full bg-gradient-to-r rounded-md flex items-center justify-center relative transition-all ${
                      defibrillator.isShockButtonPressed
                        ? "from-orange-300 to-orange-400"
                        : defibrillator.displayMode === "DAE" && daePhase === 'attente_choc'
                          ? "from-orange-400 to-orange-500"
                          : defibrillator.displayMode === "DAE" && daePhase !== 'attente_choc'
                            ? "from-gray-400 to-gray-500"
                            : "from-orange-400 to-orange-500"
                    }`}
                  >
                    <div className="absolute left-2">
                      <span className={`text-xs font-bold ${
                        defibrillator.displayMode === "DAE" && daePhase !== 'attente_choc'
                          ? "text-gray-300"
                          : "text-black"
                      }`}>
                        Choc
                      </span>
                    </div>
                    <div className={`w-10 h-10 border-3 rounded-full flex items-center justify-center ${
                      defibrillator.displayMode === "DAE" && daePhase !== 'attente_choc'
                        ? "border-gray-700"
                        : "border-orange-800"
                    }`}>
                      <Zap className={`w-6 h-6 ${
                        defibrillator.displayMode === "DAE" && daePhase !== 'attente_choc'
                          ? "text-gray-300"
                          : "text-white"
                      }`} />
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
