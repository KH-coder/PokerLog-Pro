using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTracker.Domain.Entities;
using PokerTracker.Domain.Interfaces;
using PokerTracker.Infrastructure.Data;

namespace PokerTracker.Infrastructure.Repositories;

public class HandRecordRepository : GenericRepository<HandRecord>, IHandRecordRepository
{
    public HandRecordRepository(ApplicationDbContext context) : base(context)
    {
    }
    
    public async Task<HandRecord?> GetHandWithActionsAsync(Guid id)
    {
        return await _dbSet
            .Include(h => h.Actions.OrderBy(a => a.Order))
            .FirstOrDefaultAsync(h => h.Id == id);
    }
    
    public async Task<IEnumerable<HandRecord>> GetHandsByUserIdAsync(string userId)
    {
        return await _dbSet
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.Timestamp)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<HandRecord>> GetHandsPendingSyncAsync()
    {
        return await _dbSet
            .Where(h => h.SyncStatus == "Pending" || h.SyncStatus == null)
            .ToListAsync();
    }
}
