import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MousePointer2 } from 'lucide-react';

interface CompareSliderProps {
  original: string;
  modified: string;
  className?: string;
}

const CompareSlider: React.FC<CompareSliderProps> = ({ original, modified, className = '' }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  const onMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchend', onMouseUp);
    } else {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onMouseUp);
    }
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl cursor-col-resize select-none shadow-2xl ${className}`}
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* Background Image (After/Modified) */}
      <img 
        src={modified} 
        alt="Redesigned Room" 
        className="absolute top-0 left-0 w-full h-full object-cover" 
      />
      
      {/* Foreground Image (Before/Original) - Clipped */}
      <div 
        className="absolute top-0 left-0 h-full w-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={original} 
          alt="Original Room" 
          className="absolute top-0 left-0 w-full h-full object-cover max-w-none"
          // Important: width must be the same as container to maintain aspect ratio alignment
          style={{ width: containerRef.current?.getBoundingClientRect().width || '100%' }} 
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center group"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 group-hover:scale-110 transition-transform">
           <MousePointer2 size={16} className="text-slate-800 fill-slate-800 rotate-90" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm pointer-events-none">
        Original
      </div>
      <div className="absolute top-4 right-4 bg-indigo-600/80 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm pointer-events-none">
        Redesigned
      </div>
    </div>
  );
};

export default CompareSlider;
