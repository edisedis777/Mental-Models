/**
 * Search and Filter Functionality
 * Handles text search and category filtering for mental models
 */

class SearchManager {
    constructor(parser, constellation) {
        this.parser = parser;
        this.constellation = constellation;
        this.searchInput = document.getElementById('search-input');
        this.searchButton = document.getElementById('search-button');
        this.categoryFiltersContainer = document.getElementById('category-filters');
        this.showAllButton = document.getElementById('show-all-button');
        this.detailsPanel = document.getElementById('details-panel');
        this.detailsTitle = document.getElementById('details-title');
        this.detailsDescription = document.getElementById('details-description');
        this.detailsCategory = document.getElementById('details-category');
        this.detailsCategoryContainer = document.getElementById('details-category-container');
        this.historyList = document.getElementById('history-list');
        this.clearHistoryButton = document.getElementById('clear-history-button');

        this.activeFilters = new Set();
        this.searchTimeout = null;
        this.currentSearchResults = [];
        this.viewHistory = [];
        this.maxHistory = 10;

        this.init();
    }

    /**
     * Initialize the search manager
     */
    init() {
        this.createCategoryFilters();
        this.addEventListeners();
        this.showAllCategories();
    }

    /**
     * Create category filter checkboxes
     */
    createCategoryFilters() {
        const categories = this.parser.getCategoryNames();

        categories.forEach((category) => {
            const filterItem = document.createElement('div');
            filterItem.className = 'filter-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `filter-${category.replace(/\s+/g, '-').toLowerCase()}`;
            checkbox.value = category;
            checkbox.checked = true;

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = category;

            const colorIndicator = document.createElement('span');
            colorIndicator.className = 'color-indicator';
            const config = this.constellation.categoryConfigs[category];
            if (config) {
                colorIndicator.style.backgroundColor = `#${config.color
                    .toString(16)
                    .padStart(6, '0')}`;
            }

            label.appendChild(colorIndicator);
            filterItem.appendChild(checkbox);
            filterItem.appendChild(label);
            this.categoryFiltersContainer.appendChild(filterItem);
            this.activeFilters.add(category);
        });
    }

    /**
     * Add event listeners for search and filters
     */
    addEventListeners() {
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });

        this.searchButton.addEventListener('click', () => {
            this.handleSearch(this.searchInput.value);
        });

        this.categoryFiltersContainer.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.handleCategoryFilter(e.target);
            }
        });

        this.showAllButton.addEventListener('click', () => {
            this.toggleAllCategories();
        });

        document.addEventListener('starSelected', (e) => {
            this.showModelDetails(e.detail);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideDetailsPanel();
            } else if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.searchInput.focus();
            }
        });

        this.clearHistoryButton.addEventListener('click', () => {
            this.clearHistory();
        });
    }

    /**
     * Handle search input
     */
    handleSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }

        const results = this.parser.searchModels(query);
        this.currentSearchResults = results.map((model) => model.id);
        this.constellation.highlightSearchResults(this.currentSearchResults);
        this.updateSearchResultsUI(results, query);
    }

    /**
     * Handle category filter change
     */
    handleCategoryFilter(target) {
        const category = target.value;
        if (target.checked) {
            this.activeFilters.add(category);
        } else {
            this.activeFilters.delete(category);
        }
        this.constellation.filterByCategory(Array.from(this.activeFilters));
        this.updateShowAllButtonState();
    }

    /**
     * Toggle all categories on or off
     */
    toggleAllCategories() {
        const checkboxes = this.categoryFiltersContainer.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every((checkbox) => checkbox.checked);

        checkboxes.forEach((checkbox) => {
            checkbox.checked = !allChecked;
            if (checkbox.checked) {
                this.activeFilters.add(checkbox.value);
            } else {
                this.activeFilters.delete(checkbox.value);
            }
        });

        this.constellation.filterByCategory(Array.from(this.activeFilters));
        this.updateShowAllButtonState();
    }

    /**
     * Clear search results
     */
    clearSearchResults() {
        this.currentSearchResults = [];
        this.constellation.resetHighlights();
        this.clearSearchResultsUI();
    }

    /**
     * Update search results UI
     */
    updateSearchResultsUI(results, query) {
        this.clearSearchResultsUI();
        if (results.length === 0) {
            this.showNoResultsMessage(query);
            return;
        }

        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        const header = document.createElement('div');
        header.className = 'search-results-header';
        header.textContent = `${results.length} result${
            results.length !== 1 ? 's' : ''
        } for "${query}"`;
        resultsContainer.appendChild(header);

        results.forEach((model) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div class="result-name">${this.highlightSearchTerm(model.name, query)}</div>
                <div class="result-description">${this.highlightSearchTerm(
                    model.description,
                    query
                )}</div>
                <div class="result-category">${model.category}</div>
            `;
            resultItem.addEventListener('click', () => {
                this.focusOnModel(model.id);
            });
            resultsContainer.appendChild(resultItem);
        });

        const searchContainer = this.searchInput.closest('.search-container');
        searchContainer.parentNode.insertBefore(resultsContainer, searchContainer.nextSibling);
    }

    /**
     * Clear search results UI
     */
    clearSearchResultsUI() {
        const existingResults = document.querySelector('.search-results');
        if (existingResults) existingResults.remove();
        const noResults = document.querySelector('.no-results');
        if (noResults) noResults.remove();
    }

    /**
     * Show no results message
     */
    showNoResultsMessage(query) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = `No results found for "${query}"`;
        const searchContainer = this.searchInput.closest('.search-container');
        searchContainer.parentNode.insertBefore(noResults, searchContainer.nextSibling);
    }

    /**
     * Highlight search term in text
     */
    highlightSearchTerm(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Focus on a specific model in the constellation
     */
    focusOnModel(modelId) {
        const star = this.constellation.stars.get(modelId);
        if (star) {
            this.constellation.selectStar(star);
            this.showModelDetails(star.userData);
            this.searchInput.value = '';
            this.clearSearchResults();
        }
    }

    /**
     * Show model details in the sidebar
     */
    showModelDetails(model) {
        this.detailsTitle.textContent = model.name;
        this.detailsDescription.textContent = model.description;
        this.detailsCategory.textContent = model.category;
        this.detailsCategoryContainer.style.display = 'block';

        const config = this.constellation.categoryConfigs[model.category];
        if (config) {
            this.detailsCategory.style.color = `#${config.color.toString(16).padStart(6, '0')}`;
        }

        this.detailsPanel.classList.add('show');
        this.addToHistory(model);
    }

    /**
     * Hide the details panel
     */
    hideDetailsPanel() {
        this.detailsPanel.classList.remove('show');
    }

    /**
     * Add a model to the history, moving it to the top if it already exists.
     */
    addToHistory(model) {
        // Remove the model from the history if it already exists
        const existingIndex = this.viewHistory.findIndex((item) => item.id === model.id);
        if (existingIndex > -1) {
            // If the model already exists, do not reorder, just return.
            return;
        }

        // Add the new model to the beginning of the history
        this.viewHistory.unshift(model);

        // Limit the history to the max number of items
        if (this.viewHistory.length > this.maxHistory) {
            this.viewHistory.pop();
        }

        // Update the UI
        this.updateHistoryUI();
    }

    /**
     * Clear the view history
     */
    clearHistory() {
        this.viewHistory = [];
        this.updateHistoryUI();
    }

    /**
     * Update the history UI
     */
    updateHistoryUI() {
        this.historyList.innerHTML = '';
        this.viewHistory.forEach((model) => {
            const historyItem = document.createElement('li');
            historyItem.className = 'history-item';
            historyItem.textContent = model.name;
            historyItem.addEventListener('click', () => {
                this.focusOnModel(model.id);
            });
            this.historyList.appendChild(historyItem);
        });
    }

    /**
     * Update the state of the 'Show All' button
     */
    updateShowAllButtonState() {
        const totalCategories = this.parser.getCategoryNames().length;
        const activeCount = this.activeFilters.size;
        if (activeCount === totalCategories) {
            this.showAllButton.textContent = 'Hide All';
            this.showAllButton.classList.add('active');
        } else {
            this.showAllButton.textContent = 'Show All';
            this.showAllButton.classList.remove('active');
        }
    }

    /**
     * Show all categories
     */
    showAllCategories() {
        const checkboxes = this.categoryFiltersContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = true;
            this.activeFilters.add(checkbox.value);
        });
        this.constellation.filterByCategory(Array.from(this.activeFilters));
        this.updateShowAllButtonState();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
} else {
    window.SearchManager = SearchManager;
}
