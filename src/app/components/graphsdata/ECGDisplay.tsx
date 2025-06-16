import React, { useRef, useEffect } from "react";
import { getRhythmData, type RhythmType } from "./ECGRhythms";

interface ECGDisplayProps {
  width?: number;
  height?: number;
  rhythmType?: RhythmType;
  showSynchroArrows?: boolean; //afficher les flèches synchro
  heartRate?: number; 
}

const ECGDisplay: React.FC<ECGDisplayProps> = ({
  width = 800,
  height = 80,
  rhythmType = 'sinus',
  showSynchroArrows = false,
  heartRate = 70, //par défaut
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const animationState = useRef({
    baseLoop: getRhythmData('sinus'),
    ecgStream: [] as number[],
    dataBuffer: [] as number[],
    offset: 0,
    currentRhythmType: rhythmType,
    currentHeartRate: heartRate,
    pendingRhythmChange: false,
    lastPeakPositions: [] as number[], //positions des derniers pics détectés
    peakPositions: [] as number[], // Positions absolues des pics dans ecgStream
    lastDetectedIndex: 0, // Dernier index analysé pour les pics
  });

  const detectRPeaks = (data: number[], startIndex: number, endIndex: number): number[] => {
    const peaks: number[] = [];
    const threshold = 80; 
    
    for (let i = startIndex + 2; i < endIndex - 2; i++) {
      const current = data[i];
      const prev = data[i - 1];
      const next = data[i + 1];
      
      if (current > threshold && 
          current > prev && 
          current > next &&
          current > data[i - 2] &&
          current > data[i + 2]) {
        
        if (peaks.length === 0 || i - peaks[peaks.length - 1] > 30) {
          peaks.push(i);
        }
      }
    }
    
    return peaks;
  };

  const updatePeakPositions = () => {
    if (!showSynchroArrows) return;
    
    const state = animationState.current;
    
    // Analyser seulement la nouvelle portion du stream
    const searchStart = state.lastDetectedIndex;
    const searchEnd = state.ecgStream.length;
    
    if (searchEnd > searchStart) {
      // Détecter les nouveaux pics
      const newPeaks = detectRPeaks(state.ecgStream, searchStart, searchEnd);
      
      // Ajouter les nouveaux pics à la liste des positions absolues
      newPeaks.forEach(peakIndex => {
        const isNearExisting = state.peakPositions.some(existing => 
          Math.abs(existing - peakIndex) < 30
        );
        
        if (!isNearExisting) {
          state.peakPositions.push(peakIndex);
        }
      });
      
      // Nettoyer les pics qui sont sortis du stream
      const minKeepIndex = Math.max(0, state.offset - width);
      state.peakPositions = state.peakPositions.filter(pos => pos > minKeepIndex);
      
      state.lastDetectedIndex = searchEnd;
    }
  };

  const drawSynchroArrows = (ctx: CanvasRenderingContext2D) => {
    if (!showSynchroArrows) return;
    
    const state = animationState.current;
    
    updatePeakPositions();
    
    const arrowHeight = Math.min(12, height * 0.15); 
    const arrowWidth = Math.min(6, arrowHeight * 0.5); 
    const stemHeight = Math.min(8, height * 0.1); 
    
    state.peakPositions.forEach(peakIndex => {
      const x = peakIndex - state.offset; // Position à l'écran (bouge avec le tracé)
      
      // Seulement si visible à l'écran
      if (x >= 0 && x < width && peakIndex < state.ecgStream.length) {
        const peakY = height - 10 - state.ecgStream[peakIndex] * 0.6;
        const maxArrowTop = Math.max(5, peakY - arrowHeight - stemHeight);
        const arrowTop = Math.max(maxArrowTop, 5);
        const arrowBottom = arrowTop + arrowHeight;
        
        // Dessiner la flèche blanche pointant vers le bas
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(x, arrowBottom); // Pointe de la flèche
        ctx.lineTo(x - arrowWidth, arrowTop); // Coin gauche
        ctx.lineTo(x + arrowWidth, arrowTop); // Coin droit
        ctx.closePath();
        ctx.fill();
        
        // Ligne verticale de la flèche 
        if (stemHeight > 2) { 
          ctx.beginPath();
          ctx.moveTo(x, arrowTop);
          ctx.lineTo(x, Math.max(2, arrowTop - stemHeight));
          ctx.stroke();
        }
      }
    });
  };

  //buffer ECG basé sur la fréquence cardiaque
  const createHeartRateBuffer = (baseData: number[], targetHeartRate: number) => {
    // Fréquence de base du rythme sinusal (approximativement 70 bpm)
    const baseHeartRate = 70;
    
    // Calculer le facteur de vitesse
    const speedFactor = targetHeartRate / baseHeartRate;
    
    // Pour des fréquences plus élevées, on raccourcit l'intervalle entre les battements
    // Pour des fréquences plus basses, on l'allonge
    const targetLength = Math.round(baseData.length / speedFactor);
    
    if (speedFactor >= 1) {
      // Fréquence plus élevée : on raccourcit en supprimant des points
      const step = baseData.length / targetLength;
      const newData: number[] = [];
      
      for (let i = 0; i < targetLength; i++) {
        const sourceIndex = Math.round(i * step);
        if (sourceIndex < baseData.length) {
          newData.push(baseData[sourceIndex]);
        }
      }
      return newData;
    } else {
      // Fréquence plus basse : on allonge en ajoutant des points
      const newData: number[] = [];
      const step = (baseData.length - 1) / (targetLength - 1);
      
      for (let i = 0; i < targetLength; i++) {
        const sourceIndex = i * step;
        const lowerIndex = Math.floor(sourceIndex);
        const upperIndex = Math.ceil(sourceIndex);
        
        if (lowerIndex === upperIndex || upperIndex >= baseData.length) {
          newData.push(baseData[lowerIndex] || 2);
        } else {
          const fraction = sourceIndex - lowerIndex;
          const interpolated = baseData[lowerIndex] * (1 - fraction) + baseData[upperIndex] * fraction;
          newData.push(interpolated);
        }
      }
      return newData;
    }
  };

  const triggerRhythmTransition = (newRhythmType: RhythmType, newHeartRate?: number) => {
    const state = animationState.current;
    
    const hasRhythmChanged = state.currentRhythmType !== newRhythmType;
    const hasHeartRateChanged = newHeartRate !== undefined && state.currentHeartRate !== newHeartRate;
    
    if (!hasRhythmChanged && !hasHeartRateChanged) return;
        
    const visibleSegment = state.ecgStream.slice(state.offset, state.offset + width);
    
    let newRhythmData = getRhythmData(newRhythmType);
    
    // Appliquer la fréquence cardiaque seulement pour le rythme sinusal
    if (newRhythmType === 'sinus' && newHeartRate !== undefined) {
      newRhythmData = createHeartRateBuffer(newRhythmData, newHeartRate);
    }
    
    let transitionData: number[] = [];
    
    if (hasRhythmChanged) {
      if (state.currentRhythmType === 'fibrillation' && newRhythmType === 'asystole') {
        transitionData = newRhythmData.slice(0, 50);
      } else if (state.currentRhythmType === 'asystole' && newRhythmType === 'sinus') {
        transitionData = newRhythmData.slice(0, 100);
      } else if (state.currentRhythmType === 'sinus' && newRhythmType === 'fibrillation') {
        transitionData = newRhythmData.slice(0, 80);
      } else {
        transitionData = newRhythmData.slice(0, 60);
      }
    } else {
      transitionData = newRhythmData.slice(0, Math.min(100, newRhythmData.length));
    }
    
    state.ecgStream = visibleSegment.concat(transitionData);
    state.baseLoop = newRhythmData; 
    state.offset = 0; 
    state.currentRhythmType = newRhythmType;
    if (newHeartRate !== undefined) {
      state.currentHeartRate = newHeartRate;
    }
    state.pendingRhythmChange = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initializeECGStream = () => {
      const state = animationState.current;
      let rhythmData = getRhythmData(state.currentRhythmType);
      
      // Appliquer la fréquence cardiaque pour le rythme sinusal
      if (state.currentRhythmType === 'sinus') {
        rhythmData = createHeartRateBuffer(rhythmData, state.currentHeartRate);
      }
      
      state.baseLoop = rhythmData;
      
      const repeats = Math.ceil(width / rhythmData.length) + 3;
      state.ecgStream = [];
      for (let i = 0; i < repeats; i++) {
        state.ecgStream = state.ecgStream.concat([...rhythmData]);
      }
    };

    if (animationState.current.ecgStream.length === 0) {
      animationState.current.currentRhythmType = rhythmType;
      animationState.current.currentHeartRate = heartRate;
      initializeECGStream();
    } else if (animationState.current.currentRhythmType !== rhythmType || 
               animationState.current.currentHeartRate !== heartRate) {
      triggerRhythmTransition(rhythmType, heartRate);
    }

    const drawECG = () => {
      const state = animationState.current;

      ctx.clearRect(0, 0, width, height);
      drawGrid(ctx);

      // Dessiner le tracé ECG
      ctx.beginPath();
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;

      for (let x = 0; x < width; x++) {
        const i = (state.offset + x) % state.ecgStream.length;
        const y = height - 10 - state.ecgStream[i] * 0.6;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      drawSynchroArrows(ctx);

      // Vitesse adaptée selon le rythme et la fréquence cardiaque
      let speed = state.currentRhythmType === 'fibrillation' ? 2 : 1;
      
      // ajuste la vitesse selon la fréquence cardiaque
      if (state.currentRhythmType === 'sinus') {
        speed = Math.max(0.5, Math.min(3, state.currentHeartRate / 70));
      }
      
      state.offset += speed;

      if (state.offset + width >= state.ecgStream.length) {
        if (state.dataBuffer.length > 0) {
          state.ecgStream = state.ecgStream.concat(state.dataBuffer);
          state.dataBuffer = [];
        } else {
          state.ecgStream = state.ecgStream.concat([...state.baseLoop]);
        }
      }

      animationRef.current = requestAnimationFrame(drawECG);
    };

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = "#002200";
      ctx.lineWidth = 0.5;

      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = "#004400";
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    drawECG();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, rhythmType, showSynchroArrows, heartRate]);

  // Réinitialiser les pics quand le mode synchro change
  useEffect(() => {
    if (!showSynchroArrows) {
      animationState.current.peakPositions = [];
      animationState.current.lastDetectedIndex = 0;
    }
  }, [showSynchroArrows]);

  return (
    <div className="flex flex-col bg-black rounded w-full">
      <div>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full"
          style={{ imageRendering: "pixelated", height: height }}
        />
      </div>
    </div>
  );
};

export default ECGDisplay;