import React, { useRef, useEffect } from "react";
import { getRhythmData, type RhythmType } from "./ECGRhythms";

interface ECGDisplayProps {
  width?: number;
  height?: number;
  rhythmType?: RhythmType;
}

const ECGDisplay: React.FC<ECGDisplayProps> = ({
  width = 800,
  height = 80,
  rhythmType = 'sinus',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const animationState = useRef({
    baseLoop: getRhythmData('sinus'), // boucle de base 
    ecgStream: [] as number[], // flux continu qui défile
    dataBuffer: [] as number[], // buffer pour nouvelles données
    offset: 0,
    currentRhythmType: rhythmType,
    pendingRhythmChange: false,
  });

  // Fonction pour déclencher transition de rythme
  const triggerRhythmTransition = (newRhythmType: RhythmType) => {
    const state = animationState.current;
    
    if (state.currentRhythmType === newRhythmType) return;
        
    const visibleSegment = state.ecgStream.slice(state.offset, state.offset + width);
    
    const newRhythmData = getRhythmData(newRhythmType);
    let transitionData: number[] = [];
    
    if (state.currentRhythmType === 'fibrillation' && newRhythmType === 'asystole') {
      // FV → Asystolie : transition directe
      transitionData = newRhythmData.slice(0, 50); // 50 échantillons d'asystolie
    } else if (state.currentRhythmType === 'asystole' && newRhythmType === 'sinus') {
      // Asystolie → Sinusal : transition directe
      transitionData = newRhythmData.slice(0, 100); // Plus d'échantillons pour le retour
    } else if (state.currentRhythmType === 'sinus' && newRhythmType === 'fibrillation') {
      // Sinusal → FV : transition directe
      transitionData = newRhythmData.slice(0, 80);
    } else {
      // Transition générique
      transitionData = newRhythmData.slice(0, 60);
    }
    
    // Reconstruire le stream : segment visible + nouvelles données
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

    // Initialiser le stream
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

    // Initialisation ou changement de rythme détecté
    if (animationState.current.ecgStream.length === 0) {
      animationState.current.currentRhythmType = rhythmType;
      initializeECGStream();
    } else if (animationState.current.currentRhythmType !== rhythmType) {
      triggerRhythmTransition(rhythmType);
    }

    const drawECG = () => {
      const state = animationState.current;

      // Effacer le canvas
      ctx.clearRect(0, 0, width, height);

      // Dessiner la grille ECG
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

      // Lignes verticales
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Lignes horizontales
      for (let y = 0; y < height; y += 10) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Lignes principales plus épaisses
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
  }, [width, height, rhythmType]);

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