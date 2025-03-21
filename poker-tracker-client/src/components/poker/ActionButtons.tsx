import React, { useState } from 'react';
import { Action, Stage } from '../../types';

interface ActionButtonsProps {
  stage: Stage;
  onAction: (action: Action, amount?: number) => void;
  currentBet?: number;
  minRaise?: number;
  playerStack?: number;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  stage,
  onAction,
  currentBet = 0,
  minRaise = 0,
  playerStack = 1000,
}) => {
  const [betAmount, setBetAmount] = useState<number>(minRaise || currentBet * 2);

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setBetAmount(Math.min(value, playerStack));
    }
  };

  const renderBetSlider = () => {
    return (
      <div className="mt-2 flex flex-col space-y-2">
        <div className="flex justify-between">
          <span>{minRaise}</span>
          <span>{playerStack}</span>
        </div>
        <input
          type="range"
          min={minRaise}
          max={playerStack}
          value={betAmount}
          onChange={handleBetChange}
          className="w-full"
        />
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={betAmount}
            onChange={handleBetChange}
            className="w-24 p-1 border rounded"
            min={minRaise}
            max={playerStack}
          />
          <div className="flex space-x-1">
            <button 
              className="px-2 py-1 bg-gray-200 rounded" 
              onClick={() => setBetAmount(Math.max(minRaise, Math.floor(playerStack * 0.25)))}
            >
              25%
            </button>
            <button 
              className="px-2 py-1 bg-gray-200 rounded" 
              onClick={() => setBetAmount(Math.max(minRaise, Math.floor(playerStack * 0.5)))}
            >
              50%
            </button>
            <button 
              className="px-2 py-1 bg-gray-200 rounded" 
              onClick={() => setBetAmount(Math.max(minRaise, Math.floor(playerStack * 0.75)))}
            >
              75%
            </button>
            <button 
              className="px-2 py-1 bg-gray-200 rounded" 
              onClick={() => setBetAmount(playerStack)}
            >
              All-in
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="flex flex-wrap gap-2">
        {/* Fold button - always available except preflop when checking is free */}
        {!(stage === Stage.PREFLOP && currentBet === 0) && (
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={() => onAction(Action.FOLD)}
          >
            Fold
          </button>
        )}

        {/* Check button - only available when no bet to call */}
        {currentBet === 0 && (
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={() => onAction(Action.CHECK)}
          >
            Check
          </button>
        )}

        {/* Call button - only available when there's a bet to call */}
        {currentBet > 0 && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => onAction(Action.CALL, currentBet)}
          >
            Call ${currentBet}
          </button>
        )}

        {/* Bet button - only available when no current bet */}
        {currentBet === 0 && (
          <>
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              onClick={() => onAction(Action.BET, betAmount)}
            >
              Bet ${betAmount}
            </button>
            {renderBetSlider()}
          </>
        )}

        {/* Raise button - only available when there's a current bet */}
        {currentBet > 0 && (
          <>
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              onClick={() => onAction(Action.RAISE, betAmount)}
            >
              Raise to ${betAmount}
            </button>
            {renderBetSlider()}
          </>
        )}

        {/* All-in button - always available */}
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          onClick={() => onAction(Action.ALL_IN, playerStack)}
        >
          All-in ${playerStack}
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;
