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
            
            const markdownData = await loadMarkdownData();
            const parsedData = parser.parse(markdownData);
            
            console.log('Parsed data:', parsedData);
            console.log('Stats:', parser.getStats());
            
            console.log('Initializing constellation...');
            constellation = new ConstellationVisualization('constellation-container', parsedData);
            
            console.log('Initializing search manager...');
            searchManager = new SearchManager(parser, constellation);
            
            window.app = {
                parser,
                constellation,
                searchManager
            };
            
            hideLoading();
            
            console.log('Application initialized successfully!');
            
        } catch (error) {
            console.error('Error initializing application:', error);
            showError('Failed to initialize application. Please refresh the page.');
        }
    }

    async function loadMarkdownData() {
        try {
            const response = await fetch('src/data/mental-models.md');
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn('Could not load markdown file, using sample data:', error);
        }
        
        return '';
    }

    function hideLoading() {
        isLoading = false;
        if (loadingContainer) {
            loadingContainer.style.opacity = '0';
            setTimeout(() => {
                loadingContainer.style.display = 'none';
            }, 300);
        }
    }

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

    function handleKeyboardShortcuts(event) {
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
                const detailsPanel = document.getElementById('details-panel');
                if (detailsPanel.classList.contains('show')) {
                    searchManager.hideDetailsPanel();
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

    function addGlobalEventListeners() {
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        const menuButton = document.getElementById('menu-button');
        const controlsPanel = document.querySelector('.controls-panel');
        const constellationContainer = document.getElementById('constellation-container');

        if (menuButton && controlsPanel) {
            menuButton.addEventListener('click', () => {
                controlsPanel.classList.toggle('show');
                // Hide details panel if controls panel is shown
                if (controlsPanel.classList.contains('show')) {
                    searchManager.hideDetailsPanel();
                }
            });

            // Close controls panel when clicking outside on mobile
            constellationContainer.addEventListener('click', () => {
                if (window.innerWidth <= 480 && controlsPanel.classList.contains('show')) {
                    controlsPanel.classList.remove('show');
                }
            });
        }

        document.addEventListener('starSelected', (e) => {
            if (searchManager) {
                searchManager.showModelDetails(e.detail);
                // Hide controls panel if details panel is shown on mobile
                if (window.innerWidth <= 480 && controlsPanel.classList.contains('show')) {
                    controlsPanel.classList.remove('show');
                }
            }
        });

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (constellation) {
                    constellation.onWindowResize();
                }
            }, 250);
        });
        
        document.addEventListener('visibilitychange', () => {
            if (constellation) {
                constellation.isRotating = !document.hidden;
            }
        });
    }

    function initializeTooltips() {
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

    initApp().then(() => {
        addGlobalEventListeners();
        initializeTooltips();
        addDebugHelpers();
        
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initApp };
}
