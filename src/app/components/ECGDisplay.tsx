import React, { useRef, useEffect } from "react";

interface ECGDisplayProps {
  width?: number;
  height?: number;
}

const ECGDisplay: React.FC<ECGDisplayProps> = ({
  width = 800,
  height = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Données du rythme sinusal normal
  const sinusRhythm = [
    2, 2, 3, 3, 4, 6, 7, 7, 7, 6, 3, 2, 2, 1, 2, 1, 2, 1, 2, 5, 83, 11, 8, 6, 4,
    3, 3, 3, 3, 4, 4, 5, 9, 14, 17, 19, 16, 12, 10, 6, 3, 2, 2, 2, 2, 1, 2, 5,
    7, 7, 6, 3, 2, 2, 2, 3, 86, 14, 9, 6, 5, 4, 5, 7, 7, 7, 9, 12, 16, 20, 22,
    21, 18, 14, 10, 5, 4, 4, 3, 3, 3,
  ];

  // État de l'animation
  const animationState = useRef({
    offset: 0,
    ecgStream: [] as number[],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initializeECGStream = () => {
      const state = animationState.current;
      const repeats = Math.ceil(width / sinusRhythm.length) + 2;
      state.ecgStream = [];

      for (let i = 0; i < repeats; i++) {
        state.ecgStream = state.ecgStream.concat([...sinusRhythm]);
      }
    };

    // IMPORTANT : Appeler l'initialisation une seule fois
    if (animationState.current.ecgStream.length === 0) {
      initializeECGStream();
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
      state.offset += 1;

      // Réinitialiser l'offset quand on atteint la fin d'un cycle
      if (state.offset >= sinusRhythm.length) {
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
  }, [width, height]);

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
      <div className="text-xs font-bold text-green-400 text-right ">
        <span>Rythme sinusal</span>
      </div>
    </div>
  );
};

export default ECGDisplay;
