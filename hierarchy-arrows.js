/**
 * Hierarchy Arrows and Course Status Visualization
 * 
 * This file contains functions to enhance the course hierarchy visualization
 * with directional arrows and visual indicators for locked/unlocked courses.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add the new CSS file to the document
    if (!document.querySelector('link[href="assets/hierarchy-arrows.css"]')) {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'assets/hierarchy-arrows.css';
        document.head.appendChild(linkElement);
    }

    // Extend the original renderCourseHierarchy function
    const originalRenderCourseHierarchy = window.renderCourseHierarchy;
    
    if (originalRenderCourseHierarchy) {
        window.renderCourseHierarchy = function(courseCode) {
            // Call the original function first
            originalRenderCourseHierarchy(courseCode);
            
            // Then enhance with arrows and locked status
            setTimeout(() => {
                enhanceHierarchyVisualization(courseCode);
            }, 100); // Small delay to ensure the original rendering is complete
        };
    }
    
    // Function to enhance hierarchy visualization
    function enhanceHierarchyVisualization(courseCode) {
        const course = courses.find(c => c.code === courseCode);
        if (!course) return;
        
        const container = document.querySelector('.tree-container');
        if (!container) return;
        
        // Get all nodes
        const nodes = container.querySelectorAll('.tree-node');
        const coreNode = container.querySelector('.core-node');
        
        // Process each node to determine if it's locked
        nodes.forEach(node => {
            const nodeCode = node.getAttribute('data-code');
            if (!nodeCode) return;
            
            const nodeData = courses.find(c => c.code === nodeCode);
            if (!nodeData) return;
            
            // Check if this course is locked (not available yet)
            const isLocked = isCourseLocked(nodeData, course);
            
            if (isLocked) {
                node.classList.add('locked');
                
                // Add lock icon
                const lockIcon = document.createElement('i');
                lockIcon.className = 'fas fa-lock lock-icon';
                node.appendChild(lockIcon);
                
                // Update tooltip if exists
                const tooltipText = node.getAttribute('data-tooltip');
                if (tooltipText) {
                    node.setAttribute('data-tooltip', 
                        tooltipText + ' (Locked: Prerequisites not completed)');
                }
            }
            
            // Add sequence indicator
            if (nodeData.semester) {
                const sequenceIndicator = document.createElement('div');
                sequenceIndicator.className = 'sequence-indicator';
                sequenceIndicator.textContent = nodeData.semester;
                node.appendChild(sequenceIndicator);
            }
        });
        
        // Replace line connections with arrows
        replaceConnectionsWithArrows();
    }
    
    // Function to check if a course is locked
    function isCourseLocked(course, currentCourse) {
        // If this is the current course, it's not locked
        if (course.code === currentCourse.code) return false;
        
        // If it's a prerequisite of the current course, it's not locked
        if (currentCourse.prerequisites && 
            currentCourse.prerequisites.includes(course.code)) {
            return false;
        }
        
        // If it's in a future semester compared to current course, it might be locked
        if (course.semester > currentCourse.semester) {
            // Check if all prerequisites are completed
            if (!course.prerequisites || course.prerequisites.length === 0) {
                return false; // No prerequisites, so not locked
            }
            
            // Check if any prerequisite is not completed
            // For demo purposes, we'll consider courses in earlier semesters as completed
            const hasUncompletedPrereq = course.prerequisites.some(prereqCode => {
                const prereq = courses.find(c => c.code === prereqCode);
                return prereq && prereq.semester >= currentCourse.semester;
            });
            
            return hasUncompletedPrereq;
        }
        
        // By default, courses in earlier semesters are not locked
        return false;
    }
    
    // Function to replace line connections with arrows
    function replaceConnectionsWithArrows() {
        const container = document.querySelector('.tree-container');
        if (!container) return;
        
        // Get all existing connections
        const connections = container.querySelectorAll('.node-connection');
        
        connections.forEach(connection => {
            // Get connection properties
            const isPrereq = connection.classList.contains('prerequisite-connection');
            const isRequired = connection.classList.contains('required-connection');
            
            // Get position and dimensions
            const rect = connection.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Calculate relative position
            const left = rect.left - containerRect.left;
            const top = rect.top - containerRect.top;
            const width = rect.width;
            const height = rect.height;
            
            // Determine arrow direction based on connection type
            let arrowDirection, arrowClass;
            
            if (isPrereq) {
                // Prerequisites point from prerequisite to current course (up)
                arrowDirection = 'up';
                arrowClass = 'prerequisite-arrow';
            } else if (isRequired) {
                // Required courses point from current course to required course (down)
                arrowDirection = 'down';
                arrowClass = 'required-arrow';
            } else {
                // Default direction
                arrowDirection = 'right';
                arrowClass = '';
            }
            
            // Create arrow head
            const arrowHead = document.createElement('div');
            arrowHead.className = `arrow-head ${arrowClass}`;
            
            // Position and style arrow head based on direction
            if (arrowDirection === 'up') {
                // Arrow pointing up (from prerequisite to current course)
                arrowHead.style.borderWidth = '0 6px 10px 6px';
                arrowHead.style.borderColor = 'transparent transparent var(--gu-secondary) transparent';
                arrowHead.style.left = `${left + width/2 - 6}px`;
                arrowHead.style.top = `${top - 10}px`;
            } else if (arrowDirection === 'down') {
                // Arrow pointing down (from current course to required course)
                arrowHead.style.borderWidth = '10px 6px 0 6px';
                arrowHead.style.borderColor = 'var(--gu-success) transparent transparent transparent';
                arrowHead.style.left = `${left + width/2 - 6}px`;
                arrowHead.style.top = `${top + height}px`;
            } else {
                // Arrow pointing right (default)
                arrowHead.style.borderWidth = '6px 0 6px 10px';
                arrowHead.style.left = `${left + width}px`;
                arrowHead.style.top = `${top + height/2 - 6}px`;
            }
            
            // Add arrow head to container
            container.appendChild(arrowHead);
            
            // Make arrow visible with animation
            setTimeout(() => {
                arrowHead.classList.add('visible');
                arrowHead.classList.add('arrow-animation');
            }, 300);
        });
    }
    
    // Initialize if we're already on a course page
    const currentCourseCode = getCurrentCourseFromURL();
    if (currentCourseCode) {
        setTimeout(() => {
            enhanceHierarchyVisualization(currentCourseCode);
        }, 500);
    }
    
    // Helper function to get current course from URL
    function getCurrentCourseFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('course');
    }
});
