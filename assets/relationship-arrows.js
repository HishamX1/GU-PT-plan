/**
 * Enhanced Course Relationship Arrows
 * 
 * This file adds more prominent arrows between prerequisite and required courses,
 * with clear visual indicators of course relationships.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add the new CSS file to the document
    if (!document.querySelector('link[href="assets/enhanced-spacing.css"]')) {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'assets/enhanced-spacing.css';
        document.head.appendChild(linkElement);
    }

    // Extend the original renderCourseHierarchy function
    const originalRenderCourseHierarchy = window.renderCourseHierarchy;
    
    if (originalRenderCourseHierarchy) {
        window.renderCourseHierarchy = function(courseCode) {
            // Call the original function first
            originalRenderCourseHierarchy(courseCode);
            
            // Then enhance with improved arrows and relationship indicators
            setTimeout(() => {
                enhanceCourseRelationshipArrows(courseCode);
            }, 400); // Increased delay to ensure the original rendering is complete
        };
    }
    
    // Function to enhance course relationship arrows
    function enhanceCourseRelationshipArrows(courseCode) {
        const course = courses.find(c => c.code === courseCode);
        if (!course) return;
        
        const container = document.querySelector('.tree-container');
        if (!container) return;
        
        // Add zoom controls to the container
        addZoomControls(container);
        
        // Get all nodes
        const nodes = container.querySelectorAll('.tree-node');
        const coreNode = container.querySelector('.core-node');
        
        if (!coreNode) return;
        
        // Get core node position
        const coreRect = coreNode.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate core node center position
        const coreX = coreRect.left + coreRect.width / 2 - containerRect.left;
        const coreY = coreRect.top + coreRect.height / 2 - containerRect.top;
        
        // Clear existing connections and arrows
        const existingConnections = container.querySelectorAll('.node-connection, .arrow-head, .relationship-label');
        existingConnections.forEach(conn => conn.remove());
        
        // Create enhanced connections for each node
        nodes.forEach(node => {
            if (node === coreNode) return;
            
            const nodeCode = node.getAttribute('data-code');
            if (!nodeCode) return;
            
            const nodeData = courses.find(c => c.code === nodeCode);
            if (!nodeData) return;
            
            // Get node position
            const nodeRect = node.getBoundingClientRect();
            const nodeX = nodeRect.left + nodeRect.width / 2 - containerRect.left;
            const nodeY = nodeRect.top + nodeRect.height / 2 - containerRect.top;
            
            // Determine connection type
            let connectionType = '';
            let relationshipType = '';
            
            if (course.prerequisites && course.prerequisites.includes(nodeCode)) {
                connectionType = 'prerequisite-connection';
                relationshipType = 'prerequisite';
            } else if (nodeData.prerequisites && nodeData.prerequisites.includes(course.code)) {
                connectionType = 'required-connection';
                relationshipType = 'required';
            } else {
                return; // No direct connection
            }
            
            // Create multi-segment connection with arrows
            createMultiSegmentConnection(container, coreX, coreY, nodeX, nodeY, connectionType, relationshipType);
            
            // Add relationship label
            addRelationshipLabel(container, coreX, coreY, nodeX, nodeY, relationshipType);
        });
    }
    
    // Function to create a multi-segment connection with arrows
    function createMultiSegmentConnection(container, x1, y1, x2, y2, connectionType, relationshipType) {
        // Determine if this is a vertical connection (prerequisite above or required below)
        const isVertical = Math.abs(y2 - y1) > Math.abs(x2 - x1);
        
        if (isVertical) {
            // Create a three-segment path with arrows at each bend
            const midY = (y1 + y2) / 2;
            
            // First segment (vertical from start)
            createConnectionSegment(container, x1, y1, x1, midY, connectionType);
            
            // Arrow at first bend
            createArrowHead(container, x1, midY, connectionType, y2 > y1 ? 'down' : 'up');
            
            // Second segment (horizontal)
            createConnectionSegment(container, x1, midY, x2, midY, connectionType);
            
            // Arrow at second bend
            createArrowHead(container, x2, midY, connectionType, y2 > y1 ? 'down' : 'up');
            
            // Third segment (vertical to end)
            createConnectionSegment(container, x2, midY, x2, y2, connectionType);
            
            // Arrow at the end
            createArrowHead(container, x2, y2, connectionType, y2 > y1 ? 'down' : 'up');
        } else {
            // Create a three-segment path with arrows at each bend
            const midX = (x1 + x2) / 2;
            
            // First segment (horizontal from start)
            createConnectionSegment(container, x1, y1, midX, y1, connectionType);
            
            // Arrow at first bend
            createArrowHead(container, midX, y1, connectionType, x2 > x1 ? 'right' : 'left');
            
            // Second segment (vertical)
            createConnectionSegment(container, midX, y1, midX, y2, connectionType);
            
            // Arrow at second bend
            createArrowHead(container, midX, y2, connectionType, x2 > x1 ? 'right' : 'left');
            
            // Third segment (horizontal to end)
            createConnectionSegment(container, midX, y2, x2, y2, connectionType);
            
            // Arrow at the end
            createArrowHead(container, x2, y2, connectionType, x2 > x1 ? 'right' : 'left');
        }
    }
    
    // Function to create a connection segment
    function createConnectionSegment(container, x1, y1, x2, y2, connectionType) {
        // Calculate line length and angle
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        // Create line element
        const line = document.createElement('div');
        line.className = `node-connection ${connectionType}`;
        
        // Set line position and dimensions
        line.style.width = `${length}px`;
        line.style.height = '4px'; // Thicker line for visibility
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${angle}deg)`;
        
        // Add line to container
        container.appendChild(line);
        
        // Make line visible with animation
        setTimeout(() => {
            line.classList.add('visible');
        }, 100);
    }
    
    // Function to create an arrow head
    function createArrowHead(container, x, y, connectionType, direction) {
        const arrowHead = document.createElement('div');
        arrowHead.className = connectionType === 'prerequisite-connection' ? 
                             'arrow-head prerequisite-arrow' : 
                             'arrow-head required-arrow';
        
        // Position and style arrow head based on direction
        if (direction === 'up') {
            arrowHead.style.borderWidth = '0 8px 12px 8px';
            arrowHead.style.borderColor = 'transparent transparent var(--gu-secondary) transparent';
            arrowHead.style.left = `${x - 8}px`;
            arrowHead.style.top = `${y - 12}px`;
        } else if (direction === 'down') {
            arrowHead.style.borderWidth = '12px 8px 0 8px';
            arrowHead.style.borderColor = connectionType === 'prerequisite-connection' ? 
                                         'var(--gu-secondary) transparent transparent transparent' : 
                                         'var(--gu-success) transparent transparent transparent';
            arrowHead.style.left = `${x - 8}px`;
            arrowHead.style.top = `${y}px`;
        } else if (direction === 'right') {
            arrowHead.style.borderWidth = '8px 0 8px 12px';
            arrowHead.style.borderColor = connectionType === 'prerequisite-connection' ? 
                                         'transparent transparent transparent var(--gu-secondary)' : 
                                         'transparent transparent transparent var(--gu-success)';
            arrowHead.style.left = `${x}px`;
            arrowHead.style.top = `${y - 8}px`;
        } else if (direction === 'left') {
            arrowHead.style.borderWidth = '8px 12px 8px 0';
            arrowHead.style.borderColor = connectionType === 'prerequisite-connection' ? 
                                         'transparent var(--gu-secondary) transparent transparent' : 
                                         'transparent var(--gu-success) transparent transparent';
            arrowHead.style.left = `${x - 12}px`;
            arrowHead.style.top = `${y - 8}px`;
        }
        
        // Add arrow head to container
        container.appendChild(arrowHead);
        
        // Make arrow head visible with animation
        setTimeout(() => {
            arrowHead.classList.add('visible');
            arrowHead.classList.add('arrow-animation');
        }, 300);
    }
    
    // Function to add relationship label
    function addRelationshipLabel(container, x1, y1, x2, y2, relationshipType) {
        const label = document.createElement('div');
        label.className = `relationship-label ${relationshipType}`;
        
        // Set label text
        if (relationshipType === 'prerequisite') {
            label.textContent = 'Prerequisite';
        } else {
            label.textContent = 'Required For';
        }
        
        // Position label at the midpoint of the connection
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        label.style.left = `${midX - 50}px`;
        label.style.top = `${midY - 15}px`;
        
        // Add label to container
        container.appendChild(label);
        
        // Make label visible with animation
        setTimeout(() => {
            label.style.opacity = '1';
        }, 500);
    }
    
    // Function to add zoom controls
    function addZoomControls(container) {
        // Check if zoom controls already exist
        if (container.querySelector('.zoom-controls')) return;
        
        // Create zoom controls container
        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        
        // Create zoom in button
        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'zoom-btn zoom-in';
        zoomInBtn.innerHTML = '+';
        zoomInBtn.title = 'Zoom In';
        
        // Create zoom out button
        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'zoom-btn zoom-out';
        zoomOutBtn.innerHTML = '-';
        zoomOutBtn.title = 'Zoom Out';
        
        // Create reset zoom button
        const resetZoomBtn = document.createElement('button');
        resetZoomBtn.className = 'zoom-btn reset-zoom';
        resetZoomBtn.innerHTML = '↺';
        resetZoomBtn.title = 'Reset Zoom';
        
        // Add buttons to controls
        zoomControls.appendChild(zoomInBtn);
        zoomControls.appendChild(zoomOutBtn);
        zoomControls.appendChild(resetZoomBtn);
        
        // Add controls to container
        container.appendChild(zoomControls);
        
        // Initialize zoom level
        let zoomLevel = 1;
        
        // Add event listeners
        zoomInBtn.addEventListener('click', () => {
            zoomLevel += 0.1;
            applyZoom(container, zoomLevel);
        });
        
        zoomOutBtn.addEventListener('click', () => {
            zoomLevel -= 0.1;
            if (zoomLevel < 0.5) zoomLevel = 0.5;
            applyZoom(container, zoomLevel);
        });
        
        resetZoomBtn.addEventListener('click', () => {
            zoomLevel = 1;
            applyZoom(container, zoomLevel);
        });
    }
    
    // Function to apply zoom
    function applyZoom(container, zoomLevel) {
        container.style.transform = `scale(${zoomLevel})`;
        container.style.transformOrigin = 'center top';
    }
    
    // Initialize if we're already on a course page
    const currentCourseCode = getCurrentCourseFromURL();
    if (currentCourseCode) {
        setTimeout(() => {
            enhanceCourseRelationshipArrows(currentCourseCode);
        }, 600);
    }
    
    // Helper function to get current course from URL
    function getCurrentCourseFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('course');
    }
});
