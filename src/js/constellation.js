/**
 * Constellation Visualization using Three.js
 * Creates an interactive 3D constellation of mental models
 */

class ConstellationVisualization {
    constructor(containerId, data) {
        this.container = document.getElementById(containerId);
        this.data = data;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.stars = new Map(); // Map to store star objects by model ID
        this.constellations = new Map(); // Map to store constellation line groups
        this.selectedStar = null;
        this.isRotating = true;
        this.rotationSpeed = 0.001;
        
        // Category constellation configurations
        this.categoryConfigs = {
            'Economics and Strategy': {
                symbol: 'phoenix',
                color: 0xff6b35,
                constellationPattern: 'phoenix',
                position: { x: 0, y: 20, z: 0 }
            },
            'Human Nature and Judgment': {
                symbol: 'owl',
                color: 0x9b59b6,
                constellationPattern: 'owl',
                position: { x: -25, y: 0, z: 10 }
            },
            'Numeracy and Interpretation': {
                symbol: 'fox',
                color: 0xe67e22,
                constellationPattern: 'fox',
                position: { x: 25, y: 0, z: 10 }
            },
            'Thinking': {
                symbol: 'dolphin',
                color: 0x3498db,
                constellationPattern: 'dolphin',
                position: { x: 0, y: -20, z: 10 }
            },
            'Systems': {
                symbol: 'spider',
                color: 0x2ecc71,
                constellationPattern: 'spider',
                position: { x: -30, y: 10, z: -10 }
            },
            'Biological World': {
                symbol: 'tree',
                color: 0x27ae60,
                constellationPattern: 'tree',
                position: { x: 30, y: 10, z: -10 }
            },
            'Physical World': {
                symbol: 'dragon',
                color: 0xe74c3c,
                constellationPattern: 'dragon',
                position: { x: 0, y: 25, z: -15 }
            },
            'Military and War': {
                symbol: 'wolf',
                color: 0x34495e,
                constellationPattern: 'wolf',
                position: { x: -20, y: -15, z: -10 }
            },
            'Political Failure': {
                symbol: 'chameleon',
                color: 0xf39c12,
                constellationPattern: 'chameleon',
                position: { x: 20, y: -15, z: -10 }
            },
            'Rule of Law': {
                symbol: 'scales',
                color: 0xf1c40f,
                constellationPattern: 'scales',
                position: { x: 0, y: 0, z: -20 }
            }
        };
        
        this.init();
    }

    /**
     * Initialize the Three.js scene
     */
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createStarField();
        this.createConstellations();
        this.createControls();
        this.addEventListeners();
        this.animate();
    }

    /**
     * Create the Three.js scene
     */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
    }

    /**
     * Create the camera
     */
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 50);
    }

    /**
     * Create the renderer
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }

    /**
     * Create lights for the scene
     */
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
    }

    /**
     * Create background star field
     */
    createStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 200;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    /**
     * Create constellations for each category
     */
    createConstellations() {
        for (const [category, models] of Object.entries(this.data)) {
            if (this.categoryConfigs[category]) {
                this.createCategoryConstellation(category, models);
            }
        }
    }

    /**
     * Create constellation for a specific category
     * @param {string} category - Category name
     * @param {Array} models - Array of mental models in this category
     */
    createCategoryConstellation(category, models) {
        const config = this.categoryConfigs[category];
        const constellationGroup = new THREE.Group();
        constellationGroup.userData = { category: category };

        // Create constellation pattern
        this.createConstellationPattern(constellationGroup, config);

        // Create stars for each mental model
        models.forEach((model, index) => {
            const star = this.createStar(model, config, index, models.length);
            constellationGroup.add(star);
            this.stars.set(model.id, star);
        });

        // Position the constellation
        constellationGroup.position.set(
            config.position.x,
            config.position.y,
            config.position.z
        );

        this.scene.add(constellationGroup);
        this.constellations.set(category, constellationGroup);
    }

    /**
     * Create constellation pattern lines
     * @param {THREE.Group} group - The constellation group
     * @param {Object} config - Category configuration
     */
    createConstellationPattern(group, config) {
        const material = new THREE.LineBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.3
        });

        const points = this.getConstellationPoints(config.constellationPattern);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const lines = new THREE.Line(geometry, material);
        group.add(lines);
    }

    /**
     * Get points for constellation pattern
     * @param {string} pattern - Pattern name
     * @returns {Array} Array of Vector3 points
     */
    getConstellationPoints(pattern) {
        const points = [];
        const scale = 8;

        switch (pattern) {
            case 'phoenix':
                // Phoenix wing pattern
                points.push(new THREE.Vector3(-scale, 0, 0));
                points.push(new THREE.Vector3(-scale/2, scale/2, 0));
                points.push(new THREE.Vector3(0, scale, 0));
                points.push(new THREE.Vector3(scale/2, scale/2, 0));
                points.push(new THREE.Vector3(scale, 0, 0));
                points.push(new THREE.Vector3(0, -scale/2, 0));
                points.push(new THREE.Vector3(-scale, 0, 0));
                break;
            
            case 'owl':
                // Owl face pattern
                points.push(new THREE.Vector3(-scale/2, scale/2, 0));
                points.push(new THREE.Vector3(-scale/2, -scale/2, 0));
                points.push(new THREE.Vector3(scale/2, -scale/2, 0));
                points.push(new THREE.Vector3(scale/2, scale/2, 0));
                points.push(new THREE.Vector3(-scale/2, scale/2, 0));
                points.push(new THREE.Vector3(0, 0, 0));
                points.push(new THREE.Vector3(scale/2, scale/2, 0));
                break;
            
            case 'fox':
                // Fox profile pattern
                points.push(new THREE.Vector3(-scale, 0, 0));
                points.push(new THREE.Vector3(-scale/2, scale/2, 0));
                points.push(new THREE.Vector3(0, scale/3, 0));
                points.push(new THREE.Vector3(scale/2, 0, 0));
                points.push(new THREE.Vector3(scale/3, -scale/2, 0));
                points.push(new THREE.Vector3(-scale/3, -scale/3, 0));
                points.push(new THREE.Vector3(-scale, 0, 0));
                break;
            
            case 'dolphin':
                // Dolphin jumping pattern
                points.push(new THREE.Vector3(-scale, -scale/2, 0));
                points.push(new THREE.Vector3(-scale/2, 0, 0));
                points.push(new THREE.Vector3(0, scale, 0));
                points.push(new THREE.Vector3(scale/2, 0, 0));
                points.push(new THREE.Vector3(scale, -scale/2, 0));
                break;
            
            case 'spider':
                // Spider web pattern
                points.push(new THREE.Vector3(0, 0, 0));
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    points.push(new THREE.Vector3(
                        Math.cos(angle) * scale,
                        Math.sin(angle) * scale,
                        0
                    ));
                    points.push(new THREE.Vector3(0, 0, 0));
                }
                break;
            
            case 'tree':
                // Tree pattern
                points.push(new THREE.Vector3(0, -scale, 0));
                points.push(new THREE.Vector3(0, 0, 0));
                points.push(new THREE.Vector3(-scale/2, scale/2, 0));
                points.push(new THREE.Vector3(0, 0, 0));
                points.push(new THREE.Vector3(scale/2, scale/2, 0));
                points.push(new THREE.Vector3(0, 0, 0));
                points.push(new THREE.Vector3(0, scale, 0));
                break;
            
            case 'dragon':
                // Dragon serpentine pattern
                for (let i = 0; i < 10; i++) {
                    const x = Math.sin(i * 0.5) * scale;
                    const y = (i - 5) * scale/5;
                    points.push(new THREE.Vector3(x, y, 0));
                }
                break;
            
            case 'wolf':
                // Wolf howling pattern
                points.push(new THREE.Vector3(-scale/2, -scale/2, 0));
                points.push(new THREE.Vector3(-scale/3, 0, 0));
                points.push(new THREE.Vector3(0, scale/2, 0));
                points.push(new THREE.Vector3(scale/3, 0, 0));
                points.push(new THREE.Vector3(scale/2, -scale/2, 0));
                points.push(new THREE.Vector3(0, -scale/3, 0));
                break;
            
            case 'chameleon':
                // Chameleon spiral pattern
                for (let i = 0; i < 12; i++) {
                    const angle = i * 0.5;
                    const radius = scale * (1 - i/12);
                    points.push(new THREE.Vector3(
                        Math.cos(angle) * radius,
                        Math.sin(angle) * radius,
                        0
                    ));
                }
                break;
            
            case 'scales':
                // Scales pattern
                points.push(new THREE.Vector3(-scale, 0, 0));
                points.push(new THREE.Vector3(0, scale/3, 0));
                points.push(new THREE.Vector3(scale, 0, 0));
                points.push(new THREE.Vector3(0, -scale/3, 0));
                points.push(new THREE.Vector3(-scale, 0, 0));
                break;
            
            default:
                // Default circular pattern
                for (let i = 0; i <= 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    points.push(new THREE.Vector3(
                        Math.cos(angle) * scale,
                        Math.sin(angle) * scale,
                        0
                    ));
                }
                break;
        }

        return points;
    }

    /**
     * Create a star for a mental model
     * @param {Object} model - Mental model object
     * @param {Object} config - Category configuration
     * @param {number} index - Index of the model in the category
     * @param {number} total - Total number of models in the category
     * @returns {THREE.Mesh} Star mesh
     */
    createStar(model, config, index, total) {
        // Create star geometry
        const geometry = new THREE.SphereGeometry(0.5, 8, 8);
        
        // Create material with category color
        const material = new THREE.MeshPhongMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.9
        });

        const star = new THREE.Mesh(geometry, material);
        
        // Position star in a circle around the constellation pattern
        const angle = (index / total) * Math.PI * 2;
        const radius = 12 + Math.random() * 3;
        star.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            (Math.random() - 0.5) * 5
        );

        // Store model data in star
        star.userData = model;

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.8, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        star.add(glow);

        return star;
    }

    /**
     * Create camera controls
     */
    createControls() {
        this.controls = {
            mouseX: 0,
            mouseY: 0,
            targetRotationX: 0,
            targetRotationY: 0,
            isMouseDown: false
        };
    }

    /**
     * Add event listeners
     */
    addEventListeners() {
        // Mouse events
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('mousedown', (event) => this.onMouseDown(event));
        this.renderer.domElement.addEventListener('mouseup', (event) => this.onMouseUp(event));
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
        this.renderer.domElement.addEventListener('wheel', (event) => this.onMouseWheel(event));

        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Keyboard events
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
    }

    /**
     * Handle mouse move
     * @param {MouseEvent} event
     */
    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        if (this.controls.isMouseDown) {
            this.controls.targetRotationY = (event.clientX - this.controls.mouseX) * 0.01;
            this.controls.targetRotationX = (event.clientY - this.controls.mouseY) * 0.01;
        }

        this.controls.mouseX = event.clientX;
        this.controls.mouseY = event.clientY;
    }

    /**
     * Handle mouse down
     * @param {MouseEvent} event
     */
    onMouseDown(event) {
        this.controls.isMouseDown = true;
    }

    /**
     * Handle mouse up
     * @param {MouseEvent} event
     */
    onMouseUp(event) {
        this.controls.isMouseDown = false;
    }

    /**
     * Handle mouse click
     * @param {MouseEvent} event
     */
    onMouseClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            
            // Find the star (might be the glow or the actual star)
            let star = clickedObject;
            while (star.parent && !star.userData.name) {
                star = star.parent;
            }

            if (star.userData.name) {
                this.selectStar(star);
            }
        }
    }

    /**
     * Handle mouse wheel
     * @param {WheelEvent} event
     */
    onMouseWheel(event) {
        event.preventDefault();
        const delta = event.deltaY * 0.05;
        this.camera.position.z = Math.max(20, Math.min(100, this.camera.position.z + delta));
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    /**
     * Handle keyboard events
     * @param {KeyboardEvent} event
     */
    onKeyDown(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.isRotating = !this.isRotating;
                break;
            case 'KeyR':
                this.resetCamera();
                break;
        }
    }

    /**
     * Select a star and trigger callback
     * @param {THREE.Mesh} star
     */
    selectStar(star) {
        // Deselect previous star
        if (this.selectedStar) {
            this.selectedStar.scale.set(1, 1, 1);
        }

        // Select new star
        this.selectedStar = star;
        star.scale.set(1.5, 1.5, 1.5);

        // Trigger custom event
        const event = new CustomEvent('starSelected', {
            detail: star.userData
        });
        document.dispatchEvent(event);
    }

    /**
     * Reset camera to default position
     */
    resetCamera() {
        this.camera.position.set(0, 0, 50);
        this.controls.targetRotationX = 0;
        this.controls.targetRotationY = 0;
    }

    /**
     * Filter constellations by category
     * @param {Array} visibleCategories - Array of category names to show
     */
    filterByCategory(visibleCategories) {
        this.constellations.forEach((constellation, category) => {
            constellation.visible = visibleCategories.includes(category);
        });
    }

    /**
     * Highlight stars matching search query
     * @param {Array} modelIds - Array of model IDs to highlight
     */
    highlightSearchResults(modelIds) {
        this.stars.forEach((star, modelId) => {
            if (modelIds.includes(modelId)) {
                star.material.emissiveIntensity = 0.8;
                star.scale.set(1.3, 1.3, 1.3);
            } else {
                star.material.emissiveIntensity = 0.3;
                star.scale.set(1, 1, 1);
            }
        });
    }

    /**
     * Reset all highlights
     */
    resetHighlights() {
        this.stars.forEach(star => {
            star.material.emissiveIntensity = 0.3;
            star.scale.set(1, 1, 1);
        });
    }

    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate constellations
        if (this.isRotating) {
            this.constellations.forEach(constellation => {
                constellation.rotation.y += this.rotationSpeed;
            });
        }

        // Apply mouse rotation
        if (this.controls.isMouseDown) {
            this.scene.rotation.y += this.controls.targetRotationY;
            this.scene.rotation.x += this.controls.targetRotationX;
        }

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.renderer.dispose();
        this.stars.clear();
        this.constellations.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConstellationVisualization;
} else {
    window.ConstellationVisualization = ConstellationVisualization;
}
