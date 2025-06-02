'use client'

import React, { useState, useRef, useEffect } from 'react';
import { FlagTriangleRight, Triangle, CopyMinus, Printer, Zap } from 'lucide-react';

const defibinterface: React.FC = () => {
  const [rotaryValue, setRotaryValue] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [joystickPosition, setJoystickPosition] = useState<'center' | 'up' | 'down' | 'left' | 'right'>('center');
  const [isJoystickDragging, setIsJoystickDragging] = useState(false);
  const rotaryRef = useRef<HTMLDivElement>(null);
  const joystickRef = useRef<HTMLDivElement>(null);

  // Gestion bouton rotatif
  const handleRotaryMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleRotaryMove = (e: MouseEvent) => {
    if (!isDragging || !rotaryRef.current) return;

    const rect = rotaryRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
    
    // Mapp l'angle aux valeurs (0-200)
    const value = Math.round((degrees / 360) * 200);
    setRotaryValue(Math.max(0, Math.min(200, value)));
  };

  // Gestion du joystick
  const handleJoystickMouseDown = (e: React.MouseEvent) => {
    setIsJoystickDragging(true);
    e.preventDefault();
  };

  const handleJoystickMove = (e: MouseEvent) => {
    if (!isJoystickDragging || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // Zone morte au centre
    const deadZone = 15;
    
    if (Math.abs(deltaX) < deadZone && Math.abs(deltaY) < deadZone) {
      setJoystickPosition('center');
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Mouvement horizontal dominant
      setJoystickPosition(deltaX > 0 ? 'right' : 'left');
    } else {
      // Mouvement vertical dominant
      setJoystickPosition(deltaY > 0 ? 'down' : 'up');
    }
  };

  const handleJoystickMouseUp = () => {
    setIsJoystickDragging(false);
    setJoystickPosition('center'); // Retour au centre
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleRotaryMove);
      document.addEventListener('mouseup', () => setIsDragging(false));
      return () => {
        document.removeEventListener('mousemove', handleRotaryMove);
        document.removeEventListener('mouseup', () => setIsDragging(false));
      };
    }
  }, [isDragging]);

  useEffect(() => {
    if (isJoystickDragging) {
      document.addEventListener('mousemove', handleJoystickMove);
      document.addEventListener('mouseup', handleJoystickMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleJoystickMove);
        document.removeEventListener('mouseup', handleJoystickMouseUp);
      };
    }
  }, [isJoystickDragging]);

  // Calcul rotation du bouton
  const rotationAngle = (rotaryValue / 200) * 360 - 90;

  // Calcul position du joystick
  const getJoystickOffset = () => {
    const offset = 15; // pixels de déplacement
    switch (joystickPosition) {
      case 'up': return { x: 0, y: -offset };
      case 'down': return { x: 0, y: offset };
      case 'left': return { x: -offset, y: 0 };
      case 'right': return { x: offset, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const joystickOffset = getJoystickOffset();

  return (
    <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-4xl mx-auto shadow-2xl mt-35">
      <div className="flex gap-6">
        {/* Section principale */}
        <div className="flex-1">
          {/* Écran principal */}
          <div className="bg-gray-700 rounded-lg border-4 border-gray-600 h-64 mb-6 relative overflow-hidden">
            <div className="absolute inset-2 bg-gray-900 rounded">
              <div className="h-full flex items-center justify-center text-green-400 text-lg font-mono">
                NIVEAU: {rotaryValue}
              </div>
            </div>
          </div>

          {/* Container pour boutons + joystick */}
          <div className="flex items-center gap-8 mb-4">
            {/* Colonnes de boutons */}
            <div className="flex-1">
              {/* button transparents */}
              <div className="flex gap-3 mb-4 items-center justify-center">
                <button className="w-20 h-10 bg-gray-600 hover:bg-gray-500 p-3 rounded border-2 border-gray-500 transition-all">
                </button>
                <button className="w-20 h-10 bg-gray-600 hover:bg-gray-500 p-3 rounded border-2 border-gray-500 transition-all">
                </button>
                <button className="w-20 h-10 bg-gray-600 hover:bg-gray-500 p-3 rounded border-2 border-gray-500 transition-all">
                </button>
                <button className="w-20 h-10 bg-gray-600 hover:bg-gray-500 p-3 rounded border-2 border-gray-500 transition-all">
                </button>
              </div>

              {/* 4 buttons du bas */}
              <div className="flex gap-3 items-center justify-center">
                <button className="w-20 h-10 bg-gray-600 hover:bg-gray-500 p-3 rounded border-2 border-gray-500 transition-all flex items-center justify-center">
                  <Triangle className="w-5 h-5 text-white" />
                </button>
                <button className="w-20 h-10 bg-gray-600 hover:bg-gray-500 p-3 rounded border-2 border-gray-500 transition-all flex items-center justify-center">
                  <FlagTriangleRight className="w-5 h-5 text-white" />
                </button>
                <button className="w-20 h-10 bg-gray-600 hover:bg-gray-500 p-3 rounded border-2 border-gray-500 transition-all flex items-center justify-center">
                  <CopyMinus className="w-4 h-4 text-white" />
                </button>
                <button className="w-20 h-10 bg-gray-600 hover:bg-gray-500 p-3 rounded border-2 border-gray-500 transition-all flex items-center justify-center">
                  <Printer className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            {/* joystick */}
            <div className="flex items-center justify-center">
              <div 
                ref={joystickRef}
                className="w-20 h-20 bg-gray-900 rounded-full border-4 border-gray-600 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-all"
                onMouseDown={handleJoystickMouseDown}
              >
                <div 
                  className="w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-700 transition-all duration-150"
                  style={{
                    transform: `translate(${joystickOffset.x}px, ${joystickOffset.y}px)`,
                    backgroundColor: joystickPosition !== 'center' ? '#374151' : '#1f2937'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* right side */}
        <div className="w-80 space-y-4">
          {/* Bouton rotatif */}
          <div className="relative flex flex-col items-center">
            <span className="text-white text-2xl font-bold mb-2 mr-45">1</span>
            <div className="relative">
              
              {/* Graduations et valeurs autour du bouton */}
              <div className="absolute inset-0 w-32 h-32">
                {/* Graduations principales avec valeurs */}
                {[
                  { value: '1-10', angle: -75},
                  { value: '15', angle: -56 },
                  { value: '20', angle: -37 },
                  { value: '30', angle: -18 },
                  { value: '50', angle: 1 },
                  { value: '70', angle: 22 },
                  { value: '100', angle: 45 },
                  { value: '120', angle: 66 },
                  { value: '150', angle: 92 },
                  { value: '170', angle: 114 },
                  { value: '200', angle: 135 }
                ].map(({ value, angle }) => (
                  <div 
                    key={value}
                    className="absolute text-white font-bold"
                    style={{
                      transform: `rotate(${angle}deg) translate(75px) rotate(${-angle}deg)`,
                      transformOrigin: '50% 50%',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-6px',
                      marginTop: '-6px',
                      fontSize: '8px'
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
                      width: '1px',
                      height: '8px',
                      left: '50%',
                      top: '8px',
                      transformOrigin: '50% 56px',
                      transform: `translateX(-0.5px) rotate(${-135 + (i * 15)}deg)`
                    }}
                  />
                ))}
                
                {/* Graduations principales */}
                {[
                  -135, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180, 225
                ].map((angle, i) => (
                  <div
                    key={angle}
                    className="absolute bg-white"
                    style={{
                      width: '2px',
                      height: '12px',
                      left: '50%',
                      top: '6px',
                      transformOrigin: '50% 58px',
                      transform: `translateX(-1px) rotate(${angle}deg)`
                    }}
                  />
                ))}
              </div>

              {/* Zone verte d'arrière-plan */}
              <div className="absolute inset-2 bg-green-500 opacity-20 rounded-full"></div>

              {/* Bouton rotatif principal */}
              <div
                ref={rotaryRef}
                className="relative w-32 h-32  rounded-full border-gray-600  cursor-grab active:cursor-grabbing"
                onMouseDown={handleRotaryMouseDown}
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease'
                }}
              >
                {/* Indicateur principal */}
                <div className="absolute top-2 left-1/2 w-1 h-8 bg-white rounded-full transform -translate-x-1/2 shadow-md"></div>
                
                {/* Centre du bouton avec effet 3D */}
                <div className="absolute inset-6 bg-gradient-to-br from-green,-200 to-green,-400 rounded-full shadow-inner border border-gray-300">
                  <div className="absolute inset-2 bg-gradient-to-br from-green-100 to-green-300 rounded-full">
                    {/* Petit indicateur au centre */}
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* buttons colorés */}
          <div className="space-y-3 mt-25">
            {/* Jaune */}
            <div className="flex items-center gap-3">
              <span className="text-white text-xl font-bold">2</span>
              <button
                className={`flex-1 h-12 rounded border-2 transition-all ${
                  selectedChannel === 2
                    ? 'bg-yellow-400 border-yellow-300 shadow-lg'
                    : 'bg-yellow-500 border-yellow-400 hover:bg-yellow-400'
                }`}
                onClick={() => setSelectedChannel(2)}
              >
                <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-yellow-800 rounded"></div>
                </div>
              </button>
            </div>

            {/* Orange */}
            <div className="flex items-center gap-3">
              <span className="text-white text-xl font-bold">3</span>
              <button
                className={`flex-1 h-12 rounded border-2 transition-all ${
                  selectedChannel === 3
                    ? 'bg-orange-400 border-orange-300 shadow-lg'
                    : 'bg-orange-500 border-orange-400 hover:bg-orange-400'
                }`}
                onClick={() => setSelectedChannel(3)}
              >
                <div className="w-full h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-orange-800 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default defibinterface;