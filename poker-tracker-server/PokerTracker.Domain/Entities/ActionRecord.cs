using System;

namespace PokerTracker.Domain.Entities;

public class ActionRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid HandRecordId { get; set; }
    public required string Stage { get; set; } // Preflop, Flop, Turn, River
    public required string ActionType { get; set; } // Bet, Call, Raise, Fold, Check
    public decimal? Amount { get; set; }
    public int Order { get; set; }
    
    // 導航屬性
    public HandRecord? HandRecord { get; set; }
}