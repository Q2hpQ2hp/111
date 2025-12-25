import React from 'react';
import { CardData, Rarity } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  card: CardData;
  isRevealed?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const RarityBorder: Record<Rarity, string> = {
  [Rarity.COMMON]: 'border-slate-300 bg-slate-50',
  [Rarity.RARE]: 'border-blue-300 bg-blue-50',
  [Rarity.EPIC]: 'border-purple-300 bg-purple-50',
  [Rarity.LEGENDARY]: 'border-yellow-300 bg-yellow-50',
};

const RarityText: Record<Rarity, string> = {
  [Rarity.COMMON]: 'text-slate-500',
  [Rarity.RARE]: 'text-blue-500',
  [Rarity.EPIC]: 'text-purple-500',
  [Rarity.LEGENDARY]: 'text-yellow-600',
};

export const Card: React.FC<CardProps> = ({ card, isRevealed = true, onClick, className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-24 h-36',
    md: 'w-48 h-72',
    lg: 'w-64 h-96',
  };

  return (
    <div
      onClick={onClick}
      className={twMerge(
        'group cursor-pointer perspective-1000',
        sizeClasses[size],
        className
      )}
    >
      <div
        className={clsx(
          'w-full h-full relative transition-all duration-500 transform-style-3d shadow-soft hover:shadow-lg rounded-theme',
          !isRevealed && 'rotate-y-180'
        )}
      >
        {/* Front */}
        <div
          className={clsx(
            'absolute inset-0 w-full h-full backface-hidden flex flex-col overflow-hidden rounded-theme border-4',
            'bg-white',
            RarityBorder[card.rarity]
          )}
        >
          {/* Image Area */}
          <div className="h-3/4 w-full relative overflow-hidden bg-gray-100">
             <img 
               src={card.imageUrl} 
               alt={card.name} 
               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
             />
             {card.rarity === Rarity.LEGENDARY && (
                 <div className="absolute inset-0 bg-gradient-to-t from-yellow-200/20 to-transparent pointer-events-none animate-pulse"></div>
             )}
          </div>
          
          {/* Info Area */}
          <div className="h-1/4 p-3 flex flex-col justify-between bg-white/80 backdrop-blur-sm">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm leading-tight text-gray-800">{card.name}</h3>
                    <span className={clsx("text-[10px] font-bold uppercase", RarityText[card.rarity])}>{card.rarity}</span>
                </div>
                <div className="text-[10px] text-muted truncate mt-1">{card.animeSource}</div>
            </div>
            
            <div className="flex justify-between items-end mt-1">
                 <div className="text-[10px] text-muted font-mono">#{card.id}</div>
                 <div className="text-xs font-bold text-accent">PW {card.powerLevel}</div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={clsx(
            'absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-theme shadow-inner',
            'bg-gradient-to-br from-accent to-pink-200 flex items-center justify-center'
          )}
        >
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/50">
             <div className="w-10 h-10 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
