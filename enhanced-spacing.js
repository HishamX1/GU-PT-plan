/**
 * Enhanced Spacing and Arrows for Course Hierarchy
 * 
 * This file significantly increases the spacing between course nodes
 * and adds more prominent arrows between prerequisite and required courses.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Extend the original renderCourseHierarchy function
    const originalRenderCourseHierarchy = window.renderCourseHierarchy;
    
    if (originalRenderCourseHierarchy) {
        window.renderCourseHierarchy = function(courseCode) {
            // Call the original function first
            originalRenderCourseHierarchy(courseCode);
            
            // Then enhance with improved spacing and arrows
            setTimeout(() => {
                enhanceHierarchySpacingAndArrows(courseCode);
            }, 300); // Increased delay to ensure the original rendering is complete
        };
    }
    
    // Function to enhance hierarchy with improved spacing and arrows
    function enhanceHierarchySpacingAndArrows(courseCode) {
        const course = courses.find(c => c.code === courseCode);
        if (!course) return;
        
        const container = document.querySelector('.tree-container');
        if (!container) return;
        
        // Increase container size dramatically
        container.style.minHeight = '1200px'; // Much larger height
        container.style.width = '100%';
        container.style.padding = '60px';
        
        // Get all nodes
        const nodes = container.querySelectorAll('.tree-node');
        const coreNode = container.querySelector('.core-node');
        
        // Apply extreme spacing between nodes
        applyExtremeSpacing(nodes, coreNode, container, course);
        
        // Add enhanced arrows between courses
        addEnhancedCourseArrows(nodes, container, course);
    }
    
    // Function to apply extreme spacing between nodes
    function applyExtremeSpacing(nodes, coreNode, container, course) {
        if (!coreNode) return;
        
        // Get core node position
        const coreRect = coreNode.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate core node center position
        const coreX = coreRect.left + coreRect.width / 2 - containerRect.left;
        const coreY = coreRect.top + coreRect.height / 2 - containerRect.top;
        
        // Position core node in the center
        coreNode.style.left = '50%';
        coreNode.style.top = '40%';
        coreNode.style.transform = 'translate(-50%, -50%)';
        
        // Group nodes by type (prerequisite or required)
        const prerequisiteNodes = [];
        const requiredNodes = [];
        
        nodes.forEach(node => {
            if (node === coreNode) return;
            
            const nodeCode = node.getAttribute('data-code');
            if (!nodeCode) return;
            
            const nodeData = courses.find(c => c.code === nodeCode);
            if (!nodeData) return;
            
            // Determine if this is a prerequisite or required course
            if (course.prerequisites && course.prerequisites.includes(nodeCode)) {
                prerequisiteNodes.push({
                    node: node,
                    data: nodeData
                });
            } else if (nodeData.prerequisites && nodeData.prerequisites.includes(course.code)) {
                requiredNodes.push({
                    node: node,
                    data: nodeData
                });
            }
        });
        
        // Sort nodes by semester
        prerequisiteNodes.sort((a, b) => a.data.semester - b.data.semester);
        requiredNodes.sort((a, b) => a.data.semester - b.data.semester);
        
        // Position prerequisite nodes (above)
        const prereqSpacing = 400; // Extreme horizontal spacing
        const prereqVerticalOffset = 300; // Extreme vertical spacing
        
        prerequisiteNodes.forEach((item, index) => {
            const totalWidth = prerequisiteNodes.length * prereqSpacing;
            const startX = coreX - totalWidth / 2 + prereqSpacing / 2;
            
            const node = item.node;
            const nodeX = startX + index * prereqSpacing;
            const nodeY = coreY - prereqVerticalOffset;
            
            // Set position
            node.style.left = `${nodeX}px`;
            node.style.top = `${nodeY}px`;
            
            // Add semester indicator if not already present
            if (!node.querySelector('.semester-indicator')) {
                const semesterIndicator = document.createElement('div');
                semesterIndicator.className = 'semester-indicator';
                semesterIndicator.textContent = item.data.semester;
                node.appendChild(semesterIndicator);
            }
        });
        
        // Position required nodes (below)
        const requiredSpacing = 400; // Extreme horizontal spacing
        const requiredVerticalOffset = 300; // Extreme vertical spacing
        
        requiredNodes.forEach((item, index) => {
            const totalWidth = requiredNodes.length * requiredSpacing;
            const startX = coreX - totalWidth / 2 + requiredSpacing / 2;
            
            const node = item.node;
            const nodeX = startX + index * requiredSpacing;
            const nodeY = coreY + requiredVerticalOffset;
            
            // Set position
            node.style.left = `${nodeX}px`;
            node.style.top = `${nodeY}px`;
            
            // Add semester indicator if not already present
            if (!node.querySelector('.semester-indicator')) {
                const semesterIndicator = document.createElement('div');
                semesterIndicator.className = 'semester-indicator';
                semesterIndicator.textContent = item.data.semester;
                node.appendChild(semesterIndicator);
            }
        });
    }
    
    // Function to add enhanced arrows between courses
    function addEnhancedCourseArrows(nodes, container, course) {
        // Clear existing connections and arrows
        const existingConnections = container.querySelectorAll('.node-connection, .arrow-head, .semester-arrow');
        existingConnections.forEach(conn => conn.remove());
        
        // Get core node
        const coreNode = container.querySelector('.core-node');
        if (!coreNode) return;
        
        // Get core node position
        const coreRect = coreNode.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate core node center position
        const coreX = coreRect.left + coreRect.width / 2 - containerRect.left;
        const coreY = coreRect.top + coreRect.height / 2 - containerRect.top;
        
        // Create connections for each node
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
            let arrowDirection = '';
            
            if (course.prerequisites && course.prerequisites.includes(nodeCode)) {
                connectionType = 'prerequisite-connection';
                arrowDirection = 'down'; // Arrow pointing from prerequisite to core
            } else if (nodeData.prerequisites && nodeData.prerequisites.includes(course.code)) {
                connectionType = 'required-connection';
                arrowDirection = 'down'; // Arrow pointing from core to required
            } else {
                return; // No direct connection
            }
            
            // Create enhanced connection with multiple segments
            createEnhancedConnection(container, coreX, coreY, nodeX, nodeY, connectionType, arrowDirection);
        });
    }
    
    // Function to create an enhanced connection with multiple segments
    function createEnhancedConnection(container, x1, y1, x2, y2, connectionType, arrowDirection) {
        // Determine if this is a vertical connection (prerequisite above or required below)
        const isVertical = Math.abs(y2 - y1) > Math.abs(x2 - x1);
        
        if (isVertical) {
            // Create a three-segment path: vertical -> horizontal -> vertical
            const midY = (y1 + y2) / 2;
            
            // First segment (vertical from start)
            createConnectionSegment(container, x1, y1, x1, midY, connectionType);
            
            // Second segment (horizontal)
            createConnectionSegment(container, x1, midY, x2, midY, connectionType);
            
            // Third segment (vertical to end)
            createConnectionSegment(container, x2, midY, x2, y2, connectionType);
            
            // Add arrow at the end
            createArrowHead(container, x2, y2, connectionType, arrowDirection);
        } else {
            // Create a three-segment path: horizontal -> vertical -> horizontal
            const midX = (x1 + x2) / 2;
            
            // First segment (horizontal from start)
            createConnectionSegment(container, x1, y1, midX, y1, connectionType);
            
            // Second segment (vertical)
            createConnectionSegment(container, midX, y1, midX, y2, connectionType);
            
            // Third segment (horizontal to end)
            createConnectionSegment(container, midX, y2, x2, y2, connectionType);
            
            // Add arrow at the end
            createArrowHead(container, x2, y2, connectionType, arrowDirection === 'down' ? 'right' : 'left');
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
    
    // Initialize if we're already on a course page
    const currentCourseCode = getCurrentCourseFromURL();
    if (currentCourseCode) {
        setTimeout(() => {
            enhanceHierarchySpacingAndArrows(currentCourseCode);
        }, 500);
    }
    
    // Helper function to get current course from URL
    function getCurrentCourseFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('course');
    }
});
