export type RhythmType = 'sinus' | 'fibrillation' | 'asystole';

export interface ECGRhythm {
  name: string;
  data: number[];
  description: string;
}

// Rythme sinusal normal 
const sinusRhythm: number[] = [
  2,2,3,3,4,6,7,7,7,6,3,2,2,1,2,1,2,1,2,5,83,11,8,6,4,3,3,3,3,4,4,5,9,14,17,19,16,12,10,6,
  3,2,2,2,2,1,2,5,7,7,6,3,2
];


const fibrillationRhythm: number[] = [
  60.25, 58.71, 48.41, 28.84, 27.81, 26.78, 29.35, 39.65, 54.07, 64.89,
  61.28, 48.41, 39.14, 38.62, 34.5, 65.4, 66.95, 66.43, 65.92, 46.86,
  41.2, 31.93, 33.99, 56.13, 57.16, 52.53, 45.32, 39.65, 48.41, 46.86,
  49.95, 58.71, 63.34, 64.37, 53.04, 48.41, 40.17, 37.08, 41.71, 69.52,
  70.55, 28.32, 22.14, 13.39, 33.47, 54.07, 85.49, 83.94, 76.22, 59.22,
  44.29, 32.96, 25.23, 24.72, 29.35, 32.96, 42.23, 59.74, 68.49, 79.31,
  64.37, 35.53, 23.17, 19.05, 33.47, 55.1, 52.01, 37.08, 35.02, 31.93,
  33.99, 36.05, 46.86, 49.95, 46.35, 42.23, 37.59, 36.05, 33.47, 24.2,
  19.57, 10.81, 16.99, 30.38, 55.62, 66.43, 67.46, 66.95, 56.13, 14.42,
  0.51, 21.63, 39.65, 55.1, 55.62, 40.17, 42.23, 49.95, 43.26, 37.59,
  23.17, 22.14, 38.62, 66.43, 66.95, 53.04, 22.14, 23.17, 46.86, 53.56,
  56.13, 51.5, 48.41, 33.47, 50.98, 52.53, 49.95, 53.56, 53.56, 53.56,
  43.77, 37.08, 43.26, 49.44, 45.32, 45.83, 46.35, 45.83, 44.29, 42.23,
  42.23, 50.98, 57.68, 57.68, 54.59, 42.74, 34.5, 21.63, 32.44, 43.26,
  58.19, 57.68, 56.13, 43.77, 35.53, 63.34, 54.07, 27.29, 30.9, 58.19,
  54.07, 33.99, 37.59, 55.62, 55.1, 44.29, 36.05, 37.08, 56.65, 45.32,
  33.47, 42.23, 54.07, 56.65, 57.16, 58.19, 56.13, 54.07, 41.2, 48.41,
  57.68, 66.95, 67.98, 66.95, 60.25, 29.87, 13.9, 14.42, 36.56, 58.71,
  72.61, 74.67, 67.46, 55.62, 47.38, 38.11, 48.92, 56.65, 57.68, 38.62,
  54.07, 65.92, 66.43, 67.98, 63.86, 49.44, 37.59, 30.9, 33.47, 32.96
];

// Asystolie (ligne plate)
const asystoleRhythm: number[] = new Array(100).fill(2);

export const ECG_RHYTHMS: Record<RhythmType, ECGRhythm> = {
  sinus: {
    name: 'Rythme sinusal',
    data: sinusRhythm,
    description: 'Rythme cardiaque normal et régulier'
  },
  fibrillation: {
    name: 'Fibrillation ventriculaire',
    data: fibrillationRhythm,
    description: 'Rythme cardiaque chaotique et irrégulier'
  },
  asystole: {
    name: 'Asystolie',
    data: asystoleRhythm,
    description: 'Absence d\'activité électrique cardiaque'
  }
};


export const getRhythmData = (rhythmType: RhythmType): number[] => {
  return ECG_RHYTHMS[rhythmType].data;
};


export const getRhythmInfo = (rhythmType: RhythmType): ECGRhythm => {
  return ECG_RHYTHMS[rhythmType];
};


export const isValidRhythmType = (rhythmType: string): rhythmType is RhythmType => {
  return rhythmType in ECG_RHYTHMS;
};