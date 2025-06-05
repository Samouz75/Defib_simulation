"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FlagTriangleRight,
  Triangle,
  CopyMinus,
  Printer,
  Zap,
} from "lucide-react";
import ButtonComponent from "./components/ButtonComponent";
import MonitorDisplay from "./components/MonitorDisplay";
import DAEDisplay from "./components/DAEDisplay";
import ARRETDisplay from "./components/ARRETDisplay";
import StimulateurDisplay from "./components/StimulateurDisplay";

const DefibInterface: React.FC = () => {
  const [rotaryValue, setRotaryValue] = useState(-90);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [joystickPosition, setJoystickPosition] = useState<
    "center" | "up" | "down" | "left" | "right"
  >("center");
  const [isJoystickDragging, setIsJoystickDragging] = useState(false);
  const rotaryRef = useRef<HTMLDivElement>(null);
  const joystickRef = useRef<HTMLDivElement>(null);
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

  // Fonction utilitaire pour extraire les coordonnées d'un événement (souris ou tactile)
  const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      // Événement tactile
      const touch = e.touches[0] || e.changedTouches[0];
      return { clientX: touch.clientX, clientY: touch.clientY };
    } else {
      // Événement souris
      return { clientX: e.clientX, clientY: e.clientY };
    }
  };

  // === GESTION DU BOUTON ROTATIF ===
  const handleRotaryMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleRotaryTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleRotaryMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !rotaryRef.current) return;

    const { clientX, clientY } = getEventCoordinates(e);
    const rect = rotaryRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    const degrees = ((angle * 180) / Math.PI + 90 + 360) % 360;

    const value = Math.round(degrees);
    setRotaryValue(Math.max(0, Math.min(360, value)));
  };

  const handleRotaryEnd = () => {
    setIsDragging(false);
  };

  // === GESTION DU JOYSTICK ===
  const handleJoystickMouseDown = (e: React.MouseEvent) => {
    setIsJoystickDragging(true);
    e.preventDefault();
  };

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    setIsJoystickDragging(true);
    e.preventDefault();
  };

  const handleJoystickMove = (e: MouseEvent | TouchEvent) => {
    if (!isJoystickDragging || !joystickRef.current) return;

    const { clientX, clientY } = getEventCoordinates(e);
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    const deadZone = 15;

    if (Math.abs(deltaX) < deadZone && Math.abs(deltaY) < deadZone) {
      setJoystickPosition("center");
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setJoystickPosition(deltaX > 0 ? "right" : "left");
    } else {
      setJoystickPosition(deltaY > 0 ? "down" : "up");
    }
  };

  const handleJoystickEnd = () => {
    setIsJoystickDragging(false);
    setJoystickPosition("center");
  };

  // === EFFET POUR LES ÉVÉNEMENTS GLOBAUX ===
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleRotaryMove(e);
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Empêche le scroll sur mobile
        handleRotaryMove(e);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleRotaryEnd);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleRotaryEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleRotaryEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleRotaryEnd);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    if (isJoystickDragging) {
      const handleMouseMove = (e: MouseEvent) => handleJoystickMove(e);
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Empêche le scroll sur mobile
        handleJoystickMove(e);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleJoystickEnd);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleJoystickEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleJoystickEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleJoystickEnd);
      };
    }
  }, [isJoystickDragging]);

  const rotationAngle = rotaryValue;

  const getJoystickOffset = () => {
    const offset = 20;
    switch (joystickPosition) {
      case "up":
        return { x: 0, y: -offset };
      case "down":
        return { x: 0, y: offset };
      case "left":
        return { x: -offset, y: 0 };
      case "right":
        return { x: offset, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const joystickOffset = getJoystickOffset();

  // Fonctions de gestion des boutons du ButtonComponent
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

  // Fonction pour rendre le contenu de l'écran selon le mode
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
            {/* Écran principal */}

            {/* screen divised in 6 rows */}
            <div className="bg-black  rounded-xl border-4 border-gray-600 h-90 mb-8 relative overflow-hidden">
              {renderScreenContent()}
            </div>

            {/* Container pour boutons + joystick */}
            <div className="flex items-center gap-10 mb-6">
              {/* Colonnes de boutons */}
              <div className="flex-1">
                {/* Boutons transparents */}
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
              <div className="flex items-center justify-center">
                <div
                  ref={joystickRef}
                  className="w-28 h-28 bg-gray-900 rounded-full border-4 border-gray-600 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-all touch-manipulation select-none"
                  onMouseDown={handleJoystickMouseDown}
                  onTouchStart={handleJoystickTouchStart}
                  style={{ touchAction: "none" }}
                >
                  <div
                    className="w-10 h-10 bg-gray-800 rounded-full border-2 border-gray-700 transition-all duration-150"
                    style={{
                      transform: `translate(${joystickOffset.x}px, ${joystickOffset.y}px)`,
                      backgroundColor:
                        joystickPosition !== "center" ? "#374151" : "#1f2937",
                    }}
                  ></div>
                </div>
              </div>
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
              <div className="relative mt-6">
                {/* Graduations et valeurs autour du bouton */}
                <div className="absolute inset-0 w-40 h-40">
                  {/* Graduations principales avec valeurs */}
                  {[
                    { value: "1-10", angle: -75 },
                    { value: "15", angle: -56 },
                    { value: "20", angle: -37 },
                    { value: "30", angle: -18 },
                    { value: "50", angle: 1 },
                    { value: "70", angle: 22 },
                    { value: "100", angle: 45 },
                    { value: "120", angle: 66 },
                    { value: "150", angle: 92 },
                    { value: "170", angle: 114 },
                    { value: "200", angle: 135 },
                  ].map(({ value, angle }) => (
                    <div
                      key={value}
                      className="absolute text-white font-bold"
                      style={{
                        transform: `rotate(${angle}deg) translate(95px) rotate(${-angle}deg)`,
                        transformOrigin: "50% 50%",
                        left: "50%",
                        top: "50%",
                        marginLeft: "-8px",
                        marginTop: "-8px",
                        fontSize: "10px",
                      }}
                    >
                      {value}
                    </div>
                  ))}

                  {/* Petites graduations */}
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute bg-gray-400"
                      style={{
                        width: "1.5px",
                        height: "10px",
                        left: "50%",
                        top: "10px",
                        transformOrigin: "50% 70px",
                        transform: `translateX(-0.75px) rotate(${-135 + i * 15}deg)`,
                      }}
                    />
                  ))}

                  {/* Graduations principales */}
                  {[-135, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180, 225].map(
                    (angle, i) => (
                      <div
                        key={angle}
                        className="absolute bg-white"
                        style={{
                          width: "3px",
                          height: "15px",
                          left: "50%",
                          top: "8px",
                          transformOrigin: "50% 72px",
                          transform: `translateX(-1.5px) rotate(${angle}deg)`,
                        }}
                      />
                    ),
                  )}
                </div>

                {/* Zone verte d'arrière-plan */}
                <div className="absolute inset-3 bg-green-500 opacity-20 rounded-full"></div>

                {/* Bouton rotatif principal */}
                <div
                  ref={rotaryRef}
                  className="relative w-40 h-40 rounded-full border-gray-600 cursor-grab active:cursor-grabbing touch-manipulation select-none"
                  onMouseDown={handleRotaryMouseDown}
                  onTouchStart={handleRotaryTouchStart}
                  style={{
                    transform: `rotate(${rotationAngle}deg)`,
                    transition: isDragging ? "none" : "transform 0.1s ease",
                    touchAction: "none",
                  }}
                >
                  {/* Indicateur principal */}
                  <div className="absolute top-3 left-1/2 w-1.5 h-10 bg-white rounded-full transform -translate-x-1/2 shadow-md"></div>

                  {/* Centre du bouton avec effet 3D */}
                  <div className="absolute inset-8 bg-gradient-to-br from-green-200 to-green-400 rounded-full shadow-inner border border-gray-300">
                    <div className="absolute inset-3 bg-gradient-to-br from-green-100 to-green-300 rounded-full">
                      {/* Petit indicateur au centre */}
                      <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
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
