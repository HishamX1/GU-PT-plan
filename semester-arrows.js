/**
 * Semester Arrows and Improved Spacing for Course Hierarchy
 * 
 * This file enhances the course hierarchy visualization with:
 * 1. Increased spacing between course nodes
 * 2. Arrows between courses and semesters
 * 3. Semester labels for better organization
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add the new CSS file to the document
    if (!document.querySelector('link[href="assets/galala-green-theme.css"]')) {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'assets/galala-green-theme.css';
        document.head.appendChild(linkElement);
    }

    // Extend the original renderCourseHierarchy function
    const originalRenderCourseHierarchy = window.renderCourseHierarchy;
    
    if (originalRenderCourseHierarchy) {
        window.renderCourseHierarchy = function(courseCode) {
            // Call the original function first
            originalRenderCourseHierarchy(courseCode);
            
            // Then enhance with improved spacing and semester arrows
            setTimeout(() => {
                enhanceHierarchySpacingAndArrows(courseCode);
            }, 200); // Small delay to ensure the original rendering is complete
        };
    }
    
    // Function to enhance hierarchy with improved spacing and semester arrows
    function enhanceHierarchySpacingAndArrows(courseCode) {
        const course = courses.find(c => c.code === courseCode);
        if (!course) return;
        
        const container = document.querySelector('.tree-container');
        if (!container) return;
        
        // Get all nodes
        const nodes = container.querySelectorAll('.tree-node');
        const coreNode = container.querySelector('.core-node');
        
        // Increase spacing between nodes
        increaseNodeSpacing(nodes, coreNode);
        
        // Add semester labels and arrows
        addSemesterLabelsAndArrows(nodes, container);
        
        // Adjust connection lines to account for new spacing
        adjustConnectionLines();
    }
    
    // Function to increase spacing between nodes
    function increaseNodeSpacing(nodes, coreNode) {
        if (!coreNode) return;
        
        // Get core node position
        const coreRect = coreNode.getBoundingClientRect();
        const containerRect = coreNode.parentElement.getBoundingClientRect();
        
        // Calculate core node center position
        const coreX = coreRect.left + coreRect.width / 2 - containerRect.left;
        const coreY = coreRect.top + coreRect.height / 2 - containerRect.top;
        
        // Group nodes by semester
        const semesterGroups = {};
        
        nodes.forEach(node => {
            const nodeCode = node.getAttribute('data-code');
            if (!nodeCode) return;
            
            const nodeData = courses.find(c => c.code === nodeCode);
            if (!nodeData || !nodeData.semester) return;
            
            const semester = nodeData.semester;
            
            if (!semesterGroups[semester]) {
                semesterGroups[semester] = [];
            }
            
            semesterGroups[semester].push({
                node: node,
                data: nodeData
            });
        });
        
        // Calculate positions with increased spacing
        const semesterKeys = Object.keys(semesterGroups).sort((a, b) => a - b);
        
        // Determine if this is a prerequisite view or required-for view
        const isPrereqView = coreNode.classList.contains('core-node') && 
                            semesterKeys.some(sem => sem < course.semester);
        
        // Position nodes based on semester
        if (isPrereqView) {
            // Prerequisites view - earlier semesters below, later semesters above
            positionPrerequisiteNodes(semesterGroups, semesterKeys, coreNode, coreX, coreY);
        } else {
            // Required-for view - later semesters below
            positionRequiredForNodes(semesterGroups, semesterKeys, coreNode, coreX, coreY);
        }
    }
    
    // Position nodes for prerequisites view
    function positionPrerequisiteNodes(semesterGroups, semesterKeys, coreNode, coreX, coreY) {
        const coreSemester = parseInt(coreNode.getAttribute('data-semester') || '0');
        
        // Calculate vertical spacing
        const verticalSpacing = 180; // Increased vertical spacing
        const horizontalSpacing = 350; // Increased horizontal spacing
        
        semesterKeys.forEach((semester, index) => {
            const nodes = semesterGroups[semester];
            const sem = parseInt(semester);
            
            // Skip the core node's semester
            if (sem === coreSemester) return;
            
            // Calculate vertical position based on semester difference
            const verticalOffset = (coreSemester - sem) * verticalSpacing;
            
            // Position nodes horizontally
            const totalWidth = nodes.length * horizontalSpacing;
            const startX = coreX - totalWidth / 2 + horizontalSpacing / 2;
            
            nodes.forEach((item, i) => {
                const node = item.node;
                const nodeX = startX + i * horizontalSpacing;
                const nodeY = coreY + verticalOffset;
                
                // Set position
                node.style.left = `${nodeX}px`;
                node.style.top = `${nodeY}px`;
            });
        });
    }
    
    // Position nodes for required-for view
    function positionRequiredForNodes(semesterGroups, semesterKeys, coreNode, coreX, coreY) {
        const coreSemester = parseInt(coreNode.getAttribute('data-semester') || '0');
        
        // Calculate vertical spacing
        const verticalSpacing = 180; // Increased vertical spacing
        const horizontalSpacing = 350; // Increased horizontal spacing
        
        semesterKeys.forEach((semester, index) => {
            const nodes = semesterGroups[semester];
            const sem = parseInt(semester);
            
            // Skip the core node's semester
            if (sem === coreSemester) return;
            
            // Calculate vertical position based on semester difference
            const verticalOffset = (sem - coreSemester) * verticalSpacing;
            
            // Position nodes horizontally
            const totalWidth = nodes.length * horizontalSpacing;
            const startX = coreX - totalWidth / 2 + horizontalSpacing / 2;
            
            nodes.forEach((item, i) => {
                const node = item.node;
                const nodeX = startX + i * horizontalSpacing;
                const nodeY = coreY + verticalOffset;
                
                // Set position
                node.style.left = `${nodeX}px`;
                node.style.top = `${nodeY}px`;
            });
        });
    }
    
    // Function to add semester labels and arrows
    function addSemesterLabelsAndArrows(nodes, container) {
        // Group nodes by semester
        const semesterGroups = {};
        
        nodes.forEach(node => {
            const nodeCode = node.getAttribute('data-code');
            if (!nodeCode) return;
            
            const nodeData = courses.find(c => c.code === nodeCode);
            if (!nodeData || !nodeData.semester) return;
            
            const semester = nodeData.semester;
            
            if (!semesterGroups[semester]) {
                semesterGroups[semester] = [];
            }
            
            semesterGroups[semester].push({
                node: node,
                data: nodeData,
                rect: node.getBoundingClientRect(),
                containerRect: container.getBoundingClientRect()
            });
        });
        
        // Add semester labels and arrows
        Object.keys(semesterGroups).forEach(semester => {
            const semNodes = semesterGroups[semester];
            if (semNodes.length === 0) return;
            
            // Calculate average position for this semester group
            let avgX = 0;
            let avgY = 0;
            
            semNodes.forEach(item => {
                const rect = item.rect;
                const containerRect = item.containerRect;
                
                avgX += rect.left + rect.width / 2 - containerRect.left;
                avgY += rect.top + rect.height / 2 - containerRect.top;
            });
            
            avgX /= semNodes.length;
            avgY /= semNodes.length;
            
            // Create semester label
            const semesterLabel = document.createElement('div');
            semesterLabel.className = 'semester-label';
            semesterLabel.textContent = `Semester ${semester}`;
            
            // Position label
            semesterLabel.style.left = `${avgX - 60}px`;
            semesterLabel.style.top = `${avgY - 80}px`;
            
            // Add label to container
            container.appendChild(semesterLabel);
            
            // Create arrows from semester label to each node
            semNodes.forEach(item => {
                const nodeRect = item.rect;
                const containerRect = item.containerRect;
                
                const nodeX = nodeRect.left + nodeRect.width / 2 - containerRect.left;
                const nodeY = nodeRect.top - containerRect.top;
                
                // Create arrow
                const arrow = document.createElement('div');
                arrow.className = 'semester-arrow down';
                
                // Position arrow
                arrow.style.left = `${nodeX - 8}px`;
                arrow.style.top = `${nodeY - 15}px`;
                
                // Add arrow to container
                container.appendChild(arrow);
                
                // Make arrow visible with animation
                setTimeout(() => {
                    arrow.classList.add('visible');
                }, 300);
            });
        });
        
        // Add arrows between adjacent semesters
        const semesterKeys = Object.keys(semesterGroups).sort((a, b) => a - b);
        
        for (let i = 0; i < semesterKeys.length - 1; i++) {
            const currentSem = semesterKeys[i];
            const nextSem = semesterKeys[i + 1];
            
            const currentNodes = semesterGroups[currentSem];
            const nextNodes = semesterGroups[nextSem];
            
            if (currentNodes.length === 0 || nextNodes.length === 0) continue;
            
            // Calculate average positions
            let currentAvgX = 0, currentAvgY = 0;
            let nextAvgX = 0, nextAvgY = 0;
            
            currentNodes.forEach(item => {
                const rect = item.rect;
                const containerRect = item.containerRect;
                
                currentAvgX += rect.left + rect.width / 2 - containerRect.left;
                currentAvgY += rect.top + rect.height / 2 - containerRect.top;
            });
            
            nextNodes.forEach(item => {
                const rect = item.rect;
                const containerRect = item.containerRect;
                
                nextAvgX += rect.left + rect.width / 2 - containerRect.left;
                nextAvgY += rect.top + rect.height / 2 - containerRect.top;
            });
            
            currentAvgX /= currentNodes.length;
            currentAvgY /= currentNodes.length;
            nextAvgX /= nextNodes.length;
            nextAvgY /= nextNodes.length;
            
            // Determine arrow direction
            let arrowClass;
            let arrowX, arrowY;
            
            if (Math.abs(nextAvgX - currentAvgX) > Math.abs(nextAvgY - currentAvgY)) {
                // Horizontal arrow
                if (nextAvgX > currentAvgX) {
                    arrowClass = 'right';
                    arrowX = (currentAvgX + nextAvgX) / 2 - 6;
                    arrowY = (currentAvgY + nextAvgY) / 2 - 8;
                } else {
                    arrowClass = 'left';
                    arrowX = (currentAvgX + nextAvgX) / 2 - 6;
                    arrowY = (currentAvgY + nextAvgY) / 2 - 8;
                }
            } else {
                // Vertical arrow
                if (nextAvgY > currentAvgY) {
                    arrowClass = 'down';
                    arrowX = (currentAvgX + nextAvgX) / 2 - 8;
                    arrowY = (currentAvgY + nextAvgY) / 2 - 6;
                } else {
                    arrowClass = 'up';
                    arrowX = (currentAvgX + nextAvgX) / 2 - 8;
                    arrowY = (currentAvgY + nextAvgY) / 2 - 6;
                }
            }
            
            // Create arrow
            const arrow = document.createElement('div');
            arrow.className = `semester-arrow ${arrowClass}`;
            
            // Position arrow
            arrow.style.left = `${arrowX}px`;
            arrow.style.top = `${arrowY}px`;
            
            // Add arrow to container
            container.appendChild(arrow);
            
            // Make arrow visible with animation
            setTimeout(() => {
                arrow.classList.add('visible');
            }, 300);
        }
    }
    
    // Function to adjust connection lines
    function adjustConnectionLines() {
        const container = document.querySelector('.tree-container');
        if (!container) return;
        
        // Get all nodes and connections
        const nodes = container.querySelectorAll('.tree-node');
        const connections = container.querySelectorAll('.node-connection');
        
        // Remove existing connections
        connections.forEach(conn => {
            conn.remove();
        });
        
        // Get core node
        const coreNode = container.querySelector('.core-node');
        if (!coreNode) return;
        
        const coreNodeCode = coreNode.getAttribute('data-code');
        if (!coreNodeCode) return;
        
        const coreNodeData = courses.find(c => c.code === coreNodeCode);
        if (!coreNodeData) return;
        
        // Create new connections
        nodes.forEach(node => {
            if (node === coreNode) return;
            
            const nodeCode = node.getAttribute('data-code');
            if (!nodeCode) return;
            
            const nodeData = courses.find(c => c.code === nodeCode);
            if (!nodeData) return;
            
            // Determine connection type
            let connectionType = '';
            
            if (coreNodeData.prerequisites && coreNodeData.prerequisites.includes(nodeCode)) {
                connectionType = 'prerequisite-connection';
            } else if (nodeData.prerequisites && nodeData.prerequisites.includes(coreNodeCode)) {
                connectionType = 'required-connection';
            } else {
                return; // No direct connection
            }
            
            // Get node positions
            const coreRect = coreNode.getBoundingClientRect();
            const nodeRect = node.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Calculate relative positions
            const coreX = coreRect.left + coreRect.width / 2 - containerRect.left;
            const coreY = coreRect.top + coreRect.height / 2 - containerRect.top;
            const nodeX = nodeRect.left + nodeRect.width / 2 - containerRect.left;
            const nodeY = nodeRect.top + nodeRect.height / 2 - containerRect.top;
            
            // Create connection line
            createConnectionLine(container, coreX, coreY, nodeX, nodeY, connectionType);
        });
    }
    
    // Function to create a connection line
    function createConnectionLine(container, x1, y1, x2, y2, connectionType) {
        // Calculate line length and angle
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        // Create line element
        const line = document.createElement('div');
        line.className = `node-connection ${connectionType}`;
        
        // Set line position and dimensions
        line.style.width = `${length}px`;
        line.style.height = '3px'; // Thicker line
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${angle}deg)`;
        
        // Add line to container
        container.appendChild(line);
        
        // Make line visible with animation
        setTimeout(() => {
            line.classList.add('visible');
        }, 100);
        
        // Create arrow head
        const arrowHead = document.createElement('div');
        arrowHead.className = connectionType === 'prerequisite-connection' ? 
                             'arrow-head prerequisite-arrow' : 
                             'arrow-head required-arrow';
        
        // Position arrow head
        if (connectionType === 'prerequisite-connection') {
            // Arrow pointing to core node
            arrowHead.style.borderWidth = '0 6px 10px 6px';
            arrowHead.style.borderColor = 'transparent transparent var(--gu-secondary) transparent';
            arrowHead.style.left = `${x1 - 6}px`;
            arrowHead.style.top = `${y1 - 10}px`;
        } else {
            // Arrow pointing to required node
            arrowHead.style.borderWidth = '10px 6px 0 6px';
            arrowHead.style.borderColor = 'var(--gu-success) transparent transparent transparent';
            arrowHead.style.left = `${x2 - 6}px`;
            arrowHead.style.top = `${y2 + 2}px`;
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
