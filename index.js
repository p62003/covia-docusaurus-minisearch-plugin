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

            // 拷貝到 static 目錄
            const staticPath = path.join(siteDir, 'static', 'search-index.json');
            fs.mkdirSync(path.dirname(staticPath), { recursive: true });
            fs.copyFileSync(indexOutputPath, staticPath);
            console.log(`✅ search-index.json 已複製到 ${staticPath} 成功`);

            // 仍然同時複製到 public 目錄作為備份
            const publicPath = path.join(siteDir, 'public', 'search-index.json');
            fs.mkdirSync(path.dirname(publicPath), { recursive: true });
            fs.copyFileSync(indexOutputPath, publicPath);
            console.log(`✅ search-index.json 也已複製到 ${publicPath} 成功`);

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

        // 在客戶端注入變量
        injectHtmlTags() {
            return {
                headTags: [
                    {
                        tagName: 'style',
                        innerHTML: `
                            :root {
                                --search-highlight-color: ${highlightColor};
                            }
                        `,
                    },
                ],
            };
        },
    };
}

module.exports = pluginMiniSearch;