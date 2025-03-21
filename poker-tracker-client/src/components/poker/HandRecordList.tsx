import React from 'react';
import { HandRecord, Position } from '../../types';

interface HandRecordListProps {
  handRecords: HandRecord[];
  onSelectRecord: (record: HandRecord) => void;
  onDeleteRecord?: (recordId: string) => void;
}

const HandRecordList: React.FC<HandRecordListProps> = ({
  handRecords,
  onSelectRecord,
  onDeleteRecord,
}) => {
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format result with color and sign
  const formatResult = (result: number) => {
    const formattedResult = result > 0 ? `+$${result}` : `$${result}`;
    const colorClass = result > 0 ? 'text-green-600' : result < 0 ? 'text-red-600' : 'text-gray-600';
    
    return <span className={colorClass}>{formattedResult}</span>;
  };

  // Get a summary of hole cards
  const getHoleCardsSummary = (record: HandRecord) => {
    if (!record.holeCards || record.holeCards.length === 0) {
      return 'No cards';
    }
    
    return record.holeCards.map(card => `${card.rank}${getCardSuitSymbol(card.suit)}`).join(' ');
  };

  // Get card suit symbol
  const getCardSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cards
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Result
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {handRecords.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                No hand records found
              </td>
            </tr>
          ) : (
            handRecords.map((record) => (
              <tr 
                key={record.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectRecord(record)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(record.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {getHoleCardsSummary(record)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {formatResult(record.result)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRecord(record);
                    }}
                  >
                    View
                  </button>
                  {onDeleteRecord && (
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (record.id && window.confirm('Are you sure you want to delete this record?')) {
                          onDeleteRecord(record.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HandRecordList;
