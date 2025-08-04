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
        this.activeFilters = new Set();
        this.searchTimeout = null;
        this.currentSearchResults = [];
        
        this.init();
    }

    /**
     * Initialize the search manager
     */
    init() {
        this.createCategoryFilters();
        this.addEventListeners();
        this.addModalCloseListener();
        this.showAllCategories();
    }

    /**
     * Create category filter checkboxes
     */
    createCategoryFilters() {
        const categories = this.parser.getCategoryNames();
        
        categories.forEach(category => {
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
            
            // Add category color indicator
            const colorIndicator = document.createElement('span');
            colorIndicator.className = 'color-indicator';
            const config = this.constellation.categoryConfigs[category];
            if (config) {
                colorIndicator.style.backgroundColor = `#${config.color.toString(16).padStart(6, '0')}`;
            }
            
            label.appendChild(colorIndicator);
            
            filterItem.appendChild(checkbox);
            filterItem.appendChild(label);
            this.categoryFiltersContainer.appendChild(filterItem);
            
            // Add to active filters
            this.activeFilters.add(category);
        });
    }

    /**
     * Add event listeners for search and filters
     */
    addEventListeners() {
        // Search input with debouncing
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });

        // Search button
        this.searchButton.addEventListener('click', () => {
            this.handleSearch(this.searchInput.value);
        });

        // Category filter checkboxes
        this.categoryFiltersContainer.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.handleCategoryFilter(e.target);
            }
        });

        // Show all button
        this.showAllButton.addEventListener('click', () => {
            this.showAllCategories();
        });

        // Listen for star selection events from constellation
        document.addEventListener('starSelected', (e) => {
            this.showModelDetails(e.detail);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            } else if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.searchInput.focus();
            }
        });
    }

    /**
     * Handle search input
     * @param {string} query - Search query
     */
    handleSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }

        // Search for matching models
        const results = this.parser.searchModels(query);
        this.currentSearchResults = results.map(model => model.id);
        
        // Highlight results in constellation
        this.constellation.highlightSearchResults(this.currentSearchResults);
        
        // Update UI
        this.updateSearchResultsUI(results, query);
    }

    /**
     * Handle category filter change
     * @param {Event} event - Change event
     */
    handleCategoryFilter(event) {
        const category = event.target.value;
        const isChecked = event.target.checked;
        
        if (isChecked) {
            this.activeFilters.add(category);
        } else {
            this.activeFilters.delete(category);
        }
        
        // Update constellation visibility
        this.constellation.filterByCategory(Array.from(this.activeFilters));
        
        // Update show all button state
        this.updateShowAllButtonState();
    }

    /**
     * Show all categories
     */
    showAllCategories() {
        const checkboxes = this.categoryFiltersContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.activeFilters.add(checkbox.value);
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
     * @param {Array} results - Search results
     * @param {string} query - Search query
     */
    updateSearchResultsUI(results, query) {
        // Remove existing results
        this.clearSearchResultsUI();
        
        if (results.length === 0) {
            this.showNoResultsMessage(query);
            return;
        }
        
        // Create results container
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        
        // Add results header
        const header = document.createElement('div');
        header.className = 'search-results-header';
        header.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`;
        resultsContainer.appendChild(header);
        
        // Add result items
        results.forEach(model => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div class="result-name">${this.highlightSearchTerm(model.name, query)}</div>
                <div class="result-description">${this.highlightSearchTerm(model.description, query)}</div>
                <div class="result-category">${model.category}</div>
            `;
            
            // Add click handler to focus on the star
            resultItem.addEventListener('click', () => {
                this.focusOnModel(model.id);
            });
            
            resultsContainer.appendChild(resultItem);
        });
        
        // Insert after search container
        const searchContainer = this.searchInput.closest('.search-container');
        searchContainer.parentNode.insertBefore(resultsContainer, searchContainer.nextSibling);
    }

    /**
     * Clear search results UI
     */
    clearSearchResultsUI() {
        const existingResults = document.querySelector('.search-results');
        if (existingResults) {
            existingResults.remove();
        }
        
        const noResults = document.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
    }

    /**
     * Show no results message
     * @param {string} query - Search query
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
     * @param {string} text - Original text
     * @param {string} term - Search term
     * @returns {string} Text with highlighted term
     */
    highlightSearchTerm(text, term) {
        if (!term) return text;
        
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Focus on a specific model in the constellation
     * @param {string} modelId - Model ID to focus on
     */
    focusOnModel(modelId) {
        const star = this.constellation.stars.get(modelId);
        if (star) {
            // Select the star
            this.constellation.selectStar(star);
            
            // Show model details
            this.showModelDetails(star.userData);
            
            // Clear search
            this.searchInput.value = '';
            this.clearSearchResults();
        }
    }

    /**
     * Show model details in modal
     * @param {Object} model - Model data
     */
    showModelDetails(model) {
        const modal = document.getElementById('model-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const modalCategory = document.getElementById('modal-category');
        
        modalTitle.textContent = model.name;
        modalDescription.textContent = model.description;
        modalCategory.textContent = model.category;
        
        // Add category color
        const config = this.constellation.categoryConfigs[model.category];
        if (config) {
            modalCategory.style.color = `#${config.color.toString(16).padStart(6, '0')}`;
        }
        
        modal.style.display = 'block';
        
        // Add animation class
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('model-modal');
        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    /**
     * Update show all button state
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
     * Get active filters
     * @returns {Array} Array of active filter categories
     */
    getActiveFilters() {
        return Array.from(this.activeFilters);
    }

    /**
     * Set active filters
     * @param {Array} filters - Array of category names to filter
     */
    setActiveFilters(filters) {
        this.activeFilters.clear();
        
        const checkboxes = this.categoryFiltersContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const isChecked = filters.includes(checkbox.value);
            checkbox.checked = isChecked;
            
            if (isChecked) {
                this.activeFilters.add(checkbox.value);
            }
        });
        
        this.constellation.filterByCategory(Array.from(this.activeFilters));
        this.updateShowAllButtonState();
    }

    /**
     * Get current search results
     * @returns {Array} Array of current search result model IDs
     */
    getCurrentSearchResults() {
        return this.currentSearchResults;
    }

    /**
     * Clear all filters and search
     */
    clearAll() {
        this.searchInput.value = '';
        this.clearSearchResults();
        this.showAllCategories();
    }

    /**
     * Add modal close button event listener
     */
    addModalCloseListener() {
        const modal = document.getElementById('model-modal');
        const closeBtn = modal.querySelector('.modal-close');
        
        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }
}


// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
} else {
    window.SearchManager = SearchManager;
}
