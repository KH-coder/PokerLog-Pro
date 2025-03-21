import React, { useState } from 'react';
import { Card as CardType, Suit, Rank } from '../../types';
import Card from './Card';
import './CardPicker.css';

interface CardPickerProps {
  onCardSelect: (card: CardType) => void;
  selectedCards?: CardType[];
  excludedCards?: CardType[];
  onClose?: () => void;
}

const CardPicker: React.FC<CardPickerProps> = ({
  onCardSelect,
  selectedCards = [],
  excludedCards = [],
  onClose,
}) => {
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);

  // Check if a card is already selected or excluded
  const isCardUsed = (suit: Suit, rank: Rank) => {
    return [
      ...selectedCards,
      ...excludedCards,
    ].some(card => card.suit === suit && card.rank === rank);
  };

  // All suits in order
  const suits = [Suit.SPADES, Suit.HEARTS, Suit.CLUBS, Suit.DIAMONDS];
  
  // All ranks in order (from high to low)
  const ranks = [
    Rank.ACE,
    Rank.KING,
    Rank.QUEEN,
    Rank.JACK,
    Rank.TEN,
    Rank.NINE,
    Rank.EIGHT,
    Rank.SEVEN,
    Rank.SIX,
    Rank.FIVE,
    Rank.FOUR,
    Rank.THREE,
    Rank.TWO
  ];

  const handleCardSelect = (suit: Suit, rank: Rank) => {
    if (!isCardUsed(suit, rank)) {
      onCardSelect({ suit, rank });
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    setSelectedSuit(selectedSuit === suit ? null : suit);
  };

  const getSuitSymbol = (suit: Suit) => {
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

  // Filter suits to show based on selected suit
  const displaySuits = selectedSuit ? [selectedSuit] : suits;

  return (
    <div className="card-picker-modal">
      <div className="card-picker-container">
        <div className="card-picker-header">
          <h2 className="card-picker-title">選擇撲克牌</h2>
          <button 
            onClick={onClose}
            className="card-picker-close"
          >
            ×
          </button>
        </div>
        
        {/* Suit selector */}
        <div className="suit-selector">
          {suits.map(suit => (
            <button 
              key={suit}
              className="suit-button"
              onClick={() => handleSuitSelect(suit)}
              style={{
                border: selectedSuit === suit ? '2px solid #2563eb' : 'none',
              }}
            >
              {getSuitSymbol(suit)}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <div className="card-grid">
          {displaySuits.map(suit => (
            <div key={suit} className="card-row">
              {ranks.map(rank => {
                const isUsed = isCardUsed(suit, rank);
                const suitClass = suit === Suit.HEARTS || suit === Suit.DIAMONDS ? 'card-red' : 'card-black';
                
                return (
                  <button
                    key={`${suit}-${rank}`}
                    className={`card-button ${suitClass}`}
                    onClick={() => handleCardSelect(suit, rank)}
                    disabled={isUsed}
                  >
                    {rank}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Selected cards display */}
        {selectedCards.length > 0 && (
          <div className="mt-4">
            <h3 className="text-white text-lg font-medium mb-2">已選擇的牌</h3>
            <div className="flex space-x-2">
              {selectedCards.map((card, index) => (
                <Card key={`${card.suit}-${card.rank}-${index}`} card={card} />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="card-picker-actions">
          <button
            className="card-picker-button card-picker-cancel"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="card-picker-button card-picker-confirm"
            onClick={onClose}
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardPicker;
