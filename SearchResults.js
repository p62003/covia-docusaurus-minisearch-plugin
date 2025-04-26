import React, { useEffect, useState } from 'react';
import { useLocation } from '@docusaurus/router';
import MiniSearch from 'minisearch';
import Layout from '@theme/Layout';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './styles.module.css';

/**
 * 搜尋結果頁面組件 - 修復路由問題
 */
export default function SearchResults() {
    // 從全局數據獲取搜尋配置
    const { searchConfig } = usePluginData('docusaurus-plugin-minisearch') || {};

    const { search } = useLocation();
    const query = new URLSearchParams(search).get('q') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 使用默認配置或從全局數據獲取配置
    const {
        indexPath = '/search-index.json',
        searchFields = ['title', 'content'],
        resultFields = ['title', 'url', 'excerpt'],
        maxResults = 10,
        highlightColor = '#ffeb3b'
    } = searchConfig || {};

    // 高亮搜尋關鍵字 - 終極修復版 5.0
    const highlightMatches = (text, query, originalQuery, forceHighlight = false) => {
        if (!text || (!query && !originalQuery)) return text;

        // 轉義正則表達式特殊字符
        const escapeRegExp = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        // 處理查詢詞 - 不過濾長度，允許匹配任何長度的詞
        const words = query.trim().split(/\s+/).filter(word => word.length > 0);

        // 添加原始查詢詞，確保部分匹配也能被高亮
        const originalWords = originalQuery ? originalQuery.trim().split(/\s+/).filter(word => word.length > 0) : [];
        const allWords = [...new Set([...words, ...originalWords])];

        if (allWords.length === 0) return text;

        // 使用最直接的方式，不進行HTML轉義
        let result = text;

        // 添加調試信息
        console.log('原始文本:', text);
        console.log('搜尋詞:', allWords);

        // 檢查文本中是否包含搜尋詞
        let hasMatch = false;

        // 先嘗試直接匹配原始查詢詞（可能是部分詞如"READ"）
        originalWords.forEach(word => {
            try {
                if (text.toLowerCase().includes(word.toLowerCase())) {
                    hasMatch = true;
                    console.log(`找到原始詞匹配: "${word}"`);

                    const escapedWord = escapeRegExp(word);
                    // 使用不區分大小寫的正則表達式
                    const regex = new RegExp(`(${escapedWord})`, 'gi');

                    // 使用特定的類名和內聯樣式
                    result = result.replace(regex, `<span class="search-highlight" style="background-color:${highlightColor} !important;color:#000 !important;padding:0 2px;border-radius:2px;font-weight:bold;">$1</span>`);
                }
            } catch (e) {
                console.error('原始詞匹配錯誤:', e);
            }
        });

        // 然後嘗試匹配完整詞
        if (!hasMatch) {
            words.forEach(word => {
                if (text.toLowerCase().includes(word.toLowerCase())) {
                    hasMatch = true;
                    console.log(`找到完整詞匹配: "${word}"`);

                    const escapedWord = escapeRegExp(word);
                    const regex = new RegExp(`(${escapedWord})`, 'gi');

                    // 使用特定的類名和內聯樣式
                    result = result.replace(regex, `<span class="search-highlight" style="background-color:${highlightColor} !important;color:#000 !important;padding:0 2px;border-radius:2px;font-weight:bold;">$1</span>`);
                }
            });
        }

        // 如果仍然沒有匹配，嘗試部分匹配
        if (!hasMatch) {
            console.log('沒有找到匹配項，嘗試部分匹配');

            // 對所有詞進行部分匹配
            allWords.forEach(word => {
                try {
                    const escapedWord = escapeRegExp(word);

                    // 首先嘗試匹配包含該詞的單詞
                    const containsRegex = new RegExp(`([^\\s]*${escapedWord}[^\\s]*)`, 'gi');
                    const containsMatches = text.match(containsRegex);

                    if (containsMatches && containsMatches.length > 0) {
                        console.log(`找到包含匹配: ${containsMatches.join(', ')}`);

                        // 使用特定的類名和內聯樣式
                        result = result.replace(containsRegex, `<span class="search-highlight" style="background-color:${highlightColor} !important;color:#000 !important;padding:0 2px;border-radius:2px;font-weight:bold;">$1</span>`);
                        hasMatch = true;
                    }
                    // 如果沒有找到包含匹配，嘗試匹配部分詞
                    else if (word.length >= 3) {  // 只對長度>=3的詞進行部分匹配
                        // 匹配任何包含該詞一部分的文本
                        for (let i = 0; i < word.length - 2; i++) {
                            const partialWord = word.substring(i, i + 3);  // 取3個字符的子串
                            const partialEscaped = escapeRegExp(partialWord);
                            const partialRegex = new RegExp(`(${partialEscaped})`, 'gi');

                            if (text.toLowerCase().includes(partialWord.toLowerCase())) {
                                console.log(`找到部分詞匹配: ${partialWord}`);

                                // 使用特定的類名和內聯樣式
                                result = result.replace(partialRegex, `<span class="search-highlight" style="background-color:${highlightColor} !important;color:#000 !important;padding:0 2px;border-radius:2px;font-weight:bold;">$1</span>`);
                                hasMatch = true;
                                break;  // 找到一個匹配就停止
                            }
                        }
                    }
                } catch (e) {
                    console.error('部分匹配錯誤:', e);
                }
            });

            // 如果強制高亮，且沒有找到匹配項，則高亮第一個單詞
            if (forceHighlight && !hasMatch && text.length > 0) {
                console.log('強制高亮第一個單詞');
                const firstWord = text.split(/\s+/)[0];
                if (firstWord && firstWord.length > 0) {
                    result = result.replace(firstWord, `<span class="search-highlight" style="background-color:${highlightColor} !important;color:#000 !important;padding:0 2px;border-radius:2px;font-weight:bold;">${firstWord}</span>`);
                    hasMatch = true;
                }
            }
        }

        // 添加調試信息
        console.log('處理後文本:', result);
        console.log('是否有匹配:', hasMatch);

        return result;
    };

    // 通用 URL 修復函數，增強版
    const fixDocUrl = (url) => {
        // 獲取當前環境的基礎路徑
        const getBasePath = () => {
            // 嘗試從 Docusaurus meta 標籤獲取
            const metaBaseUrl = document.querySelector('meta[name="docusaurus-base-url"]')?.getAttribute('content');
            if (metaBaseUrl) {
                return metaBaseUrl.endsWith('/') ? metaBaseUrl : metaBaseUrl + '/';
            }

            // 檢查當前 URL 路徑
            const currentPath = window.location.pathname;

            // 檢查是否在本地開發環境
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // 檢查本地環境是否有特定路徑前綴
                const matches = currentPath.match(/^(\/[^\/]+)\//);
                if (matches && matches[1] !== '/search-results') {
                    console.log('本地環境檢測到路徑前綴:', matches[1]);
                    return matches[1] + '/';
                }
            }

            // 檢查是否包含 docusaurus-plugin-minisearch-COVIA-demo
            if (currentPath.includes('/docusaurus-plugin-minisearch-COVIA-demo/')) {
                return '/docusaurus-plugin-minisearch-COVIA-demo/';
            }

            // 嘗試從搜尋結果頁面 URL 獲取
            const searchResultsIndex = currentPath.indexOf('/search-results');
            if (searchResultsIndex > 0) {
                return currentPath.substring(0, searchResultsIndex) + '/';
            }

            // 嘗試從文檔鏈接推斷
            const docsMatch = document.querySelector('a[href*="/docs/"]');
            if (docsMatch) {
                const href = docsMatch.getAttribute('href');
                const docsIndex = href.indexOf('/docs/');
                if (docsIndex > 0) {
                    return href.substring(0, docsIndex) + '/';
                }
            }

            // 默認返回根路徑
            return '/';
        };

        const basePath = getBasePath();
        console.log('檢測到的基礎路徑:', basePath, '原始 URL:', url);

        // 處理 README.md 特殊情況
        if (url.endsWith('/README')) {
            url = url.substring(0, url.length - '/README'.length) || '/docs';
        }

        // 確保 URL 包含正確的基礎路徑
        if (url.startsWith('/') && !url.startsWith(basePath)) {
            // 移除開頭的斜線，然後加上基礎路徑
            url = basePath + url.substring(1);
            console.log('修正後的 URL:', url);
        }

        return url;
    };
    useEffect(() => {
        async function searchDocs() {
            if (!query) return;
            setLoading(true);
            setError(null);
            try {
                console.log('開始執行搜尋...');

                // 嘗試多種索引路徑
                const possiblePaths = [
                    // 原始路徑
                    indexPath,
                    // 相對路徑
                    './search-index.json',
                    // 絕對路徑
                    '/search-index.json',
                    // 基於當前站點的路徑
                    window.location.pathname.split('/search-results')[0] + '/search-index.json',
                    // Docusaurus 文檔特定路徑
                    '/docusaurus-plugin-minisearch-COVIA-demo/search-index.json'
                ];

                // 去除重複路徑
                const uniquePaths = [...new Set(possiblePaths)];
                console.log('將嘗試以下路徑:', uniquePaths);

                let success = false;
                let lastError = null;

                // 依次嘗試所有可能的路徑
                for (const path of uniquePaths) {
                    try {
                        console.log(`嘗試路徑: ${path}`);
                        const res = await fetch(path);

                        if (!res.ok) {
                            console.log(`路徑 ${path} 返回狀態: ${res.status}`);
                            continue; // 嘗試下一個路徑
                        }

                        const text = await res.text();

                        // 確認是 JSON 而不是 HTML
                        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                            console.log(`路徑 ${path} 返回 HTML 而非 JSON`);
                            continue;
                        }

                        console.log(`成功從 ${path} 獲取索引內容`);

                        const miniSearch = MiniSearch.loadJSON(text, {
                            fields: searchFields,
                            storeFields: resultFields,
                        });

                        console.log(`使用關鍵詞 "${query}" 執行搜尋`);
                        const hits = miniSearch.search(query, {
                            prefix: true,
                            boost: { title: 2 },
                            fuzzy: 0.2
                        });

                        console.log(`找到 ${hits.length} 個結果`);

                        // 從搜尋結果中獲取匹配的詞
                        const matchTerms = new Set();
                        hits.forEach(hit => {
                            if (hit.terms) {
                                hit.terms.forEach(term => matchTerms.add(term));
                            }
                            // 如果沒有terms屬性，使用搜尋詞
                            else {
                                query.trim().split(/\s+/).forEach(term => matchTerms.add(term));
                            }
                        });

                        console.log('匹配的詞:', Array.from(matchTerms));

                        // 將匹配的詞添加到結果中
                        const resultsWithTerms = hits.map(hit => ({
                            ...hit,
                            matchTerms: Array.from(matchTerms)
                        }));

                        setResults(resultsWithTerms.slice(0, maxResults));
                        success = true;
                        break; // 成功獲取索引，跳出循環

                    } catch (err) {
                        console.warn(`路徑 ${path} 獲取失敗:`, err);
                        lastError = err;
                    }
                }

                if (!success) {
                    console.error('所有路徑都失敗');
                    throw lastError || new Error('無法載入搜尋索引');
                }
            } catch (err) {
                console.error('搜尋出錯:', err);
                setError('無法載入搜尋索引。請確保 search-index.json 文件已正確生成並放置在適當位置。');
            } finally {
                setLoading(false);
            }
        }

        searchDocs();
    }, [query, indexPath, searchFields, resultFields, maxResults]);

    // 渲染搜尋結果內容
    const renderSearchContent = () => {
        if (loading) {
            return (
                <div className={styles.searchResults}>
                    <h2>搜尋中...</h2>
                    <div className={styles.loader}></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.searchResults}>
                    <h2>搜尋錯誤</h2>
                    <p className={styles.error}>{error}</p>
                    <div className={styles.debugInfo}>
                        <h3>調試信息</h3>
                        <p>如果您是網站管理員，請檢查：</p>
                        <ol>
                            <li>static/search-index.json 檔案是否存在</li>
                            <li>檔案是否為有效的 JSON 格式</li>
                            <li>打開瀏覽器開發者工具，切換到網路標籤，嘗試搜尋並查看網路請求</li>
                        </ol>
                    </div>
                </div>
            );
        }

        if (!query) {
            return (
                <div className={styles.searchResults}>
                    <h2>文檔搜尋</h2>
                    <p>請在上方搜尋框輸入關鍵字。</p>
                </div>
            );
        }

        if (results.length === 0) {
            return (
                <div className={styles.searchResults}>
                    <h2>搜尋結果: {query}</h2>
                    <p>沒有找到符合 "{query}" 的內容。</p>
                    <ul className={styles.suggestions}>
                        <li>請確認拼寫是否正確</li>
                        <li>嘗試使用不同的關鍵字</li>
                        <li>嘗試使用更一般的詞彙</li>
                    </ul>
                </div>
            );
        }

        // 添加調試信息
        console.log('搜尋結果:', results);
        console.log('搜尋詞:', query);

        return (
            <div className={styles.searchResults}>
                <h2>搜尋結果: {query}</h2>
                <p className={styles.resultCount}>共找到 {results.length} 個結果</p>
                <ul className={styles.resultList}>
                    {results.map((item, idx) => {
                        // 使用匹配的詞來高亮文本
                        const terms = item.matchTerms || query.trim().split(/\s+/);
                        console.log(`結果 ${idx} 匹配的詞:`, terms);

                        // 預處理高亮文本 - 使用匹配的詞和原始查詢詞，不強制高亮
                        const highlightedExcerpt = item.excerpt ?
                            highlightMatches(item.excerpt, terms.join(' '), query, false) : '';
                        console.log(`結果 ${idx} 高亮後:`, highlightedExcerpt);

                        // 預處理高亮標題，不強制高亮
                        const highlightedTitle = highlightMatches(item.title, terms.join(' '), query, false);

                        return (
                            <li key={idx} className={styles.resultItem}>
                                <a
                                    href={fixDocUrl(item.url)}
                                    className={styles.resultTitle}
                                    dangerouslySetInnerHTML={{
                                        __html: highlightedTitle
                                    }}
                                />
                                {item.excerpt && (
                                    <p
                                        className={styles.resultExcerpt}
                                        dangerouslySetInnerHTML={{
                                            __html: highlightedExcerpt
                                        }}
                                    />
                                )}
                                <a href={fixDocUrl(item.url)} className={styles.resultLink}>
                                    查看文檔 →
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    // 使用 Docusaurus Layout 包裹內容
    return (
        <Layout
            title={query ? `搜尋結果: ${query}` : '搜尋'}
            description="文檔搜尋結果"
        >
            <main className="container margin-vert--lg">
                {renderSearchContent()}
            </main>
        </Layout>
    );
}