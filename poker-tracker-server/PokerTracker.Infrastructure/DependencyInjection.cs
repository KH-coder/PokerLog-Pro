using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PokerTracker.Domain.Interfaces;
using PokerTracker.Infrastructure.Data;
using PokerTracker.Infrastructure.Repositories;

namespace PokerTracker.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // 註冊 DbContext
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            // 使用 PostgreSQL
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly("PokerTracker.Infrastructure"));
        });

        // 註冊存儲庫和工作單元
        services.AddScoped<IHandRecordRepository, HandRecordRepository>();
        services.AddScoped<IActionRecordRepository, ActionRecordRepository>();
        services.AddScoped<ISyncQueueRepository, SyncQueueRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}