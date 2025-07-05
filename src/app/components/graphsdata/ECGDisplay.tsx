import React, { useRef, useEffect } from "react";
import { getRhythmData, type RhythmType } from "./ECGRhythms";

interface ECGDisplayProps {
  width?: number;
  height?: number;
  rhythmType?: RhythmType;
  showSynchroArrows?: boolean;
  heartRate?: number;
  durationSeconds?: number;
  isDottedAsystole?: boolean;
  scanPosition?: number;
  onScanPositionChange?: (position: number) => void;
}

const ECGDisplay: React.FC<ECGDisplayProps> = ({
  width = 800,
  height = 65,
  rhythmType = 'sinus',
  showSynchroArrows = false,
  heartRate = 70, 
  durationSeconds = 7,
  isDottedAsystole = false,
  scanPosition,
  onScanPositionChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // Refs for data and animation state
  const dataRef = useRef<number[]>([]);
  const peakCandidateIndicesRef = useRef<Set<number>>(new Set());
  const pacingSpikeIndicesRef = useRef<Set<number>>(new Set());
  const normalizationRef = useRef({ min: 0, max: 1 });
  const scanAccumulatorRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const lastArrowDrawTimeRef = useRef<number>(0);
  const lastYRef = useRef<number | null>(null);
  
  // A ref to hold the latest props, accessible from the animation loop without re-triggering effects
  const propsRef = useRef({ showSynchroArrows, durationSeconds, rhythmType, heartRate, isDottedAsystole });
  useEffect(() => {
    propsRef.current = { showSynchroArrows, durationSeconds, rhythmType, heartRate, isDottedAsystole };
  });

  // Effect for Data Loading and Peak Pre-computation. Runs only when data-related props change.
  useEffect(() => {
    const { rhythmType, heartRate } = propsRef.current;
    
    // Get the full data buffer for the selected rhythm.
    const newBuffer = getRhythmData(rhythmType, heartRate);
    dataRef.current = newBuffer;

    // Pre-compute R-Peak candidates for the new buffer
    const newPeakCandidates = new Set<number>();
    
    const excludedRhythms: RhythmType[] = ['fibrillationVentriculaire', 'asystole'];

    if (!excludedRhythms.includes(rhythmType)) {
      const min = Math.min(...newBuffer);
      const max = Math.max(...newBuffer);
      const threshold = min + (max - min) * 0.7;
      const searchWindowRadius = 5;
      const refractoryPeriodSamples = 38; // 152ms @ 250Hz

      for (let i = 0; i < newBuffer.length; i++) {
          const value = newBuffer[i];
          if (value < threshold) continue;
          
          let isWindowMax = true;
          for (let j = 1; j <= searchWindowRadius; j++) {
              if (value < newBuffer[(i - j + newBuffer.length) % newBuffer.length] || value < newBuffer[(i + j) % newBuffer.length]) {
                  isWindowMax = false;
                  break;
              }
          }
          if (isWindowMax) {
            newPeakCandidates.add(i);
            i += refractoryPeriodSamples; 
          }
      }
  
    }
    
    peakCandidateIndicesRef.current = newPeakCandidates;
    normalizationRef.current = {
      min: Math.min(...newBuffer),
      max: Math.max(...newBuffer),
    };
    const newPacingSpikes = new Set<number>();
    if (rhythmType === 'electroEntrainement') {
        for (let i = 1; i < newBuffer.length; i++) {
            // A pacing spike is characterized by a very large, sudden positive jump.
            if (newBuffer[i] - newBuffer[i-1] >= 0.4) {
                newPacingSpikes.add(i);
            }
        }
    }
    pacingSpikeIndicesRef.current = newPacingSpikes;
  }, [rhythmType, heartRate]); // Triggered only when the rhythm or its rate changes.


  // Effect for Animation and Drawing. Runs only when canvas dimensions change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Utiliser la position initiale du scan si fournie, sinon commencer à zéro
    scanAccumulatorRef.current = scanPosition || 0;
    lastFrameTimeRef.current = 0;
    lastArrowDrawTimeRef.current = 0;
    lastYRef.current = null;

    const getNormalizedY = (value: number) => {
      const { min, max } = normalizationRef.current;
      const range = max - min;
      const topMargin = height * 0.1;
      const bottomMargin = height * 0.1;
      const traceHeight = height - topMargin - bottomMargin;
      const normalizedValue = range === 0 ? 0.5 : (value - min) / range;
      const canvasCenter = topMargin + traceHeight / 2;
      const { rhythmType } = propsRef.current;
      if (rhythmType === 'electroEntrainement'  || rhythmType === 'choc') {
        // For pacing, use a fixed gain (pixels per mV) and center the trace.
        // This causes large spikes to go off-screen (clipping).
        const gain = 40; // 20px per 1mV
        return (canvasCenter - (value * gain))/0.6;
      } else
      {return topMargin + (1 - normalizedValue) * traceHeight;}
    };
    
    const drawGridColumn = (x: number) => {
        const pixelsPerSecond = width / propsRef.current.durationSeconds;
        ctx.strokeStyle = "#002200";
        ctx.lineWidth = 0.5;
        const timeStep = pixelsPerSecond / 5; // 200ms grid lines
        if (x > 0 && Math.round(x) % Math.round(timeStep) === 0) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += 10) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 1, y);
            ctx.stroke();
        }
    };
    
    const drawArrow = (x: number) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(x, 15);
        ctx.lineTo(x - 5, 5);
        ctx.lineTo(x + 5, 5);
        ctx.closePath();
        ctx.fill();
    };
    const drawPacingSpike = ( x: number) => {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
  };
    // Initial clear and grid draw
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    for (let x = 0; x < width; x++) {
        drawGridColumn(x);
    }

    // Pré-remplir le canvas avec le tracé correspondant à la position actuelle du scan
    const data = dataRef.current;
    if (data.length > 0 && scanAccumulatorRef.current > 0) {
      const { isDottedAsystole } = propsRef.current;
      const samplingRate = 250;
      const pixelsPerSecond = width / durationSeconds;
      const samplesOnScreen = durationSeconds * samplingRate;
      const samplesPerPixel = samplesOnScreen / width;
      const currentScanPosition = scanAccumulatorRef.current;
      
      let lastY = null;
      
      for (let x = 0; x < width; x++) {
        const currentX = currentScanPosition - width + x;
        
        const windowOffset = Math.floor(currentX - (currentX % width)); 
        const startSampleOfWindow = Math.floor(windowOffset * samplesPerPixel);
        const sampleInWindow = Math.floor((currentX % width) * samplesPerPixel);
        const sampleIndex = (startSampleOfWindow + sampleInWindow) % data.length;
        
        if (sampleIndex >= 0) {
          if (isDottedAsystole) {
            const centerY = height / 2;
            if (x % 4 === 0) {
              ctx.fillStyle = "#00ff00";
              ctx.fillRect(x, centerY - 1, 2, 2);
            }
          } else {
            const value = data[sampleIndex];
            const currentY = getNormalizedY(value);
            
            // Dessiner la ligne continue
            if (lastY !== null) {
              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x - 1, lastY);
              ctx.lineTo(x, currentY);
              ctx.stroke();
            }
            
            lastY = currentY;
          }
        }
      }
    }

    const drawFrame = (currentTime: number) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = currentTime;
      const deltaTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;
      
      const data = dataRef.current;
      if (data.length === 0) {
          animationRef.current = requestAnimationFrame(drawFrame);
          return;
      }
      
      const { durationSeconds, showSynchroArrows } = propsRef.current;
      const samplingRate = 250;
      const pixelsPerSecond = width / durationSeconds;
      const pixelsToAdvance = (deltaTime / 1000) * pixelsPerSecond;
      

      const oldAccumulator = scanAccumulatorRef.current;
      scanAccumulatorRef.current += pixelsToAdvance;
      
      // The number of samples that should be visible on screen at any time
      const samplesOnScreen = durationSeconds * samplingRate;
      const samplesPerPixel = samplesOnScreen / width;
      
      const oldScanX = Math.floor(oldAccumulator);
      const newScanX = Math.floor(scanAccumulatorRef.current);
      
      for (let currentX = oldScanX; currentX < newScanX; currentX++) {
          const x = currentX % width;
          
          // Calculate the starting sample of the current visible window
          const windowOffset = Math.floor(currentX - x); 
          const startSampleOfWindow = Math.floor(windowOffset * samplesPerPixel);
          
          // Calculate the sample within the window corresponding to the current pixel
          const sampleInWindow = Math.floor(x * samplesPerPixel);
          
          // The final index into the master data buffer
          const sampleIndex = (startSampleOfWindow + sampleInWindow) % data.length;

          const barX = (x + 2) % width;
          ctx.fillStyle = 'black';
          ctx.fillRect(barX, 0, 3, height);
          drawGridColumn(barX);

          const { isDottedAsystole } = propsRef.current;
          
          if (isDottedAsystole) {
            const centerY = height / 2;
            const dotPattern = 4; 
            const dotSize = 2;
            
            if (x % dotPattern === 0) {
              ctx.fillStyle = "#00ff00";
              ctx.fillRect(x, centerY - dotSize/2, dotSize, dotSize);
            }
            lastYRef.current = centerY;
          } else {
            // Mode ECG normal
            const value = data[sampleIndex];
            const currentY = getNormalizedY(value);
            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (lastYRef.current !== null && x > 0 && x - 1 === ((currentX - 1) % width)) {
              ctx.moveTo(x - 1, lastYRef.current);
              ctx.lineTo(x, currentY);
            } else {
              ctx.moveTo(x, currentY);
              ctx.lineTo(x, currentY);
            }
            ctx.stroke();
            lastYRef.current = currentY;
          }
          
          if (showSynchroArrows && peakCandidateIndicesRef.current.has(sampleIndex)) {
             
                drawArrow(x);
                
          }

          if (pacingSpikeIndicesRef.current.has(sampleIndex)) {
            drawPacingSpike(x);
        }
      }

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    animationRef.current = requestAnimationFrame(drawFrame);

    return () => {
      // Sauvegarder la position actuelle du scan avant de démonter
      if (onScanPositionChange) {
        onScanPositionChange(scanAccumulatorRef.current);
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [width, height, onScanPositionChange]);

  // Effet pour sauvegarder la position périodiquement
  useEffect(() => {
    if (!onScanPositionChange) return;
    
    const interval = setInterval(() => {
      onScanPositionChange(scanAccumulatorRef.current);
    }, 100); // Sauvegarder toutes les 100ms
    
    return () => clearInterval(interval);
  }, [onScanPositionChange]);

  return (
    <div className="flex flex-col bg-black rounded w-full">
      <div>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full"
          style={{ imageRendering: "auto", height: height }}
        />
      </div>
    </div>
  );
};

export default ECGDisplay;
