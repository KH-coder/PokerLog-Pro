// PokerTracker.API/Controllers/HandsController.cs
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PokerTracker.Application.DTOs;
using PokerTracker.Application.Interfaces;

namespace PokerTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HandsController : ControllerBase
{
    private readonly IHandRecordService _handRecordService;

    public HandsController(IHandRecordService handRecordService)
    {
        _handRecordService = handRecordService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HandRecordDto>>> GetHands()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var hands = await _handRecordService.GetHandRecordsByUserIdAsync(userId);
        return Ok(hands);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<HandRecordDto>> GetHand(Guid id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var hand = await _handRecordService.GetHandRecordByIdAsync(id, userId);
        if (hand == null)
        {
            return NotFound();
        }

        return Ok(hand);
    }

    [HttpPost]
    public async Task<ActionResult<HandRecordDto>> CreateHand(CreateHandRecordDto createDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var handDto = await _handRecordService.CreateHandRecordAsync(createDto, userId);
        return CreatedAtAction(nameof(GetHand), new { id = handDto.Id }, handDto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateHand(Guid id, UpdateHandRecordDto updateDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        try
        {
            await _handRecordService.UpdateHandRecordAsync(id, updateDto, userId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteHand(Guid id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        try
        {
            await _handRecordService.DeleteHandRecordAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}