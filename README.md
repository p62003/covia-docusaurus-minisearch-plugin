# Covia Docusaurus MiniSearch Plugin

Covia MiniSearch Plugin 是一個為 Docusaurus 小型至中型知識庫網站設計的輕量型本地搜尋解決方案。  
它主打快速部署、簡單整合，特別適合不具備專業開發背景的使用者。  
此插件完全於前端運行，無需額外的後端伺服器支持，適合個人、團隊與中小型專案使用。

> 📢 **注意**：本插件並不適用於超大型、多語系網站，或需要中文分詞優化的場景。
> 若有進階需求，建議參考如 @easyops-cn/docusaurus-search-local 等其他解決方案。

## 檔案結構

```
my-website/
│
├── plugins/
│   │
│   └── docusaurus-plugin-minisearch/
│       │
│       ├── index.js
│       ├── indexGenerator.js
│       ├── SearchBar.js
│       ├── SearchResults.js
│       ├── styles.module.css
│       ├── README.md
│       └── LICENSE
```

## 功能特點

* **即時搜尋**：提供高效、即時的前端搜尋體驗
* **關鍵字高亮**：在搜尋結果中高亮顯示匹配的關鍵字
* **模糊搜尋**：支援拼寫錯誤和近似匹配
* **前綴搜尋**：支援輸入部分詞語進行匹配
* **字段加權**：可對不同字段（如標題）設置不同的權重
* **無縫整合**：完美融入 Docusaurus 主題，支援明暗模式切換
* **完整布局**：搜尋結果頁面包含頁首和頁尾，保持網站一致性
* **自動索引**：在建置時自動生成搜尋索引

## 安裝方式

### 先決條件

* Docusaurus v3.0.0 或以上版本
* Node.js v16.0.0 或以上版本

### 步驟

1. 在你的 Docusaurus 項目中創建插件目錄：

```bash
mkdir -p plugins/docusaurus-plugin-minisearch
```

2. 複製插件檔案到該目錄：

```bash
# 複製以下檔案到插件目錄
# - index.js
# - indexGenerator.js
# - SearchBar.js
# - SearchResults.js
# - styles.module.css
```

3. 在 `docusaurus.config.js` 中添加插件配置：

```js
module.exports = {
  // 其他配置...
  plugins: [
    [
      './plugins/docusaurus-plugin-minisearch',
      {
        // 配置選項
        highlightColor: '#ffeb3b',
        searchResultPath: '/search-results',
        searchFields: ['title', 'content'],
        resultFields: ['title', 'url', 'excerpt'],
        maxResults: 10
      }
    ],
  ],
};
```

## 配置選項

| 選項 | 類型 | 默認值 | 說明 |
|------|------|--------|------|
| highlightColor | String | '#ffeb3b' | 搜尋關鍵字高亮顏色 |
| debounceTime | Number | 3000 | 連續搜尋的最小間隔時間(毫秒) |
| searchResultPath | String | '/search-results' | 搜尋結果顯示頁面路徑 |
| indexPath | String | '/search-index.json' | 搜尋索引檔案路徑 |
| searchFields | Array | ['title', 'content'] | 要搜尋的欄位 |
| resultFields | Array | ['title', 'url', 'excerpt'] | 要顯示的結果欄位 |
| maxResults | Number | 10 | 最大顯示結果數量 |

## 技術實現

### 插件架構

插件由以下核心組件構成：

1. **索引生成器** - 從文檔檔案生成搜尋索引
2. **搜尋框組件** - 整合到 Docusaurus 導航欄
3. **搜尋結果頁面** - 顯示搜尋結果並高亮關鍵字
4. **插件主文件** - 連接各組件並處理配置

### 使用的關鍵技術

* **MiniSearch** - 輕量級但功能強大的前端全文搜尋引擎
* **Docusaurus Theme API** - 集成到 Docusaurus 主題系統
* **React Hooks** - 管理搜尋狀態和索引載入
* **Docusaurus Plugin API** - 註冊路由和共享配置數據

### 工作原理

1. **索引生成**
   * 在建置時遍歷所有文檔檔案
   * 提取標題、內容、URL 等信息
   * 生成 JSON 索引檔案存放在 `static` 目錄
   
2. **搜尋流程**
   * 用戶在導航欄搜尋框輸入關鍵字
   * 點擊搜尋按鈕後導航至搜尋結果頁面
   * 搜尋結果頁面載入索引檔案
   * 使用 MiniSearch 在瀏覽器中進行搜尋
   * 渲染搜尋結果並高亮關鍵字

## 自定義

### 自定義搜尋結果樣式

修改 `styles.module.css` 檔案可自定義搜尋結果的外觀：

```css
/* 修改搜尋結果項目樣式 */
.resultItem {
  /* 自定義樣式 */
}

/* 修改高亮關鍵字樣式 */
.highlight {
  /* 自定義樣式 */
}
```

### 自定義搜尋選項

在 `SearchResults.js` 中修改搜尋選項：

```javascript
const hits = miniSearch.search(query, { 
  prefix: true,      // 前綴搜尋
  boost: { title: 2 }, // 標題權重為 2
  fuzzy: 0.2         // 模糊搜尋，容許 20% 的編輯距離
});
```

## 常見問題

**Q: 搜尋索引會增加網站大小嗎？**  
A: 會，但幅度有限。對於中小型文檔網站，索引通常在幾百KB範圍內。

**Q: 如何更新搜尋索引？**  
A: 每次重新建置網站時會自動更新索引。

**Q: 搜尋結果是否支援多語言？**  
A: 基本支援，但可能需要針對不同語言調整分詞設定。

**Q: 為什麼搜尋結果頁面顯示「頁面未找到」？**  
A: 這通常是由於路由衝突導致。確保 `searchResultPath` 設置為一個不與其他路由衝突的值。

## 技術限制

* 純前端搜尋，不適用於極大型文檔庫
* 搜尋索引需要在建置時生成，無法包含動態內容
* 目前沒有內置的搜尋建議功能

## 貢獻指南

歡迎提交 Issues 和 Pull Requests。在提交前，請確保：

1. 代碼符合專案的編碼風格
2. 所有測試均已通過
3. 新功能或修改已添加適當的文檔

## 實作細節與注意事項

### MiniSearch 使用注意事項

使用 `MiniSearch.loadJSON` 時需直接傳入 JSON 字符串而非解析後的對象：

```javascript
// 錯誤方式
const rawIndex = JSON.parse(text);
const miniSearch = MiniSearch.loadJSON(rawIndex, options);

// 正確方式
const miniSearch = MiniSearch.loadJSON(text, options);
```

### 路由設置注意事項

避免搜尋結果路徑與 Docusaurus 默認路徑衝突：

```javascript
// 推薦使用專用路徑
searchResultPath = '/search-results'

// 確保精確匹配
addRoute({
  path: searchResultPath,
  component: '@theme/SearchResults',
  exact: true,
});
```

## 授權協議

本專案使用 MIT 授權協議。