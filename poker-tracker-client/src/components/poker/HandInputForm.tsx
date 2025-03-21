import React, { useState, useEffect } from 'react';
import { Position, Card as CardType, Action, Stage, PlayerAction, HandRecord } from '../../types';
import PokerTable from './PokerTable';
import Card from './Card';
import CardPicker from './CardPicker';
import ActionButtons from './ActionButtons';

interface HandInputFormProps {
  onSubmit: (handRecord: Omit<HandRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<HandRecord>;
}

const HandInputForm: React.FC<HandInputFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const [position, setPosition] = useState<Position>(initialData?.position || Position.BTN);
  const [holeCards, setHoleCards] = useState<CardType[]>(initialData?.holeCards || []);
  const [communityCards, setCommunityCards] = useState<CardType[]>(initialData?.communityCards || []);
  const [currentStage, setCurrentStage] = useState<Stage>(Stage.PREFLOP);
  const [actions, setActions] = useState<PlayerAction[]>(initialData?.actions || []);
  const [result, setResult] = useState<number>(initialData?.result || 0);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [potSize, setPotSize] = useState<number>(1.5); // Starting pot size (blinds)
  const [playerStack, setPlayerStack] = useState<number>(1000);
  
  // For card selection mode
  const [selectionMode, setSelectionMode] = useState<'hole' | 'community'>('hole');
  const [showCardPicker, setShowCardPicker] = useState<boolean>(false);

  // Reset current bet when stage changes
  useEffect(() => {
    setCurrentBet(0);
  }, [currentStage]);

  const handlePositionSelect = (pos: Position) => {
    setPosition(pos);
  };

  const handleCardSelect = (card: CardType) => {
    if (selectionMode === 'hole') {
      if (holeCards.length < 2) {
        setHoleCards([...holeCards, card]);
      }
    } else {
      if (communityCards.length < 5) {
        setCommunityCards([...communityCards, card]);
        
        // Automatically advance the stage based on community card count
        if (communityCards.length === 2) { // About to add 3rd card (flop)
          setCurrentStage(Stage.FLOP);
        } else if (communityCards.length === 3) { // About to add 4th card (turn)
          setCurrentStage(Stage.TURN);
        } else if (communityCards.length === 4) { // About to add 5th card (river)
          setCurrentStage(Stage.RIVER);
        }
      }
    }
  };

  const handleAction = (action: Action, amount?: number) => {
    const newAction: PlayerAction = {
      action,
      amount,
      stage: currentStage,
    };
    
    setActions([...actions, newAction]);
    
    // Update current bet and pot size if applicable
    if (action === Action.BET || action === Action.RAISE) {
      setCurrentBet(amount || 0);
      setPotSize(prevPotSize => prevPotSize + (amount || 0));
    } else if (action === Action.CALL) {
      // For a call, add the current bet to the pot
      setPotSize(prevPotSize => prevPotSize + currentBet);
    } else if (action === Action.CHECK || action === Action.FOLD) {
      // No change to current bet or pot size
    } else if (action === Action.ALL_IN) {
      setCurrentBet(playerStack);
      setPotSize(prevPotSize => prevPotSize + playerStack);
      setPlayerStack(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const handRecord: Omit<HandRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      date: new Date().toISOString(),
      position,
      holeCards,
      communityCards,
      actions,
      result,
      notes,
    };
    
    onSubmit(handRecord);
  };

  const renderCommunityCards = () => {
    return (
      <div className="flex space-x-2">
        {[0, 1, 2, 3, 4].map((index) => (
          <Card
            key={index}
            card={communityCards[index]}
            faceDown={!communityCards[index]}
          />
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Hand Input</h2>
        
        {/* Position Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Your Position</h3>
          <PokerTable
            selectedPosition={position}
            onPositionSelect={handlePositionSelect}
            communityCards={communityCards.filter(card => card !== null) as CardType[]}
            heroPosition={position}
            villainPosition={position === Position.BB ? Position.UTG : Position.BB}
            heroCards={holeCards.filter(card => card !== null) as CardType[]}
            potSize={potSize}
            betSize={currentBet}
          />
        </div>
        
        {/* Card Selection */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-medium">Cards</h3>
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${selectionMode === 'hole' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setSelectionMode('hole')}
              >
                Hole Cards
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-md ${selectionMode === 'community' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                onClick={() => setSelectionMode('community')}
              >
                Community Cards
              </button>
            </div>
          </div>
          
          {/* Display selected hole cards */}
          {selectionMode === 'hole' && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Hole Cards</h4>
              <div className="flex space-x-2 mb-2">
                {[0, 1].map((index) => (
                  <Card
                    key={index}
                    card={holeCards[index]}
                    faceDown={!holeCards[index]}
                  />
                ))}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  onClick={() => setShowCardPicker(true)}
                >
                  Select Cards
                </button>
                {holeCards.length > 0 && (
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-600 text-white rounded-md"
                    onClick={() => setHoleCards([])}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Display selected community cards */}
          {selectionMode === 'community' && (
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Community Cards ({currentStage})</h4>
              <div className="flex space-x-2 mb-2">
                {renderCommunityCards()}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  onClick={() => setShowCardPicker(true)}
                >
                  Select Cards
                </button>
                {communityCards.length > 0 && (
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-600 text-white rounded-md"
                    onClick={() => setCommunityCards([])}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Card picker modal */}
          {showCardPicker && (
            <CardPicker
              onCardSelect={handleCardSelect}
              selectedCards={selectionMode === 'hole' ? holeCards : communityCards}
              excludedCards={selectionMode === 'hole' ? communityCards : holeCards}
              onClose={() => setShowCardPicker(false)}
            />
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Actions ({currentStage})</h3>
          <ActionButtons
            stage={currentStage}
            onAction={handleAction}
            currentBet={currentBet}
            minRaise={currentBet * 2}
            playerStack={playerStack}
          />
          
          {/* Display action history */}
          {actions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-medium mb-2">Action History</h4>
              <ul className="bg-gray-100 p-2 rounded">
                {actions.map((action, index) => (
                  <li key={index} className="mb-1">
                    <span className="font-medium">{action.stage}:</span> {action.action}
                    {action.amount ? ` $${action.amount}` : ''}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="text-sm text-red-500 mt-2"
                onClick={() => setActions([])}
              >
                Clear actions
              </button>
            </div>
          )}
        </div>
        
        {/* Result Input */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Result</h3>
          <div className="flex items-center">
            <span className="mr-2">$</span>
            <input
              type="number"
              value={result}
              onChange={(e) => setResult(Number(e.target.value))}
              className="border rounded p-2 w-32"
              placeholder="Amount won/lost"
            />
            <span className="ml-2 text-sm text-gray-500">
              {result > 0 ? 'Won' : result < 0 ? 'Lost' : 'Break even'}
            </span>
          </div>
        </div>
        
        {/* Notes */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded p-2 w-full h-24"
            placeholder="Add notes about the hand..."
          />
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Hand
          </button>
        </div>
      </div>
    </form>
  );
};

export default HandInputForm;
