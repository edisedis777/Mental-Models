/**
 * Main Application File
 * Initializes and coordinates all components
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    let parser, constellation, searchManager;
    let isLoading = true;

    // Show loading indicator
    const loadingContainer = document.getElementById('loading-container');
    
    // Initialize the application
    async function initApp() {
        try {
            // Step 1: Initialize parser and load data
            console.log('Initializing parser...');
            parser = new MentalModelsParser();
            
            // In a real application, you would fetch this from a file
            // For now, we'll assume the data is available in a global variable
            // or we'll fetch it from the markdown file
            const markdownData = await loadMarkdownData();
            const parsedData = parser.parse(markdownData);
            
            console.log('Parsed data:', parsedData);
            console.log('Stats:', parser.getStats());
            
            // Step 2: Initialize constellation visualization
            console.log('Initializing constellation...');
            constellation = new ConstellationVisualization('constellation-container', parsedData);
            
            // Step 3: Initialize search manager
            console.log('Initializing search manager...');
            searchManager = new SearchManager(parser, constellation);
            
            // Store globally for debugging
            window.app = {
                parser,
                constellation,
                searchManager
            };
            
            // Hide loading indicator
            hideLoading();
            
            console.log('Application initialized successfully!');
            
        } catch (error) {
            console.error('Error initializing application:', error);
            showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Load markdown data from file
     * In a real implementation, this would fetch from the actual file
     */
    async function loadMarkdownData() {
        try {
            // Try to fetch from the actual file first
            const response = await fetch('src/data/mental-models.md');
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn('Could not load markdown file, using sample data:', error);
        }
        
        return '';
    }

    /**
     * Hide loading indicator
     */
    function hideLoading() {
        isLoading = false;
        if (loadingContainer) {
            loadingContainer.style.opacity = '0';
            setTimeout(() => {
                loadingContainer.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        hideLoading();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboardShortcuts(event) {
        // Don't handle shortcuts when typing in inputs
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key.toLowerCase()) {
            case 'f':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    document.getElementById('search-input').focus();
                }
                break;
            case 'escape':
                // Close modal if open
                const modal = document.getElementById('model-modal');
                if (modal.classList.contains('show')) {
                    searchManager.closeModal();
                }
                break;
            case 'r':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    constellation.resetCamera();
                }
                break;
        }
    }

    /**
     * Add global keyboard event listeners
     */
    function addGlobalEventListeners() {
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // Listen for star selection events from constellation
        document.addEventListener('starSelected', (e) => {
            if (searchManager) {
                searchManager.showModelDetails(e.detail);
            }
        });

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (constellation) {
                    constellation.onWindowResize();
                }
            }, 250);
        });
        
        // Handle visibility change (pause animation when tab is not visible)
        document.addEventListener('visibilitychange', () => {
            if (constellation) {
                constellation.isRotating = !document.hidden;
            }
        });
    }

    /**
     * Initialize tooltips for better UX
     */
    function initializeTooltips() {
        // Add tooltips for UI elements
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'ui-tooltip';
            tooltip.textContent = tooltipText;
            
            element.addEventListener('mouseenter', (e) => {
                document.body.appendChild(tooltip);
                
                const rect = element.getBoundingClientRect();
                tooltip.style.top = `${rect.bottom + 5}px`;
                tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
                tooltip.classList.add('show');
            });
            
            element.addEventListener('mouseleave', () => {
                tooltip.classList.remove('show');
                setTimeout(() => {
                    if (tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 300);
            });
        });
    }

    /**
     * Add some helpful console commands for debugging
     */
    function addDebugHelpers() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('%c🌟 Mental Models Constellation Debug Helpers', 'color: #3498db; font-size: 16px; font-weight: bold;');
            console.log('Available commands:');
            console.log('  app.parser.getStats() - Get parsing statistics');
            console.log('  app.parser.searchModels("query") - Search models');
            console.log('  app.constellation.resetCamera() - Reset camera position');
            console.log('  app.searchManager.clearAll() - Clear all filters and search');
            console.log('  app.constellation.filterByCategory(["Category Name"]) - Filter by category');
        }
    }

    // Start the application
    initApp().then(() => {
        addGlobalEventListeners();
        initializeTooltips();
        addDebugHelpers();
        
        // Add a welcome message for first-time users
        if (!localStorage.getItem('constellation-visited')) {
            setTimeout(() => {
                alert('Welcome to Mental Models Constellation!\n\n' +
                      '• Drag to rotate the view\n' +
                      '• Scroll to zoom in/out\n' +
                      '• Click on stars to view details\n' +
                      '• Use Ctrl+F to search\n' +
                      '• Press Space to pause rotation');
                localStorage.setItem('constellation-visited', 'true');
            }, 1000);
        }
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initApp };
}
