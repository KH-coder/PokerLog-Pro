using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PokerTracker.Domain.Entities;

namespace PokerTracker.Domain.Interfaces;

public interface IActionRecordRepository
{
    Task<ActionRecord?> GetByIdAsync(Guid id);
    Task<IEnumerable<ActionRecord>> GetAllAsync();
    Task<IEnumerable<ActionRecord>> GetActionsByHandIdAsync(Guid handId);
    Task AddAsync(ActionRecord actionRecord);
    void Update(ActionRecord actionRecord);
    void Delete(ActionRecord actionRecord);
    Task SaveChangesAsync();
}