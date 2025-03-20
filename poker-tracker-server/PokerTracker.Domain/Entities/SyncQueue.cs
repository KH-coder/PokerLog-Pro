using System;

namespace PokerTracker.Domain.Entities;

public class SyncQueue
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid HandRecordId { get; set; }
    public required string Status { get; set; } // Pending, Processing, Completed, Failed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public int RetryCount { get; set; }
    public string? ErrorMessage { get; set; }
    
    // 導航屬性
    public HandRecord? HandRecord { get; set; }
}