import React, { useRef, useEffect } from "react";
import { getRhythmData, type RhythmType } from "./ECGRhythms";

interface ECGDisplayProps {
  width?: number;
  height?: number;
  rhythmType?: RhythmType;
  showSynchroArrows?: boolean;
  heartRate?: number; 
}

const ECGDisplay: React.FC<ECGDisplayProps> = ({
  width = 800,
  height = 80,
  rhythmType = 'sinus',
  showSynchroArrows = false,
  heartRate = 70,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const animationState = useRef({
    scanX: 0,
    sampleIndex: 0,
    lastY: null as number | null,
    currentBuffer: [] as number[],
    peakPositions: [] as { x: number, timestamp: number }[],
    SCROLL_SPEED: 60, // px/s
  });

  const createCycleBuffer = (rhythmType: RhythmType, bpm: number) => {
    const baseData = getRhythmData(rhythmType);
    
    if (rhythmType === 'asystole') {
      return new Array(200).fill(2);
    }
    
    if (rhythmType === 'fibrillation') {
      return [...baseData];
    }
    
    // Pour le rythme sinusal, utiliser exactement la même logique que le HTML
    const spacing = Math.round(animationState.current.SCROLL_SPEED * (60 / bpm));
    const buffer = new Array(spacing).fill(2);
    
    // Copier le battement dans le buffer
    for (let i = 0; i < baseData.length && i < spacing; i++) {
      buffer[i] = baseData[i];
    }
    
    return buffer;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = animationState.current;
    
    // Mettre à jour la vitesse selon le rythme
    state.SCROLL_SPEED = rhythmType === 'fibrillation' ? 120 : 60;
    
    // Créer le buffer cyclique
    state.currentBuffer = createCycleBuffer(rhythmType, heartRate);
    const maxValue = Math.max(...state.currentBuffer);

    const drawFrame = () => {
      // Effacer la colonne actuelle
      ctx.fillStyle = 'black';
      ctx.fillRect(state.scanX, 0, 2, height);

      // Dessiner la grille à cette position
      drawGridColumn(ctx, state.scanX);

      // Récupérer la valeur du buffer
      const value = state.currentBuffer[state.sampleIndex % state.currentBuffer.length];
      
      let currentY;
      if (rhythmType === 'asystole') {
        currentY = height - 5; 
      } else {
        const normalized = value != null ? value / maxValue : 2 / maxValue;
        const topMargin = height * 0.1;
        const bottomMargin = height * 0.1;
        const traceHeight = height - topMargin - bottomMargin;
        currentY = topMargin + (1 - normalized) * traceHeight;
      }

      // Dessiner le tracé ECG
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.beginPath();

      if (state.lastY !== null && Math.abs(state.lastY - currentY) > 0.5) {
        ctx.moveTo(state.scanX, state.lastY);
        ctx.lineTo(state.scanX, currentY);
      } else {
        ctx.moveTo(state.scanX, currentY - 0.5);
        ctx.lineTo(state.scanX, currentY + 0.5);
      }
      ctx.stroke();

      // Détecter les pics R pour les flèches synchro
      if (showSynchroArrows && rhythmType === 'sinus' && value === 83) {
        state.peakPositions.push({
          x: state.scanX,
          timestamp: Date.now()
        });
        
        // Nettoyer les anciens pics
        state.peakPositions = state.peakPositions.filter(peak => {
          const elapsed = Date.now() - peak.timestamp;
          const pixelsTraveled = elapsed * state.SCROLL_SPEED / 1000;
          return pixelsTraveled < width;
        });
      }

      // Dessiner les flèches synchro
      if (showSynchroArrows) {
        drawSynchroArrows(ctx);
      }

      // Mise à jour
      state.lastY = currentY;
      state.scanX = (state.scanX + 1) % width;
      state.sampleIndex++;

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    const drawGridColumn = (ctx: CanvasRenderingContext2D, x: number) => {
      ctx.strokeStyle = "#002200";
      ctx.lineWidth = 0.5;

      if (x % 20 === 0) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if (x % 100 === 0) {
        ctx.strokeStyle = "#004400";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Lignes horizontales
      ctx.strokeStyle = "#002200";
      ctx.lineWidth = 0.5;
      for (let y = 0; y < height; y += 10) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 1, y);
        ctx.stroke();
      }

      ctx.strokeStyle = "#004400";
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 1, y);
        ctx.stroke();
      }
    };

    const drawSynchroArrows = (ctx: CanvasRenderingContext2D) => {
      const arrowHeight = Math.min(12, height * 0.15);
      const arrowWidth = Math.min(6, arrowHeight * 0.5);
      
      state.peakPositions.forEach(peak => {
        const elapsed = Date.now() - peak.timestamp;
        const pixelsTraveled = elapsed * state.SCROLL_SPEED / 1000;
        const currentX = (peak.x - pixelsTraveled + width) % width;
        
        if (currentX >= 0 && currentX < width) {
          ctx.fillStyle = 'white';
          
          const arrowTop = 5;
          const arrowBottom = arrowTop + arrowHeight;
          
          ctx.beginPath();
          ctx.moveTo(currentX, arrowBottom);
          ctx.lineTo(currentX - arrowWidth, arrowTop);
          ctx.lineTo(currentX + arrowWidth, arrowTop);
          ctx.closePath();
          ctx.fill();
        }
      });
    };

    drawFrame();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, rhythmType, showSynchroArrows, heartRate]);

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