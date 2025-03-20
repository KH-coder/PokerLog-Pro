using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PokerTracker.Domain.Entities;

namespace PokerTracker.Domain.Interfaces;

public interface ISyncQueueRepository
{
    Task<SyncQueue?> GetByIdAsync(Guid id);
    Task<IEnumerable<SyncQueue>> GetAllAsync();
    Task<IEnumerable<SyncQueue>> GetPendingSyncItemsAsync(int limit = 10);
    Task<IEnumerable<SyncQueue>> GetFailedSyncItemsAsync();
    Task AddAsync(SyncQueue syncQueue);
    void Update(SyncQueue syncQueue);
    void Delete(SyncQueue syncQueue);
    Task SaveChangesAsync();
}