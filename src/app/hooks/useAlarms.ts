import { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import type { RhythmType } from '../components/graphsdata/ECGRhythms';

interface AlarmState {
  heartRate: number;
  isBlinking: boolean;
  showAlarmBanner: boolean;
}

type FCBeepOptions = Partial<{
  waveform: OscillatorType; // 'sine' | 'square' | 'sawtooth' | 'triangle'
  frequencyHz: number;
  durationSec: number;
  attackSec: number;
  decaySec: number;
  volumeMul: number;
}>;

type UseAlarmsOptions = {
  /** Caler l’intervalle des bips sur la FC (bpm). Si absent, on garde l’intervalle interne du service. */
  hr?: number;
  /** Personnaliser le timbre du bip FC. */
  fcBeep?: FCBeepOptions;
};

/**
 * Gère les alarmes visuelles/sonores selon le rythme et l’affichage.
 * @param rhythmType Rythme ECG courant
 * @param showFCValue true si la FC est affichée (sinon on coupe les sons)
 * @param options (facultatif) réglages bip FC + HR pour synchroniser l’intervalle
 */
export const useAlarms = (
  rhythmType: RhythmType,
  showFCValue: boolean,
  options?: UseAlarmsOptions
): AlarmState => {
  const fvHeartRates = [169, 170, 180, 175, 163, 173, 190];
  const audioService = useAudio();

  const [alarmState, setAlarmState] = useState<AlarmState>({
    heartRate: 115,
    isBlinking: false,
    showAlarmBanner: false,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // clignotement + variations de FC affichée pour FV/FA
  useEffect(() => {
    const isAlarmingRhythm =
      rhythmType === 'fibrillationVentriculaire' ||
      rhythmType === 'fibrillationAtriale';

    setAlarmState((prev) => ({ ...prev, showAlarmBanner: isAlarmingRhythm }));

    if (isAlarmingRhythm) {
      const blinkInterval = setInterval(() => {
        setAlarmState((prev) => ({ ...prev, isBlinking: !prev.isBlinking }));
      }, 500);

      const valueInterval = setInterval(() => {
        setCurrentIndex((prev) => {
          const nextIndex = (prev + 1) % fvHeartRates.length;
          setAlarmState((current) => ({
            ...current,
            heartRate: fvHeartRates[nextIndex],
          }));
          return nextIndex;
        });
      }, 2000);

      return () => {
        clearInterval(blinkInterval);
        clearInterval(valueInterval);
      };
    } else {
      setAlarmState((prev) => ({ ...prev, isBlinking: false }));
    }
  }, [rhythmType]);

  // sons (bip FC / alarme FV) + personnalisation du bip FC
  useEffect(() => {
    if (!audioService) return;

    const isAlarmableRhythm =
      rhythmType === 'fibrillationVentriculaire' ||
      rhythmType === 'fibrillationAtriale' ||
      rhythmType === 'tachycardieVentriculaire' ||
      rhythmType === 'asystole';

    // 1) si on cache la FC, couper tous les sons
    if (!showFCValue) {
      audioService.stopFVAlarmSequence();
      audioService.stopFCBeepSequence();
      return;
    }

    // 2) si rythme “alarmable” → alarme FV ON, bip FC OFF
    if (isAlarmableRhythm) {
      audioService.stopFCBeepSequence();
      audioService.startFVAlarmSequence();
      return;
    }

    // 3) rythme “normal” → bip FC ON, alarme FV OFF
    audioService.stopFVAlarmSequence();

    // (nouveau) personnalise le timbre du bip si demandé
    if (options?.fcBeep && typeof (audioService as any).setFCBeepParams === 'function') {
      (audioService as any).setFCBeepParams(options.fcBeep);
    }

    // (nouveau) synchronise l’intervalle sur la FC si fournie
    if (options?.hr && typeof (audioService as any).startFCBeepSequenceForHR === 'function') {
      (audioService as any).startFCBeepSequenceForHR(options.hr);
    } else {
      audioService.startFCBeepSequence(); // intervalle interne par défaut
    }

    // cleanup à chaque changement
    return () => {
      audioService.stopFCBeepSequence();
      audioService.stopFVAlarmSequence();
    };
  }, [audioService, rhythmType, showFCValue, options?.hr, JSON.stringify(options?.fcBeep)]);

  return alarmState;
};
