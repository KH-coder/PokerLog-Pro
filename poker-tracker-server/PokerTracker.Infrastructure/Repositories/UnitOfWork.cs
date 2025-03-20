using System;
using System.Threading.Tasks;
using PokerTracker.Domain.Interfaces;
using PokerTracker.Infrastructure.Data;

namespace PokerTracker.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IHandRecordRepository _handRecordRepository;
    private IActionRecordRepository _actionRecordRepository;
    private ISyncQueueRepository _syncQueueRepository;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IHandRecordRepository HandRecords => 
        _handRecordRepository ??= new HandRecordRepository(_context);

    public IActionRecordRepository ActionRecords => 
        _actionRecordRepository ??= new ActionRecordRepository(_context);

    public ISyncQueueRepository SyncQueue => 
        _syncQueueRepository ??= new SyncQueueRepository(_context);

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}