import React, { useState, useRef, useEffect } from 'react';

interface JoystickProps {
  onPositionChange?: (position: "center" | "up" | "down" | "left" | "right") => void;
}

const Joystick: React.FC<JoystickProps> = ({ onPositionChange }) => {
  const [joystickPosition, setJoystickPosition] = useState<
    "center" | "up" | "down" | "left" | "right"
  >("center");
  const [isJoystickDragging, setIsJoystickDragging] = useState(false);

  const joystickRef = useRef<HTMLDivElement>(null);

  // Fonction utilitaire pour extraire les coordonnées d'un événement (souris ou tactile)
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

  const handleJoystickMouseDown = (e: React.MouseEvent) => {
    setIsJoystickDragging(true);
    e.preventDefault();
  };

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    setIsJoystickDragging(true);
    e.preventDefault();
  };

  const handleJoystickMove = (e: MouseEvent | TouchEvent) => {
    if (!isJoystickDragging || !joystickRef.current) return;

    const { clientX, clientY } = getEventCoordinates(e);
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    const deadZone = 15;

    let newPosition: "center" | "up" | "down" | "left" | "right" = "center";

    if (Math.abs(deltaX) < deadZone && Math.abs(deltaY) < deadZone) {
      newPosition = "center";
    } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
      newPosition = deltaX > 0 ? "right" : "left";
    } else {
      newPosition = deltaY > 0 ? "down" : "up";
    }

    setJoystickPosition(newPosition);
    onPositionChange?.(newPosition);
  };

  const handleJoystickEnd = () => {
    setIsJoystickDragging(false);
    setJoystickPosition("center");
    onPositionChange?.("center");
  };

  useEffect(() => {
    if (isJoystickDragging) {
      const handleMouseMove = (e: MouseEvent) => handleJoystickMove(e);
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Empêche le scroll sur mobile
        handleJoystickMove(e);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleJoystickEnd);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleJoystickEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleJoystickEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleJoystickEnd);
      };
    }
  }, [isJoystickDragging]);

  const getJoystickOffset = () => {
    const offset = 20;
    switch (joystickPosition) {
      case "up":
        return { x: 0, y: -offset };
      case "down":
        return { x: 0, y: offset };
      case "left":
        return { x: -offset, y: 0 };
      case "right":
        return { x: offset, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  };

  const joystickOffset = getJoystickOffset();
    
  return (
    <div className="flex items-center justify-center">
      <div
        ref={joystickRef}
        className="w-28 h-28 bg-gray-900 rounded-full border-4 border-gray-600 shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-all touch-manipulation select-none"
        onMouseDown={handleJoystickMouseDown}
        onTouchStart={handleJoystickTouchStart}
        style={{ touchAction: "none" }}
      >
        <div
          className="w-10 h-10 bg-gray-800 rounded-full border-2 border-gray-700 transition-all duration-150"
          style={{
            transform: `translate(${joystickOffset.x}px, ${joystickOffset.y}px)`,
            backgroundColor:
              joystickPosition !== "center" ? "#374151" : "#1f2937",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Joystick;