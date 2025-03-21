import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HandRecord } from '../types';
import { handRecordsApi } from '../api/api';
import { useAuthStore } from '../store/authStore';
import StatsDashboard from '../components/poker/StatsDashboard';

const NewDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [recentHands, setRecentHands] = useState<HandRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [totalHands, setTotalHands] = useState<number>(0);

  // Fetch hand records
  useEffect(() => {
    const fetchHandRecords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await handRecordsApi.getAll();
        if (response.success) {
          // Sort by date descending
          const sortedRecords = [...response.data].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setRecentHands(sortedRecords.slice(0, 5)); // Get 5 most recent hands
          setTotalHands(sortedRecords.length);
          setTotalProfit(sortedRecords.reduce((sum, record) => sum + record.result, 0));
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError('Failed to fetch hand records');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHandRecords();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount >= 0 ? `$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username || 'Player'}!</h1>
        <p className="text-gray-600">Here's your poker tracking dashboard</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-2">Total Profit/Loss</h2>
          <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalProfit)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-2">Total Hands</h2>
          <p className="text-3xl font-bold">{totalHands}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-2">Average Profit per Hand</h2>
          <p className={`text-3xl font-bold ${totalHands > 0 && totalProfit / totalHands >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalHands > 0 ? formatCurrency(totalProfit / totalHands) : '$0.00'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Hands</h2>
            <Link to="/hands" className="text-blue-500 hover:text-blue-700">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading hand records...</p>
            </div>
          ) : recentHands.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No hand records found. Start tracking your poker hands!</p>
              <Link 
                to="/hands" 
                className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Your First Hand
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentHands.map((hand) => (
                    <tr key={hand.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(hand.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hand.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={hand.result >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(hand.result)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Quick Stats</h2>
            <Link to="/hands?tab=stats" className="text-blue-500 hover:text-blue-700">
              Full Statistics
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading statistics...</p>
            </div>
          ) : recentHands.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No data available for statistics.</p>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              {/* This would be a chart or visualization in a real implementation */}
              <p className="text-gray-600">Statistics visualization would go here</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/hands?new=true" 
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 text-center"
          >
            <div className="text-xl mb-2">Add New Hand</div>
            <p className="text-sm">Record your latest poker hand</p>
          </Link>
          <Link 
            to="/hands?tab=stats" 
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-6 text-center"
          >
            <div className="text-xl mb-2">View Statistics</div>
            <p className="text-sm">Analyze your poker performance</p>
          </Link>
          <Link 
            to="/settings" 
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-6 text-center"
          >
            <div className="text-xl mb-2">Settings</div>
            <p className="text-sm">Configure your poker tracker</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewDashboardPage;
