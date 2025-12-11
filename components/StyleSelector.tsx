import React from 'react';
import { DesignStyle } from '../types';

interface StyleSelectorProps {
  styles: DesignStyle[];
  onSelect: (style: DesignStyle) => void;
  disabled: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, onSelect, disabled }) => {
  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex space-x-4 min-w-max px-1">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style)}
            disabled={disabled}
            className={`group relative flex-shrink-0 w-32 h-40 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <img 
              src={style.thumbnail} 
              alt={style.name} 
              className="w-full h-full object-cover group-hover:brightness-110 transition-all"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
              <span className="text-white font-medium text-sm text-left">{style.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
