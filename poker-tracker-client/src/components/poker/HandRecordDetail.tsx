import React from 'react';
import { HandRecord, Stage, Position, Action } from '../../types';
import Card from './Card';
import PokerTable from './PokerTable';

interface HandRecordDetailProps {
  handRecord: HandRecord;
  onEdit?: () => void;
  onClose: () => void;
}

const HandRecordDetail: React.FC<HandRecordDetailProps> = ({
  handRecord,
  onEdit,
  onClose,
}) => {
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Group actions by stage
  const actionsByStage = handRecord.actions.reduce((acc, action) => {
    if (!acc[action.stage]) {
      acc[action.stage] = [];
    }
    acc[action.stage].push(action);
    return acc;
  }, {} as Record<Stage, typeof handRecord.actions>);

  // Format result with color and sign
  const formatResult = (result: number) => {
    const formattedResult = result > 0 ? `+$${result}` : `$${result}`;
    const colorClass = result > 0 ? 'text-green-600' : result < 0 ? 'text-red-600' : 'text-gray-600';
    
    return <span className={colorClass}>{formattedResult}</span>;
  };

  // Calculate pot size from actions
  const calculatePotSize = () => {
    let pot = 1.5; // Starting pot (blinds)
    
    handRecord.actions.forEach(action => {
      if (action.action === Action.BET || action.action === Action.RAISE || 
          action.action === Action.CALL || action.action === Action.ALL_IN) {
        pot += action.amount || 0;
      }
    });
    
    return pot;
  };
  
  // Get the last bet amount
  const getLastBetAmount = () => {
    const bettingActions = handRecord.actions.filter(action => 
      action.action === Action.BET || action.action === Action.RAISE || action.action === Action.ALL_IN
    );
    
    if (bettingActions.length > 0) {
      return bettingActions[bettingActions.length - 1].amount || 0;
    }
    
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Hand Record Details</h2>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Date:</span> {formatDate(handRecord.date)}
            </div>
            <div>
              <span className="font-medium">Position:</span> {handRecord.position}
            </div>
            <div>
              <span className="font-medium">Result:</span> {formatResult(handRecord.result)}
            </div>
          </div>

          <h3 className="text-lg font-medium mt-6 mb-4">Hole Cards</h3>
          <div className="flex space-x-2">
            {handRecord.holeCards.map((card, index) => (
              <Card key={index} card={card} size="lg" />
            ))}
          </div>

          <h3 className="text-lg font-medium mt-6 mb-4">Actions</h3>
          {Object.entries(actionsByStage).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(actionsByStage).map(([stage, actions]) => (
                <div key={stage}>
                  <h4 className="font-medium capitalize">{stage}</h4>
                  <ul className="list-disc list-inside pl-4">
                    {actions.map((action, index) => (
                      <li key={index}>
                        {action.action} {action.amount ? `$${action.amount}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400">No actions recorded</div>
          )}

          {handRecord.notes && (
            <>
              <h3 className="text-lg font-medium mt-6 mb-4">Notes</h3>
              <div className="bg-gray-50 p-4 rounded">
                {handRecord.notes}
              </div>
            </>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Table View</h3>
          <PokerTable
            selectedPosition={handRecord.position}
            communityCards={handRecord.communityCards || []}
            heroPosition={handRecord.position}
            villainPosition={handRecord.position === Position.BB ? Position.UTG : Position.BB}
            heroCards={handRecord.holeCards}
            potSize={calculatePotSize()}
            betSize={getLastBetAmount()}
          />
        </div>
      </div>
    </div>
  );
};

export default HandRecordDetail;
