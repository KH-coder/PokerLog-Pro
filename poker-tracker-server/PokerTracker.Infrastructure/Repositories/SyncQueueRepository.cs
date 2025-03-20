using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTracker.Domain.Entities;
using PokerTracker.Domain.Interfaces;
using PokerTracker.Infrastructure.Data;

namespace PokerTracker.Infrastructure.Repositories;

public class SyncQueueRepository : GenericRepository<SyncQueue>, ISyncQueueRepository
{
    public SyncQueueRepository(ApplicationDbContext context) : base(context)
    {
    }
    
    public async Task<IEnumerable<SyncQueue>> GetPendingSyncItemsAsync(int limit = 10)
    {
        return await _dbSet
            .Where(s => s.Status == "Pending" || (s.Status == "Failed" && s.RetryCount < 3))
            .OrderBy(s => s.CreatedAt)
            .Take(limit)
            .Include(s => s.HandRecord)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<SyncQueue>> GetFailedSyncItemsAsync()
    {
        return await _dbSet
            .Where(s => s.Status == "Failed" && s.RetryCount >= 3)
            .OrderByDescending(s => s.CreatedAt)
            .Include(s => s.HandRecord)
            .ToListAsync();
    }
}