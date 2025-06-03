import React from 'react';
import { useStopwatch } from 'react-timer-hook';

interface TimerDisplayProps {
  className?: string;
  onTimeUpdate?: (seconds: number) => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  className = "text-white text-3xl font-bold font-mono",
  onTimeUpdate
}) => {
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    isRunning,
    reset,
  } = useStopwatch({ 
    autoStart: true // Démarre automatiquement
  });

  // Auto-reset à 30 minutes (1800 secondes)
  React.useEffect(() => {
    if (totalSeconds >= 1800) { // 30 minutes = 1800 secondes
      reset();
      console.log('Timer auto-reset après 30 minutes');
    }
  }, [totalSeconds, reset]);

  // Callback pour les mises à jour de temps
  React.useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(totalSeconds);
    }
  }, [totalSeconds, onTimeUpdate]);

  // Format: MM:SS toujours (pas besoin d'heures car max 30min)
  const formatTime = () => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Couleur selon la durée
  const getTimerColor = () => {
    if (totalSeconds < 300) return 'text-green-400';    // Vert les 5 premières minutes
    if (totalSeconds < 900) return 'text-orange-400';   // Orange de 5 à 15 minutes  
    if (totalSeconds < 1500) return 'text-red-400';     // Rouge de 15 à 25 minutes
    return 'text-red-500 animate-pulse';                // Rouge clignotant les 5 dernières minutes
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${className} ${getTimerColor()}`}>
        {formatTime()}
      </div>
      
      {/* Indicateur visuel simple */}
      <div className="ml-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
    </div>
  );
};

export default TimerDisplay;