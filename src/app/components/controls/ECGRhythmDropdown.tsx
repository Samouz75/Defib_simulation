import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Heart, Activity, Zap, Ruler, ChevronsUp, TrendingUpDown, Minus } from 'lucide-react';
import type { RhythmType } from '../graphsdata/ECGRhythms';

interface ECGRhythmDropdownProps {
  currentRhythm: RhythmType;
  onRhythmChange: (rhythm: RhythmType) => void;
  isScenarioActive: boolean;
  heartRate: number;
  onHeartRateChange: (rate: number) => void;
}

const ECGRhythmDropdown: React.FC<ECGRhythmDropdownProps> = ({
  currentRhythm,
  onRhythmChange,
  isScenarioActive,
  heartRate,
  onHeartRateChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const rhythmOptions = [
    {
      type: 'sinus' as RhythmType,
      label: 'Rythme sinusal',
      icon: <Heart className="w-4 h-4" />,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Normal',
    },
    {
      type: 'fibrillationVentriculaire' as RhythmType,
      label: 'Fibrillation ventriculaire',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Chaotique',
    },
    {
      type: 'asystole' as RhythmType,
      label: 'Asystolie',
      icon: <Minus className="w-4 h-4" />,
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Plat',
    },
    {
      type: 'tachycardie' as RhythmType,
      label: 'Tachycardie',
      icon: <ChevronsUp className="w-4 h-4" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Accéléré',
    },
    {
      type: 'fibrillationAtriale' as RhythmType,
      label: 'Fibrillation atriale',
      icon: <TrendingUpDown className="w-4 h-4" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Accéléré et irrégulier',
    },
  ];

  const handleRhythmSelect = (rhythm: RhythmType) => {
    onRhythmChange(rhythm);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !isScenarioActive && setIsOpen(!isOpen)}
        disabled={isScenarioActive}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border 
          transition-colors duration-200 shadow-lg ${isScenarioActive
            ? 'bg-gray-600 border-gray-500 text-gray-300 cursor-not-allowed opacity-70'
            : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
        }`}
      >
        <Ruler className="w-4 h-4" />
        <span className="text-sm font-medium whitespace-nowrap">
          {rhythmOptions.find((opt) => opt.type === currentRhythm)?.label ||
            'Sélectionner Rythme'}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && !isScenarioActive && (
        <div className="absolute left-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="py-2">
            <h3 className="text-white text-xs font-bold mb-2 px-4 flex items-center gap-2">
              <Activity className="w-3 h-3 text-blue-400" />
              Contrôle du rythme ECG
            </h3>
            {rhythmOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleRhythmSelect(option.type)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 ${currentRhythm === option.type
                  ? `${option.color} ring-2 ring-white ring-opacity-50 shadow-md`
                  : `text-white hover:bg-gray-700`
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
                <span className="ml-auto text-xs opacity-75">
                  {option.description}
                </span>
              </button>
            ))}

            {currentRhythm === 'sinus' && (
              <div className="mt-4 p-3 bg-gray-700 rounded-lg border border-gray-600 mx-2 mb-2">
                <h4 className="text-white text-xs font-bold mb-2 flex items-center gap-2">
                  <Heart className="w-3 h-3 text-red-400" />
                  Fréquence cardiaque
                </h4>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>30 bpm</span>
                    <span className="font-bold text-white">{heartRate} bpm</span>
                    <span>170 bpm</span>
                  </div>

                  <input
                    type="range"
                    min="30"
                    max="170"
                    value={heartRate}
                    onChange={(e) => onHeartRateChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background:
                        `linear-gradient(to right, #ef4444 0%, #f59e0b ${((heartRate - 30) / 150) * 100}%, #374151 ${((heartRate - 30) / 150) * 100}%, #374151 100%)`,
                    }}
                  />

                  <div className="flex justify-between text-xs ml-1 mr-1 gap-2 text-gray-400">
                    <span>Bradycardie</span>
                    <span>Normal</span>
                    <span>Tachycardie</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ECGRhythmDropdown; 