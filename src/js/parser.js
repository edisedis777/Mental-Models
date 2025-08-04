/**
 * Parser for mental models markdown table
 * Converts markdown table format into structured JavaScript object
 */

class MentalModelsParser {
    constructor() {
        this.categories = {};
        this.currentCategory = null;
    }

    /**
     * Parse markdown table content into structured data
     * @param {string} markdownText - The raw markdown text
     * @returns {Object} Structured data with categories and mental models
     */
    parse(markdownText) {
        // Reset state
        this.categories = {};
        this.currentCategory = null;

        // Split into lines and process each line
        const lines = markdownText.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines and separator lines
            if (!line || line.startsWith('|---') || line.startsWith('**|')) {
                continue;
            }
            
            // Check for category headers
            if (this.isCategoryHeader(line)) {
                this.currentCategory = this.extractCategoryName(line);
                this.categories[this.currentCategory] = [];
                continue;
            }
            
            // Parse table rows
            if (line.startsWith('|') && this.currentCategory) {
                const model = this.parseTableRow(line);
                if (model) {
                    this.categories[this.currentCategory].push(model);
                }
            }
        }
        
        return this.categories;
    }

    /**
     * Check if a line is a category header
     * @param {string} line - The line to check
     * @returns {boolean} True if line is a category header
     */
    isCategoryHeader(line) {
        return line.startsWith('Mental models in') || 
               line.startsWith('**Mental models in');
    }

    /**
     * Extract category name from header line
     * @param {string} line - The header line
     * @returns {string} Clean category name
     */
    extractCategoryName(line) {
        // Remove markdown formatting and "Mental models in" prefix
        let categoryName = line
            .replace(/\*\*/g, '') // Remove bold markdown
            .replace(/^Mental models in\s*/i, '') // Remove prefix
            .trim();
        
        // Clean up common formatting
        categoryName = categoryName
            .replace(/\s+/g, ' ') // Multiple spaces to single space
            .replace(/\s+and\s+/gi, ' & ') // "and" to "&" for consistency
            .trim();
        
        return categoryName;
    }

    /**
     * Parse a table row into a mental model object
     * @param {string} line - The table row line
     * @returns {Object|null} Mental model object or null if parsing fails
     */
    parseTableRow(line) {
        // Remove leading/trailing pipes and split by pipe
        const cells = line
            .replace(/^\|\s*/, '')
            .replace(/\s*\|$/, '')
            .split('|')
            .map(cell => cell.trim());
        
        // We expect exactly 2 cells: model name and description
        if (cells.length !== 2) {
            return null;
        }
        
        const [name, description] = cells;
        
        // Clean up the name and description
        const cleanName = this.cleanText(name);
        const cleanDescription = this.cleanText(description);
        
        // Skip if name or description is empty
        if (!cleanName || !cleanDescription) {
            return null;
        }
        
        return {
            name: cleanName,
            description: cleanDescription,
            // Additional metadata for the constellation
            id: this.generateId(cleanName),
            category: this.currentCategory
        };
    }

    /**
     * Clean text by removing markdown formatting and extra spaces
     * @param {string} text - The text to clean
     * @returns {string} Cleaned text
     */
    cleanText(text) {
        return text
            .replace(/\*\*/g, '') // Remove bold markdown
            .replace(/\*/g, '') // Remove italic markdown
            .replace(/\s+/g, ' ') // Multiple spaces to single space
            .trim();
    }

    /**
     * Generate a unique ID for a mental model
     * @param {string} name - The model name
     * @returns {string} Unique ID
     */
    generateId(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .substring(0, 30); // Limit length
    }

    /**
     * Get category statistics
     * @returns {Object} Statistics about the parsed data
     */
    getStats() {
        const stats = {
            totalCategories: Object.keys(this.categories).length,
            totalModels: 0,
            modelsPerCategory: {}
        };

        for (const [category, models] of Object.entries(this.categories)) {
            stats.modelsPerCategory[category] = models.length;
            stats.totalModels += models.length;
        }

        return stats;
    }

    /**
     * Get all mental models as a flat array
     * @returns {Array} Flat array of all mental models
     */
    getAllModels() {
        const allModels = [];
        
        for (const models of Object.values(this.categories)) {
            allModels.push(...models);
        }
        
        return allModels;
    }

    /**
     * Search mental models by name or description
     * @param {string} query - Search query
     * @returns {Array} Array of matching mental models
     */
    searchModels(query) {
        if (!query) return [];
        
        const searchTerm = query.toLowerCase();
        const allModels = this.getAllModels();
        
        return allModels.filter(model => 
            model.name.toLowerCase().includes(searchTerm) ||
            model.description.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Get models by category
     * @param {string} category - Category name
     * @returns {Array} Array of models in the category
     */
    getModelsByCategory(category) {
        return this.categories[category] || [];
    }

    /**
     * Get all category names
     * @returns {Array} Array of category names
     */
    getCategoryNames() {
        return Object.keys(this.categories);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MentalModelsParser;
} else {
    window.MentalModelsParser = MentalModelsParser;
}

/**
 * Test function to verify parser functionality
 * Can be called from browser console for testing
 */
function testParser() {
    // Sample markdown text for testing
    const sampleMarkdown = `
Mental models in economics and strategy
Opportunity cost
The value of what you have to give up to choose something else.
Creative destruction
A theory of economic innovation where new production units replace outdated ones.

Mental models in human nature and judgment
Trust
A fundamental part of human nature that produces increased speed, efficiency, and decreased costs.
Availability heuristic
The tendency to judge the frequency of events by the ease with which examples come to mind.
    `;

    const parser = new MentalModelsParser();
    const result = parser.parse(sampleMarkdown);
    
    console.log('Parsed Result:', result);
    console.log('Stats:', parser.getStats());
    console.log('All Models:', parser.getAllModels());
    console.log('Search Results for "cost":', parser.searchModels('cost'));
    
    return result;
}

// Make test function available globally
if (typeof window !== 'undefined') {
    window.testParser = testParser;
}
