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
        maxResults = 10
    } = searchConfig || {};

    // 高亮搜尋關鍵字
    const highlightMatches = (text, query) => {
        if (!text || !query) return text;
        const words = query.trim().split(/\s+/).filter(word => word.length > 1);
        if (words.length === 0) return text;

        let result = text;
        words.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            result = result.replace(regex, '<span class="' + styles.highlight + '">$1</span>');
        });
        return result;
    };

    useEffect(() => {
        async function searchDocs() {
            if (!query) return;

            setLoading(true);
            setError(null);

            try {
                console.log('開始執行搜尋...');
                console.log(`使用索引路徑: ${indexPath}`);

                // 直接從檔案加載索引
                try {
                    // 嘗試從靜態資源目錄載入索引
                    const res = await fetch(indexPath);

                    if (!res.ok) {
                        throw new Error(`HTTP 錯誤: ${res.status}`);
                    }

                    // 獲取索引 JSON 文本
                    const text = await res.text();
                    console.log(`成功獲取索引內容，前 50 個字符: ${text.slice(0, 50)}`);

                    // 直接將文本傳給 loadJSON，不先解析
                    const miniSearch = MiniSearch.loadJSON(text, {
                        fields: searchFields,
                        storeFields: resultFields,
                    });

                    // 執行搜尋
                    console.log(`使用關鍵詞 "${query}" 執行搜尋`);
                    const hits = miniSearch.search(query, {
                        prefix: true,
                        boost: { title: 2 },
                        fuzzy: 0.2
                    });

                    console.log(`找到 ${hits.length} 個結果`);
                    setResults(hits.slice(0, maxResults));
                } catch (err) {
                    console.error('搜尋出錯:', err);
                    setError(err.message);
                }
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

        return (
            <div className={styles.searchResults}>
                <h2>搜尋結果: {query}</h2>
                <p className={styles.resultCount}>共找到 {results.length} 個結果</p>
                <ul className={styles.resultList}>
                    {results.map((item, idx) => (
                        <li key={idx} className={styles.resultItem}>
                            <a href={item.url} className={styles.resultTitle}>
                                {item.title}
                            </a>
                            {item.excerpt && (
                                <p
                                    className={styles.resultExcerpt}
                                    dangerouslySetInnerHTML={{
                                        __html: highlightMatches(item.excerpt, query)
                                    }}
                                />
                            )}
                            <a href={item.url} className={styles.resultLink}>
                                查看文檔 →
                            </a>
                        </li>
                    ))}
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