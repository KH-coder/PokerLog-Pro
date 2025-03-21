import React from 'react';
import { Card as CardType, Suit, Rank } from '../../types';

interface CardProps {
  card?: CardType;
  size?: 'sm' | 'md' | 'lg';
  isSelectable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  faceDown?: boolean;
}

const Card: React.FC<CardProps> = ({
  card,
  size = 'md',
  isSelectable = false,
  isSelected = false,
  onClick,
  faceDown = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-12',
    md: 'w-12 h-16',
    lg: 'w-16 h-24',
  };

  const getSuitColor = (suit?: Suit) => {
    if (!suit) return 'text-gray-700';
    return suit === Suit.HEARTS || suit === Suit.DIAMONDS
      ? 'text-red-600'
      : 'text-black';
  };

  const getSuitSymbol = (suit?: Suit) => {
    if (!suit) return '';
    switch (suit) {
      case Suit.HEARTS:
        return '♥';
      case Suit.DIAMONDS:
        return '♦';
      case Suit.CLUBS:
        return '♣';
      case Suit.SPADES:
        return '♠';
      default:
        return '';
    }
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        bg-white rounded-md shadow-md flex flex-col justify-between p-1
        ${isSelectable ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''}
        ${isSelected ? 'ring-2 ring-blue-600' : ''}
        ${faceDown ? 'bg-gradient-to-br from-blue-800 to-blue-600' : ''}
      `}
      onClick={isSelectable ? onClick : undefined}
    >
      {!faceDown && card ? (
        <>
          <div className={`text-left font-bold ${getSuitColor(card.suit)}`}>
            {card.rank}
          </div>
          <div className={`text-center text-xl ${getSuitColor(card.suit)}`}>
            {getSuitSymbol(card.suit)}
          </div>
          <div className={`text-right font-bold ${getSuitColor(card.suit)}`}>
            {card.rank}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {faceDown && (
            <div className="text-white text-opacity-50 text-xs">Card</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Card;
