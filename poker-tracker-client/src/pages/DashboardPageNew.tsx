import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHandRecordStore } from '../store/handRecordStore';
import { formatDate } from '../utils/formatters';
import { Position } from '../types';

const DashboardPageNew: React.FC = () => {
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #e5e7eb', 
          borderTopColor: '#0284c7',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '6px', color: '#b91c1c' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Hand Records Dashboard</h1>
        <Link 
          to="/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#0284c7',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: '500',
            fontSize: '14px',
            textDecoration: 'none',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          Add New Record
        </Link>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Records</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>{handRecords.length}</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Profit</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: totalProfit >= 0 ? '#059669' : '#dc2626' }}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Win Rate</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            {handRecords.length > 0 
              ? `${Math.round((handRecords.filter(r => r.result > 0).length / handRecords.length) * 100)}%` 
              : '0%'}
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Average Profit</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: totalProfit / Math.max(1, handRecords.length) >= 0 ? '#059669' : '#dc2626' }}>
            {handRecords.length > 0 
              ? (totalProfit / handRecords.length).toFixed(2) 
              : '0'}
          </div>
        </div>
      </div>

      {/* Position Stats Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827' }}>Position Statistics</h3>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
            <div>Position</div>
            <div>Hands</div>
            <div>Win Rate</div>
            <div>Total Profit</div>
            <div>Average Profit</div>
          </div>
        </div>
        <div>
          {Object.entries(positionStats).map(([position, stats]) => (
            <div key={position} style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{position}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{stats.count}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {stats.count > 0 
                    ? `${Math.round((handRecords.filter(r => r.position === position && r.result > 0).length / stats.count) * 100)}%` 
                    : '0%'}
                </div>
                <div style={{ fontSize: '14px', color: stats.profit >= 0 ? '#059669' : '#dc2626' }}>
                  {stats.profit >= 0 ? '+' : ''}{stats.profit}
                </div>
                <div style={{ fontSize: '14px', color: stats.average >= 0 ? '#059669' : '#dc2626' }}>
                  {stats.average.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Hands */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827' }}>Recent Records</h3>
          <Link to="/records" style={{ fontSize: '14px', color: '#0284c7', textDecoration: 'none' }}>View All</Link>
        </div>
        
        {handRecords.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
            No records found. Click the "Add New Record" button to create one.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Position</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Cards</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Result</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {handRecords.slice(0, 5).map((record) => (
                  <tr key={record.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{formatDate(record.date)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{record.position}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {record.holeCards.map(card => `${card.rank}${card.suit.charAt(0)}`).join(' ')}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: record.result >= 0 ? '#059669' : '#dc2626', whiteSpace: 'nowrap' }}>
                      {record.result >= 0 ? '+' : ''}{record.result}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link to={`/records/${record.id}`} style={{ color: '#0284c7', textDecoration: 'none', marginRight: '16px' }}>View</Link>
                      <Link to={`/records/${record.id}/edit`} style={{ color: '#0284c7', textDecoration: 'none' }}>Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPageNew;
