import React, { useRef, useState, useEffect } from 'react';

interface RotativeKnobProps {
  onValueChange?: (value: number) => void;
  initialValue?: number;
  rotationSpeed?: number; // New prop to control rotation speed
}

const RotativeKnob: React.FC<RotativeKnobProps> = ({ 
  onValueChange, 
  initialValue = 0, 
  rotationSpeed = 0.5 // Default speed factor (0.5 = half speed)
}) => {
  const [rotaryValue, setRotaryValue] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseAngle, setLastMouseAngle] = useState<number | null>(null);
  const [accumulatedRotation, setAccumulatedRotation] = useState(0);
  const rotaryRef = useRef<HTMLDivElement>(null);

  type PredefinedAngle = {
    value: string;
    angle: number;
  };

  // Angles prédéfinis pour les crans
  const predefinedAngles: PredefinedAngle[] = [
    { value: "0", angle: 0 },
    { value: "1-10", angle: 20 },
    { value: "15", angle: 40 },
    { value: "20", angle: 60 },
    { value: "30", angle: 80 },
    { value: "50", angle: 100 },
    { value: "70", angle: 120 },
    { value: "100", angle: 140 },
    { value: "120", angle: 160 },
    { value: "150", angle: 180 },
    { value: "170", angle: 200 },
    { value: "200", angle: 220 },
    { value: "Stimulateur", angle: 240 },
  ];

  // Fonction pour trouver l'angle le plus proche
  const findClosestAngle = (targetAngle: number) => {
    // Normaliser l'angle cible entre 0 et 360
    const normalizedTarget = ((targetAngle % 360) + 360) % 360;
    
    let minDifference = 360;
    let closestAngle = predefinedAngles[0].angle;
    
    predefinedAngles.forEach(({ angle }) => {
      // Calculer la différence dans les deux sens du cercle
      const diff1 = Math.abs(normalizedTarget - angle);
      const diff2 = 360 - diff1;
      const difference = Math.min(diff1, diff2);
      
      if (difference < minDifference) {
        minDifference = difference;
        closestAngle = angle;
      }
    });
    
    return closestAngle;
  };

  // Fonction qui extrait les coordonnées de la souris ou tactile
  const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      // Événement tactile
      const touch = e.touches[0] || e.changedTouches[0];
      return { clientX: touch.clientX, clientY: touch.clientY };
    } else {
      // Événement souris
      return { clientX: e.clientX, clientY: e.clientY };
    }
  };

  // === GESTION DU BOUTON ROTATIF ===
  const handleRotaryMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setAccumulatedRotation(0);
    setLastMouseAngle(null);
    e.preventDefault();
  };

  const handleRotaryTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setAccumulatedRotation(0);
    setLastMouseAngle(null);
    e.preventDefault();
  };

  const handleRotaryMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !rotaryRef.current) return;

    const { clientX, clientY } = getEventCoordinates(e);
    const rect = rotaryRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    const degrees = (angle * 180) / Math.PI + 90;

    // Normaliser l'angle entre 0 et 360
    const normalizedDegrees = ((degrees % 360) + 360) % 360;

    if (lastMouseAngle !== null) {
      // Calculer la différence d'angle depuis la dernière position
      let angleDiff = normalizedDegrees - lastMouseAngle;
      
      // Gérer le passage par 0/360 degrés
      if (angleDiff > 180) {
        angleDiff -= 360;
      } else if (angleDiff < -180) {
        angleDiff += 360;
      }

      // Appliquer le facteur de vitesse pour ralentir la rotation
      const scaledDiff = angleDiff * rotationSpeed;
      const newAccumulated = accumulatedRotation + scaledDiff;
      
      // Seuil pour changer de cran (nécessite plus de mouvement)
      const threshold = 15; // Augmenter cette valeur pour nécessiter plus de mouvement
      
      if (Math.abs(newAccumulated) > threshold) {
        const direction = newAccumulated > 0 ? 1 : -1;
        const currentIndex = predefinedAngles.findIndex(item => item.angle === rotaryValue);
        const nextIndex = currentIndex + direction;
        
        if (nextIndex >= 0 && nextIndex < predefinedAngles.length) {
          const newAngle = predefinedAngles[nextIndex].angle;
          setRotaryValue(newAngle);
          onValueChange?.(newAngle);
          setAccumulatedRotation(0); // Réinitialiser l'accumulation
        } else {
          setAccumulatedRotation(newAccumulated); // Garder l'accumulation si on ne peut pas bouger
        }
      } else {
        setAccumulatedRotation(newAccumulated);
      }
    }

    setLastMouseAngle(normalizedDegrees);
  };

  const handleRotaryEnd = () => {
    setIsDragging(false);
    setLastMouseAngle(null);
    setAccumulatedRotation(0);
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleRotaryMove(e);
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Empêche le scroll sur mobile
        handleRotaryMove(e);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleRotaryEnd);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleRotaryEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleRotaryEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleRotaryEnd);
      };
    }
  }, [isDragging, lastMouseAngle, accumulatedRotation, rotaryValue, rotationSpeed]);

  const rotationAngle = rotaryValue;

  return (
    <div className="relative mt-6">
      <div className="absolute inset-0 w-48 h-48">
        {predefinedAngles
          .filter(item => item.value !== "0") // Hide "0" from visual display
          .map((item) => (
          <div
            key={item.value}
            className="absolute text-white font-bold"
            style={{
              transform: `rotate(${item.angle - 90}deg) translate(72px) rotate(${-(item.angle - 90)}deg)`,
              transformOrigin: "50% 50%",
              left: "50%",
              top: "50%",
              marginLeft: "-8px",
              marginTop: "-8px",
              fontSize: "10px",
            }}
          >
            {item.value}
          </div>
        ))}
      </div>

      {/* Zone verte d'arrière-plan */}
      <div className="absolute inset-4 bg-green-500 opacity-20 rounded-full"></div>

      {/* Bouton rotatif principal */}
      <div
        ref={rotaryRef}
        className="relative w-48 h-48 rounded-full border-gray-600 cursor-grab active:cursor-grabbing touch-manipulation select-none"
        onMouseDown={handleRotaryMouseDown}
        onTouchStart={handleRotaryTouchStart}
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
          touchAction: "none",
        }}
      >
        {/* Centre du bouton avec effet 3D */}
        <div className="absolute inset-10 bg-gradient-to-br from-green-200 to-green-400 rounded-full shadow-inner border border-gray-300 pointer-events-none">
          <div className="absolute inset-3 bg-gradient-to-br from-green-100 to-green-300 rounded-full pointer-events-none">
            {/* Indicateur principal - barre verticale au centre */}
            <div className="absolute top-1/2 left-1/2 w-4 h-24 bg-green-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md pointer-events-none">
              {/* Petit indicateur oval blanc à l'extrémité de la barre */}
              <div className="absolute top-1 left-1/2 w-1.5 h-3 bg-white rounded-full transform -translate-x-1/2 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotativeKnob;