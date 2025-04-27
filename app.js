/**
 * Physical Therapy Program Study Plan Visualization
 * 
 * This application creates an interactive hierarchical visualization of the
 * Physical Therapy program study plan, showing course prerequisites and relationships
 * in a tree-like structure with smooth animations and transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('System Initialized - Courses Available:', courses?.length ?? 0);

    // Application state
    const state = {
        activeFilters: { 
            prerequisites: true, 
            requiredFor: true 
        },
        navigationStack: [],
        currentConnections: [],
        searchResults: [],
        creditsRange: { min: 1, max: 8 },
        selectedSemester: 'all',
        tooltipTimeout: null,
        historyLimit: 5
    };

    // DOM elements cache
    const elements = {
        semesterContainer: document.getElementById('semester-container'),
        visualizationContainer: document.getElementById('visualization-container'),
        breadcrumbContainer: document.getElementById('breadcrumb-container'),
        historyList: document.getElementById('history-list'),
        courseSearch: document.getElementById('course-search'),
        searchBtn: document.getElementById('search-btn'),
        semesterFilter: document.getElementById('semester-filter'),
        creditsMinSlider: document.getElementById('credits-min'),
        creditsMaxSlider: document.getElementById('credits-max'),
        creditsMinValue: document.getElementById('credits-min-value'),
        creditsMaxValue: document.getElementById('credits-max-value'),
        courseModal: document.getElementById('course-modal'),
        modalContent: document.getElementById('modal-course-content')
    };

    /**
     * Initialize the application
     */
    function initialize() {
        setupEventListeners();
        populateSemesterFilter();
        renderSemesters();
        updateBreadcrumbs();
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Main container click delegation
        elements.visualizationContainer.addEventListener('click', handleContainerClick);
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filterType = btn.dataset.filter;
                toggleFilter(filterType);
                btn.classList.toggle('active');
            });
        });
        
        // Search functionality
        elements.searchBtn.addEventListener('click', performSearch);
        elements.courseSearch.addEventListener('keyup', e => {
            if (e.key === 'Enter') performSearch();
        });
        
        // Semester filter
        elements.semesterFilter.addEventListener('change', () => {
            state.selectedSemester = elements.semesterFilter.value;
            if (state.navigationStack.length === 0) {
                renderSemesters();
            } else if (state.navigationStack[state.navigationStack.length - 1].type === 'semester') {
                renderCourses(state.navigationStack[state.navigationStack.length - 1].id);
            }
        });
        
        // Credits range sliders
        elements.creditsMinSlider.addEventListener('input', updateCreditsRange);
        elements.creditsMaxSlider.addEventListener('input', updateCreditsRange);
        
        // Modal close button
        document.querySelector('.close-modal').addEventListener('click', () => {
            elements.courseModal.classList.remove('show');
        });
        
        // Close modal when clicking outside
        elements.courseModal.addEventListener('click', e => {
            if (e.target === elements.courseModal) {
                elements.courseModal.classList.remove('show');
            }
        });
        
        // Breadcrumb navigation
        elements.breadcrumbContainer.addEventListener('click', e => {
            const item = e.target.closest('.breadcrumb-item');
            if (item && !item.classList.contains('active')) {
                const index = Array.from(elements.breadcrumbContainer.children).indexOf(item);
                navigateToBreadcrumb(index);
            }
        });
        
        // History list navigation
        elements.historyList.addEventListener('click', e => {
            const item = e.target.closest('li');
            if (item) {
                const type = item.dataset.type;
                const id = item.dataset.id;
                navigateToHistoryItem(type, id);
            }
        });
    }

    /**
     * Populate the semester filter dropdown
     */
    function populateSemesterFilter() {
        const semesters = [...new Set(courses.map(c => c.semester))]
            .filter(s => s !== undefined)
            .sort((a, b) => a - b);
        
        let options = '<option value="all">All Semesters</option>';
        semesters.forEach(sem => {
            options += `<option value="${sem}">Semester ${sem}</option>`;
        });
        
        elements.semesterFilter.innerHTML = options;
    }

    /**
     * Update the credits range display and filter courses
     */
    function updateCreditsRange() {
        const minValue = parseInt(elements.creditsMinSlider.value);
        const maxValue = parseInt(elements.creditsMaxSlider.value);
        
        // Ensure min doesn't exceed max
        if (minValue > maxValue) {
            if (this === elements.creditsMinSlider) {
                elements.creditsMinSlider.value = maxValue;
                state.creditsRange.min = maxValue;
            } else {
                elements.creditsMaxSlider.value = minValue;
                state.creditsRange.max = minValue;
            }
        } else {
            state.creditsRange.min = minValue;
            state.creditsRange.max = maxValue;
        }
        
        elements.creditsMinValue.textContent = state.creditsRange.min;
        elements.creditsMaxValue.textContent = state.creditsRange.max;
        
        // Re-render current view with new filters
        if (state.navigationStack.length === 0) {
            renderSemesters();
        } else if (state.navigationStack[state.navigationStack.length - 1].type === 'semester') {
            renderCourses(state.navigationStack[state.navigationStack.length - 1].id);
        }
    }

    /**
     * Perform search based on the search input
     */
    function performSearch() {
        const query = elements.courseSearch.value.trim().toLowerCase();
        if (!query) return;
        
        state.searchResults = courses.filter(course => 
            course.code.toLowerCase().includes(query) || 
            course.name.toLowerCase().includes(query)
        );
        
        if (state.searchResults.length > 0) {
            renderSearchResults();
            addToNavigationStack({ type: 'search', id: query });
            updateBreadcrumbs();
            updateHistoryList();
        } else {
            // Show no results message
            elements.semesterContainer.innerHTML = `
                <div class="no-results">
                    <h3>No courses found matching "${query}"</h3>
                    <button class="back-btn">← Back</button>
                </div>
            `;
        }
    }

    /**
     * Handle clicks on the main container
     */
    function handleContainerClick(e) {
        const target = e.target;
        
        // Back button
        if (target.closest('.back-btn')) {
            handleNavigationBack();
            return;
        }
        
        // Semester card
        if (target.closest('.semester-card')) {
            const card = target.closest('.semester-card');
            handleSemesterNavigation(card);
            return;
        }
        
        // Course card
        if (target.closest('.course-card')) {
            const card = target.closest('.course-card');
            if (card.classList.contains('tree-node')) {
                // If it's a tree node in the hierarchy view
                handleCourseNavigation(card);
            } else {
                // If it's a course in the course list view
                handleCourseNavigation(card);
            }
            return;
        }
    }

    /**
     * Handle navigation to a semester
     */
    function handleSemesterNavigation(card) {
        const semester = parseInt(card.dataset.semester, 10);
        addToNavigationStack({ type: 'semester', id: semester });
        renderCourses(semester);
        updateBreadcrumbs();
        updateHistoryList();
    }

    /**
     * Handle navigation to a course
     */
    function handleCourseNavigation(card) {
        const courseCode = card.dataset.code;
        if (!courseCode || !courses.some(c => c.code === courseCode)) return;
        
        // If clicked on a course in the hierarchy view, show course details
        if (card.classList.contains('tree-node')) {
            showCourseDetails(courseCode);
            return;
        }
        
        addToNavigationStack({ type: 'course', id: courseCode });
        renderCourseHierarchy(courseCode);
        updateBreadcrumbs();
        updateHistoryList();
    }

    /**
     * Show course details in a modal
     */
    function showCourseDetails(courseCode) {
        const course = courses.find(c => c.code === courseCode);
        if (!course) return;
        
        elements.modalContent.innerHTML = `
            <div class="course-details">
                <div class="course-header">
                    <span class="course-code">${course.code}</span>
                    <h3>${course.name}</h3>
                </div>
                <div class="course-info">
                    <div class="info-item">
                        <span class="label">Semester:</span>
                        <span class="value">${course.semester}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Credits:</span>
                        <span class="value">${course.credits}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Prerequisites:</span>
                        <div class="value prereq-list">
                            ${course.prerequisites.length > 0 ? 
                                course.prerequisites.map(code => {
                                    const prereq = courses.find(c => c.code === code);
                                    return prereq ? 
                                        `<span class="prereq-tag" data-code="${prereq.code}">${prereq.code}: ${prereq.name}</span>` : 
                                        `<span class="prereq-tag">${code}</span>`;
                                }).join('') : 
                                '<span class="none-text">None</span>'
                            }
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="label">Required For:</span>
                        <div class="value prereq-list">
                            ${course.requiredFor.length > 0 ? 
                                course.requiredFor.map(c => 
                                    `<span class="prereq-tag" data-code="${c.code}">${c.code}: ${c.name}</span>`
                                ).join('') : 
                                '<span class="none-text">None</span>'
                            }
                        </div>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="view-hierarchy-btn" data-code="${course.code}">View in Hierarchy</button>
                </div>
            </div>
        `;
        
        // Add event listener to the view hierarchy button
        const viewBtn = elements.modalContent.querySelector('.view-hierarchy-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                elements.courseModal.classList.remove('show');
                addToNavigationStack({ type: 'course', id: course.code });
                renderCourseHierarchy(course.code);
                updateBreadcrumbs();
                updateHistoryList();
            });
        }
        
        // Add event listeners to prerequisite tags
        elements.modalContent.querySelectorAll('.prereq-tag').forEach(tag => {
            const code = tag.dataset.code;
            if (code) {
                tag.addEventListener('click', () => {
                    elements.courseModal.classList.remove('show');
                    showCourseDetails(code);
                });
            }
        });
        
        elements.courseModal.classList.add('show');
    }

    /**
     * Handle navigation back
     */
    function handleNavigationBack() {
        if (state.navigationStack.length <= 1) {
            // If at the root or only one level deep, go back to semesters
            state.navigationStack = [];
            renderSemesters();
        } else {
            // Remove the current view and go back to the previous one
            state.navigationStack.pop();
            renderPreviousView();
        }
        
        updateBreadcrumbs();
        updateHistoryList();
    }

    /**
     * Render the previous view based on navigation stack
     */
    function renderPreviousView() {
        const current = state.navigationStack[state.navigationStack.length - 1];
        
        if (!current) {
            renderSemesters();
            return;
        }
        
        switch (current.type) {
            case 'semester':
                renderCourses(current.id);
                break;
            case 'course':
                renderCourseHierarchy(current.id);
                break;
            case 'search':
                renderSearchResults();
                break;
            default:
                renderSemesters();
        }
    }

    /**
     * Add an item to the navigation stack
     */
    function addToNavigationStack(item) {
        // If navigating to the same item, don't add it again
        const current = state.navigationStack[state.navigationStack.length - 1];
        if (current && current.type === item.type && current.id === item.id) {
            return;
        }
        
        state.navigationStack.push(item);
    }

    /**
     * Update breadcrumbs based on navigation stack
     */
    function updateBreadcrumbs() {
        let breadcrumbHTML = `<span class="breadcrumb-item ${state.navigationStack.length === 0 ? 'active' : ''}" data-index="0">Home</span>`;
        
        state.navigationStack.forEach((item, index) => {
            let label = '';
            
            switch (item.type) {
                case 'semester':
                    label = `Semester ${item.id}`;
                    break;
                case 'course':
                    const course = courses.find(c => c.code === item.id);
                    label = course ? `${course.code}: ${course.name}` : item.id;
                    break;
                case 'search':
                    label = `Search: "${item.id}"`;
                    break;
                default:
                    label = item.id;
            }
            
            breadcrumbHTML += `<span class="breadcrumb-item ${index === state.navigationStack.length - 1 ? 'active' : ''}" data-index="${index + 1}">${label}</span>`;
        });
        
        elements.breadcrumbContainer.innerHTML = breadcrumbHTML;
    }

    /**
     * Update history list based on navigation stack
     */
    function updateHistoryList() {
        // Create a copy of the navigation stack in reverse order (most recent first)
        const history = [...state.navigationStack].reverse().slice(0, state.historyLimit);
        
        let historyHTML = '';
        history.forEach(item => {
            let label = '';
            
            switch (item.type) {
                case 'semester':
                    label = `Semester ${item.id}`;
                    break;
                case 'course':
                    const course = courses.find(c => c.code === item.id);
                    label = course ? `${course.code}: ${course.name}` : item.id;
                    break;
                case 'search':
                    label = `Search: "${item.id}"`;
                    break;
                default:
                    label = item.id;
            }
            
            historyHTML += `<li data-type="${item.type}" data-id="${item.id}">${label}</li>`;
        });
        
        elements.historyList.innerHTML = historyHTML;
    }

    /**
     * Navigate to a breadcrumb item
     */
    function navigateToBreadcrumb(index) {
        if (index === 0) {
            // Home
            state.navigationStack = [];
            renderSemesters();
        } else {
            // Truncate navigation stack to the selected breadcrumb
            state.navigationStack = state.navigationStack.slice(0, index);
            renderPreviousView();
        }
        
        updateBreadcrumbs();
        updateHistoryList();
    }

    /**
     * Navigate to a history item
     */
    function navigateToHistoryItem(type, id) {
        // Find the item in the navigation stack
        const index = state.navigationStack.findIndex(item => item.type === type && item.id === id);
        
        if (index !== -1) {
            // Item exists in navigation stack, navigate to it
            state.navigationStack = state.navigationStack.slice(0, index + 1);
            renderPreviousView();
        } else {
            // Item doesn't exist in navigation stack, add it
            addToNavigationStack({ type, id });
            
            switch (type) {
                case 'semester':
                    renderCourses(parseInt(id, 10));
                    break;
                case 'course':
                    renderCourseHierarchy(id);
                    break;
                case 'search':
                    elements.courseSearch.value = id;
                    performSearch();
                    break;
                default:
                    renderSemesters();
            }
        }
        
        updateBreadcrumbs();
        updateHistoryList();
    }

    /**
     * Toggle a filter
     */
    function toggleFilter(filterType) {
        state.activeFilters[filterType] = !state.activeFilters[filterType];
        
        // If in course hierarchy view, re-render
        const currentItem = state.navigationStack[state.navigationStack.length - 1];
        if (currentItem && currentItem.type === 'course') {
            renderCourseHierarchy(currentItem.id);
        }
    }

    /**
     * Filter courses based on current filters
     */
    function filterCourses(courseList) {
        return courseList.filter(course => {
            // Filter by semester
            if (state.selectedSemester !== 'all' && course.semester !== parseInt(state.selectedSemester, 10)) {
                return false;
            }
            
            // Filter by credits
            if (course.credits < state.creditsRange.min || course.credits > state.creditsRange.max) {
                return false;
            }
            
            return true;
        });
    }

    /**
     * Render the semesters view
     */
    function renderSemesters() {
        const container = elements.semesterContainer;
        
        // Start transition
        container.classList.add('view-exit');
        
        setTimeout(() => {
            const semesters = [...new Set(courses.map(c => c.semester))]
                .filter(s => s !== undefined)
                .sort((a, b) => a - b);
            
            container.innerHTML = `
                <div class="semester-grid">
                    ${semesters.map(sem => {
                        const semesterCourses = filterCourses(courses.filter(c => c.semester === sem));
                        const totalCredits = semesterCourses.reduce((sum, c) => sum + c.credits, 0);
                        
                        return `
                            <div class="semester-card" data-semester="${sem}">
                                <h3>Semester ${sem}</h3>
                                <div class="semester-stats">
                                    <span>${semesterCourses.length} Courses</span>
                                    <span>${totalCredits} Credits</span>
                                </div>
                                <div class="progress-bar">
                                    <div style="width: ${(sem/10)*100}%"></div>
                                </div>
                                <div class="course-codes">
                                    ${semesterCourses.slice(0, 4).map(c => `
                                        <div class="course-code-tag">${c.code}</div>
                                    `).join('')}
                                    ${semesterCourses.length > 4 ? 
                                        `<div class="more-courses">+${semesterCourses.length - 4} more</div>` : ''}
                                </div>
                            </div>`;
                    }).join('')}
                </div>`;
            
            // Animate entrance
            container.classList.remove('view-exit');
            container.classList.add('view-enter');
            
            setTimeout(() => container.classList.remove('view-enter'), 300);
        }, 300);
    }

    /**
     * Render courses for a specific semester
     */
    function renderCourses(semester) {
        const container = elements.semesterContainer;
        
        // Start transition
        container.classList.add('view-exit');
        
        setTimeout(() => {
            const semesterCourses = filterCourses(courses.filter(c => c.semester === semester));
            
            container.innerHTML = `
                <button class="back-btn">← Back</button>
                <h2>Semester ${semester} Courses</h2>
                <div class="course-list">
                    ${semesterCourses.map(course => `
                        <div class="course-card" data-code="${course.code}">
                            <div class="course-code">${course.code}</div>
                            <h4>${course.name}</h4>
                            <div class="meta">
                                <span>${course.credits} Credits</span>
                                <span>${course.prerequisites.length > 0 ? 
                                    `${course.prerequisites.length} Prereq${course.prerequisites.length > 1 ? 's' : ''}` : 
                                    'No Prereqs'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
            
            // Animate entrance
            container.classList.remove('view-exit');
            container.classList.add('view-enter');
            
            setTimeout(() => container.classList.remove('view-enter'), 300);
        }, 300);
    }

    /**
     * Render search results
     */
    function renderSearchResults() {
        const container = elements.semesterContainer;
        
        // Start transition
        container.classList.add('view-exit');
        
        setTimeout(() => {
            const filteredResults = filterCourses(state.searchResults);
            
            container.innerHTML = `
                <button class="back-btn">← Back</button>
                <h2>Search Results (${filteredResults.length})</h2>
                <div class="course-list">
                    ${filteredResults.map(course => `
                        <div class="course-card" data-code="${course.code}">
                            <div class="course-code">${course.code}</div>
                            <h4>${course.name}</h4>
                            <div class="meta">
                                <span>Semester ${course.semester}</span>
                                <span>${course.credits} Credits</span>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
            
            // Animate entrance
            container.classList.remove('view-exit');
            container.classList.add('view-enter');
            
            setTimeout(() => container.classList.remove('view-enter'), 300);
        }, 300);
    }

    /**
     * Render the course hierarchy visualization
     */
    function renderCourseHierarchy(code) {
        const container = elements.semesterContainer;
        const course = courses.find(c => c.code === code);
        
        if (!course) return;
        
        // Start transition
        container.classList.add('view-exit');
        
        setTimeout(() => {
            container.innerHTML = `
                <button class="back-btn">← Back</button>
                <h2>Course Hierarchy: ${course.code}</h2>
                <div class="hierarchy-view">
                    <div class="tree-container" id="tree-container"></div>
                </div>`;
            
            const treeContainer = document.getElementById('tree-container');
            
            // Render the core node (selected course)
            renderCoreNode(treeContainer, course);
            
            // Render child nodes (prerequisites and required courses)
            renderChildNodes(treeContainer, course);
            
            // Animate entrance
            container.classList.remove('view-exit');
            container.classList.add('view-enter');
            
            setTimeout(() => {
                container.classList.remove('view-enter');
                
                // Animate connections after nodes are rendered
                animateConnections();
            }, 300);
        }, 300);
    }

    /**
     * Render the core node (selected course)
     */
    function renderCoreNode(container, course) {
        const coreNode = document.createElement('div');
        coreNode.className = 'tree-node core-node course-card';
        coreNode.dataset.code = course.code;
        coreNode.innerHTML = `
            <div class="course-code">${course.code}</div>
            <h4>${course.name}</h4>
            <div class="meta">
                <span>${course.credits} Credits</span>
                <span>Semester ${course.semester}</span>
            </div>`;
        
        container.appendChild(coreNode);
        
        // Add tooltip
        coreNode.addEventListener('mouseenter', () => {
            showTooltip(coreNode, `${course.code}: ${course.name}<br>Semester ${course.semester}, ${course.credits} Credits`);
        });
        
        coreNode.addEventListener('mouseleave', hideTooltip);
    }

    /**
     * Render child nodes (prerequisites and required courses)
     */
    function renderChildNodes(container, course) {
        // Clear existing connections
        state.currentConnections.forEach(c => c.remove());
        state.currentConnections = [];
        
        const coreNode = container.querySelector('.core-node');
        const coreRect = coreNode.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Calculate center position of core node relative to container
        const coreX = coreRect.left - containerRect.left + coreRect.width / 2;
        const coreY = coreRect.top - containerRect.top + coreRect.height / 2;
        
        // Render prerequisites (if filter is active)
        if (state.activeFilters.prerequisites && course.recentPrerequisites.length > 0) {
            const prereqCount = course.recentPrerequisites.length;
            const angleStep = Math.PI / (prereqCount + 1);
            const radius = Math.min(containerRect.width, containerRect.height) * 0.35;
            
            course.recentPrerequisites.forEach((prereq, i) => {
                // Calculate position in a semi-circle above the core node
                const angle = Math.PI + angleStep * (i + 1);
                const x = coreX + radius * Math.cos(angle);
                const y = coreY + radius * Math.sin(angle);
                
                renderTreeNode(container, prereq, x, y, 'prerequisite');
                createConnection(coreX, coreY, x, y, 'prerequisite');
            });
        }
        
        // Render required courses (if filter is active)
        if (state.activeFilters.requiredFor && course.requiredFor.length > 0) {
            const requiredCount = course.requiredFor.length;
            const angleStep = Math.PI / (requiredCount + 1);
            const radius = Math.min(containerRect.width, containerRect.height) * 0.35;
            
            course.requiredFor.forEach((required, i) => {
                // Calculate position in a semi-circle below the core node
                const angle = angleStep * (i + 1);
                const x = coreX + radius * Math.cos(angle);
                const y = coreY + radius * Math.sin(angle);
                
                renderTreeNode(container, required, x, y, 'required');
                createConnection(coreX, coreY, x, y, 'required');
            });
        }
    }

    /**
     * Render a tree node
     */
    function renderTreeNode(container, course, x, y, type) {
        const nodeElement = document.createElement('div');
        nodeElement.className = `tree-node ${type}-node course-card`;
        nodeElement.style.left = `${x - 140}px`; // Half of node width (280px)
        nodeElement.style.top = `${y - 60}px`; // Half of approximate node height
        nodeElement.dataset.code = course.code;
        nodeElement.innerHTML = `
            <div class="course-code">${course.code}</div>
            <h4>${course.name}</h4>
            <div class="meta">
                <span>${course.credits} Credits</span>
                <span>Semester ${course.semester}</span>
            </div>`;
        
        container.appendChild(nodeElement);
        
        // Add tooltip
        nodeElement.addEventListener('mouseenter', () => {
            showTooltip(nodeElement, `${course.code}: ${course.name}<br>Semester ${course.semester}, ${course.credits} Credits`);
        });
        
        nodeElement.addEventListener('mouseleave', hideTooltip);
        
        // Add animation delay based on distance from core
        nodeElement.style.animationDelay = `${Math.random() * 0.3}s`;
    }

    /**
     * Create a connection line between nodes
     */
    function createConnection(fromX, fromY, toX, toY, type) {
        const container = document.querySelector('.tree-container');
        const line = document.createElement('div');
        line.className = `node-connection ${type}-connection`;
        
        // Calculate line properties
        const dx = toX - fromX;
        const dy = toY - fromY;
        const length = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Position and rotate the line
        line.style.width = `${length}px`;
        line.style.height = '2px';
        line.style.left = `${fromX}px`;
        line.style.top = `${fromY}px`;
        line.style.transform = `rotate(${angle}deg)`;
        
        container.appendChild(line);
        state.currentConnections.push(line);
    }

    /**
     * Animate connections after nodes are rendered
     */
    function animateConnections() {
        // Add visible class to connections with a delay
        state.currentConnections.forEach((connection, index) => {
            setTimeout(() => {
                connection.classList.add('visible');
            }, 300 + index * 100);
        });
    }

    /**
     * Show tooltip for a node
     */
    function showTooltip(element, content) {
        // Clear any existing tooltip timeout
        if (state.tooltipTimeout) {
            clearTimeout(state.tooltipTimeout);
        }
        
        // Remove any existing tooltip
        const existingTooltip = document.querySelector('.tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        // Create new tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = content;
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        
        // Show tooltip with a slight delay
        state.tooltipTimeout = setTimeout(() => {
            tooltip.classList.add('show');
        }, 200);
    }

    /**
     * Hide tooltip
     */
    function hideTooltip() {
        // Clear any existing tooltip timeout
        if (state.tooltipTimeout) {
            clearTimeout(state.tooltipTimeout);
        }
        
        // Hide tooltip
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
            
            // Remove tooltip after animation
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        }
    }

    // Initialize the application
    initialize();
});
