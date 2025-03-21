import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHandRecordStore } from '../store/handRecordStore';
import { formatDate, formatCurrency, formatPercentage } from '../utils/formatters';
import { Position } from '../types';

const DashboardPage: React.FC = () => {
  const { handRecords, isLoading, error, fetchHandRecords } = useHandRecordStore();

  useEffect(() => {
    fetchHandRecords();
  }, [fetchHandRecords]);

  // Calculate total profit/loss
  const totalProfit = handRecords.reduce((sum, record) => sum + record.result, 0);

  // Get position stats
  const positionStats = Object.values(Position).reduce((stats, position) => {
    const positionRecords = handRecords.filter(record => record.position === position);
    const positionProfit = positionRecords.reduce((sum, record) => sum + record.result, 0);
    const count = positionRecords.length;
    
    return {
      ...stats,
      [position]: {
        count,
        profit: positionProfit,
        average: count > 0 ? positionProfit / count : 0
      }
    };
  }, {} as Record<Position, { count: number; profit: number; average: number }>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-red-800">{error}</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hand Records Dashboard</h1>
        <Link
          to="/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Add New Record
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Records</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{handRecords.length}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Profit</dt>
            <dd className={`mt-1 text-3xl font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalProfit}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Win Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {handRecords.length > 0 
                ? `${Math.round((handRecords.filter(r => r.result > 0).length / handRecords.length) * 100)}%` 
                : '0%'}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Average Profit</dt>
            <dd className={`mt-1 text-3xl font-semibold ${totalProfit / Math.max(1, handRecords.length) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {handRecords.length > 0 
                ? (totalProfit / handRecords.length).toFixed(2) 
                : '0'}
            </dd>
          </div>
        </div>
      </div>

      {/* Position Stats */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Position Statistics</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-500">
              <div>Position</div>
              <div>Hands</div>
              <div>Win Rate</div>
              <div>Total Profit</div>
              <div>Average Profit</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {Object.entries(positionStats).map(([position, stats]) => (
              <div key={position} className="px-4 py-3 sm:px-6">
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-sm font-medium text-gray-900">{position}</div>
                  <div className="text-sm text-gray-500">{stats.count}</div>
                  <div className="text-sm text-gray-500">
                    {stats.count > 0 
                      ? `${Math.round((handRecords.filter(r => r.position === position && r.result > 0).length / stats.count) * 100)}%` 
                      : '0%'}
                  </div>
                  <div className={`text-sm ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.profit >= 0 ? '+' : ''}{stats.profit}
                  </div>
                  <div className={`text-sm ${stats.average >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.average.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Hands */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Records</h3>
          <Link to="/records" className="text-sm text-primary-600 hover:text-primary-500">View All</Link>
        </div>
        <div className="border-t border-gray-200">
          {handRecords.length === 0 ? (
            <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
              No records found. Click the "Add New Record" button to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cards</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {handRecords.slice(0, 5).map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.holeCards.map(card => `${card.rank}${card.suit.charAt(0)}`).join(' ')}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${record.result >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {record.result >= 0 ? '+' : ''}{record.result}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/records/${record.id}`} className="text-primary-600 hover:text-primary-900 mr-4">View</Link>
                        <Link to={`/records/${record.id}/edit`} className="text-primary-600 hover:text-primary-900">Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
