using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PokerTracker.Application.DTOs;

namespace PokerTracker.Application.Interfaces;

public interface IHandRecordService
{
    Task<IEnumerable<HandRecordDto>> GetHandRecordsByUserIdAsync(string userId);
    Task<HandRecordDto?> GetHandRecordByIdAsync(Guid id, string userId);
    Task<HandRecordDto> CreateHandRecordAsync(CreateHandRecordDto createDto, string userId);
    Task UpdateHandRecordAsync(Guid id, UpdateHandRecordDto updateDto, string userId);
    Task DeleteHandRecordAsync(Guid id, string userId);
}