using System;

namespace PokerTracker.Application.DTOs;

public class ActionRecordDto
{
    public Guid Id { get; set; }
    public Guid HandRecordId { get; set; }
    public string Stage { get; set; } = null!;
    public string ActionType { get; set; } = null!;
    public decimal? Amount { get; set; }
    public int Order { get; set; }
}

public class CreateActionRecordDto
{
    public string Stage { get; set; } = null!;
    public string ActionType { get; set; } = null!;
    public decimal? Amount { get; set; }
    public int Order { get; set; }
}

public class UpdateActionRecordDto
{
    public string Stage { get; set; } = null!;
    public string ActionType { get; set; } = null!;
    public decimal? Amount { get; set; }
    public int Order { get; set; }
}