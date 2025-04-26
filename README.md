# Covia Docusaurus MiniSearch Plugin

Covia MiniSearch Plugin is a lightweight local search solution designed for small to medium-sized knowledge base websites using Docusaurus.  
It features quick deployment and simple integration, especially suitable for users without professional development backgrounds.  
This plugin runs entirely on the frontend without requiring additional backend server support, making it ideal for individuals, teams, and small to medium-sized projects.

> 📢 **Important Notice**  
> This plugin is designed for small to medium-sized, primarily English websites.  
> It is **not suitable** for:
> - Very large document repositories
> - Multilingual websites
> - Scenarios requiring **Chinese (Traditional or Simplified) word segmentation**  
> 
> ⚠️ Due to the limitations of MiniSearch tokenization, **this plugin cannot properly support Chinese search**. It is recommended for English or other space-separated languages.  
> 
> For advanced needs such as large-scale, multilingual, or Chinese-optimized search, please consider alternatives like `@easyops-cn/docusaurus-search-local`.


**🌟 Live Demo**
- You can view a working demo of this plugin here:  
- 🔗 [https://p62003.github.io/docusaurus-plugin-minisearch-COVIA-demo/docs/](https://p62003.github.io/docusaurus-plugin-minisearch-COVIA-demo/docs/)


**🌟 Plugin Repository**
- If you are looking for the source code of the plugin itself, please visit:  
- 🔗 [covia-docusaurus-minisearch-plugin](https://github.com/p62003/covia-docusaurus-minisearch-plugin)


**🌐 Available Languages:**
- [English (Default)](README.md)
- [繁體中文 (Traditional Chinese)](README_zh.md)


## File Structure

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

## Features

* **Real-time Search**: Provides efficient, real-time frontend search experience
* **Keyword Highlighting**: Uses multi-level matching strategies, from exact matching to fuzzy matching
* **Fuzzy Search**: Supports spelling errors and approximate matching (allowing 20% edit distance)
* **Prefix Search**: Supports partial word matching
* **Field Weighting**: Sets higher weight for titles (2x) to improve relevance
* **Seamless Integration**: Perfectly integrates with Docusaurus themes, supporting light and dark mode switching
* **Complete Layout**: Search results page includes header and footer, maintaining website consistency
* **Automatic Indexing**: Automatically generates search index at build time and copies to multiple locations for enhanced compatibility
* **Smart Search Delay**: Automatically enables throttling when search frequency exceeds 2 times within 3 seconds
* **Multi-path Compatibility**: Automatically tries multiple possible index paths to ensure normal operation in different environments
* **URL Smart Repair**: Automatically detects base path and fixes search result links

## Installation

### Prerequisites

* Docusaurus v3.0.0 or above
* Node.js v16.0.0 or above

### Steps

**1. Install necessary dependencies and create plugin directory in your Docusaurus project:**

* Required dependencies:

| Package | Description | Installation Command |
|---|----|-------|
| minisearch | Frontend full-text search engine | npm install minisearch |
| globby | File path capture tool | npm install globby |
| gray-matter | Parse .md / .mdx front matter metadata | npm install gray-matter |

```
npm install minisearch globby gray-matter
```
* Create plugin directory:
```bash
mkdir -p plugins/docusaurus-plugin-minisearch
```

**2. Copy plugin files to the directory:**

```bash
# Copy the following files to the plugin directory
# - index.js
# - indexGenerator.js
# - SearchBar.js
# - SearchResults.js
# - styles.module.css
```

**3. Add plugin configuration in `docusaurus.config.js`:**

```js
// docusaurus.config.js
const config = {
  // Other configurations...
  plugins: [
    [
      './plugins/docusaurus-plugin-minisearch',
      {
        // Basic configuration (required)
        indexPath: '/search-index.json',  // Search index file path
        searchResultPath: '/search-results',  // Search results display page path
        searchFields: ['title', 'content'],  // Fields to search
        resultFields: ['title', 'url', 'excerpt'],  // Result fields to display
        
        // Optional configuration
        maxResults: 10,  // Maximum number of results to display
        highlightColor: '#ffeb3b',  // Search keyword highlight color
        debounceTime: 3000  // Minimum interval for consecutive searches (milliseconds)
      }
    ],
  ],
};
```

## Configuration Options

The table below lists all available configuration options, defined in `index.js`:

| Option | Type | Default Value | Required | Description |
|------|------|--------|--------|------|
| indexPath | String | '/search-index.json' | Optional | Search index file path |
| searchResultPath | String | '/search-results' | Optional | Search results display page path |
| searchFields | Array | ['title', 'content'] | Optional | Fields to search |
| resultFields | Array | ['title', 'url', 'excerpt'] | Optional | Result fields to display |
| maxResults | Number | 10 | Optional | Maximum number of results to display |
| highlightColor | String | '#ffeb3b' | Optional | Search keyword highlight color |
| debounceTime | Number | 3000 | Optional | Minimum interval for consecutive searches (milliseconds) |

## Technical Implementation

### Plugin Architecture

The plugin consists of the following core components:

1. **Index Generator (indexGenerator.js)** - Generates search index from document files
2. **Search Bar Component (SearchBar.js)** - Integrates into Docusaurus navigation bar, implementing smart search delay functionality
3. **Search Results Page (SearchResults.js)** - Displays search results, implements multi-level highlighting and URL repair
4. **Plugin Main File (index.js)** - Connects components, handles configuration, injects global styles
5. **Style File (styles.module.css)** - Defines styles for search bar, search results, highlighted keywords, etc.

### Key Technologies Used

* **MiniSearch** - Lightweight but powerful frontend full-text search engine
* **Docusaurus Theme API** - Integration with Docusaurus theme system
* **React Hooks** - Manage search state and index loading
* **Docusaurus Plugin API** - Register routes and share configuration data
* **CSS Modules** - Component style isolation, avoiding style conflicts

### How It Works

1. **Index Generation**
   * Traverses all document files during build time
   * Extracts title, content, URL and other information
   * Generates JSON index file stored in the `static` directory
   * Index file is copied to multiple locations for enhanced compatibility
   
2. **Search Process**
   * User enters keywords in the navigation bar search box
   * Smart delay function detects search frequency, preventing frequent searches in a short time
   * After clicking the search button, navigates to the search results page
   * Search results page attempts to load the index file from multiple possible paths
   * Uses MiniSearch to perform searches in the browser, supporting prefix matching, fuzzy matching, and field weighting
   * Renders search results and highlights keywords using multi-level matching strategy

3. **Highlighting Implementation**
   * Uses multi-level matching strategy, trying in priority order:
     1. Original query term matching (e.g., when searching for "READ")
     2. Complete word matching (each word after tokenization)
     3. Containing matching (words containing search terms)
     4. Partial word matching (substrings of words with length >=3)
   * Uses a combination of CSS and inline styles to ensure highlight effects display correctly in various environments

4. **URL Repair Mechanism**
   * Automatically detects the base path of the current environment using multiple methods:
     1. Get from Docusaurus meta tags
     2. Check current URL path
     3. Check if in local development environment
     4. Get from search results page URL
     5. Infer from document links
   * Ensures search result links work correctly in different deployment environments

## Customization

### Customizing Search Result Styles

Modify the `styles.module.css` file to customize the appearance of search results:

```css
/* Modify search result item styles */
.resultItem {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  border-radius: 8px;
  background-color: var(--ifm-card-background-color);
  box-shadow: var(--ifm-global-shadow-lw);
  transition: all 0.2s ease;
  border-left: 4px solid var(--ifm-color-primary);
}

/* Modify highlighted keyword styles */
.highlight,
:global(.search-highlight) {
  background-color: var(--search-highlight-color, #ffeb3b) !important;
  color: #000 !important;
  padding: 0 2px !important;
  border-radius: 2px !important;
  font-weight: bold !important;
  display: inline !important;
}

/* Throttled state search box */
.throttled {
  border-color: var(--ifm-color-warning, #f0ad4e);
  background-color: rgba(240, 173, 78, 0.05);
  animation: pulse 1.5s infinite;
}
```

### Customizing Search Options

Modify search options in `SearchResults.js`:

```javascript
const hits = miniSearch.search(query, { 
  prefix: true,      // Prefix search
  boost: { title: 2 }, // Title weight is 2
  fuzzy: 0.2         // Fuzzy search, allowing 20% edit distance
});
```

## Frequently Asked Questions

**Q: Will the search index increase the website size?**  
A: Yes, but to a limited extent. For small to medium-sized documentation websites, the index is typically in the range of a few hundred KB.

**Q: How to update the search index?**  
A: The index is automatically updated each time the website is rebuilt.

**Q: Do search results support multiple languages?**  
A: Basic support is provided, but word segmentation settings may need to be adjusted for different languages.

**Q: Why does the search results page show "Page Not Found"?**  
A: This is usually caused by route conflicts. Make sure `searchResultPath` is set to a value that doesn't conflict with other routes.

**Q: Why does the search function still work after modifying indexPath?**  
A: The plugin has designed multiple backup mechanisms and will try multiple possible index paths to ensure functionality even if the configuration changes.

**Q: Why are multiple searches in a short time restricted?**  
A: The plugin implements smart search delay functionality. When the number of searches exceeds 2 times within 3 seconds, the throttling mechanism is activated to prevent excessive requests.

## Technical Limitations

* Pure frontend search, not suitable for extremely large document repositories
* Search index needs to be generated at build time, cannot include dynamic content
* Currently no built-in search suggestion functionality
* No specialized word segmentation optimization for Chinese and other Asian languages

## Documentation Updates and Index Maintenance

### Updating Search Index After Adding New Documents

When you add or modify documents, the search index needs to be updated to reflect the new content. There are several ways to do this:

#### Method 1: Complete Site Rebuild

The most direct method is to rebuild the entire website:

```bash
npm run build
# Then redeploy the website
```
#### Method 2: Update Index File Separately (Suitable for VPS/Server Deployment)

If you only added or modified document content and don't want to rebuild the entire website, you can:

1. Generate a new index file in the local environment:
   ```bash
   npm start
   ```

2. Wait for the index generation to complete (you'll usually see a message like `✅ search-index.json has been copied to [path] successfully` in the console)

3. Upload the following files to your server:
   - The newly added document files
   - The new index file located at `static/search-index.json`

4. Make sure the index file is uploaded to the correct location, typically:
   - `/path-to-your-website/search-index.json`
   - And other paths that the plugin might try

This method is particularly suitable for situations where documentation is frequently updated but the website structure remains stable, saving deployment time and reducing resource consumption.

### Path and Deployment Considerations

In different environments (local development, GitHub Pages, self-hosted VPS, etc.), the website's base path may be different:

- Local development: usually `http://localhost:3000/`
- GitHub Pages: usually `https://username.github.io/repo-name/`
- Self-hosted: could be `https://your-domain.com/` or `https://your-domain.com/docs/`

The plugin will attempt to automatically detect the base path of the current environment and try multiple possible index paths, but if problems occur (e.g., incorrect search result links), you can explicitly set `baseUrl` in `docusaurus.config.js`:

```javascript
module.exports = {
  // ...
  baseUrl: '/your-base-path/',  // e.g., '/docs/' or '/'
  // ...
};
```

## Implementation Details and Notes

### Multi-path Attempt Mechanism

The plugin will attempt to load the index file from multiple possible paths:

```javascript
const possiblePaths = [
    // Original path
    indexPath,
    // Relative path
    './search-index.json',
    // Absolute path
    '/search-index.json',
    // Path based on current site
    window.location.pathname.split('/search-results')[0] + '/search-index.json'
];
```

This design ensures that the search function works normally even if the configuration changes.

### Smart Search Delay Functionality

The plugin implements smart search delay functionality, activating delay only when searches are frequent in a short period:

```javascript
// Check if throttling is needed
const checkThrottle = () => {
    const now = Date.now();
    const history = searchHistoryRef.current;
    
    // Add current search time to history
    history.push(now);
    
    // Only keep records within the last 3 seconds
    const recentHistory = history.filter(time => now - time < debounceTime);
    searchHistoryRef.current = recentHistory;
    
    // Enable throttling if search count exceeds 2 times within 3 seconds
    const needThrottle = recentHistory.length > 2;
    
    // ...
};
```

### MiniSearch Usage Notes

When using `MiniSearch.loadJSON`, you need to pass the JSON string directly rather than the parsed object:

```javascript
// Incorrect method
const rawIndex = JSON.parse(text);
const miniSearch = MiniSearch.loadJSON(rawIndex, options);

// Correct method
const miniSearch = MiniSearch.loadJSON(text, options);
```

### Route Setting Notes

Avoid conflicts between the search results path and Docusaurus default paths:

```javascript
// Recommend using a dedicated path
searchResultPath = '/search-results'

// Ensure exact matching
addRoute({
  path: searchResultPath,
  component: '@theme/SearchResults',
  exact: true,
});
```

## License

This project is licensed under the MIT License.