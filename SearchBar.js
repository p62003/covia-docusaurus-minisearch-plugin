import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './styles.module.css';

// 定義SVG圖標
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
    </svg>
);

const TimerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
    </svg>
);

/**
 * 搜尋框組件 - 添加智能延遲功能
 */
export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const [isThrottled, setIsThrottled] = useState(false);
    const [expanded, setExpanded] = useState(false); // 新增展開狀態
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
            console.log(`搜尋頻率過高，請稍後再試 (${debounceTime / 1000}秒)`);
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

    // 切換展開狀態
    const toggleExpanded = () => {
        setExpanded(!expanded);
        // 如果展開，自動聚焦輸入框
        if (!expanded && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);
        }
    };

    return (
        <form onSubmit={handleSearch} className={`${styles.searchForm} ${expanded ? styles.searchFormExpanded : ''}`}>
            {/* 移動端搜索圖標按鈕 */}
            <button
                type="button"
                className={styles.mobileSearchButton}
                aria-label="展開搜尋"
                onClick={toggleExpanded}
            >
                <SearchIcon />
            </button>

            <div className={`${styles.searchInputWrapper} ${expanded ? styles.searchInputWrapperExpanded : ''}`}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="搜尋文檔..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        setFocused(false);
                        // 在移動端，失去焦點時自動收起搜索框
                        if (window.innerWidth <= 768) {
                            setTimeout(() => setExpanded(false), 200);
                        }
                    }}
                    className={`${styles.searchInput} ${isThrottled ? styles.throttled : ''}`}
                    aria-label="搜尋文檔"
                />
                <button
                    type="submit"
                    className={styles.searchButton}
                    aria-label="搜尋"
                    disabled={isThrottled}
                >
                    {isThrottled ? <TimerIcon /> : <SearchIcon />}
                </button>

                {/* 節流提示 - 只在節流時顯示 */}
                {focused && isThrottled && (
                    <div className={styles.throttleMessage}>
                        搜尋頻率過高，請稍後再試
                    </div>
                )}
            </div>
        </form>
    );
}