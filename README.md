# Mental Models Constellation

![Constellation Visualization](https://img.shields.io/badge/Visualization-Three.js-blue) ![Interactive](https://img.shields.io/badge/Interactive-Yes-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

An interactive constellation visualization that transforms mental models into a celestial map, where each category becomes a unique constellation symbol and individual mental models shine as stars within their celestial groupings.

## 🌟 Overview

This project creates an immersive, starry-sky visualization of mental models, organizing them into constellation-like groupings based on their categories. Each category is represented by a creative symbol or animal (similar to zodiac constellations), and individual mental models appear as stars that users can explore interactively.

### Live Demo


## ✨ Features

- **Constellation Visualization**: Mental models arranged in a beautiful starry sky with category-based constellations
- **Interactive Stars**: Click on any mental model star to view its full description
- **Category Constellations**: Each category represented by unique constellation symbols:
  - Economics & Strategy → The Phoenix (rebirth through innovation)
  - Human Nature & Judgment → The Owl (wisdom and insight)
  - Numeracy & Interpretation → The Fox (cunning with numbers)
  - Thinking → The Dolphin (intelligence and adaptability)
  - Systems → The Spider (web of connections)
  - Biological World → The Tree of Life
  - Physical World → The Dragon (power and natural forces)
  - Military & War → The Wolf (strategy and pack tactics)
  - Political Failure → The Chameleon (adaptation and deception)
  - Rule of Law → The Scales (balance and justice)
- **Search Functionality**: Real-time text search across all mental models
- **Category Filtering**: Toggle visibility of entire constellations
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Smooth Animations**: Elegant transitions and hover effects using Three.js

## 🛠️ Technical Stack

- **Three.js**: 3D visualization library for creating the constellation effect
- **HTML5**: Semantic markup structure
- **CSS3**: Styling and animations
- **JavaScript (ES6+)**: Interactive functionality and data processing
- **Markdown**: Mental models data source (`mental-models-table.md`)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/mental-models-constellation.git
cd mental-models-constellation
```

2. **Install dependencies**
```bash
npm install
```

3. **Prepare data file**
   - Place your `mental-models-table.md` file in the `src/data/` directory
   - Ensure it follows the format: `| Mental Model | One-Sentence Description |`

4. **Start the development server**
```bash
npm start
```

5. **Build for production**
```bash
npm run build
```

## 📁 Project Structure

```
mental-models-constellation/
├── src/
│   ├── data/
│   │   └── mental-models-table.md    # Source data file
│   ├── js/
│   │   ├── main.js                   # Main application logic
│   │   ├── constellation.js          # Constellation visualization
│   │   ├── search.js                 # Search functionality
│   │   └── parser.js                 # Markdown parser
│   ├── css/
│   │   ├── main.css                  # Main styles
│   │   └── constellation.css         # Constellation-specific styles
│   └── index.html                    # Main HTML file
├── dist/                              # Built files (generated)
├── assets/                            # Images and resources
├── README.md                          # This file
├── package.json                       # Project dependencies
└── .gitignore                         # Git ignore rules
```

## 🎮 Usage

### Basic Navigation

1. **Explore the Constellation**
   - Use mouse drag to rotate the view
   - Scroll to zoom in/out
   - Hover over stars to see mental model names

2. **Interact with Mental Models**
   - Click on any star to view the full mental model description
   - Click again or press Escape to close the description

3. **Search and Filter**
   - Use the search bar to find specific mental models
   - Toggle category checkboxes to show/hide entire constellations
   - Use the "Show All" button to reset filters

### Keyboard Shortcuts

- `Space` - Pause/resume constellation rotation
- `R` - Reset view to default position
- `S` - Focus search bar
- `Escape` - Close modal/pop-up

## 🎨 Customization

### Adding New Categories

To add a new category constellation:

1. Update the `categorySymbols` object in `src/js/constellation.js`:
```javascript
const categorySymbols = {
  // Existing categories...
  "Your New Category": {
    symbol: "YourSymbol",
    color: 0xHEXCOLOR,
    description: "Brief description"
  }
};
```

2. Add your category to the mental models table with appropriate header

### Modifying Constellation Appearance

Edit the constellation parameters in `src/js/constellation.js`:
```javascript
const constellationConfig = {
  starSize: 2,
  constellationLineWidth: 1,
  rotationSpeed: 0.001,
  cameraDistance: 100
};
```

### Customizing Colors

Update the color scheme in `src/css/constellation.css`:
```css
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --background-color: #0a0a0a;
  --text-color: #ffffff;
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add comments for complex functionality
- Update documentation as needed
- Test your changes thoroughly


## 📄 License

See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mental Models Source**: Based on the comprehensive mental models collection from [sungcap.com](https://sungcap.com/g/mental-models/)
- **Three.js**: For the amazing 3D visualization capabilities
- **Inspiration**: The beauty of astronomical constellations and the wisdom of mental models



---

Made with 🌟 by [Your Name](https://github.com/your-username)
