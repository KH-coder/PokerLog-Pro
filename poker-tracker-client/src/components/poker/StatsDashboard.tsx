import React, { useMemo } from 'react';
import { HandRecord, Position } from '../../types';

interface StatsDashboardProps {
  handRecords: HandRecord[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ handRecords }) => {
  // Calculate overall stats
  const overallStats = useMemo(() => {
    if (!handRecords.length) return null;

    const totalHands = handRecords.length;
    const totalProfit = handRecords.reduce((sum, record) => sum + record.result, 0);
    const winningHands = handRecords.filter(record => record.result > 0).length;
    const losingHands = handRecords.filter(record => record.result < 0).length;
    const breakEvenHands = handRecords.filter(record => record.result === 0).length;
    const winRate = (winningHands / totalHands) * 100;

    return {
      totalHands,
      totalProfit,
      winningHands,
      losingHands,
      breakEvenHands,
      winRate,
    };
  }, [handRecords]);

  // Calculate position stats
  const positionStats = useMemo(() => {
    if (!handRecords.length) return [];

    const stats = Object.values(Position).map(position => {
      const handsInPosition = handRecords.filter(record => record.position === position);
      const totalHands = handsInPosition.length;
      if (totalHands === 0) return { position, totalHands: 0, totalProfit: 0, winRate: 0 };

      const totalProfit = handsInPosition.reduce((sum, record) => sum + record.result, 0);
      const winningHands = handsInPosition.filter(record => record.result > 0).length;
      const winRate = (winningHands / totalHands) * 100;

      return {
        position,
        totalHands,
        totalProfit,
        winRate,
      };
    });

    return stats.sort((a, b) => b.totalProfit - a.totalProfit);
  }, [handRecords]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount >= 0 ? `$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`;
  };

  if (!overallStats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Statistics</h2>
        <p className="text-gray-500">No hand records available to generate statistics.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Statistics Dashboard</h2>

      {/* Overall Stats */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Overall Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Total Profit/Loss</div>
            <div className={`text-2xl font-bold ${overallStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(overallStats.totalProfit)}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Total Hands</div>
            <div className="text-2xl font-bold">{overallStats.totalHands}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Win Rate</div>
            <div className="text-2xl font-bold">{overallStats.winRate.toFixed(1)}%</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Winning Hands</div>
            <div className="text-2xl font-bold text-green-600">{overallStats.winningHands}</div>
            <div className="text-sm text-gray-500">{((overallStats.winningHands / overallStats.totalHands) * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Losing Hands</div>
            <div className="text-2xl font-bold text-red-600">{overallStats.losingHands}</div>
            <div className="text-sm text-gray-500">{((overallStats.losingHands / overallStats.totalHands) * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Break Even</div>
            <div className="text-2xl font-bold text-gray-600">{overallStats.breakEvenHands}</div>
            <div className="text-sm text-gray-500">{((overallStats.breakEvenHands / overallStats.totalHands) * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Position Stats */}
      <div>
        <h3 className="text-lg font-medium mb-4">Performance by Position</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hands
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit/Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positionStats.map((stat) => (
                <tr key={stat.position}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {stat.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.totalHands}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={stat.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(stat.totalProfit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.winRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
