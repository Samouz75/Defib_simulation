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
import Joystick from "./components/buttons/Joystick";
import RotativeKnob from "./components/buttons/RotativeKnob";

const DefibInterface: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [heartRate, setHeartRate] = useState(75);
  const [displayMode, setDisplayMode] = useState<"DAE" | "ARRET" | "Moniteur" | "Stimulateur">(
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

  const handleRotaryValueChange = (value: number) => {
    console.log("Rotary value:", value);
    // space to add logic about rotary value changes
  };

  const renderScreenContent = () => {
    switch (displayMode) {
      case "ARRET":
        return <ARRETDisplay />;
      case "DAE":
        return <DAEDisplay />;
      case "Moniteur":
        return <MonitorDisplay />;
      case "Stimulateur":
        return <StimulateurDisplay />;
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
                selectedMode={displayMode}
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
