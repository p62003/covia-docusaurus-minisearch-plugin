import React, { useState, useRef } from 'react';
import { useHistory } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './styles.module.css';

/**
 * 搜尋框組件 - 修復路由問題
 */
export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const history = useHistory();
    const inputRef = useRef(null);

    // 從全局數據獲取搜尋配置
    const { searchConfig } = usePluginData('docusaurus-plugin-minisearch') || {};
    const { searchResultPath = '/search-results' } = searchConfig || {};

    // 搜尋處理函數
    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            console.log(`🔍 導向到搜尋結果頁面: ${searchResultPath}?q=${query.trim()}`);
            // 使用配置中的搜尋結果路徑
            history.push(`${searchResultPath}?q=${encodeURIComponent(query.trim())}`);

            // 搜尋後清空焦點
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    return (
        <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
                ref={inputRef}
                type="text"
                placeholder="搜尋文檔..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={styles.searchInput}
                aria-label="搜尋文檔"
            />
            <button
                type="submit"
                className={styles.searchButton}
                aria-label="搜尋"
            >
                🔍
            </button>

            {/* 搜尋快捷鍵提示 */}
            {focused && (
                <div className={styles.searchShortcut}>
                    <kbd className={styles.kbdKey}>Enter</kbd> 搜尋
                </div>
            )}
        </form>
    );
}