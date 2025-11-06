
import React from 'react';
import { Card as CardType } from '../types';
import { CARD_BACK_IMAGE } from '../constants';

interface CardProps {
  card: CardType;
  isFlipped: boolean;
  isReversed: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({ card, isFlipped, isReversed, className = '' }) => {
  return (
    <div className={`w-40 h-[17.5rem] md:w-48 md:h-[21rem] perspective-1000 ${className}`}>
      <div
        className={`relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Card Back */}
        <div
          className="absolute w-full h-full [backface-visibility:hidden] rounded-xl overflow-hidden shadow-lg shadow-black/50 border-2 border-yellow-400/20 bg-black"
          aria-label="Card Back"
        >
          <img
            src={CARD_BACK_IMAGE}
            alt="Card Back"
            className="w-full h-full object-contain"
          />
        </div>
        {/* Card Front */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-hidden shadow-lg shadow-black/50 border-2 border-yellow-400/50 bg-black">
          <img
            src={card.image}
            alt={card.name}
            className={`w-full h-full object-contain transition-transform duration-500 ${
              isReversed ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default Card;
