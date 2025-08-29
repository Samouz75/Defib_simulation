import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { RhythmType } from './graphsdata/ECGRhythms';
import { useAlarms } from '../hooks/useAlarms';
import { useAudio } from '../context/AudioContext';

interface VitalsDisplayProps {
  bloodPressure?: { systolic: number; diastolic: number; map?: number };
  rhythmType: RhythmType;
  heartRate: number;
  showFCValue: boolean;
  onShowFCValueChange: (show: boolean) => void;
  showVitalSigns: boolean;
  onShowVitalSignsChange: (show: boolean) => void;
  isScenario4?: boolean;
  isScenario1Completed?: boolean;
}

const VitalsDisplay: React.FC<VitalsDisplayProps> = ({
  rhythmType,
  heartRate,
  showFCValue,
  bloodPressure,
  onShowFCValueChange,
  showVitalSigns,
  onShowVitalSignsChange,
  isScenario4 = false,
  isScenario1Completed = false,
}) => {
  const [fibBlink, setFibBlink] = useState(false);

  // 🛠️ Utilise la version du hook synchronisée sur la FC clinique (heartRate)
  const alarms = useAlarms(rhythmType, showFCValue, heartRate);

  // --- PNI / Mesure séquentielle ---
  const [showPNIValues, setShowPNIValues] = useState(false);
  const [selectedFrequencePNI, setSelectedFrequencePNI] = useState('Manuel');

  const [isBPMeasuring, setIsBPMeasuring] = useState(false);
  const [bpStepValue, setBpStepValue] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const audioService = useAudio();

  const computeMAP = (sys?: number, dia?: number, map?: number) => {
    if (typeof map === 'number') return Math.round(map);
    if (typeof sys === 'number' && typeof dia === 'number') {
      return Math.round(dia + (sys - dia) / 3);
    }
    return undefined;
  };

  // Blink pour Fib
  useEffect(() => {
    if (rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale') {
      const i = setInterval(() => setFibBlink((p) => !p), 500);
      return () => clearInterval(i);
    }
  }, [rhythmType]);

  // Scénario 4 : afficher la TA d’emblée
  useEffect(() => {
    if (isScenario4) setShowPNIValues(true);
  }, [isScenario4]);

  // Nettoyage intervalle au démontage
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      try { audioService.stopCuffInflation?.(); } catch {}
    };
  }, [audioService]);

  // Gèle l’UI globale pendant la prise de TA pour supprimer le zoom/dézoom
useEffect(() => {
  const cls = 'bp-freeze';
  const target = document.body; // ou un conteneur #simulator-root si tu en as un
  if (isBPMeasuring) target.classList.add(cls);
  else target.classList.remove(cls);
  return () => target.classList.remove(cls); // nettoyage si unmount
}, [isBPMeasuring]);

  // Lance la mesure séquentielle (1 “tick” ~ 0.7 s ici)
  const startBPMeasurement = useCallback(() => {
    if (isBPMeasuring) return;
    if (rhythmType === 'fibrillationVentriculaire') return;

    setShowPNIValues(true);
    setIsBPMeasuring(true);
    setBpStepValue(20);
    audioService.playCuffInflation?.();

    let value = 20;
    let phase: 'inflate' | 'deflate' = 'inflate';

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (phase === 'inflate') {
        value += 14;
        if (value >= 180) {
          value = 180;
          setBpStepValue(value);
          phase = 'deflate';
          return;
        }
      } else {
        value -= 12;
        if (value <= 60) {
          value = 60;
          setBpStepValue(value);
          setTimeout(() => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            audioService.stopCuffInflation?.();
            audioService.playBPDone?.();
            setIsBPMeasuring(false);
            setBpStepValue(null);
          }, 700);
          return;
        }
      }
      setBpStepValue(value);
    }, 700);
  }, [audioService, isBPMeasuring, rhythmType]);

  return (
    <div className="h-1/4 border-b border-gray-600 flex items-center text-sm bg-black px-2">
      {/* FC (Fréquence Cardiaque) */}
      <div
        className="flex flex-col items-center w-24 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
        onClick={() => onShowFCValueChange(!showFCValue)}
      >
        {showFCValue && (rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale') ? (
          <div className="flex items-center justify-center -ml-9">
            <div className={`px-5 py-0.2 ${fibBlink ? 'bg-red-600' : 'bg-white'}`}>
              <span className={`text-xs font-bold ${fibBlink ? 'text-white' : 'text-red-600'}`}>
                {rhythmType === 'fibrillationVentriculaire' ? 'Fib.V' : 'Fib.A'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-row items-center gap-x-2">
            <div className="text-gray-400 text-xs">FC</div>
            <div className="text-gray-400 text-xs">bpm</div>
          </div>
        )}
        <div className="flex flex-row items-center gap-x-2">
          <div className="text-green-400 text-4xl font-bold w-[65px] text-center">
            {showFCValue
              ? (rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale')
                // 🛠️ ici on utilise bien le retour du hook:
                ? alarms.heartRate
                : rhythmType === 'asystole'
                  ? '0'
                  : heartRate
              : '--'}
          </div>
          <div className="flex flex-col items-center w-8">
            <div className="text-green-400 text-xs text-center">120</div>
            <div className="text-green-400 text-xs text-center">50</div>
          </div>
        </div>
      </div>

      {/* SpO2 et Pouls */}
      <div
        className="flex flex-row items-center gap-4 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
        onClick={() => onShowVitalSignsChange(!showVitalSigns)}
      >
        {/* SpO2 */}
        <div className="flex flex-col items-center w-28">
          <div className="flex flex-row items-center gap-x-2">
            <div className="text-blue-400 text-2xl font-bold">SpO2</div>
            <div className="text-blue-400 text-xs">%</div>
          </div>
          <div className="flex flex-row items-center gap-x-2">
            <div className="text-blue-400 text-4xl font-bold min-w-[60px] text-center -mt-2">
              {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'tachycardieVentriculaire' || rhythmType === 'asystole'
                ? '--'
                : showVitalSigns
                  ? rhythmType === 'fibrillationAtriale'
                    ? '95'
                    : '92'
                  : '--'}
            </div>
            <div className="flex flex-col items-center w-8">
              <div className="text-blue-400 text-xs">100</div>
              <div className="text-blue-400 text-xs">90</div>
            </div>
          </div>
        </div>

        {/* Pouls */}
        <div className="flex flex-row items-center w-28">
          <div className="flex flex-col items-center">
            <div className="text-blue-400 text-xs">Pouls</div>
            <div className="text-blue-400 text-4xl font-bold min-w-[60px] text-center">
              {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'tachycardieVentriculaire' || rhythmType === 'asystole' || (rhythmType === 'fibrillationAtriale' && !isScenario4)
                ? '--'
                : showVitalSigns
                  ? isScenario1Completed
                    ? Math.max(0, heartRate + (heartRate >= 75 ? -3 : +2))
                    : heartRate
                  : '--'}
            </div>
          </div>
          <div className="flex flex-col items-center w-8 ml-2">
            <div className="text-blue-400 text-xs mb-2">bpm</div>
            <div className="text-blue-400 text-xs">120</div>
            <div className="text-blue-400 text-xs">50</div>
          </div>
        </div>
      </div>

      {/* PNI */}
      <div
        className={`flex flex-col items-center w-45 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors ${isBPMeasuring ? 'animate-pulse' : ''}`}
        onClick={startBPMeasurement}
        role="button"
        title="Prendre la tension"
      >
        <div className="flex flex-row items-center gap-x-2">
          <div className="text-white text-xs font-bold">PNI</div>
          <div className="text-white text-xs font-bold w-12 text-center">
            {selectedFrequencePNI}
          </div>
          <div className="text-white text-xs font-bold">10:20</div>
          <div className="text-white text-xs font-bold">mmHg</div>
        </div>
        <div className="flex flex-row items-center gap-x-1 mt-1">
          {/* GRAND AFFICHAGE : reste '--' pendant la mesure, puis SYS/DIA */}
          <div className="text-white text-4xl min-w-[100px] text-center">
            {rhythmType === 'fibrillationVentriculaire'
              ? '-?-'
              : isBPMeasuring
                ? '--'
                : showPNIValues
                  ? `${bloodPressure?.systolic ?? '--'}/${bloodPressure?.diastolic ?? '--'}`
                  : '--'}
          </div>

          {/* PETIT CHAMP ENTRE PARENTHÈSES : (xx) pendant la mesure, puis (MAP) */}
          <div className="text-white text-xs min-w-[30px] text-center">
            {rhythmType === 'fibrillationVentriculaire'
              ? ''
              : isBPMeasuring && bpStepValue != null
                ? `(${bpStepValue})`
                : showPNIValues
                  ? (() => {
                      const map = computeMAP(bloodPressure?.systolic, bloodPressure?.diastolic, bloodPressure?.map);
                      return map != null ? `(${map})` : '';
                    })()
                  : ''}
          </div>

          <div className="flex flex-col items-center w-8">
            <div className="text-white text-xs">MOY</div>
            <div className="text-white text-xs">110</div>
            <div className="text-white text-xs">50</div>
          </div>
        </div>
      </div>

      {/* CO2 et FR */}
      <div className="flex flex-row items-center gap-x-6 ">
        <div className="flex flex-col items-center w-20">
          <div className="flex flex-row items-center gap-x-1 mb-3">
            <div className="text-white text-xs font-bold">CO2ie</div>
            <div className="text-white text-xs font-bold">mmHg</div>
          </div>
          <div className="flex flex-row items-center">
            <div className="text-yellow-400 text-4xl font-bold min-w-[50px] text-center">
              {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale' ? '-?-' : '--'}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center w-20">
          <div className="flex flex-row items-center gap-x-1">
            <div className="text-white text-xs font-bold">FR</div>
            <div className="text-white text-xs font-bold">rpm</div>
          </div>
          <div className="flex flex-row items-center">
            <div className="text-yellow-400 text-4xl font-bold min-w-[50px] text-center">
              {rhythmType === 'fibrillationVentriculaire' || rhythmType === 'fibrillationAtriale' ? '-?-' : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsDisplay;
