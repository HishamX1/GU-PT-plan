/**
 * Enhanced Animation Integration for Physical Therapy Program Study Plan
 * 
 * This file extends the main app.js with additional animation functionality
 * to create smooth, engaging user experiences with minimal lag time.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Animation controller object
    const animations = {
        // Track animation states
        state: {
            isAnimating: false,
            nodeAnimationQueue: [],
            connectionAnimationQueue: []
        },
        
        // Initialize animations
        init() {
            this.setupAnimationObservers();
            this.setupEventListeners();
        },
        
        // Set up intersection observers for scroll-based animations
        setupAnimationObservers() {
            // Create observer for elements that should animate when they enter the viewport
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                        animationObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            
            // Observe elements with animation classes
            document.querySelectorAll('.animate-on-scroll').forEach(el => {
                animationObserver.observe(el);
            });
        },
        
        // Set up event listeners for animation triggers
        setupEventListeners() {
            // Add hover animation listeners
            document.querySelectorAll('.semester-card, .course-card').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    this.pulseElement(card);
                });
            });
            
            // Add click animation listeners
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.clickEffect(btn);
                });
            });
        },
        
        // Transition between views with smooth animations
        transitionView(fromElement, toElement, direction = 'forward') {
            if (this.state.isAnimating) return;
            this.state.isAnimating = true;
            
            // Set transition direction
            const exitClass = direction === 'forward' ? 'view-exit' : 'view-exit-reverse';
            const enterClass = direction === 'forward' ? 'view-enter' : 'view-enter-reverse';
            
            // Exit animation
            fromElement.classList.add(exitClass);
            
            setTimeout(() => {
                fromElement.style.display = 'none';
                fromElement.classList.remove(exitClass);
                
                // Enter animation
                toElement.style.display = 'block';
                toElement.classList.add(enterClass);
                
                // Force reflow
                void toElement.offsetWidth;
                
                toElement.classList.remove(enterClass);
                toElement.classList.add('view-active');
                
                setTimeout(() => {
                    toElement.classList.remove('view-active');
                    this.state.isAnimating = false;
                }, 400);
            }, 400);
        },
        
        // Animate tree nodes with staggered entrance
        animateTreeNodes(nodes) {
            nodes.forEach((node, index) => {
                // Set custom animation delay based on index
                node.style.setProperty('--node-index', index);
                
                // Add to animation queue
                this.state.nodeAnimationQueue.push({
                    element: node,
                    delay: index * 100
                });
            });
            
            // Process animation queue
            this.processNodeAnimationQueue();
        },
        
        // Process node animation queue
        processNodeAnimationQueue() {
            if (this.state.nodeAnimationQueue.length === 0) return;
            
            const item = this.state.nodeAnimationQueue.shift();
            
            setTimeout(() => {
                item.element.classList.add('animate');
                this.processNodeAnimationQueue();
            }, item.delay);
        },
        
        // Animate connections between nodes
        animateConnections(connections) {
            connections.forEach((connection, index) => {
                // Set custom animation delay based on index
                connection.style.setProperty('--connection-index', index);
                
                // Add to animation queue
                this.state.connectionAnimationQueue.push({
                    element: connection,
                    delay: index * 100 + 300 // Start after nodes have appeared
                });
            });
            
            // Process animation queue
            this.processConnectionAnimationQueue();
        },
        
        // Process connection animation queue
        processConnectionAnimationQueue() {
            if (this.state.connectionAnimationQueue.length === 0) return;
            
            const item = this.state.connectionAnimationQueue.shift();
            
            setTimeout(() => {
                item.element.classList.add('visible');
                this.processConnectionAnimationQueue();
            }, item.delay);
        },
        
        // Create pulse effect on element
        pulseElement(element) {
            element.classList.add('pulse');
            
            // Remove class after animation completes
            setTimeout(() => {
                element.classList.remove('pulse');
            }, 1500);
        },
        
        // Create click effect on buttons
        clickEffect(element) {
            element.classList.add('click-effect');
            
            // Remove class after animation completes
            setTimeout(() => {
                element.classList.remove('click-effect');
            }, 300);
        },
        
        // Shake element for error indication
        shakeElement(element) {
            element.classList.add('shake');
            
            // Remove class after animation completes
            setTimeout(() => {
                element.classList.remove('shake');
            }, 600);
        },
        
        // Highlight search results
        highlightSearchResults(elements) {
            elements.forEach(element => {
                element.classList.add('search-highlight');
                
                // Remove highlight after animation completes
                setTimeout(() => {
                    element.classList.remove('search-highlight');
                }, 2000);
            });
        },
        
        // Animate list items with staggered entrance
        animateListItems(container) {
            const items = container.querySelectorAll('.staggered-item');
            
            items.forEach((item, index) => {
                item.style.setProperty('--item-index', index);
                item.classList.add('animate');
            });
        },
        
        // Animate progress bars
        animateProgressBars() {
            document.querySelectorAll('.progress-bar div').forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                bar.style.setProperty('--progress-width', width);
                
                // Force reflow
                void bar.offsetWidth;
                
                bar.classList.add('animate-progress');
            });
        },
        
        // Animate modal opening
        openModal(modal) {
            modal.style.display = 'flex';
            modal.classList.add('show');
            
            // Prevent body scrolling
            document.body.style.overflow = 'hidden';
        },
        
        // Animate modal closing
        closeModal(modal) {
            modal.classList.remove('show');
            
            // Wait for animation to complete before hiding
            setTimeout(() => {
                modal.style.display = 'none';
                
                // Restore body scrolling
                document.body.style.overflow = '';
            }, 300);
        },
        
        // Create ripple effect on click
        createRippleEffect(event, element) {
            const rect = element.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            element.appendChild(ripple);
            
            // Remove ripple after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 600);
        },
        
        // Animate accordion opening/closing
        toggleAccordion(accordion) {
            accordion.classList.toggle('open');
        },
        
        // Animate course connections in hierarchy view
        animateHierarchyConnections(coreNode, relatedNodes, type) {
            const coreRect = coreNode.getBoundingClientRect();
            const containerRect = coreNode.closest('.tree-container').getBoundingClientRect();
            
            // Calculate core node center position
            const coreX = coreRect.left - containerRect.left + coreRect.width / 2;
            const coreY = coreRect.top - containerRect.top + coreRect.height / 2;
            
            // Create and animate connections
            relatedNodes.forEach((node, index) => {
                const nodeRect = node.getBoundingClientRect();
                const nodeX = nodeRect.left - containerRect.left + nodeRect.width / 2;
                const nodeY = nodeRect.top - containerRect.top + nodeRect.height / 2;
                
                // Create connection line
                const connection = document.createElement('div');
                connection.className = `node-connection ${type}-connection`;
                
                // Calculate line properties
                const dx = nodeX - coreX;
                const dy = nodeY - coreY;
                const length = Math.sqrt(dx*dx + dy*dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                // Set connection properties
                connection.style.width = `${length}px`;
                connection.style.height = '2px';
                connection.style.left = `${coreX}px`;
                connection.style.top = `${coreY}px`;
                connection.style.setProperty('--connection-angle', `${angle}deg`);
                connection.style.transform = `rotate(${angle}deg)`;
                connection.style.setProperty('--connection-index', index);
                
                // Add to container
                coreNode.closest('.tree-container').appendChild(connection);
                
                // Add to animation tracking
                this.state.currentConnections.push(connection);
            });
            
            // Animate connections
            this.animateConnections(this.state.currentConnections);
        }
    };
    
    // Initialize animations when DOM is loaded
    animations.init();
    
    // Make animations available globally
    window.ptAnimations = animations;
});
