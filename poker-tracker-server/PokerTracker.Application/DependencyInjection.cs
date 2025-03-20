// PokerTracker.Application/DependencyInjection.cs
using Microsoft.Extensions.DependencyInjection;
using PokerTracker.Application.Interfaces;
using PokerTracker.Application.Services;

namespace PokerTracker.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IHandRecordService, HandRecordService>();
        // 其他服務註冊...

        return services;
    }
}