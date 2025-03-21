import React, { useState } from 'react';
import { Card as CardType, Suit, Rank } from '../../types';
import Card from './Card';

interface CardSelectorProps {
  onCardSelect: (card: CardType) => void;
  selectedCards?: CardType[];
  excludedCards?: CardType[];
}

const CardSelector: React.FC<CardSelectorProps> = ({
  onCardSelect,
  selectedCards = [],
  excludedCards = [],
}) => {
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);

  // Check if a card is already selected or excluded
  const isCardUsed = (suit: Suit, rank: Rank) => {
    return [
      ...selectedCards,
      ...excludedCards,
    ].some(card => card.suit === suit && card.rank === rank);
  };

  const handleSuitSelect = (suit: Suit) => {
    setSelectedSuit(suit);
  };

  const handleRankSelect = (rank: Rank) => {
    if (selectedSuit) {
      onCardSelect({ suit: selectedSuit, rank });
      setSelectedSuit(null); // Reset suit selection after card is selected
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Select Suit</h3>
        <div className="flex space-x-4">
          {Object.values(Suit).map(suit => (
            <button
              key={suit}
              className={`p-2 rounded-md ${selectedSuit === suit ? 'bg-blue-500 text-white' : 'bg-white'}`}
              onClick={() => handleSuitSelect(suit)}
            >
              <span className={suit === Suit.HEARTS || suit === Suit.DIAMONDS ? 'text-red-600' : 'text-black'}>
                {suit === Suit.HEARTS ? 'u2665' :
                 suit === Suit.DIAMONDS ? 'u2666' :
                 suit === Suit.CLUBS ? 'u2663' : 'u2660'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedSuit && (
        <div>
          <h3 className="text-lg font-medium mb-2">Select Rank</h3>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(Rank).map(rank => {
              const isUsed = isCardUsed(selectedSuit, rank);
              return (
                <button
                  key={rank}
                  className={`p-2 rounded-md ${isUsed ? 'bg-gray-300 cursor-not-allowed' : 'bg-white hover:bg-blue-100'}`}
                  onClick={() => !isUsed && handleRankSelect(rank)}
                  disabled={isUsed}
                >
                  {rank}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Display currently selected cards */}
      {selectedCards.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Selected Cards</h3>
          <div className="flex space-x-2">
            {selectedCards.map((card, index) => (
              <Card key={`${card.suit}-${card.rank}-${index}`} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSelector;
