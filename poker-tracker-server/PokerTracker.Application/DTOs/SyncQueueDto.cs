using System;

namespace PokerTracker.Application.DTOs;

public class SyncQueueDto
{
    public Guid Id { get; set; }
    public Guid HandRecordId { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int RetryCount { get; set; }
    public string? ErrorMessage { get; set; }
}