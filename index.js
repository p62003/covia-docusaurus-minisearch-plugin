const fs = require('fs');
const path = require('path');
const generateSearchIndex = require('./indexGenerator');

/**
 * Docusaurus MiniSearch 插件 - 修復路由問題
 */
function pluginMiniSearch(context, options) {
    const { siteDir, generatedFilesDir } = context;
    const {
        highlightColor = '#ffeb3b',
        debounceTime = 3000,
        // 變更默認搜尋結果路徑，避免與文檔路徑衝突
        searchResultPath = '/search-results',
        indexPath = '/search-index.json',
        searchFields = ['title', 'content'],
        resultFields = ['title', 'url', 'excerpt'],
        maxResults = 10,
    } = options;

    return {
        name: 'docusaurus-plugin-minisearch',

        // 生成搜尋索引
        async loadContent() {
            console.log('✅ MiniSearch Plugin: loadContent 正在執行');
            console.log(`🔍 搜尋結果路徑設定為: ${searchResultPath}`);

            const docsPath = path.join(siteDir, 'docs');
            const indexOutputPath = path.join(generatedFilesDir, 'docusaurus-plugin-minisearch', 'search-index.json');

            // 生成索引
            await generateSearchIndex({
                docsPath,
                searchResultPath,
                searchFields,
                resultFields,
                outputPath: indexOutputPath,
            });

            // 拷貝到 static 目錄,拷貝到多個位置，增加兼容性
            const staticPaths = [
                path.join(siteDir, 'static', 'search-index.json'),
                path.join(siteDir, 'static', indexPath.replace(/^\//, '')),
                // 確保也有不帶前置斜線的版本
                path.join(siteDir, 'build', 'search-index.json')
            ];

            staticPaths.forEach(staticPath => {
                fs.mkdirSync(path.dirname(staticPath), { recursive: true });
                fs.copyFileSync(indexOutputPath, staticPath);
                console.log(`✅ search-index.json 已複製到 ${staticPath} 成功`);
            });

            const staticPath = path.join(siteDir, 'static', 'search-index.json');
            fs.mkdirSync(path.dirname(staticPath), { recursive: true });
            fs.copyFileSync(indexOutputPath, staticPath);
            console.log(`✅ search-index.json 已複製到 ${staticPath} 成功`);

            // 返回搜尋配置信息
            return {
                searchConfig: {
                    highlightColor,
                    debounceTime,
                    searchResultPath,
                    indexPath,
                    searchFields,
                    resultFields,
                    maxResults,
                }
            };
        },

        // 內容加載完成後的操作
        async contentLoaded({ content, actions }) {
            const { addRoute, setGlobalData } = actions;
            const { searchConfig } = content;

            // 設置全局數據，供搜尋組件使用
            setGlobalData({
                searchConfig,
            });

            // 添加搜尋結果路由
            addRoute({
                path: searchResultPath,
                component: '@theme/SearchResults',
                exact: true, // 確保只匹配精確路徑
            });

            console.log(`✅ 搜尋結果路由已添加: ${searchResultPath}`);
        },

        // 配置 webpack
        configureWebpack() {
            return {
                resolve: {
                    alias: {
                        '@theme/SearchBar': path.resolve(__dirname, './SearchBar.js'),
                        '@theme/SearchResults': path.resolve(__dirname, './SearchResults.js'),
                    },
                },
            };
        },

        // 在客戶端注入變量和全局樣式
        injectHtmlTags() {
            return {
                headTags: [
                    {
                        tagName: 'style',
                        innerHTML: `
                            :root {
                                --search-highlight-color: ${highlightColor};
                            }
                            
                            /* 全局高亮樣式，確保最高優先級 */
                            .search-highlight,
                            span[style*="background-color:${highlightColor}"],
                            mark[style*="background-color:${highlightColor}"] {
                                background-color: ${highlightColor} !important;
                                color: #000 !important;
                                padding: 0 2px !important;
                                border-radius: 2px !important;
                                font-weight: bold !important;
                                display: inline !important;
                            }
                            
                            /* 確保 dangerouslySetInnerHTML 中的 HTML 標籤正確顯示 */
                            .resultExcerpt span,
                            .resultExcerpt mark {
                                display: inline !important;
                            }
                        `,
                    },
                ],
            };
        },
    };
}

module.exports = pluginMiniSearch;