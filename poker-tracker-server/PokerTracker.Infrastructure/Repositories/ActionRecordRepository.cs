using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTracker.Domain.Entities;
using PokerTracker.Domain.Interfaces;
using PokerTracker.Infrastructure.Data;

namespace PokerTracker.Infrastructure.Repositories;

public class ActionRecordRepository : GenericRepository<ActionRecord>, IActionRecordRepository
{
    public ActionRecordRepository(ApplicationDbContext context) : base(context)
    {
    }
    
    public async Task<IEnumerable<ActionRecord>> GetActionsByHandIdAsync(Guid handId)
    {
        return await _dbSet
            .Where(a => a.HandRecordId == handId)
            .OrderBy(a => a.Order)
            .ToListAsync();
    }
}
