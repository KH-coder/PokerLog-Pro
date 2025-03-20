using System;
using System.Collections.Generic;

namespace PokerTracker.Application.DTOs;

public class HandRecordDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = null!;
    public DateTime Timestamp { get; set; }
    public string Position { get; set; } = null!;
    public string HoleCards { get; set; } = null!;
    public string? CommunityCards { get; set; }
    public decimal PotSize { get; set; }
    public bool IsWinner { get; set; }
    public decimal AmountWon { get; set; }
    public string? Notes { get; set; }
    public string? GameType { get; set; }
    public string? TableName { get; set; }
    public bool IsSyncedToNotion { get; set; }
    public string? SyncStatus { get; set; }
    public List<ActionRecordDto> Actions { get; set; } = [];
}

public class CreateHandRecordDto
{
    public string Position { get; set; } = null!;
    public string HoleCards { get; set; } = null!;
    public string? CommunityCards { get; set; }
    public decimal PotSize { get; set; }
    public bool IsWinner { get; set; }
    public decimal AmountWon { get; set; }
    public string? Notes { get; set; }
    public string? GameType { get; set; }
    public string? TableName { get; set; }
    public List<CreateActionRecordDto> Actions { get; set; } = [];
}

public class UpdateHandRecordDto
{
    public string Position { get; set; } = null!;
    public string HoleCards { get; set; } = null!;
    public string? CommunityCards { get; set; }
    public decimal PotSize { get; set; }
    public bool IsWinner { get; set; }
    public decimal AmountWon { get; set; }
    public string? Notes { get; set; }
    public string? GameType { get; set; }
    public string? TableName { get; set; }
    public List<UpdateActionRecordDto> Actions { get; set; } = [];
}