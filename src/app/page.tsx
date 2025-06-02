'use client'

import React, { useState, useRef, useEffect } from 'react';
import { FlagTriangleRight, Triangle, CopyMinus, Printer, Zap } from 'lucide-react';

const defibinterface: React.FC = () => {
  const [rotaryValue, setRotaryValue] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(1);
  const rotaryRef = useRef<HTMLDivElement>(null);

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

  // Calcul rotation du bouton
  const rotationAngle = (rotaryValue / 200) * 360 - 90;

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
              <div className="w-20 h-20 bg-gray-900 rounded-full border-4 border-gray-600 shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-all">
                <div className="w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-700"></div>
              </div>
            </div>
          </div>
        </div>

        {/* right side */}
        <div className="w-80 space-y-4">
          {/* Bouton rotatif */}
          <div className="relative flex flex-col items-center">
            <span className="text-white text-3xl font-bold mb-2">1</span>
            <div className="relative">
              {/* Bouton rotatif principal */}
              <div
                ref={rotaryRef}
                className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-4 border-green-300 shadow-lg cursor-grab active:cursor-grabbing relative"
                onMouseDown={handleRotaryMouseDown}
                style={{
                  transform: `rotate(${rotationAngle}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease'
                }}
              >
                {/* Indicateur */}
                <div className="absolute top-2 left-1/2 w-1 h-6 bg-white rounded-full transform -translate-x-1/2"></div>
                
                {/* Centre du bouton */}
                <div className="absolute inset-4 bg-gradient-to-br from-green-500 to-green-700 rounded-full shadow-inner">
                  <div className="absolute inset-2 bg-gradient-to-br from-green-300 to-green-500 rounded-full"></div>
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