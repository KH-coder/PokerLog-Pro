using System;
using System.Collections.Generic;

namespace PokerTracker.Domain.Entities;

public class HandRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string UserId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public required string Position { get; set; }
    public required string HoleCards { get; set; }
    public string? CommunityCards { get; set; }
    public decimal PotSize { get; set; }
    public bool IsWinner { get; set; }
    public decimal AmountWon { get; set; }
    public string? Notes { get; set; }
    public string? GameType { get; set; }
    public string? TableName { get; set; }
    
    // 同步相關屬性
    public bool IsSyncedToNotion { get; set; }
    public string? SyncStatus { get; set; }
    public string? NotionPageId { get; set; }
    public DateTime? LastSyncAttempt { get; set; }
    
    // 關聯導航屬性
    public ICollection<ActionRecord> Actions { get; set; } = [];
}