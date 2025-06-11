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
  rhythmType = 'sinus', // Par défaut : rythme sinusal
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // État de l'animation
  const animationState = useRef({
    offset: 0,
    ecgStream: [] as number[],
    currentRhythmType: rhythmType,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initializeECGStream = (newRhythmType: RhythmType) => {
      const state = animationState.current;
      const rhythmData = getRhythmData(newRhythmType);
      const repeats = Math.ceil(width / rhythmData.length) + 2;
      state.ecgStream = [];

      for (let i = 0; i < repeats; i++) {
        state.ecgStream = state.ecgStream.concat([...rhythmData]);
      }
      
      state.currentRhythmType = newRhythmType;
    };

    // Initialiser ou réinitialiser si le rythme a changé
    if (
      animationState.current.ecgStream.length === 0 || 
      animationState.current.currentRhythmType !== rhythmType
    ) {
      initializeECGStream(rhythmType);
      // Réinitialiser l'offset lors du changement de rythme
      animationState.current.offset = 0;
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

      // Avancer l'offset (vitesse du tracé)
      // Vitesse différente selon le rythme 
      const speed = rhythmType === 'fibrillation' ? 2 : 1;
      state.offset += speed;

      // Obtenir la longueur du rythme actuel pour le cycle
      const currentRhythmData = getRhythmData(rhythmType);
      if (state.offset >= currentRhythmData.length) {
        state.offset = 0;
      }

      animationRef.current = requestAnimationFrame(drawECG);
    };

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = "#002200";
      ctx.lineWidth = 0.5;

      // Lignes verticales (grille millimétrique)
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
  }, [width, height, rhythmType]); // Ajouter rhythmType aux dépendances

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