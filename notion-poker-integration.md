# 使用Notion作為撲克牌譜記錄後端的實施方案

## 一、Notion設置

### 1. 創建Notion數據庫
在Notion中創建一個專用的撲克牌譜數據庫，包含以下屬性：

| 屬性名稱 | Notion屬性類型 | 說明 |
|---------|--------------|------|
| 日期 | Date | 記錄牌局的日期和時間 |
| 遊戲類型 | Select | 現金局、比賽、私人局等 |
| 位置 | Select | BTN, SB, BB, UTG等 |
| 盲注 | Number | 盲注大小 |
| 起手牌 | Text | 例如：A♠K♥ |
| 公共牌 | Text | 例如：J♦9♣2♠7♥T♦ |
| 行動記錄 | Text | 前翻、翻牌、轉牌、河牌的行動 |
| 結果 | Select | 贏、輸、平手 |
| 金額變化 | Number | 贏/輸的金額 |
| 對手 | Multi-Select | 參與牌局的對手 |
| 備註 | Text | 牌局分析和思考 |
| 標籤 | Multi-Select | 分類標籤，如"大底池"、"詐唬"、"價值壓榨"等 |
| 圖片 | Files & Media | 可選，用於牌局截圖等 |

### 2. 設置視圖
配置多種視圖方式以便於分析：
- **表格視圖**: 基本的牌局列表
- **日曆視圖**: 按日期查看牌局分布
- **看板視圖**: 按結果分組（贏/輸/平手）
- **圖表視圖**: 跟踪盈利/虧損趨勢

### 3. 設置Notion API
1. 創建Notion集成: https://www.notion.so/my-integrations
2. 獲取API密鑰
3. 將集成添加到您的數據庫
4. 記錄數據庫ID (從URL中獲取)

## 二、應用架構設計

### 1. 簡化的應用架構
```
┌─────────────────┐      ┌───────────────┐      ┌────────────┐
│  前端界面        │ ──→  │  Notion API   │ ──→  │  Notion    │
│  (手牌記錄UI)    │ ←──  │  集成服務     │ ←──  │  數據庫    │
└─────────────────┘      └───────────────┘      └────────────┘
```

### 2. 技術堆疊
- **前端**: 
  - React.js (網頁應用) 或 Blazor WASM
  - React Native (可選，用於移動應用)
- **後端**:
  - 輕量級ASP.NET Core API (主要用於Notion API代理)
  - 也可考慮使用Azure Functions作為無服務器後端
- **存儲**:
  - Notion數據庫
  - 本地存儲(備份和離線功能)

## 三、開發步驟

### 第一階段: Notion API集成 (1-2週)

#### 1. 創建Notion客戶端服務
```csharp
// NotionService.cs
public class NotionService : INotionService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _databaseId;
    
    public NotionService(IConfiguration config)
    {
        _apiKey = config["Notion:ApiKey"];
        _databaseId = config["Notion:DatabaseId"];
        
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        _httpClient.DefaultRequestHeaders.Add("Notion-Version", "2022-06-28");
        _httpClient.BaseAddress = new Uri("https://api.notion.com/v1/");
    }
    
    // 創建手牌記錄
    public async Task<string> CreateHandRecordAsync(HandRecord record)
    {
        var pageProperties = new
        {
            parent = new { database_id = _databaseId },
            properties = new Dictionary<string, object>
            {
                ["日期"] = new { date = new { start = record.Timestamp.ToString("yyyy-MM-ddTHH:mm:ss.fffZ") } },
                ["遊戲類型"] = new { select = new { name = record.GameType } },
                ["位置"] = new { select = new { name = record.Position } },
                ["盲注"] = new { number = record.BlindSize },
                ["起手牌"] = new { rich_text = new[] { new { text = new { content = FormatCards(record.HoleCards) } } } },
                ["公共牌"] = new { rich_text = new[] { new { text = new { content = FormatCommunityCards(record.CommunityCards) } } } },
                ["行動記錄"] = new { rich_text = new[] { new { text = new { content = FormatActions(record.Actions) } } } },
                ["結果"] = new { select = new { name = record.Result.Won ? "贏" : "輸" } },
                ["金額變化"] = new { number = record.Result.AmountWon },
                ["備註"] = new { rich_text = new[] { new { text = new { content = record.Result.Notes ?? "" } } } }
            }
        };
        
        var response = await _httpClient.PostAsJsonAsync("pages", pageProperties);
        response.EnsureSuccessStatusCode();
        
        var content = await response.Content.ReadFromJsonAsync<NotionResponse>();
        return content.Id;
    }
    
    // 獲取記錄列表
    public async Task<List<HandRecord>> GetHandRecordsAsync(int limit = 100)
    {
        var queryData = new
        {
            sorts = new[] { new { property = "日期", direction = "descending" } },
            page_size = limit
        };
        
        var response = await _httpClient.PostAsJsonAsync($"databases/{_databaseId}/query", queryData);
        response.EnsureSuccessStatusCode();
        
        var content = await response.Content.ReadFromJsonAsync<NotionQueryResponse>();
        return content.Results.Select(MapToHandRecord).ToList();
    }
    
    // 格式化和映射方法
    private string FormatCards(List<Card> cards) => 
        string.Join("", cards.Select(c => $"{GetSuitSymbol(c.Suit)}{c.Value}"));
    
    private string FormatCommunityCards(List<Card> cards) =>
        cards.Count > 0 ? FormatCards(cards) : "未看到公共牌";
    
    private string FormatActions(List<PlayerAction> actions) =>
        string.Join(" | ", actions.Select(a => $"{a.Stage}: {a.Action} {(a.Amount.HasValue ? a.Amount.Value.ToString() : "")}"));
    
    private string GetSuitSymbol(string suit) => suit.ToLower() switch
    {
        "spades" => "♠",
        "hearts" => "♥",
        "diamonds" => "♦",
        "clubs" => "♣",
        _ => suit
    };
    
    private HandRecord MapToHandRecord(NotionPage page)
    {
        // 從Notion頁面映射回HandRecord對象
        // 實現省略
        return new HandRecord();
    }
}
```

#### 2. 創建API控制器
```csharp
[ApiController]
[Route("api/[controller]")]
public class HandRecordsController : ControllerBase
{
    private readonly INotionService _notionService;
    
    public HandRecordsController(INotionService notionService)
    {
        _notionService = notionService;
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateHandRecord(HandRecord record)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        record.Timestamp = DateTime.UtcNow;
        var pageId = await _notionService.CreateHandRecordAsync(record);
        
        return Ok(new { pageId });
    }
    
    [HttpGet]
    public async Task<IActionResult> GetHandRecords([FromQuery] int limit = 100)
    {
        var records = await _notionService.GetHandRecordsAsync(limit);
        return Ok(records);
    }
}
```

### 第二階段: 前端開發 (2-4週)

#### 1. 基本UI組件
使用React實現以下關鍵組件：
- 牌桌視圖組件
- 撲克牌選擇器
- 行動按鈕面板
- 結果記錄表單

#### 2. 狀態管理和API集成
```javascript
// 使用React Hooks管理狀態和API調用
function useHandRecorder() {
  const [currentHand, setCurrentHand] = useState({
    position: '',
    holeCards: [],
    communityCards: [],
    actions: [],
    result: { won: false, amountWon: 0, notes: '' }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 記錄手牌
  const recordHand = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/handrecords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentHand)
      });
      
      if (!response.ok) throw new Error('提交失敗');
      
      const result = await response.json();
      return result.pageId; // 返回Notion頁面ID
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 其他狀態管理方法...
  
  return {
    currentHand,
    isSubmitting,
    updatePosition: (pos) => setCurrentHand({...currentHand, position: pos}),
    addHoleCard: (card) => setCurrentHand({...currentHand, holeCards: [...currentHand.holeCards, card]}),
    // 其他方法...
    recordHand
  };
}
```

#### 3. 離線功能
實現本地存儲備份，確保即使無網絡情況下也能記錄：
```javascript
// 本地存儲服務
const localStorageService = {
  savePendingHand: (hand) => {
    const pendingHands = JSON.parse(localStorage.getItem('pendingHands') || '[]');
    pendingHands.push({...hand, pendingId: Date.now()});
    localStorage.setItem('pendingHands', JSON.stringify(pendingHands));
  },
  
  getPendingHands: () => {
    return JSON.parse(localStorage.getItem('pendingHands') || '[]');
  },
  
  removePendingHand: (pendingId) => {
    const pendingHands = JSON.parse(localStorage.getItem('pendingHands') || '[]');
    const filtered = pendingHands.filter(h => h.pendingId !== pendingId);
    localStorage.setItem('pendingHands', JSON.stringify(filtered));
  }
};
```

## 四、用戶體驗優化

### 1. 離線同步機制
當網絡恢復時自動同步本地存儲的記錄：
```javascript
function useSyncService() {
  useEffect(() => {
    // 檢測網絡狀態變化
    const handleOnline = async () => {
      const pendingHands = localStorageService.getPendingHands();
      if (pendingHands.length > 0) {
        // 顯示同步通知
        for (const hand of pendingHands) {
          try {
            // 嘗試同步到Notion
            await fetch('/api/handrecords', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(hand)
            });
            // 成功後移除本地記錄
            localStorageService.removePendingHand(hand.pendingId);
          } catch (err) {
            console.error('同步失敗:', err);
          }
        }
        // 更新同步狀態
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);
  
  // 返回同步狀態...
}
```

### 2. 快速輸入優化
實現快捷鍵和手勢操作，加速錄入流程：
```javascript
function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key.toLowerCase()) {
        case 'f': handlers.fold(); break;
        case 'c': handlers.call(); break;
        case 'r': handlers.raise(); break;
        // 更多快捷鍵...
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
```

## 五、部署方案

### 1. 靜態網站部署
由於主要數據都存在Notion，前端可以作為靜態網站部署：
- GitHub Pages
- Netlify
- Vercel

### 2. 輕量級API部署
為Notion API代理部署一個輕量級後端：
- Azure Static Web Apps (包含API功能)
- Azure Functions
- Vercel Serverless Functions

### 3. 移動應用方案 (可選)
- 使用PWA技術使網頁應用可安裝
- 使用React Native開發原生移動應用

## 六、開發路線圖

### 1-2週: 基礎設置和Notion API集成
- 創建Notion數據庫和集成
- 實現基本的Notion服務
- 搭建輕量級API框架

### 3-6週: 核心UI和功能開發
- 實現基本的手牌記錄界面
- 開發牌型選擇器和行動記錄功能
- 實現與Notion的數據同步

### 7-8週: 完善和優化
- 添加離線功能和同步機制
- 實現快捷鍵和高級輸入功能
- 優化移動設備體驗

### 9-10週: 測試和部署
- 進行用戶測試和修復問題
- 部署應用
- 收集反饋並持續迭代

## 七、Notion使用技巧

### 1. 數據分析
利用Notion的公式和關聯功能分析您的撲克表現：
- 使用公式計算盈利率
- 創建關聯數據庫追踪特定位置的表現
- 使用圖表視圖分析趨勢

### 2. 模板和自動化
- 創建牌局記錄模板
- 設置提醒回顧特定牌局
- 使用Notion API自動創建每日/每週總結

### 3. 內容擴展
將您的牌譜數據庫與其他Notion頁面關聯：
- 撲克學習筆記
- 對手分析數據庫
- 策略研究文檔

## 八、後續發展建議

### 1. 數據分析功能
在應用中添加數據分析和可視化功能：
- 顯示關鍵統計數據 (VPIP, PFR等)
- 生成圖表顯示趨勢
- 提供基本策略建議

### 2. AI集成
考慮添加基本的AI功能：
- 分析常見錯誤
- 提供手牌評估
- 推薦學習資源

### 3. 社區功能
建立用戶社區分享和學習：
- 分享特定牌局進行討論
- 連接志同道合的玩家
- 組織學習小組

## 九、資源和工具

### 1. Notion API文檔
- [Notion API官方文檔](https://developers.notion.com/)
- [Notion數據庫屬性](https://developers.notion.com/reference/property-object)

### 2. 開發工具
- [Visual Studio Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) (測試Notion API)

### 3. 部署平台
- [Vercel](https://vercel.com/)
- [Azure靜態Web應用](https://azure.microsoft.com/services/app-service/static/)

這個實施方案專注於使用Notion作為後端，同時保持應用的輕量級和高效性。通過這種方式，您可以快速實現核心功能，利用Notion的強大功能，並根據反饋持續改進應用。