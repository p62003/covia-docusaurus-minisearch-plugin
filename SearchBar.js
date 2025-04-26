import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './styles.module.css';

/**
 * 搜尋框組件 - 添加智能延遲功能
 */
export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const [isThrottled, setIsThrottled] = useState(false);
    const history = useHistory();
    const inputRef = useRef(null);

    // 搜尋歷史記錄
    const searchHistoryRef = useRef([]);
    const timerRef = useRef(null);

    // 從全局數據獲取搜尋配置
    const { searchConfig } = usePluginData('docusaurus-plugin-minisearch') || {};
    const {
        searchResultPath = '/search-results',
        debounceTime = 3000 // 默認延遲時間為 3 秒
    } = searchConfig || {};

    // 檢查是否需要節流
    const checkThrottle = () => {
        const now = Date.now();
        const history = searchHistoryRef.current;

        // 添加當前搜尋時間到歷史記錄
        history.push(now);

        // 只保留最近 3 秒內的記錄
        const recentHistory = history.filter(time => now - time < debounceTime);
        searchHistoryRef.current = recentHistory;

        // 如果 3 秒內搜尋次數超過 2 次，則啟用節流
        const needThrottle = recentHistory.length > 2;

        if (needThrottle && !isThrottled) {
            setIsThrottled(true);

            // 設置定時器，在延遲時間後解除節流
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                setIsThrottled(false);
            }, debounceTime);

            return true;
        }

        return false;
    };

    // 清理函數
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    // 搜尋處理函數
    const handleSearch = (e) => {
        e.preventDefault();

        if (!query.trim()) return;

        // 檢查是否需要節流
        const throttled = checkThrottle();

        if (throttled) {
            console.log(`🕒 搜尋頻率過高，請稍後再試 (${debounceTime / 1000}秒)`);
            return;
        }

        console.log(` 導向到搜尋結果頁面: ${searchResultPath}?q=${query.trim()}`);
        // 使用配置中的搜尋結果路徑
        history.push(`${searchResultPath}?q=${encodeURIComponent(query.trim())}`);

        // 搜尋後清空焦點
        if (inputRef.current) {
            inputRef.current.blur();
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
                className={`${styles.searchInput} ${isThrottled ? styles.throttled : ''}`}
                aria-label="搜尋文檔"
            />
            <button
                type="submit"
                className={styles.searchButton}
                aria-label="搜尋"
                disabled={isThrottled}
            >
                {isThrottled ? '⏱️' : '🔍'}
            </button>

            {/* 搜尋快捷鍵提示或節流提示 */}
            {focused && (
                <div className={styles.searchShortcut}>
                    {isThrottled ? (
                        <>搜尋頻率過高，請稍後再試</>
                    ) : (
                        <><kbd className={styles.kbdKey}>Enter</kbd> 搜尋</>
                    )}
                </div>
            )}
        </form>
    );
}