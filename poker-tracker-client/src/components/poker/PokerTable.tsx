import React from 'react';
import { Position, Card as CardType } from '../../types';
import Card from './Card';
import './PokerTable.css';

interface PokerTableProps {
  selectedPosition?: Position;
  onPositionSelect?: (position: Position) => void;
  communityCards?: CardType[];
  heroPosition?: Position;
  villainPosition?: Position;
  heroCards?: CardType[];
  villainCards?: CardType[];
  potSize?: number;
  betSize?: number;
  players?: {
    position: Position;
    chips?: number;
    isActive?: boolean;
    avatar?: string;
    name?: string;
    cards?: CardType[];
  }[];
}

const PokerTable: React.FC<PokerTableProps> = ({
  selectedPosition,
  onPositionSelect,
  communityCards = [],
  heroPosition,
  villainPosition,
  heroCards = [],
  villainCards = [],
  potSize = 0,
  betSize = 0,
  players = [],
}) => {
  // Define the positions on the table
  const tablePositions = [
    { position: Position.BTN, x: '50%', y: '85%', label: 'BTN' },
    { position: Position.SB, x: '30%', y: '75%', label: 'SB' },
    { position: Position.BB, x: '15%', y: '50%', label: 'BB' },
    { position: Position.UTG, x: '30%', y: '25%', label: 'UTG' },
    { position: Position.MP, x: '50%', y: '15%', label: 'MP' },
    { position: Position.CO, x: '70%', y: '25%', label: 'CO' },
    { position: Position.HJ, x: '70%', y: '75%', label: 'HJ' },
  ];

  // Get hero and villain positions
  const hero = players.find(p => p.position === heroPosition);
  const villain = players.find(p => p.position === villainPosition);
  
  // Get position labels
  const getPositionLabel = (pos?: Position) => {
    if (!pos) return '';
    return tablePositions.find(p => p.position === pos)?.label || '';
  };

  const heroLabel = getPositionLabel(heroPosition);
  const villainLabel = getPositionLabel(villainPosition);

  return (
    <div className="poker-table">
      {/* Header with position vs position and pot size */}
      {heroPosition && villainPosition && (
        <div className="table-header">
          <div>{heroLabel} vs. {villainLabel}</div>
          <div className="pot-size">{potSize > 0 ? `${potSize} BB` : ''}</div>
        </div>
      )}

      {/* Center area for community cards */}
      <div className="community-cards">
        {communityCards.map((card, index) => (
          <Card key={`community-${index}`} card={card} />
        ))}
      </div>
        
      {/* Bet size indicator */}
      {betSize > 0 && (
        <div className="bet-size">
          {betSize} BB {betSize > 0 && <span className="text-xs">(Last bet)</span>}
        </div>
      )}

      {/* Hero and villain cards */}
      {heroPosition && (
        <div className="hero-position">
          <div className="position-cards">
            {heroCards.map((card, index) => (
              <Card key={`hero-${index}`} card={card} />
            ))}
          </div>
          <div className="position-label hero-label">
            {heroLabel} {hero?.chips && hero.chips}
          </div>
        </div>
      )}

      {villainPosition && (
        <div className="villain-position">
          <div className="position-label villain-label">
            {villainLabel} {villain?.chips && villain.chips}
          </div>
          <div className="position-cards">
            {villainCards.map((card, index) => (
              <Card key={`villain-${index}`} card={card} />
            ))}
          </div>
        </div>
      )}

      {/* Positions around the table */}
      {tablePositions.map(({ position, x, y, label }) => {
        const player = players.find((p) => p.position === position);
        const isSelected = selectedPosition === position;
        const isHero = position === heroPosition;
        const isVillain = position === villainPosition;
        
        // Don't show hero and villain positions as they're displayed separately
        if (isHero || isVillain) return null;
        
        return (
          <div
            key={position}
            className="table-position"
            style={{ top: y, left: x }}
            onClick={() => onPositionSelect?.(position)}
          >
            <div className={`position-circle ${player?.isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}>
              <div>{label}</div>
              {player?.chips !== undefined && (
                <div className="position-chips">{player.chips}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PokerTable;
