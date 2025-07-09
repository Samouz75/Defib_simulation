import React, { useState, useRef, useEffect } from 'react';

interface RotaryButtonProps {
  onRotationChange?: (angle: number) => void;
  onClick?: () => void;
  initialAngle?: number;
  size?: number;
}

const RotaryButton: React.FC<RotaryButtonProps> = ({ 
  onRotationChange, 
  onClick,
  initialAngle = 0,
  size = 120
}) => {
  const [angle, setAngle] = useState(initialAngle);
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [hasRotated, setHasRotated] = useState(false);
  
  const buttonRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number>(0);
  
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { clientX: touch.clientX, clientY: touch.clientY };
    } else {
      return { clientX: e.clientX, clientY: e.clientY };
    }
  };

  const calculateAngle = (centerX: number, centerY: number, clientX: number, clientY: number) => {
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  };

  const isInCenterZone = (clientX: number, clientY: number) => {
    if (!buttonRef.current) return false;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
    );
    

    const centerZoneRadius = size * 0.08;
    return distance <= centerZoneRadius;
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    
    
    const { clientX, clientY } = getEventCoordinates(e as any);
    const isCenter = isInCenterZone(clientX, clientY);
    
    setStartTime(Date.now());
    setHasRotated(false);
    
    if (isCenter) {
      // Zone centrale - clic
      setIsPressed(true);
    } else {
      // Zone externe - démarrage rotation
      setIsDragging(true);
      
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        lastAngleRef.current = calculateAngle(centerX, centerY, clientX, clientY);
      }
    }
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !buttonRef.current) return;

    const { clientX, clientY } = getEventCoordinates(e);
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const newAngle = calculateAngle(centerX, centerY, clientX, clientY);
    
    let angleDiff = newAngle - lastAngleRef.current;
    
    if (angleDiff > 180) {
      angleDiff -= 360;
    } else if (angleDiff < -180) {
      angleDiff += 360;
    }
    
    const threshold = isTouchDevice ? 3 : 5;
    if (Math.abs(angleDiff) > threshold) {
      setHasRotated(true);
      
      const speedMultiplier = 0.5;
      angleDiff *= speedMultiplier;
      
      const newTotalAngle = angle + angleDiff;
      setAngle(newTotalAngle);
      lastAngleRef.current = newAngle;
      
      const normalizedAngle = ((newTotalAngle % 360) + 360) % 360;
      onRotationChange?.(normalizedAngle);
    }
  };

  const handleEnd = () => {
    if (isPressed && !hasRotated) {
      onClick?.();
    }
    setIsDragging(false);
    setIsPressed(false);
    setHasRotated(false);
  };

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleMove(e);
      const handleTouchMove = (e: TouchEvent) => {
        
        handleMove(e);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, angle, isPressed, hasRotated, startTime]);

  return (
    <div className="flex items-center justify-center">
      <div
        ref={buttonRef}
        className="rounded-full shadow-lg cursor-pointer select-none bg-gray-900 relative"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          touchAction: 'none'
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onMouseUp={handleEnd}
        onTouchEnd={handleEnd}
      >
        <div 
          className="w-full h-full rounded-full flex items-center justify-center transition-transform duration-100"
          style={{
            transform: `rotate(${angle}deg)`,
          }}
        >
          <div 
            className={`rounded-full relative transition-all duration-150 ${
              isPressed ? 'shadow-inner transform scale-95 bg-gray-800' : 'bg-black'
            }`}
            style={{
              width: `${size * 0.3}px`,  
              height: `${size * 0.3}px`, 
            }}
          >
            <div 
              className="absolute w-1 h-3 bg-gray-300 rounded-full"
              style={{
                left: '50%',
                top: '10%',
                transform: 'translateX(-50%)',
              }}
            />
            
            <div className="hidden">
              <div className={`w-3 h-3 rounded-full transition-all ${
                isPressed ? 'bg-gray-500' : 'bg-gray-600'
              }`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotaryButton;