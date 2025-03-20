using System.ComponentModel.DataAnnotations;

namespace PokerTracker.API.Models;

public record RegisterModel
{
    [Required]
    public required string Username { get; init; }
    
    [Required]
    [EmailAddress]
    public required string Email { get; init; }
    
    [Required]
    [MinLength(6)]
    public required string Password { get; init; }
}

public record LoginModel
{
    [Required]
    public required string Username { get; init; }
    
    [Required]
    public required string Password { get; init; }
}