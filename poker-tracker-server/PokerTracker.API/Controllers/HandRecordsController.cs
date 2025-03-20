using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PokerTracker.Application.DTOs;
using PokerTracker.Application.Interfaces;

namespace PokerTracker.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class HandRecordsController : ControllerBase
{
    private readonly IHandRecordService _handRecordService;
    
    public HandRecordsController(IHandRecordService handRecordService)
    {
        _handRecordService = handRecordService;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<HandRecordDto>>> GetAll()
    {
        var handRecords = await _handRecordService.GetHandRecordsByUserIdAsync(User.Identity!.Name!);
        return Ok(handRecords);
    }
    
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<HandRecordDto>> GetById(Guid id)
    {
        var handRecord = await _handRecordService.GetHandRecordByIdAsync(id, User.Identity!.Name!);
        
        if (handRecord == null)
        {
            return NotFound();
        }
        
        return Ok(handRecord);
    }
    
    [HttpPost]
    public async Task<ActionResult<HandRecordDto>> Create(CreateHandRecordDto createHandRecordDto)
    {
        var handRecord = await _handRecordService.CreateHandRecordAsync(createHandRecordDto, User.Identity!.Name!);
        return CreatedAtAction(nameof(GetById), new { id = handRecord.Id }, handRecord);
    }
    
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateHandRecordDto updateHandRecordDto)
    {
        await _handRecordService.UpdateHandRecordAsync(id, updateHandRecordDto, User.Identity!.Name!);
        return NoContent();
    }
    
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _handRecordService.DeleteHandRecordAsync(id, User.Identity!.Name!);
        return NoContent();
    }
}