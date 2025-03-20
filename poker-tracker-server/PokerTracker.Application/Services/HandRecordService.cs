// PokerTracker.Application/Services/HandRecordService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PokerTracker.Application.DTOs;
using PokerTracker.Application.Interfaces;
using PokerTracker.Domain.Entities;
using PokerTracker.Domain.Interfaces;

namespace PokerTracker.Application.Services;

public class HandRecordService : IHandRecordService
{
    private readonly IUnitOfWork _unitOfWork;

    public HandRecordService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<HandRecordDto>> GetHandRecordsByUserIdAsync(string userId)
    {
        var hands = await _unitOfWork.HandRecords.GetHandsByUserIdAsync(userId);
        
        var handDtos = new List<HandRecordDto>();
        foreach (var hand in hands)
        {
            var actions = await _unitOfWork.ActionRecords.GetActionsByHandIdAsync(hand.Id);
            var handDto = MapToHandRecordDto(hand, actions);
            handDtos.Add(handDto);
        }
        
        return handDtos;
    }

    public async Task<HandRecordDto?> GetHandRecordByIdAsync(Guid id, string userId)
    {
        var hand = await _unitOfWork.HandRecords.GetHandWithActionsAsync(id);
        if (hand == null || hand.UserId != userId)
        {
            return null;
        }

        return MapToHandRecordDto(hand, hand.Actions);
    }

    public async Task<HandRecordDto> CreateHandRecordAsync(CreateHandRecordDto createDto, string userId)
    {
        var hand = new HandRecord
        {
            UserId = userId,
            Position = createDto.Position,
            HoleCards = createDto.HoleCards,
            CommunityCards = createDto.CommunityCards,
            PotSize = createDto.PotSize,
            IsWinner = createDto.IsWinner,
            AmountWon = createDto.AmountWon,
            Notes = createDto.Notes,
            GameType = createDto.GameType,
            TableName = createDto.TableName,
            SyncStatus = "Pending"
        };

        await _unitOfWork.HandRecords.AddAsync(hand);
        
        // 添加動作記錄
        if (createDto.Actions != null && createDto.Actions.Count > 0)
        {
            foreach (var actionDto in createDto.Actions)
            {
                var action = new ActionRecord
                {
                    HandRecordId = hand.Id,
                    Stage = actionDto.Stage,
                    ActionType = actionDto.ActionType,
                    Amount = actionDto.Amount,
                    Order = actionDto.Order
                };
                
                await _unitOfWork.ActionRecords.AddAsync(action);
            }
        }
        
        await _unitOfWork.CompleteAsync();

        // 添加到同步隊列
        var syncQueueItem = new SyncQueue
        {
            HandRecordId = hand.Id,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            RetryCount = 0
        };

        await _unitOfWork.SyncQueue.AddAsync(syncQueueItem);
        await _unitOfWork.CompleteAsync();

        var updatedHand = await _unitOfWork.HandRecords.GetHandWithActionsAsync(hand.Id);
        return MapToHandRecordDto(updatedHand!, updatedHand!.Actions);
    }

    public async Task UpdateHandRecordAsync(Guid id, UpdateHandRecordDto updateDto, string userId)
    {
        var hand = await _unitOfWork.HandRecords.GetHandWithActionsAsync(id);
        if (hand == null || hand.UserId != userId)
        {
            throw new KeyNotFoundException($"Hand record with ID {id} not found or you don't have permission to access it.");
        }

        // 更新基本信息
        hand.Position = updateDto.Position;
        hand.HoleCards = updateDto.HoleCards;
        hand.CommunityCards = updateDto.CommunityCards;
        hand.PotSize = updateDto.PotSize;
        hand.IsWinner = updateDto.IsWinner;
        hand.AmountWon = updateDto.AmountWon;
        hand.Notes = updateDto.Notes;
        hand.GameType = updateDto.GameType;
        hand.TableName = updateDto.TableName;
        hand.SyncStatus = "Pending"; // 更新後需要重新同步

        _unitOfWork.HandRecords.Update(hand);
        
        // 處理動作記錄更新
        // 這裡採用簡單策略：刪除所有現有動作並添加新動作
        var existingActions = await _unitOfWork.ActionRecords.GetActionsByHandIdAsync(id);
        foreach (var action in existingActions)
        {
            _unitOfWork.ActionRecords.Delete(action);
        }
        
        if (updateDto.Actions != null && updateDto.Actions.Count > 0)
        {
            foreach (var actionDto in updateDto.Actions)
            {
                var action = new ActionRecord
                {
                    HandRecordId = hand.Id,
                    Stage = actionDto.Stage,
                    ActionType = actionDto.ActionType,
                    Amount = actionDto.Amount,
                    Order = actionDto.Order
                };
                
                await _unitOfWork.ActionRecords.AddAsync(action);
            }
        }
        
        await _unitOfWork.CompleteAsync();

        // 添加到同步隊列
        var syncQueueItem = new SyncQueue
        {
            HandRecordId = hand.Id,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            RetryCount = 0
        };

        await _unitOfWork.SyncQueue.AddAsync(syncQueueItem);
        await _unitOfWork.CompleteAsync();
    }

    public async Task DeleteHandRecordAsync(Guid id, string userId)
    {
        var hand = await _unitOfWork.HandRecords.GetByIdAsync(id);
        if (hand == null || hand.UserId != userId)
        {
            throw new KeyNotFoundException($"Hand record with ID {id} not found or you don't have permission to access it.");
        }

        _unitOfWork.HandRecords.Delete(hand);
        await _unitOfWork.CompleteAsync();
    }

    // Helper methods
    private HandRecordDto MapToHandRecordDto(HandRecord hand, IEnumerable<ActionRecord> actions)
    {
        return new HandRecordDto
        {
            Id = hand.Id,
            UserId = hand.UserId,
            Timestamp = hand.Timestamp,
            Position = hand.Position,
            HoleCards = hand.HoleCards,
            CommunityCards = hand.CommunityCards,
            PotSize = hand.PotSize,
            IsWinner = hand.IsWinner,
            AmountWon = hand.AmountWon,
            Notes = hand.Notes,
            GameType = hand.GameType,
            TableName = hand.TableName,
            IsSyncedToNotion = hand.IsSyncedToNotion,
            SyncStatus = hand.SyncStatus,
            Actions = actions.Select(a => new ActionRecordDto
            {
                Id = a.Id,
                HandRecordId = a.HandRecordId,
                Stage = a.Stage,
                ActionType = a.ActionType,
                Amount = a.Amount,
                Order = a.Order
            }).ToList()
        };
    }
}