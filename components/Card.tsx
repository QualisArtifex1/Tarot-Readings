import React from 'react';
import { Card as CardType } from '../types';
import { cardBackImage } from '../cardBackImage';

interface CardProps {
  card: CardType;
  isFlipped: boolean;
  isReversed: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({ card, isFlipped, isReversed, className = '' }) => {
  return (
    <div className={`w-40 h-64 md:w-48 md:h-80 perspective-1000 ${className}`}>
      <div
        className={`relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Card Back */}
        <div className="absolute w-full h-full [backface-visibility:hidden] rounded-xl overflow-hidden shadow-lg shadow-black/50 border-2 border-yellow-500/30 [transform:translateZ(0px)]">
          <img
            src={cardBackImage}
            alt="Tarot card back"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        {/* Card Front */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-hidden shadow-lg shadow-black/50 border-2 border-yellow-400/50">
          <img
            src={card.image}
            alt={card.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isReversed ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default Card;