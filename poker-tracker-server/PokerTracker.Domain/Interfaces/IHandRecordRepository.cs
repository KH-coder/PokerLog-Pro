using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PokerTracker.Domain.Entities;

namespace PokerTracker.Domain.Interfaces;

public interface IHandRecordRepository
{
    Task<HandRecord?> GetByIdAsync(Guid id);
    Task<HandRecord?> GetHandWithActionsAsync(Guid id);
    Task<IEnumerable<HandRecord>> GetAllAsync();
    Task<IEnumerable<HandRecord>> GetHandsByUserIdAsync(string userId);
    Task<IEnumerable<HandRecord>> GetHandsPendingSyncAsync();
    Task AddAsync(HandRecord handRecord);
    void Update(HandRecord handRecord);
    void Delete(HandRecord handRecord);
    Task SaveChangesAsync();
}