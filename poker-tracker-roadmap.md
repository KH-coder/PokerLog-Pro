# C# ASP.NET Core 撲克牌譜記錄應用開發路線圖

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
- **Notion集成**: Notion API

### 3. 學習資源整理
- ASP.NET Core 文檔
- Notion API 文檔
- Entity Framework Core 教程
- React 教程 (如果需要)

## 二、項目設計階段

### 1. 數據模型設計
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
    public string NotionPageId { get; set; }  // 儲存對應的Notion頁面ID
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
```

### 2. API設計
- `/api/auth` - 認證和授權
- `/api/hands` - 手牌CRUD操作
- `/api/hands/notion` - Notion同步操作
- `/api/statistics` - 統計分析

### 3. Notion整合設計
- 設計Notion頁面結構
- 計劃如何將手牌數據映射到Notion頁面/數據庫

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
    }
}
```

### 3. 核心業務邏輯 (第3-5週)
- 實現手牌記錄服務
- 實現用戶認證和授權
- 添加基本的數據驗證

```csharp
// 手牌記錄服務
public class HandRecordService : IHandRecordService
{
    private readonly PokerDbContext _context;
    
    public HandRecordService(PokerDbContext context)
    {
        _context = context;
    }
    
    public async Task<HandRecord> SaveHandRecordAsync(HandRecord handRecord)
    {
        // 業務邏輯，數據驗證等
        _context.HandRecords.Add(handRecord);
        await _context.SaveChangesAsync();
        return handRecord;
    }
    
    public async Task<List<HandRecord>> GetHandRecordsByUserIdAsync(string userId)
    {
        return await _context.HandRecords
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.Timestamp)
            .ToListAsync();
    }
}
```

### 4. API控制器 (第5-6週)
- 實現認證控制器
- 實現手牌記錄控制器
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
    
    [HttpGet("{id}")]
    public async Task<ActionResult<HandRecord>> GetHandRecord(Guid id)
    {
        var handRecord = await _handService.GetHandRecordByIdAsync(id);
        
        if (handRecord == null)
            return NotFound();
            
        return handRecord;
    }
    
    [HttpGet("user")]
    public async Task<ActionResult<IEnumerable<HandRecord>>> GetUserHandRecords()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Ok(await _handService.GetHandRecordsByUserIdAsync(userId));
    }
}
```

### 5. Notion API整合 (第6-8週)
- 創建Notion API客戶端
- 實現將手牌數據同步到Notion
- 處理Notion頁面創建和更新

```csharp
// Notion服務
public class NotionService : INotionService
{
    private readonly HttpClient _httpClient;
    private readonly string _notionApiKey;
    private readonly string _databaseId;
    
    public NotionService(IConfiguration config)
    {
        _notionApiKey = config["Notion:ApiKey"];
        _databaseId = config["Notion:DatabaseId"];
        
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_notionApiKey}");
        _httpClient.DefaultRequestHeaders.Add("Notion-Version", "2022-06-28");
    }
    
    public async Task<string> CreateHandRecordPageAsync(HandRecord handRecord)
    {
        // 將手牌記錄轉換為Notion頁面格式
        var pageProperties = new
        {
            // Notion數據庫屬性映射
            Position = new { select = new { name = handRecord.Position } },
            HoleCards = new { rich_text = new[] { new { text = new { content = FormatCards(handRecord.HoleCards) } } } },
            CommunityCards = new { rich_text = new[] { new { text = new { content = FormatCards(handRecord.CommunityCards) } } } },
            Result = new { checkbox = handRecord.Result.Won },
            Amount = new { number = handRecord.Result.AmountWon },
            Notes = new { rich_text = new[] { new { text = new { content = handRecord.Result.Notes ?? string.Empty } } } },
            Date = new { date = new { start = handRecord.Timestamp.ToString("yyyy-MM-dd") } }
        };
        
        // 發送API請求到Notion
        var response = await _httpClient.PostAsJsonAsync(
            $"https://api.notion.com/v1/databases/{_databaseId}/pages",
            new { parent = new { database_id = _databaseId }, properties = pageProperties }
        );
        
        response.EnsureSuccessStatusCode();
        
        var responseContent = await response.Content.ReadFromJsonAsync<NotionResponse>();
        return responseContent.Id;
    }
    
    private string FormatCards(List<Card> cards)
    {
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

## 四、前端開發階段 (與後端並行)

### 1. 項目設置 (第1週)
- 創建React應用
- 設置路由和狀態管理
- 配置API客戶端

### 2. 核心組件開發 (第2-4週)
- 實現牌桌視圖組件
- 實現牌型選擇器組件
- 實現行動按鈕組件
- 實現結果輸入組件

### 3. 數據集成 (第4-6週)
- 實現與後端API的通信
- 實現數據同步和離線支持
- 實現基本的錯誤處理

### 4. UI/UX優化 (第6-8週)
- 優化移動設備體驗
- 實現夜間模式
- 添加動畫和過渡效果

## 五、測試與部署階段

### 1. 單元測試和集成測試 (第8-9週)
- 為關鍵服務添加單元測試
- 為API端點添加集成測試
- 為前端組件添加測試

```csharp
// 測試示例
[Fact]
public async Task SaveHandRecord_ValidRecord_ReturnsCreatedRecord()
{
    // Arrange
    var dbContext = CreateDbContext();
    var service = new HandRecordService(dbContext);
    var handRecord = new HandRecord
    {
        Position = "BTN",
        HoleCards = new List<Card>
        {
            new Card { Suit = "spades", Value = "A" },
            new Card { Suit = "hearts", Value = "K" }
        },
        // 其他必要屬性
    };
    
    // Act
    var result = await service.SaveHandRecordAsync(handRecord);
    
    // Assert
    Assert.NotNull(result);
    Assert.NotEqual(Guid.Empty, result.Id);
    Assert.Equal("BTN", result.Position);
}
```

### 2. 部署準備 (第9-10週)
- 配置CI/CD管道
- 創建Docker容器和配置
- 準備數據庫遷移腳本

### 3. 上線部署 (第10週)
- 部署到選定的雲服務商 (Azure/AWS/GCP)
- 配置域名和SSL
- 設置監控和日誌

## 六、後續迭代計劃

### 1. 第二階段功能 (2-4週)
- 高級統計分析
- 匯出/匯入功能
- 批量同步到Notion

### 2. 第三階段功能 (4-6週)
- 團隊協作功能
- 自定義模板
- 高級可視化

### 3. 長期規劃
- 移動應用開發
- 機器學習集成 (遊戲分析)
- 第三方服務集成

## 七、Notion記錄格式設計

### 1. Notion數據庫結構
創建一個專用的Notion數據庫，包含以下屬性：
- 日期 (Date)
- 位置 (Select: BTN, SB, BB, UTG等)
- 起手牌 (Text)
- 公共牌 (Text)
- 結果 (Checkbox: 贏/輸)
- 金額 (Number)
- 備註 (Text)
- 遊戲類型 (Select: 現金, 比賽)
- 牌桌 (Select: 常用牌桌)

### 2. 集成實現細節
在應用中添加"同步到Notion"功能，讓用戶可以：
- 自動同步所有新記錄到Notion
- 手動選擇特定記錄同步
- 從應用中直接訪問Notion中的記錄

## 八、資源和參考

### 1. 關鍵文檔
- [ASP.NET Core文檔](https://docs.microsoft.com/en-us/aspnet/core)
- [Entity Framework Core文檔](https://docs.microsoft.com/en-us/ef/core)
- [Notion API文檔](https://developers.notion.com)
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
- 測試和部署: 2週
- 總計: 約3個月（兼職開發）

### 2. 所需技能
- C#和ASP.NET Core開發
- Entity Framework Core
- React前端開發
- SQL數據庫設計
- Notion API

### 3. 可能的挑戰
- Notion API限制和速率限制
- 離線同步和衝突解決
- 移動設備上的用戶體驗優化

這個路線圖提供了使用C#和ASP.NET Core開發撲克牌譜記錄應用，並整合Notion的全面規劃。根據您的具體需求和資源，可以相應調整開發範圍和時間線。