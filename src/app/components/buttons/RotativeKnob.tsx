import React, { useRef, useState, useEffect } from 'react';

interface RotativeKnobProps {
  onValueChange?: (value: number) => void;
  initialValue?: number;
}

const RotativeKnob: React.FC<RotativeKnobProps> = ({ onValueChange, initialValue = -90 }) => {
  const [rotaryValue, setRotaryValue] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const rotaryRef = useRef<HTMLDivElement>(null);

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
    e.preventDefault();
  };

  const handleRotaryTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleRotaryMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !rotaryRef.current) return;

    const { clientX, clientY } = getEventCoordinates(e);
    const rect = rotaryRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    const degrees = ((angle * 180) / Math.PI + 90 + 360) % 360;

    const value = Math.round(degrees);
    const newValue = Math.max(0, Math.min(360, value));
    setRotaryValue(newValue);
    onValueChange?.(newValue);
  };

  const handleRotaryEnd = () => {
    setIsDragging(false);
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
  }, [isDragging]);

  const rotationAngle = rotaryValue;

  return (
    <div className="relative mt-6">
      {/* Graduations et valeurs autour du bouton */}
      <div className="absolute inset-0 w-40 h-40">
        {/* Graduations principales avec valeurs */}
        {[
          { value: "1-10", angle: -75 },
          { value: "15", angle: -56 },
          { value: "20", angle: -37 },
          { value: "30", angle: -18 },
          { value: "50", angle: 1 },
          { value: "70", angle: 22 },
          { value: "100", angle: 45 },
          { value: "120", angle: 66 },
          { value: "150", angle: 92 },
          { value: "170", angle: 114 },
          { value: "200", angle: 135 },
        ].map(({ value, angle }) => (
          <div
            key={value}
            className="absolute text-white font-bold"
            style={{
              transform: `rotate(${angle}deg) translate(95px) rotate(${-angle}deg)`,
              transformOrigin: "50% 50%",
              left: "50%",
              top: "50%",
              marginLeft: "-8px",
              marginTop: "-8px",
              fontSize: "10px",
            }}
          >
            {value}
          </div>
        ))}

        {/* Petites graduations */}
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            className="absolute bg-gray-400"
            style={{
              width: "1.5px",
              height: "10px",
              left: "50%",
              top: "10px",
              transformOrigin: "50% 70px",
              transform: `translateX(-0.75px) rotate(${-135 + i * 15}deg)`,
            }}
          />
        ))}

        {/* Graduations principales */}
        {[-135, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180, 225].map(
          (angle, i) => (
            <div
              key={angle}
              className="absolute bg-white"
              style={{
                width: "3px",
                height: "15px",
                left: "50%",
                top: "8px",
                transformOrigin: "50% 72px",
                transform: `translateX(-1.5px) rotate(${angle}deg)`,
              }}
            />
          ),
        )}
      </div>

      {/* Zone verte d'arrière-plan */}
      <div className="absolute inset-3 bg-green-500 opacity-20 rounded-full"></div>

      {/* Bouton rotatif principal */}
      <div
        ref={rotaryRef}
        className="relative w-40 h-40 rounded-full border-gray-600 cursor-grab active:cursor-grabbing touch-manipulation select-none"
        onMouseDown={handleRotaryMouseDown}
        onTouchStart={handleRotaryTouchStart}
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          transition: isDragging ? "none" : "transform 0.1s ease",
          touchAction: "none",
        }}
      >
        {/* Indicateur principal */}
        <div className="absolute top-3 left-1/2 w-1.5 h-10 bg-white rounded-full transform -translate-x-1/2 shadow-md"></div>

        {/* Centre du bouton avec effet 3D */}
        <div className="absolute inset-8 bg-gradient-to-br from-green-200 to-green-400 rounded-full shadow-inner border border-gray-300">
          <div className="absolute inset-3 bg-gradient-to-br from-green-100 to-green-300 rounded-full">
            {/* Petit indicateur au centre */}
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotativeKnob;