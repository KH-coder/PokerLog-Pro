# 改進版撲克牌譜記錄應用開發路線圖

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

### 1. 數據模型設計
- **HandRecord** (手牌記錄)
  - 基本信息：ID、用戶ID、時間戳、位置
  - 牌型：起手牌、公共牌
  - 行動：各階段的行動記錄（下注、跟注等）
  - 結果：底池大小、是否贏得牌局、贏得金額等
  - 同步狀態：是否同步到Notion、同步狀態、Notion頁面ID等

- **SyncQueue** (同步隊列)
  - 隊列項目ID、手牌記錄ID
  - 狀態、創建時間、完成時間
  - 重試次數、錯誤信息

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

### 2. 數據存取層 (第2-3週)
- 實現DbContext和數據模型
- 創建數據庫遷移
- 實現數據存儲庫模式

### 3. 核心業務邏輯 (第3-5週)
- 實現手牌記錄服務
- 實現用戶認證和授權
- 添加基本的數據驗證
- 實現數據導出服務（多種格式）

### 4. 同步服務實現 (第5-6週)
- 設計同步服務接口
- 實現Notion同步隊列機制
- 實現Excel/CSV導出功能
- 添加同步重試和失敗處理邏輯

### 5. API控制器開發 (第6-8週)
- 實現認證控制器
- 實現手牌記錄控制器
- 實現同步與導出控制器
- 實現統計分析控制器

### 6. 後台任務實現 (第8-9週)
- 實現後台服務以處理同步隊列
- 設置定時任務自動處理隊列項目
- 添加同步狀態監控和錯誤通知

## 四、前端開發階段 (與後端並行)

### 1. 項目設置 (第1週)
- 創建React應用
- 設置路由和狀態管理
- 配置API客戶端

### 2. 核心組件開發 (第2-4週)
- 實現牌桌視圖組件
  - 座位位置選擇
  - 公共牌展示
  
- 實現牌型選擇器組件
  - 花色和點數選擇
  - 已選牌展示
  
- 實現行動按鈕組件
  - 不同階段行動選項
  - 金額輸入界面
  
- 實現結果輸入組件
  - 底池大小輸入
  - 勝負結果記錄
  - 贏得金額輸入
  - 筆記添加

### 3. 同步與導出界面 (第4-6週)
- 實現同步設置界面
  - Notion同步開關
  - 同步狀態顯示
  
- 實現同步狀態顯示組件
  - 顯示不同同步狀態（等待、成功、失敗）
  - 刷新狀態按鈕
  - 重試按鈕

- 設計多種導出選項界面
  - CSV導出
  - Excel導出選項
  
- 添加離線模式指示器

### 4. UI/UX優化 (第6-8週)
- 優化移動設備體驗
- 實現夜間模式
- 添加動畫和過渡效果
- 提供同步狀態視覺反饋

## 五、測試與部署階段

### 1. 單元測試和集成測試 (第8-9週)
- 為關鍵服務添加單元測試
- 為同步邏輯添加特定測試
- 為API端點添加集成測試
- 為前端組件添加測試

### 2. 部署準備 (第9-10週)
- 配置CI/CD管道
- 創建Docker容器和配置
- 準備數據庫遷移腳本
- 配置後台服務和定時任務

### 3. 上線部署 (第10週)
- 部署到選定的雲服務商 (Azure/AWS/GCP)
- 配置域名和SSL
- 設置監控和日誌
- 部署同步服務監控

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
- **用戶同步配置**
  - 是否自動同步
  - 同步頻率（立即、每小時、每天、每週）
  - Notion訪問令牌
  - 默認數據庫ID
  - 每日同步限制

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

這樣設計的應用將更加穩健可靠，即使在Notion API不可用或受限時仍能正常運作。同時，對於需要Notion整合的用戶，仍然提供了高質量、可控的同步體驗。