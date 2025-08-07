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
                color: 0xff6b35,
                position: { x: 0, y: 30, z: 0 },
            },
            'Human Nature and Judgment': {
                color: 0x9b59b6,
                position: { x: -35, y: 0, z: 15 },
            },
            'Numeracy and Interpretation': {
                color: 0xe67e22,
                position: { x: 35, y: 0, z: 15 },
            },
            Thinking: {
                color: 0x3498db,
                position: { x: 0, y: -30, z: 15 },
            },
            Systems: {
                color: 0x2ecc71,
                position: { x: -40, y: 15, z: -15 },
            },
            'Biological World': {
                color: 0x1abc9c, // Turquoise
                position: { x: 40, y: 15, z: -15 },
            },
            'Physical World': {
                color: 0xe74c3c,
                position: { x: 0, y: 35, z: -20 },
            },
            'Military and War': {
                color: 0xff0000,
                position: { x: -30, y: -20, z: -15 },
            },
            'Political Failure': {
                color: 0xf39c12,
                position: { x: 30, y: -20, z: -15 },
            },
            'Rule of Law': {
                color: 0xf1c40f,
                position: { x: 0, y: 0, z: -30 },
            },
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
            opacity: 0.8,
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

        // Create stars for each mental model
        models.forEach((model, index) => {
            const star = this.createStar(model, config, index, models.length);
            constellationGroup.add(star);
            this.stars.set(model.id, star);
        });

        // Position the constellation
        constellationGroup.position.set(config.position.x, config.position.y, config.position.z);

        this.scene.add(constellationGroup);
        this.constellations.set(category, constellationGroup);
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
        // Create star geometry - larger for mobile devices
        const baseSize = window.innerWidth <= 768 ? 1.2 : 0.8;
        const geometry = new THREE.SphereGeometry(baseSize, 16, 16);

        // Create material with category color
        const material = new THREE.MeshPhongMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.9,
        });

        const star = new THREE.Mesh(geometry, material);

        // Position star in a circle around the constellation pattern
        const angle = (index / total) * Math.PI * 2;
        const radius = 15 + Math.random() * 5;
        star.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            (Math.random() - 0.5) * 8
        );

        // Store model data in star
        star.userData = model;

        // Add glow effect - larger for mobile devices
        const glowSize = window.innerWidth <= 768 ? 2.0 : 1.2;
        const glowGeometry = new THREE.SphereGeometry(glowSize, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.3,
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
            isMouseDown: false,
            touchStartX: 0,
            touchStartY: 0,
            touchZoomDistance: 0,
            lastTouchX: 0,
            lastTouchY: 0,
            isTwoFingerTouch: false, // New property to track two-finger touch
            tapTimeout: null, // New property for tap detection
            isDragging: false, // New property to differentiate drag from tap
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

        // Touch events
        this.renderer.domElement.addEventListener('touchstart', (event) =>
            this.onTouchStart(event)
        );
        this.renderer.domElement.addEventListener('touchmove', (event) => this.onTouchMove(event));
        this.renderer.domElement.addEventListener('touchend', (event) => this.onTouchEnd(event));

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
            const deltaX = event.clientX - this.controls.mouseX;
            const deltaY = event.clientY - this.controls.mouseY;

            this.scene.rotation.y += deltaX * 0.005;
            this.scene.rotation.x += deltaY * 0.005;
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
     * Handle touch start
     * @param {TouchEvent} event
     */
    onTouchStart(event) {
        event.preventDefault(); // Prevent default touch behavior (e.g., scrolling)
        if (event.touches.length === 1) {
            this.controls.mouseX = event.touches[0].clientX;
            this.controls.mouseY = event.touches[0].clientY;
            this.controls.isMouseDown = true; // Re-using isMouseDown for single touch (rotation)
            this.controls.isTwoFingerTouch = false;
            // Store the initial touch position for tap detection
            this.controls.touchStartX = event.touches[0].clientX;
            this.controls.touchStartY = event.touches[0].clientY;
        } else if (event.touches.length === 2) {
            // Pinch to zoom
            this.controls.touchZoomDistance = this.getTouchDistance(event.touches);
            this.controls.isTwoFingerTouch = true;
        }
    }

    /**
     * Handle touch move
     * @param {TouchEvent} event
     */
    onTouchMove(event) {
        event.preventDefault(); // Prevent default touch behavior (e.g., scrolling)

        // Check if this is a drag movement (more than a small threshold)
        if (
            event.touches.length === 1 &&
            this.controls.isMouseDown &&
            !this.controls.isTwoFingerTouch
        ) {
            const deltaX = event.touches[0].clientX - this.controls.mouseX;
            const deltaY = event.touches[0].clientY - this.controls.mouseY;

            // If movement exceeds a threshold, mark as dragging
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                this.controls.isDragging = true;
            }

            this.scene.rotation.y += deltaX * 0.005;
            this.scene.rotation.x += deltaY * 0.005;

            this.controls.mouseX = event.touches[0].clientX;
            this.controls.mouseY = event.touches[0].clientY;
        } else if (event.touches.length === 2) {
            // Pinch to zoom
            this.controls.isDragging = true; // Two-finger touch is always a drag
            const currentTouchDistance = this.getTouchDistance(event.touches);
            const delta = currentTouchDistance - this.controls.touchZoomDistance;

            this.camera.position.z = Math.max(
                20,
                Math.min(100, this.camera.position.z - delta * 0.1)
            );
            this.controls.touchZoomDistance = currentTouchDistance;
        }
    }

    /**
     * Handle touch end
     * @param {TouchEvent} event
     */
    onTouchEnd(event) {
        this.controls.isMouseDown = false;
        this.controls.isTwoFingerTouch = false;

        // Handle tap selection for mobile devices
        if (event.touches.length === 0 && !this.controls.isDragging) {
            // Use a small timeout to ensure the touch has ended completely
            setTimeout(() => {
                this.handleTapSelection();
            }, 50);
        }

        // Reset drag state
        this.controls.isDragging = false;
    }

    /**
     * Handle tap selection for mobile devices
     */
    handleTapSelection() {
        // Use the initial touch position for tap detection
        const rect = this.renderer.domElement.getBoundingClientRect();
        // Convert touch position to normalized device coordinates (-1 to +1)
        this.mouse.x = ((this.controls.touchStartX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((this.controls.touchStartY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;

            // Find the star (might be the glow or the actual star)
            let star = clickedObject;
            while (star.parent && !star.userData.name) {
                star = star.parent;
            }

            // Check if the star and its parent constellation are visible
            if (star.userData.name && star.parent && star.parent.visible) {
                this.selectStar(star);
            }
        }
    }

    /**
     * Helper to get distance between two touch points
     * @param {TouchList} touches
     * @returns {number}
     */
    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
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

            // Check if the star and its parent constellation are visible
            if (star.userData.name && star.parent && star.parent.visible) {
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
            detail: star.userData,
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
        this.stars.forEach((star) => {
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
            this.constellations.forEach((constellation) => {
                constellation.rotation.y += this.rotationSpeed;
            });
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConstellationVisualization;
} else {
    window.ConstellationVisualization = ConstellationVisualization;
}
