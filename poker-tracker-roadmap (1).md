

### 3. 同步與導出界面 (第4-6週)
- 實現同步設置界面
- 實現同步狀態顯示組件
- 設計多種導出選項界面
- 添加離線模式指示器

```jsx
// src/components/SyncSettings.jsx
import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import api from '../api';

const SyncSettings = ({ handRecord, onUpdate }) => {
  const [syncToNotion, setSyncToNotion] = useState(handRecord.syncToNotion);
  const [syncStatus, setSyncStatus] = useState(handRecord.notionSyncStatus);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    setSyncToNotion(handRecord.syncToNotion);
    setSyncStatus(handRecord.notionSyncStatus);
  }, [handRecord]);
  
  const handleToggleSync = async () => {
    setIsLoading(true);
    try {
      if (!syncToNotion) {
        // 啟用同步
        await api.post(`/api/sync/notion/${handRecord.id}`);
        setSyncToNotion(true);
        setSyncStatus('Pending');
        onUpdate({ ...handRecord, syncToNotion: true, notionSyncStatus: 'Pending' });
      } else {
        // 禁用同步
        await api.put(`/api/hands/${handRecord.id}`, { 
          ...handRecord, 
          syncToNotion: false 
        });
        setSyncToNotion(false);
        onUpdate({ ...handRecord, syncToNotion: false });
      }
    } catch (error) {
      console.error('同步設置更新失敗', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkSyncStatus = async () => {
    try {
      const response = await api.get(`/api/sync/status/${handRecord.id}`);
      setSyncStatus(response.data.status);
    } catch (error) {
      console.error('獲取同步狀態失敗', error);
    }
  };
  
  const renderSyncStatus = (status) => {
    switch (status) {
      case 'NotSynced':
        return <span className="status not-synced">未同步</span>;
      case 'Pending':
        return (
          <span className="status pending">
            等待同步 <CircularProgress size={16} />
          </span>
        );
      case 'Synced':
        return <span className="status synced">已同步</span>;
      case 'Failed':
        return <span className="status failed">同步失敗</span>;
      default:
        return <span className="status unknown">{status}</span>;
    }
  };
  
  const exportToCsv = async () => {
    try {
      const response = await api.get(`/api/hands/export/csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `poker_hands_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('導出CSV失敗', error);
    }
  };
  
  return (
    <div className="sync-settings">
      <h3>同步設置</h3>
      <div className="toggle-container">
        <label>
          同步到Notion
          <input
            type="checkbox"
            checked={syncToNotion}
            onChange={handleToggleSync}
            disabled={isLoading}
          />
        </label>
      </div>
      
      {syncToNotion && (
        <div className="sync-status">
          <p>同步狀態: {renderSyncStatus(syncStatus)}</p>
          {syncStatus === 'Pending' && (
            <button onClick={checkSyncStatus} disabled={isLoading}>
              刷新狀態
            </button>
          )}
          {syncStatus === 'Failed' && (
            <button onClick={() => handleToggleSync()} disabled={isLoading}>
              重試
            </button>
          )}
        </div>
      )}
      
      <div className="export-options">
        <h4>導出選項</h4>
        <button onClick={exportToCsv}>導出為CSV</button>
      </div>
    </div>
  );
};

export default SyncSettings;
```

### 4. UI/UX優化 (第6-8週)
- 優化移動設備體驗
- 實現夜間模式
- 添加動畫和過渡效果
- 提供同步狀態視覺反饋

```jsx
// src/components/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <IconButton onClick={toggleDarkMode} color="inherit">
      {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ThemeToggle;

// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // 從本地存儲加載主題偏好
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    } else {
      // 檢查系統偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);
  
  useEffect(() => {
    // 應用主題
    document.body.classList.toggle('dark-theme', darkMode);
    // 保存偏好
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

## 五、測試與部署階段

### 1. 單元測試和集成測試 (第8-9週)
- 為關鍵服務添加單元測試
- 為同步邏輯添加特定測試
- 為API端點添加集成測試
- 為前端組件添加測試

```csharp
// 手牌記錄服務測試
[Fact]
public async Task SaveHandRecord_ValidRecord_ReturnsCreatedRecord()
{
    // Arrange
    var mockSyncQueueService = new Mock<ISyncQueueService>();
    var options = new DbContextOptionsBuilder<PokerDbContext>()
        .UseInMemoryDatabase("test_db_handrecord")
        .Options;
        
    using var context = new PokerDbContext(options);
    var service = new HandRecordService(context, mockSyncQueueService.Object);
    
    var handRecord = new HandRecord
    {
        UserId = "test-user",
        Position = "BTN",
        HoleCards = new List<Card>
        {
            new Card { Suit = "spades", Value = "A" },
            new Card { Suit = "hearts", Value = "K" }
        },
        CommunityCards = new List<Card>
        {
            new Card { Suit = "diamonds", Value = "Q" },
            new Card { Suit = "clubs", Value = "J" },
            new Card { Suit = "hearts", Value = "10" }
        },
        Result = new HandResult
        {
            Won = true,
            PotSize = 100,
            AmountWon = 100,
            Showdown = true,
            Notes = "測試記錄"
        }
    };
    
    // Act
    var result = await service.SaveHandRecordAsync(handRecord);
    
    // Assert
    Assert.NotNull(result);
    Assert.NotEqual(Guid.Empty, result.Id);
    Assert.Equal("BTN", result.Position);
    Assert.Equal(2, result.HoleCards.Count);
    Assert.Equal(5, result.CommunityCards.Count);
    Assert.True(result.Result.Won);
    Assert.Equal(100, result.Result.PotSize);
    
    // 驗證未啟用同步到Notion
    Assert.False(result.SyncToNotion);
    Assert.Equal(SyncStatus.NotSynced, result.NotionSyncStatus);
    
    // 驗證同步服務未被調用
    mockSyncQueueService.Verify(
        m => m.AddToQueueAsync(It.IsAny<Guid>()),
        Times.Never
    );
}

// 同步服務測試
[Fact]
public async Task ProcessQueue_WithinRateLimits_SuccessfulSync()
{
    // Arrange
    var mockNotionService = new Mock<INotionService>();
    mockNotionService
        .Setup(m => m.CreateHandRecordPageAsync(It.IsAny<HandRecord>()))
        .ReturnsAsync("mock-notion-page-id");
        
    var mockLogger = new Mock<ILogger<SyncQueueService>>();
    
    var options = new DbContextOptionsBuilder<PokerDbContext>()
        .UseInMemoryDatabase("test_db_sync")
        .Options;
        
    using var context = new PokerDbContext(options);
    
    // 創建測試數據
    var handRecord = new HandRecord { 
        Id = Guid.NewGuid(),
        UserId = "test-user",
        Position = "BB",
        HoleCards = new List<Card>(),
        CommunityCards = new List<Card>(),
        Result = new HandResult(),
        SyncToNotion = true,
        NotionSyncStatus = SyncStatus.Pending
    };
    context.HandRecords.Add(handRecord);
    
    var queueItem = new SyncQueueItem {
        Id = Guid.NewGuid(),
        HandRecordId = handRecord.Id,
        Status = SyncStatus.Pending,
        CreatedAt = DateTime.UtcNow,
        RetryCount = 0
    };
    context.SyncQueue.Add(queueItem);
    await context.SaveChangesAsync();
    
    var service = new SyncQueueService(context, mockNotionService.Object, mockLogger.Object);
    
    // Act
    await service.ProcessQueueAsync(10);
    
    // Assert
    var updatedRecord = await context.HandRecords.FindAsync(handRecord.Id);
    var updatedQueueItem = await context.SyncQueue.FirstOrDefaultAsync(q => q.HandRecordId == handRecord.Id);
    
    Assert.Equal(SyncStatus.Synced, updatedRecord.NotionSyncStatus);
    Assert.Equal("mock-notion-page-id", updatedRecord.NotionPageId);
    Assert.Equal(SyncStatus.Synced, updatedQueueItem.Status);
    Assert.NotNull(updatedQueueItem.CompletedAt);
}
```

### 2. 部署準備 (第9-10週)
- 配置CI/CD管道
- 創建Docker容器和配置
- 準備數據庫遷移腳本
- 配置後台服務和定時任務

```dockerfile
# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["PokerHandTracker.csproj", "./"]
RUN dotnet restore "PokerHandTracker.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "PokerHandTracker.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PokerHandTracker.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PokerHandTracker.dll"]

# Frontend Dockerfile
FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# GitHub Actions CI/CD 配置
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x
        
    - name: Restore dependencies
      run: dotnet restore
      
    - name: Build
      run: dotnet build --no-restore
      
    - name: Test
      run: dotnet test --no-build --verbosity normal
      
    - name: Publish
      run: dotnet publish -c Release -o publish
      
    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: app
        path: publish/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Download artifact
      uses: actions/download-artifact@v3
      with:
        name: app
        path: app
        
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'poker-hand-tracker'
        slot-name: 'production'
        publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
        package: 'app'
```

### 3. 上線部署 (第10週)
- 部署到選定的雲服務商 (Azure/AWS/GCP)
- 配置域名和SSL
- 設置監控和日誌
- 部署同步服務監控

```csharp
// 在Program.cs中配置Application Insights監控
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webBuilder =>
        {
            webBuilder.UseStartup<Startup>();
            
            // 添加Application Insights
            webBuilder.ConfigureServices(services =>
            {
                services.AddApplicationInsightsTelemetry();
            });
        });

// 在appsettings.json中配置日誌和監控
{
  "ApplicationInsights": {
    "InstrumentationKey": "your-instrumentation-key"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information",
      "PokerHandTracker.Services.SyncQueueService": "Debug"
    },
    "ApplicationInsights": {
      "LogLevel": {
        "Default": "Information",
        "PokerHandTracker.Services.SyncQueueService": "Debug"
      }
    }
  },
  "Sync": {
    "QueueProcessIntervalMinutes": 10,
    "QueueBatchSize": 20,
    "RateLimitPerMinute": 30
  }
}
```

## 六、後續迭代計劃

### 1. 第二階段功能 (2-4週)
- 增加用戶同步偏好設置（頻率、自動/手動）
- 實現更多導出格式支持
- 添加同步歷史記錄和審計日誌

### 2. 第三階段功能 (4-6週)
- 團隊協作功能
- 自定義模板
- 高級可視化
- 多樣化的第三方整合（不只限於Notion）

### 3. 長期規劃
- 移動應用開發
- 機器學習集成（遊戲分析）
- 實現自有筆記系統

## 七、用戶設置與管理

### 1. 用戶同步偏好設置
```csharp
public class UserSyncPreference
{
    public string UserId { get; set; }
    public bool AutoSyncEnabled { get; set; } = false;
    public SyncFrequency SyncFrequency { get; set; } = SyncFrequency.Daily;
    public string NotionAccessToken { get; set; }
    public string DefaultDatabaseId { get; set; }
    public int? MaxSyncPerDay { get; set; } = 50;  // 限制每日同步數量
}

public enum SyncFrequency
{
    Immediate,
    Hourly,
    Daily,
    Weekly
}
```

### 2. 管理員工具
- 添加同步隊列監控儀表板
- 實現手動處理隊列功能
- 添加用戶同步使用統計

## 八、資源和參考

### 1. 關鍵文檔
- [ASP.NET Core文檔](https://docs.microsoft.com/en-us/aspnet/core)
- [Entity Framework Core文檔](https://docs.microsoft.com/en-us/ef/core)
- [Notion API文檔](https://developers.notion.com)
- [API限制說明](https://developers.notion.com/reference/errors#rate-limits)
- [React文檔](https://reactjs.org/docs/getting-started.html)

### 2. 工具和服務
- 開發環境: Visual Studio 2022
- 版本控制: GitHub/Azure DevOps
- CI/CD: GitHub Actions/Azure Pipelines
- 雲服務: Microsoft Azure
- 監控: Application Insights

## 九、時間和資源估計

### 1. 開發時間
- 基本功能開發: 8-10週
- 同步機制開發: 2-3週
- 測試和部署: 2週
- 總計: 約3-4個月（兼職開發）

### 2. 所需技能
- C#和ASP.NET Core開發
- Entity Framework Core
- 背景服務和任務調度
- React前端開發
- SQL數據庫設計
- Notion API（選修）

### 3. 可能的挑戰
- 保證應用在Notion不可用時仍能良好運作
- 設計有效的節流和批處理邏輯
- 處理同步失敗和重試機制
- 確保用戶體驗流暢，即使在同步延遲的情況下

## 十、Notion數據庫設計

### 1. 數據庫結構
建議在Notion中創建如下結構的數據庫：

| 屬性名稱 | 屬性類型 | 說明 |
|---------|--------|------|
| Title | Title | 手牌記錄標題，例如"手牌 2023-01-01 20:30" |
| Position | Select | 玩家位置（BTN, SB, BB等） |
| HoleCards | Text | 玩家起手牌，例如 "♠A ♥K" |
| CommunityCards | Text | 公共牌，例如 "♦Q ♣J ♥10" |
| Result | Checkbox | 是否贏牌 |
| Amount | Number | 贏得/輸掉的金額 |
| PotSize | Number | 底池大小 |
| Notes | Text | 手牌記錄筆記 |
| Date | Date | 遊戲日期 |
| GameType | Select | 遊戲類型（現金, MTT, SNG等） |
| Table | Select | 牌桌名稱 |

### 2. 同步設計考量
- 使用Notion模板數據庫，方便用戶快速設置
- 提供詳細的同步設置指南
- 自動處理不同花色的顏色顯示

## 十一、總結

這個改進版路線圖解決了Notion API限制的問題，通過:
1. 將核心數據放在自己的數據庫
2. 實現智能隊列處理機制
3. 提供多種備選同步和導出選項
4. 增加用戶控制和配置能力

這樣設計的應用將更加穩健可靠，即使在Notion API不可用或受限時仍能正常運作。同時，對於需要Notion整合的用戶，仍然提供了高質量、可控的同步體驗。# 改進版撲克牌譜記錄應用開發路線圖

## 一、前期準備階段

### 1. 開發環境設置
- 安裝 Visual Studio 2022 或 VS Code
- 安裝 .NET 8 SDK
- 安裝 SQL Server Express/LocalDB 或 PostgreSQL
- 設置 Git 版本控制

### 2. 技術堆疊確定
- **後端**: ASP.NET Core 8 Web API
- **前端**: React.js
- **數據庫**: SQL Server/PostgreSQL
- **ORM**: Entity Framework Core
- **API文檔**: Swagger/OpenAPI
- **認證**: ASP.NET Core Identity
- **同步選項**: 
  - 主要：本地數據庫存儲
  - 次要：Notion API (可選功能)
  - 備選：Excel/CSV導出

### 3. 學習資源整理
- ASP.NET Core 文檔
- Entity Framework Core 教程
- React 教程
- Notion API 文檔（作為選修）

## 二、項目設計階段

### 1. 優化數據模型設計
```csharp
// 核心數據模型
public class HandRecord
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public DateTime Timestamp { get; set; }
    public string Position { get; set; }  // BTN, SB, BB等
    public List<Card> HoleCards { get; set; }
    public List<Card> CommunityCards { get; set; }
    public List<PlayerAction> Actions { get; set; }
    public HandResult Result { get; set; }
    
    // 同步相關屬性
    public bool SyncToNotion { get; set; } = false;  // 默認不同步
    public SyncStatus NotionSyncStatus { get; set; } = SyncStatus.NotSynced;
    public string NotionPageId { get; set; }  // 儲存對應的Notion頁面ID
    public DateTime? LastSyncAttempt { get; set; }
}

public enum SyncStatus
{
    NotSynced,
    Pending,
    Synced,
    Failed
}

public class Card
{
    public string Suit { get; set; }  // 花色：黑桃、紅心、方塊、梅花
    public string Value { get; set; }  // 點數：A, K, Q, J, 10, 9...
}

public class PlayerAction
{
    public string Stage { get; set; }  // preflop, flop, turn, river
    public string Action { get; set; }  // fold, check, call, bet, raise
    public decimal? Amount { get; set; }
}

public class HandResult
{
    public decimal PotSize { get; set; }
    public bool Won { get; set; }
    public decimal AmountWon { get; set; }
    public bool Showdown { get; set; }
    public string Notes { get; set; }
}

public class SyncQueueItem
{
    public Guid Id { get; set; }
    public Guid HandRecordId { get; set; }
    public SyncStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int RetryCount { get; set; }
    public string LastError { get; set; }
}
```

### 2. API設計
- `/api/auth` - 認證和授權
- `/api/hands` - 手牌CRUD操作
- `/api/hands/export` - 各種格式導出（包括Notion選項）
- `/api/sync/notion` - Notion同步隊列管理
- `/api/statistics` - 統計分析

### 3. 多元同步策略設計
- 設計本地優先的數據存儲模式
- 實現排隊與批量處理的同步機制
- 提供多種導出選項（Notion、Excel、CSV等）

## 三、後端開發階段

### 1. 項目基礎結構 (第1-2週)
- 創建ASP.NET Core Web API項目
- 設置Entity Framework Core和數據庫連接
- 實現基本的依賴注入和服務結構
- 配置Swagger文檔

```bash
# 創建新項目
dotnet new webapi -n PokerHandTracker
cd PokerHandTracker

# 添加Entity Framework Core包
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
```

### 2. 數據存取層 (第2-3週)
- 實現DbContext和數據模型
- 創建數據庫遷移
- 實現數據存儲庫模式

```csharp
// 數據庫上下文
public class PokerDbContext : DbContext
{
    public PokerDbContext(DbContextOptions<PokerDbContext> options)
        : base(options)
    { }
    
    public DbSet<HandRecord> HandRecords { get; set; }
    public DbSet<SyncQueueItem> SyncQueue { get; set; }  // 新增同步隊列表
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 配置複雜類型和關係
        modelBuilder.Entity<HandRecord>()
            .OwnsMany(h => h.Actions);
            
        modelBuilder.Entity<HandRecord>()
            .OwnsMany(h => h.HoleCards);
            
        modelBuilder.Entity<HandRecord>()
            .OwnsMany(h => h.CommunityCards);
            
        modelBuilder.Entity<HandRecord>()
            .OwnsOne(h => h.Result);
            
        // 設置同步狀態枚舉到字符串的轉換
        modelBuilder.Entity<HandRecord>()
            .Property(h => h.NotionSyncStatus)
            .HasConversion<string>();
            
        modelBuilder.Entity<SyncQueueItem>()
            .Property(s => s.Status)
            .HasConversion<string>();
    }
}
```

### 3. 核心業務邏輯 (第3-5週)
- 實現手牌記錄服務
- 實現用戶認證和授權
- 添加基本的數據驗證
- 實現數據導出服務（多種格式）

```csharp
// 手牌記錄服務
public class HandRecordService : IHandRecordService
{
    private readonly PokerDbContext _context;
    private readonly ISyncQueueService _syncQueueService;
    
    public HandRecordService(PokerDbContext context, ISyncQueueService syncQueueService)
    {
        _context = context;
        _syncQueueService = syncQueueService;
    }
    
    public async Task<HandRecord> SaveHandRecordAsync(HandRecord handRecord)
    {
        // 業務邏輯，數據驗證等
        _context.HandRecords.Add(handRecord);
        await _context.SaveChangesAsync();
        
        // 檢查是否需要添加到同步隊列
        if (handRecord.SyncToNotion)
        {
            handRecord.NotionSyncStatus = SyncStatus.Pending;
            await _syncQueueService.AddToQueueAsync(handRecord.Id);
        }
        
        return handRecord;
    }
    
    public async Task<HandRecord> UpdateHandRecordAsync(HandRecord handRecord)
    {
        _context.Entry(handRecord).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return handRecord;
    }
    
    public async Task<HandRecord> GetHandRecordByIdAsync(Guid id)
    {
        return await _context.HandRecords
            .Include(h => h.HoleCards)
            .Include(h => h.CommunityCards)
            .Include(h => h.Actions)
            .FirstOrDefaultAsync(h => h.Id == id);
    }
    
    public async Task<List<HandRecord>> GetHandRecordsByUserIdAsync(string userId)
    {
        return await _context.HandRecords
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.Timestamp)
            .ToListAsync();
    }
    
    public async Task<byte[]> ExportToCsvAsync(string userId)
    {
        var records = await GetHandRecordsByUserIdAsync(userId);
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream);
        
        // 寫入CSV標頭
        writer.WriteLine("ID,日期,位置,起手牌,公共牌,結果,贏得金額,底池大小");
        
        // 寫入數據行
        foreach (var record in records)
        {
            var line = string.Format("{0},{1},{2},{3},{4},{5},{6},{7}",
                record.Id,
                record.Timestamp.ToString("yyyy-MM-dd HH:mm"),
                record.Position,
                FormatCards(record.HoleCards),
                FormatCards(record.CommunityCards),
                record.Result.Won ? "贏" : "輸",
                record.Result.AmountWon,
                record.Result.PotSize);
                
            writer.WriteLine(line);
        }
        
        writer.Flush();
        return memoryStream.ToArray();
    }
    
    private string FormatCards(List<Card> cards)
    {
        if (cards == null || !cards.Any())
            return string.Empty;
            
        return string.Join(" ", cards.Select(c => $"{GetSuitSymbol(c.Suit)}{c.Value}"));
    }
    
    private string GetSuitSymbol(string suit)
    {
        return suit.ToLower() switch
        {
            "spades" => "♠",
            "hearts" => "♥",
            "diamonds" => "♦",
            "clubs" => "♣",
            _ => suit
        };
    }
}
```

### 4. 同步服務實現 (第5-6週)
- 設計同步服務接口
- 實現Notion同步隊列機制
- 實現Excel/CSV導出功能
- 添加同步重試和失敗處理邏輯

```csharp
// 同步服務接口
public interface ISyncQueueService
{
    Task AddToQueueAsync(Guid handRecordId);
    Task ProcessQueueAsync(int batchSize = 10);
    Task<IEnumerable<SyncQueueItem>> GetPendingItemsAsync(int take = 100);
    Task<SyncQueueItem> GetQueueItemByIdAsync(Guid id);
}

// Notion服務接口
public interface INotionService
{
    Task<string> CreateHandRecordPageAsync(HandRecord handRecord);
    Task<bool> UpdateHandRecordPageAsync(string pageId, HandRecord handRecord);
}

// 同步隊列服務實現
public class SyncQueueService : ISyncQueueService
{
    private readonly PokerDbContext _context;
    private readonly INotionService _notionService;
    private readonly ILogger<SyncQueueService> _logger;
    
    public SyncQueueService(
        PokerDbContext context, 
        INotionService notionService,
        ILogger<SyncQueueService> logger)
    {
        _context = context;
        _notionService = notionService;
        _logger = logger;
    }
    
    public async Task AddToQueueAsync(Guid handRecordId)
    {
        var queueItem = new SyncQueueItem
        {
            HandRecordId = handRecordId,
            Status = SyncStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            RetryCount = 0
        };
        
        _context.SyncQueue.Add(queueItem);
        await _context.SaveChangesAsync();
    }
    
    public async Task ProcessQueueAsync(int batchSize = 10)
    {
        // 獲取待處理項目
        var pendingItems = await _context.SyncQueue
            .Where(q => q.Status == SyncStatus.Pending && q.RetryCount < 3)
            .OrderBy(q => q.CreatedAt)
            .Take(batchSize)
            .ToListAsync();
            
        _logger.LogInformation($"處理同步隊列：找到 {pendingItems.Count} 個待處理項目");
            
        foreach (var item in pendingItems)
        {
            // 添加延遲以遵守API限制
            await Task.Delay(500);  // 每秒最多2個請求
            
            try
            {
                var handRecord = await _context.HandRecords
                    .Include(h => h.HoleCards)
                    .Include(h => h.CommunityCards)
                    .Include(h => h.Actions)
                    .Include(h => h.Result)
                    .FirstOrDefaultAsync(h => h.Id == item.HandRecordId);
                    
                if (handRecord == null)
                {
                    _logger.LogWarning($"無法找到ID為 {item.HandRecordId} 的手牌記錄");
                    continue;
                }
                
                // 同步到Notion
                var pageId = await _notionService.CreateHandRecordPageAsync(handRecord);
                
                // 更新狀態
                handRecord.NotionPageId = pageId;
                handRecord.NotionSyncStatus = SyncStatus.Synced;
                handRecord.LastSyncAttempt = DateTime.UtcNow;
                
                item.Status = SyncStatus.Synced;
                item.CompletedAt = DateTime.UtcNow;
                
                _logger.LogInformation($"成功同步手牌記錄 {handRecord.Id} 到Notion，頁面ID: {pageId}");
            }
            catch (Exception ex)
            {
                // 處理錯誤
                _logger.LogError(ex, $"同步手牌記錄 {item.HandRecordId} 時發生錯誤");
                
                item.RetryCount++;
                item.LastError = ex.Message;
                item.Status = item.RetryCount >= 3 ? SyncStatus.Failed : SyncStatus.Pending;
            }
            
            await _context.SaveChangesAsync();
        }
    }
    
    public async Task<IEnumerable<SyncQueueItem>> GetPendingItemsAsync(int take = 100)
    {
        return await _context.SyncQueue
            .Where(q => q.Status == SyncStatus.Pending)
            .OrderBy(q => q.CreatedAt)
            .Take(take)
            .ToListAsync();
    }
    
    public async Task<SyncQueueItem> GetQueueItemByIdAsync(Guid id)
    {
        return await _context.SyncQueue.FindAsync(id);
    }
}

// Notion服務實現
public class NotionService : INotionService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<NotionService> _logger;
    private readonly string _notionApiKey;
    private readonly string _databaseId;
    
    public NotionService(
        IConfiguration config,
        ILogger<NotionService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _notionApiKey = config["Notion:ApiKey"];
        _databaseId = config["Notion:DatabaseId"];
        _logger = logger;
        
        _httpClient = httpClientFactory.CreateClient("Notion");
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_notionApiKey}");
        _httpClient.DefaultRequestHeaders.Add("Notion-Version", "2022-06-28");
    }
    
    public async Task<string> CreateHandRecordPageAsync(HandRecord handRecord)
    {
        try
        {
            // 將手牌記錄轉換為Notion頁面格式
            var pageProperties = new
            {
                parent = new { database_id = _databaseId },
                properties = new
                {
                    Title = new { title = new[] { new { text = new { content = $"手牌 {handRecord.Timestamp.ToString("yyyy-MM-dd HH:mm")}" } } } },
                    Position = new { select = new { name = handRecord.Position } },
                    HoleCards = new { rich_text = new[] { new { text = new { content = FormatCards(handRecord.HoleCards) } } } },
                    CommunityCards = new { rich_text = new[] { new { text = new { content = FormatCards(handRecord.CommunityCards) } } } },
                    Result = new { checkbox = handRecord.Result.Won },
                    Amount = new { number = (double)handRecord.Result.AmountWon },
                    PotSize = new { number = (double)handRecord.Result.PotSize },
                    Notes = new { rich_text = new[] { new { text = new { content = handRecord.Result.Notes ?? string.Empty } } } },
                    Date = new { date = new { start = handRecord.Timestamp.ToString("yyyy-MM-dd") } }
                }
            };
            
            // 發送API請求到Notion
            var response = await _httpClient.PostAsJsonAsync(
                "https://api.notion.com/v1/pages",
                pageProperties
            );
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Notion API錯誤: {errorContent}");
                throw new Exception($"Notion API錯誤: {response.StatusCode}, {errorContent}");
            }
            
            var responseContent = await response.Content.ReadFromJsonAsync<NotionResponse>();
            return responseContent.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "創建Notion頁面時發生錯誤");
            throw;
        }
    }
    
    public async Task<bool> UpdateHandRecordPageAsync(string pageId, HandRecord handRecord)
    {
        try
        {
            // 更新頁面屬性
            var pageProperties = new
            {
                properties = new
                {
                    Position = new { select = new { name = handRecord.Position } },
                    HoleCards = new { rich_text = new[] { new { text = new { content = FormatCards(handRecord.HoleCards) } } } },
                    CommunityCards = new { rich_text = new[] { new { text = new { content = FormatCards(handRecord.CommunityCards) } } } },
                    Result = new { checkbox = handRecord.Result.Won },
                    Amount = new { number = (double)handRecord.Result.AmountWon },
                    PotSize = new { number = (double)handRecord.Result.PotSize },
                    Notes = new { rich_text = new[] { new { text = new { content = handRecord.Result.Notes ?? string.Empty } } } }
                }
            };
            
            // 發送API請求到Notion
            var response = await _httpClient.PatchAsJsonAsync(
                $"https://api.notion.com/v1/pages/{pageId}",
                pageProperties
            );
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"更新Notion頁面錯誤: {errorContent}");
                return false;
            }
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"更新Notion頁面 {pageId} 時發生錯誤");
            return false;
        }
    }
    
    private string FormatCards(List<Card> cards)
    {
        if (cards == null || !cards.Any())
            return string.Empty;
            
        return string.Join(" ", cards.Select(c => $"{GetSuitSymbol(c.Suit)}{c.Value}"));
    }
    
    private string GetSuitSymbol(string suit)
    {
        return suit.ToLower() switch
        {
            "spades" => "♠",
            "hearts" => "♥",
            "diamonds" => "♦",
            "clubs" => "♣",
            _ => suit
        };
    }
}

// Notion API響應
public class NotionResponse
{
    public string Id { get; set; }
    public string Object { get; set; }
    public DateTime CreatedTime { get; set; }
    public DateTime LastEditedTime { get; set; }
}
```

### 5. API控制器開發 (第6-8週)
- 實現認證控制器
- 實現手牌記錄控制器
- 實現同步與導出控制器
- 實現統計分析控制器

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HandsController : ControllerBase
{
    private readonly IHandRecordService _handService;
    
    public HandsController(IHandRecordService handService)
    {
        _handService = handService;
    }
    
    [HttpPost]
    public async Task<ActionResult<HandRecord>> CreateHandRecord(HandRecord handRecord)
    {
        handRecord.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        handRecord.Timestamp = DateTime.UtcNow;
        
        var result = await _handService.SaveHandRecordAsync(handRecord);
        return CreatedAtAction(nameof(GetHandRecord), new { id = result.Id }, result);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateHandRecord(Guid id, HandRecord handRecord)
    {
        if (id != handRecord.Id)
            return BadRequest();
            
        // 檢查用戶權限
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (handRecord.UserId != userId)
            return Forbid();
            
        await _handService.UpdateHandRecordAsync(handRecord);
        return NoContent();
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<HandRecord>> GetHandRecord(Guid id)
    {
        var handRecord = await _handService.GetHandRecordByIdAsync(id);
        
        if (handRecord == null)
            return NotFound();
            
        // 檢查用戶權限
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (handRecord.UserId != userId)
            return Forbid();
            
        return handRecord;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<HandRecord>>> GetUserHandRecords()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Ok(await _handService.GetHandRecordsByUserIdAsync(userId));
    }
    
    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportToCsv()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var csvData = await _handService.ExportToCsvAsync(userId);
        
        return File(csvData, "text/csv", $"poker_hands_{DateTime.UtcNow.ToString("yyyyMMdd")}.csv");
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SyncController : ControllerBase
{
    private readonly ISyncQueueService _syncQueueService;
    private readonly IHandRecordService _handService;
    
    public SyncController(ISyncQueueService syncQueueService, IHandRecordService handService)
    {
        _syncQueueService = syncQueueService;
        _handService = handService;
    }
    
    [HttpPost("notion/{id}")]
    public async Task<IActionResult> QueueNotionSync(Guid id)
    {
        var handRecord = await _handService.GetHandRecordByIdAsync(id);
        
        if (handRecord == null)
            return NotFound();
            
        // 檢查用戶權限
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (handRecord.UserId != userId)
            return Forbid();
        
        // 設置同步標誌並添加到隊列
        handRecord.SyncToNotion = true;
        handRecord.NotionSyncStatus = SyncStatus.Pending;
        await _handService.UpdateHandRecordAsync(handRecord);
        
        await _syncQueueService.AddToQueueAsync(id);
        
        return Ok(new { message = "已加入同步隊列" });
    }
    
    [HttpGet("status/{id}")]
    public async Task<ActionResult<SyncStatus>> GetSyncStatus(Guid id)
    {
        var handRecord = await _handService.GetHandRecordByIdAsync(id);
        
        if (handRecord == null)
            return NotFound();
            
        // 檢查用戶權限
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (handRecord.UserId != userId)
            return Forbid();
            
        return Ok(new { 
            status = handRecord.NotionSyncStatus.ToString(),
            lastAttempt = handRecord.LastSyncAttempt
        });
    }
    
    [HttpPost("process")]
    [Authorize(Roles = "Admin")]  // 只允許管理員手動處理隊列
    public async Task<IActionResult> ProcessQueue([FromQuery] int batchSize = 10)
    {
        await _syncQueueService.ProcessQueueAsync(batchSize);
        return Ok(new { message = "隊列處理已啟動" });
    }
}
```

### 6. 後台任務實現 (第8-9週)
- 實現後台服務以處理同步隊列
- 設置定時任務自動處理隊列項目
- 添加同步狀態監控和錯誤通知

```csharp
// 註冊後台服務
public static class BackgroundServiceExtensions
{
    public static IServiceCollection AddBackgroundServices(this IServiceCollection services)
    {
        services.AddHostedService<SyncQueueBackgroundService>();
        return services;
    }
}

// 同步隊列後台服務
public class SyncQueueBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SyncQueueBackgroundService> _logger;
    private readonly IConfiguration _configuration;
    
    public SyncQueueBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<SyncQueueBackgroundService> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("同步隊列後台服務已啟動");
        
        // 從配置讀取處理間隔，默認為10分鐘
        var intervalMinutes = _configuration.GetValue<int>("Sync:QueueProcessIntervalMinutes", 10);
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("開始處理同步隊列");
                
                using (var scope = _serviceProvider.CreateScope())
                {
                    var syncQueueService = scope.ServiceProvider.GetRequiredService<ISyncQueueService>();
                    
                    // 獲取批處理大小，默認為20
                    var batchSize = _configuration.GetValue<int>("Sync:QueueBatchSize", 20);
                    
                    await syncQueueService.ProcessQueueAsync(batchSize);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "處理同步隊列時發生錯誤");
            }
            
            // 等待指定間隔
            await Task.Delay(TimeSpan.FromMinutes(intervalMinutes), stoppingToken);
        }
    }
}

// Program.cs 或 Startup.cs 中註冊服務
public void ConfigureServices(IServiceCollection services)
{
    // ... 其他服務註冊
    
    // 註冊HttpClient工廠
    services.AddHttpClient("Notion", client =>
    {
        client.BaseAddress = new Uri("https://api.notion.com/");
        client.Timeout = TimeSpan.FromSeconds(30);
    })
    .AddTransientHttpErrorPolicy(policy => policy.WaitAndRetryAsync(
        3, // 重試次數
        retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)) // 指數退避
    ));
    
    // 註冊同步服務
    services.AddScoped<INotionService, NotionService>();
    services.AddScoped<ISyncQueueService, SyncQueueService>();
    
    // 註冊後台服務
    services.AddBackgroundServices();
}
```

## 四、前端開發階段 (與後端並行)

### 1. 項目設置 (第1週)
- 創建React應用
- 設置路由和狀態管理
- 配置API客戶端

```bash
# 創建React應用
npx create-react-app poker-hand-tracker-client
cd poker-hand-tracker-client

# 安裝依賴
npm install axios react-router-dom formik yup @mui/material @emotion/react @emotion/styled
```

### 2. 核心組件開發 (第2-4週)
- 實現牌桌視圖組件
- 實現牌型選擇器組件
- 實現行動按鈕組件
- 實現結果輸入組件

```jsx
// src/components/CardSelector.jsx
import React from 'react';

const suits = [
  { name: 'spades', symbol: '♠' },
  { name: 'hearts', symbol: '♥' },
  { name: 'diamonds', symbol: '♦' },
  { name: 'clubs', symbol: '♣' }
];

const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

const CardSelector = ({ selectedCards, onCardSelect, maxCards }) => {
  const handleCardClick = (suit, value) => {
    // 檢查是否已選擇該牌
    const isSelected = selectedCards.some(card => 
      card.suit === suit.name && card.value === value
    );
    
    if (isSelected) {
      // 如果已選擇，則移除
      onCardSelect(selectedCards.filter(card => 
        !(card.suit === suit.name && card.value === value)
      ));
    } else if (selectedCards.length < maxCards) {
      // 如果未選擇且未達到最大限制，則添加
      onCardSelect([...selectedCards, { suit: suit.name, value }]);
    }
  };
  
  const isCardSelected = (suit, value) => {
    return selectedCards.some(card => 
      card.suit === suit.name && card.value === value
    );
  };
  
  return (
    <div className="card-selector">
      {suits.map(suit => (
        <div key={suit.name} className="suit-row">
          <div className="suit-label" style={{ color: suit.name === 'hearts' || suit.name === 'diamonds' ? 'red' : 'black' }}>
            {suit.symbol}
          </div>
          <div className="card-values">
            {values.map(value => (
              <button
                key={`${suit.name}-${value}`}
                className={`card-button ${isCardSelected(suit, value) ? 'selected' : ''}`}
                onClick={() => handleCardClick(suit, value)}
                style={{ color: suit.name === 'hearts' || suit.name === 'diamonds' ? 'red' : 'black' }}
              >
                {suit.symbol}{value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSelector;