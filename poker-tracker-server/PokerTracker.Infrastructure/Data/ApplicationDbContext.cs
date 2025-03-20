using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PokerTracker.Domain.Entities;

namespace PokerTracker.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<HandRecord> HandRecords => Set<HandRecord>();
    public DbSet<ActionRecord> ActionRecords => Set<ActionRecord>();
    public DbSet<SyncQueue> SyncQueue => Set<SyncQueue>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // PostgreSQL 特定設定
        modelBuilder.Entity<HandRecord>()
            .Property(h => h.Id)
            .HasColumnType("uuid");
            
        modelBuilder.Entity<ActionRecord>()
            .Property(a => a.Id)
            .HasColumnType("uuid");
            
        modelBuilder.Entity<SyncQueue>()
            .Property(s => s.Id)
            .HasColumnType("uuid");
        
        // 關係設定
        modelBuilder.Entity<HandRecord>()
            .HasMany(h => h.Actions)
            .WithOne(a => a.HandRecord)
            .HasForeignKey(a => a.HandRecordId)
            .OnDelete(DeleteBehavior.Cascade);
                
        modelBuilder.Entity<SyncQueue>()
            .HasOne(sq => sq.HandRecord)
            .WithMany()
            .HasForeignKey(sq => sq.HandRecordId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}