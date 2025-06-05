"use client";

import React, { useState, useRef, useEffect } from "react";
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

const DefibInterface: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [heartRate, setHeartRate] = useState(75);
  const [manualFrequency, setManualFrequency] = useState(60); // Fréquence pour le mode manuel
  const [displayMode, setDisplayMode] = useState<"DAE" | "ARRET" | "Moniteur" | "Stimulateur" | "Manuel">(
    "ARRET",
  );

  useEffect(() => {
    const calculateScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const baseWidth = 1600;
      const baseHeight = 1100;

      const scaleX = (windowWidth - 40) / baseWidth;
      const scaleY = (windowHeight - 40) / baseHeight;

      const newScale = Math.min(scaleX, scaleY, 1.2);

      setScale(Math.max(newScale, 0.4));
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);

    return () => window.removeEventListener("resize", calculateScale);
  }, []);

  const handleDAEClick = () => {
    setDisplayMode("DAE");
  };

  const handleARRETClick = () => {
    setDisplayMode("ARRET");
  };

  const handleMoniteurClick = () => {
    setDisplayMode("Moniteur");
  };

  const handleStimulateurClick = () => {
    setDisplayMode("Stimulateur");
  };

  const handleJoystickPositionChange = (position: "center" | "up" | "down" | "left" | "right") => {
    console.log("Joystick position:", position);
    // space to add logic about position changes 
  };

  // Fonction pour mapper la valeur du rotary (0-360°) vers la fréquence (1-200 BPM)
  const mapRotaryToFrequency = (rotaryValue: number): number => {
    // Points de référence basés sur les graduations existantes
    const mappingPoints = [
      { angle: -75, frequency: 5 },   // "1-10" -> on prend 5 comme moyenne
      { angle: -56, frequency: 15 },
      { angle: -37, frequency: 20 },
      { angle: -18, frequency: 30 },
      { angle: 1, frequency: 50 },
      { angle: 22, frequency: 70 },
      { angle: 45, frequency: 100 },
      { angle: 66, frequency: 120 },
      { angle: 92, frequency: 150 },
      { angle: 114, frequency: 170 },
      { angle: 135, frequency: 200 },
    ];

    // Convertir la valeur rotary (0-360) en angle relatif (-90 à +270)
    const angle = rotaryValue - 90;

    // Si l'angle est avant le premier point, retourner la fréquence minimale
    if (angle <= mappingPoints[0].angle) {
      return mappingPoints[0].frequency;
    }

    // Si l'angle est après le dernier point, retourner la fréquence maximale
    if (angle >= mappingPoints[mappingPoints.length - 1].angle) {
      return mappingPoints[mappingPoints.length - 1].frequency;
    }

    // Interpolation linéaire entre les points
    for (let i = 0; i < mappingPoints.length - 1; i++) {
      const point1 = mappingPoints[i];
      const point2 = mappingPoints[i + 1];

      if (angle >= point1.angle && angle <= point2.angle) {
        // Interpolation linéaire
        const ratio = (angle - point1.angle) / (point2.angle - point1.angle);
        const frequency = point1.frequency + ratio * (point2.frequency - point1.frequency);
        return Math.round(frequency);
      }
    }

    return 60; // Valeur par défaut
  };

  const handleRotaryValueChange = (value: number) => {
    console.log("Rotary value:", value);
    
    // Calculer la nouvelle fréquence basée sur la valeur du rotary
    const newFrequency = mapRotaryToFrequency(value);
    setManualFrequency(newFrequency);
    
    // Basculer automatiquement en mode Manuel (Option A)
    if (displayMode !== "Manuel") {
      setDisplayMode("Manuel");
    }
    
    console.log(`Rotary: ${value}° -> Frequency: ${newFrequency} BPM`);
  };

  const renderScreenContent = () => {
    switch (displayMode) {
      case "ARRET":
        return <ARRETDisplay />;
      case "DAE":
        return <DAEDisplay />;
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
        return <ManuelDisplay frequency={manualFrequency} />;
      default:
        return <MonitorDisplay />
        ;
        
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
          <div className="flex-1  ">

            {/* screen */}
            <div className="bg-black  rounded-xl border-4 border-gray-600 h-90 mb-8 relative overflow-hidden">
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
            <div className="relative flex flex-col items-center ">
              <ButtonComponent
                onButton1Click={handleDAEClick}
                onButton2Click={handleARRETClick}
                onButton3Click={handleMoniteurClick}
                onButton4Click={handleStimulateurClick}
                selectedMode={displayMode as "DAE" | "ARRET" | "Moniteur" | "Stimulateur"}
              />
              <RotativeKnob 
                initialValue={-90}
                onValueChange={handleRotaryValueChange}
              />
            </div>

            {/* Boutons colorés */}
            <div className="space-y-4 mt-26">
              {/* white */}
              <div className="flex items-center gap-4  ">
                <div className="flex-row">
                <div className=" ml-8 bg-white rounded-md flex center-left w-8 h-6 rounded-lg"></div>
              </div>
              <span className="text-white text-xs font-bold">Synchro</span>
              </div>

              {/* Jaune */}
              <div className="flex items-center gap-4">
                <span className="text-white text-2xl font-bold">2</span>
                <button
                  className={`flex-1 h-16 rounded-lg border-3 transition-all touch-manipulation ${
                    selectedChannel === 2
                      ? "bg-yellow-400 border-yellow-300 shadow-lg"
                      : "bg-yellow-500 border-yellow-400 hover:bg-yellow-400 active:bg-yellow-300"
                  }`}
                  onClick={() => setSelectedChannel(2)}
                >
                  
                  <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-md flex items-center justify-center relative">
                    <div className="absolute left-2">
                      <span className="text-black text-xs font-bold">Charge</span>
                    </div>
                    <div className="w-10 h-10 border-3 border-yellow-800 rounded-lg"></div>
                  </div>
                </button>
              </div>

              {/* Orange */}
              <div className="flex items-center gap-4">
                <span className="text-white text-2xl font-bold">3</span>
                <button
                  className={`flex-1 h-16 rounded-lg border-3 transition-all touch-manipulation ${
                    selectedChannel === 3
                      ? "bg-orange-400 border-orange-300 shadow-lg"
                      : "bg-orange-500 border-orange-400 hover:bg-orange-400 active:bg-orange-300"
                  }`}
                  onClick={() => setSelectedChannel(3)}
                >
                  <div className="w-full h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-md flex items-center justify-center relative">
                    <div className="absolute left-2">
                      <span className="text-black text-xs font-bold">Choc</span>
                    </div>
                    <div className="w-10 h-10 border-3 border-orange-800 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
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
