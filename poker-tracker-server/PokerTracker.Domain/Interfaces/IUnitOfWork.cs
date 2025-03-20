using System;
using System.Threading.Tasks;

namespace PokerTracker.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IHandRecordRepository HandRecords { get; }
    IActionRecordRepository ActionRecords { get; }
    ISyncQueueRepository SyncQueue { get; }
    Task<int> CompleteAsync();
}