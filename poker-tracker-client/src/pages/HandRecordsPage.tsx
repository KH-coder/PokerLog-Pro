import React, { useState, useEffect } from 'react';
import { HandRecord } from '../types';
import HandInputForm from '../components/poker/HandInputForm';
import HandRecordList from '../components/poker/HandRecordList';
import HandRecordDetail from '../components/poker/HandRecordDetail';
import StatsDashboard from '../components/poker/StatsDashboard';
import { handRecordsApi } from '../api/api';
import { useAuthStore } from '../store/authStore';

const HandRecordsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [handRecords, setHandRecords] = useState<HandRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HandRecord | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'stats'>('records');

  // Fetch hand records
  const fetchHandRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await handRecordsApi.getAll();
      if (response.success) {
        setHandRecords(response.data);
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

  // Load hand records on mount
  useEffect(() => {
    fetchHandRecords();
  }, []);

  // Handle creating a new hand record
  const handleCreateRecord = async (handRecordData: Omit<HandRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!user) {
        setError('You must be logged in to create hand records');
        return;
      }
      
      // Add the userId to the record before sending to API
      const handRecord: Omit<HandRecord, 'id'> = {
        ...handRecordData,
        userId: user.id,  
      };
      
      const response = await handRecordsApi.create(handRecord);
      if (response.success) {
        setHandRecords([...handRecords, response.data]);
        setIsAddingNew(false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to create hand record');
      console.error(err);
    }
  };

  // Handle deleting a hand record
  const handleDeleteRecord = async (recordId: string) => {
    try {
      const response = await handRecordsApi.delete(recordId);
      if (response.success) {
        setHandRecords(handRecords.filter(record => record.id !== recordId));
        if (selectedRecord?.id === recordId) {
          setSelectedRecord(null);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to delete hand record');
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Poker Hand Records</h1>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'records' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('records')}
          >
            Hand Records
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'stats' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {activeTab === 'records' ? (
        <div>
          {!isAddingNew && !selectedRecord && (
            <div className="mb-6">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                onClick={() => setIsAddingNew(true)}
              >
                Add New Hand
              </button>
            </div>
          )}

          {isAddingNew ? (
            <div className="mb-6">
              <HandInputForm
                onSubmit={handleCreateRecord}
              />
              <div className="mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  onClick={() => setIsAddingNew(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedRecord ? (
            <HandRecordDetail
              handRecord={selectedRecord}
              onClose={() => setSelectedRecord(null)}
              onEdit={() => console.log('Edit not implemented yet')}
            />
          ) : (
            <div>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading hand records...</p>
                </div>
              ) : handRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No hand records found. Add your first hand record!</p>
                </div>
              ) : (
                <HandRecordList
                  handRecords={handRecords}
                  onSelectRecord={setSelectedRecord}
                  onDeleteRecord={handleDeleteRecord}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <StatsDashboard handRecords={handRecords} />
      )}
    </div>
  );
};

export default HandRecordsPage;
