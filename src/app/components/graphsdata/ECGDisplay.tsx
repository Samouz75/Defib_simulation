import React, { useRef, useEffect } from "react";
import { getRhythmData, type RhythmType } from "./ECGRhythms";

interface ECGDisplayProps {
  width?: number;
  height?: number;
  rhythmType?: RhythmType;
  showSynchroArrows?: boolean; 
}

const ECGDisplay: React.FC<ECGDisplayProps> = ({
  width = 800,
  height = 80,
  rhythmType = 'sinus',
  showSynchroArrows = false, 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const animationState = useRef({
    baseLoop: getRhythmData('sinus'),
    ecgStream: [] as number[],
    dataBuffer: [] as number[],
    offset: 0,
    currentRhythmType: rhythmType,
    pendingRhythmChange: false,
    lastPeakPositions: [] as number[], 
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
        
        if (peaks.length === 0 || i - peaks[peaks.length - 1] > 50) {
          peaks.push(i);
        }
      }
    }
    
    return peaks;
  };

  //Fonction pour dessiner les flèches synchro
  const drawSynchroArrows = (ctx: CanvasRenderingContext2D) => {
    if (!showSynchroArrows) return;
    
    const state = animationState.current;
    const visibleStart = state.offset;
    const visibleEnd = state.offset + width;
    
    const peaks = detectRPeaks(state.ecgStream, visibleStart, Math.min(visibleEnd, state.ecgStream.length));
    
    // Dessiner les flèches sur les pics visibles
    peaks.forEach(peakIndex => {
      const x = peakIndex - state.offset;
      if (x >= 0 && x < width) {
        const y = height - 10 - state.ecgStream[peakIndex] * 0.6;
        
        // Dessiner la flèche blanche pointant vers le bas
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        
        // Flèche simple : triangle pointant vers le bas
        ctx.beginPath();
        ctx.moveTo(x, y - 15); // Pointe de la flèche
        ctx.lineTo(x - 5, y - 25); // Coin gauche
        ctx.lineTo(x + 5, y - 25); // Coin droit
        ctx.closePath();
        ctx.fill();
        
        // Ligne verticale de la flèche
        ctx.beginPath();
        ctx.moveTo(x, y - 25);
        ctx.lineTo(x, y - 35);
        ctx.stroke();
      }
    });
  };

  const triggerRhythmTransition = (newRhythmType: RhythmType) => {
    const state = animationState.current;
    
    if (state.currentRhythmType === newRhythmType) return;
        
    const visibleSegment = state.ecgStream.slice(state.offset, state.offset + width);
    
    const newRhythmData = getRhythmData(newRhythmType);
    let transitionData: number[] = [];
    
    if (state.currentRhythmType === 'fibrillation' && newRhythmType === 'asystole') {
      transitionData = newRhythmData.slice(0, 50);
    } else if (state.currentRhythmType === 'asystole' && newRhythmType === 'sinus') {
      transitionData = newRhythmData.slice(0, 100);
    } else if (state.currentRhythmType === 'sinus' && newRhythmType === 'fibrillation') {
      transitionData = newRhythmData.slice(0, 80);
    } else {
      transitionData = newRhythmData.slice(0, 60);
    }
    
    state.ecgStream = visibleSegment.concat(transitionData);
    state.baseLoop = newRhythmData; 
    state.offset = 0; 
    state.currentRhythmType = newRhythmType;
    state.pendingRhythmChange = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initializeECGStream = () => {
      const state = animationState.current;
      const rhythmData = getRhythmData(state.currentRhythmType);
      state.baseLoop = rhythmData;
      
      const repeats = Math.ceil(width / rhythmData.length) + 3;
      state.ecgStream = [];
      for (let i = 0; i < repeats; i++) {
        state.ecgStream = state.ecgStream.concat([...rhythmData]);
      }
    };

    if (animationState.current.ecgStream.length === 0) {
      animationState.current.currentRhythmType = rhythmType;
      initializeECGStream();
    } else if (animationState.current.currentRhythmType !== rhythmType) {
      triggerRhythmTransition(rhythmType);
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

      const speed = state.currentRhythmType === 'fibrillation' ? 2 : 1;
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
  }, [width, height, rhythmType, showSynchroArrows]); //dépendance showSynchroArrows

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