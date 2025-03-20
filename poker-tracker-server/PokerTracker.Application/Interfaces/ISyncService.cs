using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PokerTracker.Application.DTOs;

namespace PokerTracker.Application.Interfaces;

public interface ISyncService
{
    Task<IEnumerable<SyncQueueDto>> GetPendingSyncItemsAsync(int limit = 10);
    Task<IEnumerable<SyncQueueDto>> GetFailedSyncItemsAsync();
    Task ProcessSyncQueueAsync(int limit = 10);
    Task QueueHandForSyncAsync(Guid handRecordId);
}