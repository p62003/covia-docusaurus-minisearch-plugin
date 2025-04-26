const fs = require('fs');
const path = require('path');
const MiniSearch = require('minisearch');
const { globby } = require('globby');
const matter = require('gray-matter');

/**
 * 生成搜尋索引
 * @param {Object} options - 索引生成選項
 * @param {string} options.docsPath - 文檔目錄路徑
 * @param {string} options.searchResultPath - 搜尋結果頁面路徑
 * @param {string[]} options.searchFields - 要搜尋的欄位
 * @param {string[]} options.resultFields - 要返回的欄位
 * @param {string} options.outputPath - 索引輸出路徑
 */
async function generateSearchIndex({ docsPath, searchResultPath, searchFields, resultFields, outputPath }) {
    try {
        console.log(`🔍 正在搜尋 Markdown 檔案: ${docsPath}`);
        const files = await globby(['**/*.md', '**/*.mdx'], { cwd: docsPath });
        console.log(`✅ 找到 ${files.length} 個檔案`);

        const documents = files.map((filePath, idx) => {
            const fullPath = path.join(docsPath, filePath);
            const raw = fs.readFileSync(fullPath, 'utf-8');
            const { data, content } = matter(raw);

            // 從 frontmatter 取得標題，如果沒有則使用檔案名
            const title = data.title || path.basename(filePath, path.extname(filePath));

            // 生成一致的 URL 路徑（使用正規化的 POSIX 風格路徑）
            const normalizedPath = filePath.split(path.sep).join('/');
            const url = `/docs/${normalizedPath.replace(/\.mdx?$/, '')}`;

            // 提取摘要（前 150 個字元）
            const plainText = content.replace(/\s+/g, ' ').trim();
            const excerpt = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

            return {
                id: idx,
                title,
                content: plainText,
                url,
                excerpt,
            };
        });

        console.log(`✅ 已處理 ${documents.length} 個文檔`);

        // 創建 MiniSearch 實例
        const miniSearch = new MiniSearch({
            fields: searchFields,
            storeFields: resultFields,
            // 增加分詞器設定，以支援中文等非英文語言
            tokenize: (text) => text.split(/\s+/),
        });

        // 添加所有文檔到索引
        miniSearch.addAll(documents);
        console.log(`✅ 搜尋索引已生成`);

        // 確保輸出目錄存在
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        // 寫入索引檔案
        const indexJSON = JSON.stringify(miniSearch.toJSON());
        fs.writeFileSync(outputPath, indexJSON);
        console.log(`✅ 搜尋索引已寫入: ${outputPath}`);

        return { success: true, documents: documents.length };
    } catch (error) {
        console.error(`❌ 生成搜尋索引時出錯:`, error);
        throw error;
    }
}

module.exports = generateSearchIndex;