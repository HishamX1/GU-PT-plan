/**
 * Advanced Filtering Functionality for Physical Therapy Program Study Plan
 * 
 * This file implements comprehensive filtering capabilities for the course visualization,
 * allowing students to easily access prerequisites and required courses.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Filtering controller object
    const filters = {
        // Filter state
        state: {
            activeFilters: {
                prerequisites: true,
                requiredFor: true
            },
            semesterFilter: 'all',
            creditsRange: { min: 1, max: 8 },
            searchQuery: '',
            tagFilters: []
        },
        
        // Initialize filters
        init() {
            this.setupFilterControls();
            this.setupEventListeners();
            this.createFilterTags();
        },
        
        // Set up filter control elements
        setupFilterControls() {
            // Initialize semester filter
            this.populateSemesterFilter();
            
            // Initialize credits range sliders
            this.updateCreditsRangeDisplay();
            
            // Set initial filter button states
            document.querySelectorAll('.filter-btn').forEach(btn => {
                const filterType = btn.dataset.filter;
                btn.classList.toggle('active', this.state.activeFilters[filterType]);
            });
        },
        
        // Set up event listeners for filter controls
        setupEventListeners() {
            // View mode filter buttons
            document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const filterType = btn.dataset.filter;
                    this.toggleFilter(filterType);
                    btn.classList.toggle('active');
                    this.applyFilters();
                });
            });
            
            // Semester filter
            document.getElementById('semester-filter').addEventListener('change', (e) => {
                this.state.semesterFilter = e.target.value;
                this.applyFilters();
            });
            
            // Credits range sliders
            document.getElementById('credits-min').addEventListener('input', (e) => {
                this.updateCreditsRange('min', parseInt(e.target.value));
            });
            
            document.getElementById('credits-max').addEventListener('input', (e) => {
                this.updateCreditsRange('max', parseInt(e.target.value));
            });
            
            // Search functionality
            document.getElementById('search-btn').addEventListener('click', () => {
                this.performSearch();
            });
            
            document.getElementById('course-search').addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
            
            // Clear filters button
            document.getElementById('clear-filters-btn').addEventListener('click', () => {
                this.clearAllFilters();
            });
            
            // Tag filters
            document.getElementById('tag-filters').addEventListener('click', (e) => {
                const tagBtn = e.target.closest('.tag-filter');
                if (tagBtn) {
                    this.toggleTagFilter(tagBtn.dataset.tag);
                    tagBtn.classList.toggle('active');
                    this.applyFilters();
                }
            });
        },
        
        // Populate semester filter dropdown
        populateSemesterFilter() {
            const semesterFilter = document.getElementById('semester-filter');
            if (!semesterFilter) return;
            
            const semesters = [...new Set(courses.map(c => c.semester))]
                .filter(s => s !== undefined)
                .sort((a, b) => a - b);
            
            let options = '<option value="all">All Semesters</option>';
            semesters.forEach(sem => {
                options += `<option value="${sem}">Semester ${sem}</option>`;
            });
            
            semesterFilter.innerHTML = options;
        },
        
        // Update credits range filter
        updateCreditsRange(type, value) {
            if (type === 'min') {
                // Ensure min doesn't exceed max
                if (value > this.state.creditsRange.max) {
                    value = this.state.creditsRange.max;
                    document.getElementById('credits-min').value = value;
                }
                this.state.creditsRange.min = value;
            } else {
                // Ensure max isn't less than min
                if (value < this.state.creditsRange.min) {
                    value = this.state.creditsRange.min;
                    document.getElementById('credits-max').value = value;
                }
                this.state.creditsRange.max = value;
            }
            
            this.updateCreditsRangeDisplay();
            this.applyFilters();
        },
        
        // Update credits range display
        updateCreditsRangeDisplay() {
            const minValue = document.getElementById('credits-min-value');
            const maxValue = document.getElementById('credits-max-value');
            
            if (minValue && maxValue) {
                minValue.textContent = this.state.creditsRange.min;
                maxValue.textContent = this.state.creditsRange.max;
            }
        },
        
        // Toggle a filter
        toggleFilter(filterType) {
            this.state.activeFilters[filterType] = !this.state.activeFilters[filterType];
        },
        
        // Toggle a tag filter
        toggleTagFilter(tag) {
            const index = this.state.tagFilters.indexOf(tag);
            if (index === -1) {
                this.state.tagFilters.push(tag);
            } else {
                this.state.tagFilters.splice(index, 1);
            }
        },
        
        // Perform search based on search input
        performSearch() {
            const searchInput = document.getElementById('course-search');
            if (!searchInput) return;
            
            this.state.searchQuery = searchInput.value.trim().toLowerCase();
            
            if (this.state.searchQuery) {
                // If in a course view, apply filters to current view
                if (window.app && window.app.state.navigationStack.length > 0) {
                    this.applyFilters();
                } else {
                    // Otherwise, perform global search
                    this.performGlobalSearch();
                }
            }
        },
        
        // Perform global search across all courses
        performGlobalSearch() {
            if (!this.state.searchQuery) return;
            
            const searchResults = this.filterCourses(courses);
            
            if (window.app) {
                window.app.renderSearchResults(searchResults, this.state.searchQuery);
            }
        },
        
        // Apply all active filters to current view
        applyFilters() {
            // If in course hierarchy view
            if (window.app && window.app.state.navigationStack.length > 0) {
                const currentView = window.app.state.navigationStack[window.app.state.navigationStack.length - 1];
                
                if (currentView.type === 'course') {
                    window.app.renderCourseHierarchy(currentView.id);
                } else if (currentView.type === 'semester') {
                    window.app.renderCourses(currentView.id);
                } else if (currentView.type === 'search') {
                    this.performGlobalSearch();
                }
            } else {
                // If in semester view
                if (window.app && typeof window.app.renderSemesters === 'function') {
                    window.app.renderSemesters();
                }
            }
        },
        
        // Filter courses based on all active filters
        filterCourses(courseList) {
            return courseList.filter(course => {
                // Filter by semester
                if (this.state.semesterFilter !== 'all' && 
                    course.semester !== parseInt(this.state.semesterFilter, 10)) {
                    return false;
                }
                
                // Filter by credits
                if (course.credits < this.state.creditsRange.min || 
                    course.credits > this.state.creditsRange.max) {
                    return false;
                }
                
                // Filter by search query
                if (this.state.searchQuery) {
                    const matchesCode = course.code.toLowerCase().includes(this.state.searchQuery);
                    const matchesName = course.name.toLowerCase().includes(this.state.searchQuery);
                    
                    if (!matchesCode && !matchesName) {
                        return false;
                    }
                }
                
                // Filter by tags
                if (this.state.tagFilters.length > 0) {
                    // Extract course tags (could be from prerequisites, semester, etc.)
                    const courseTags = this.getCourseTags(course);
                    
                    // Check if course has any of the selected tags
                    const hasMatchingTag = this.state.tagFilters.some(tag => 
                        courseTags.includes(tag)
                    );
                    
                    if (!hasMatchingTag) {
                        return false;
                    }
                }
                
                return true;
            });
        },
        
        // Get tags for a course (for tag filtering)
        getCourseTags(course) {
            const tags = [];
            
            // Add semester as tag
            tags.push(`semester-${course.semester}`);
            
            // Add credit range as tag
            if (course.credits <= 2) tags.push('credits-low');
            else if (course.credits <= 4) tags.push('credits-medium');
            else tags.push('credits-high');
            
            // Add prerequisite status as tag
            if (course.prerequisites.length === 0) tags.push('no-prerequisites');
            else tags.push('has-prerequisites');
            
            // Add required-for status as tag
            if (course.requiredFor.length === 0) tags.push('not-required');
            else tags.push('is-required');
            
            // Add course type tags based on code prefix
            const prefix = course.code.match(/^[A-Z]+/);
            if (prefix) tags.push(`prefix-${prefix[0].toLowerCase()}`);
            
            return tags;
        },
        
        // Create filter tags for common course attributes
        createFilterTags() {
            const tagContainer = document.getElementById('tag-filters');
            if (!tagContainer) return;
            
            // Get unique prefixes
            const prefixes = [...new Set(courses.map(c => {
                const match = c.code.match(/^[A-Z]+/);
                return match ? match[0] : null;
            }))].filter(p => p);
            
            // Create prefix tags
            prefixes.forEach(prefix => {
                const tag = document.createElement('button');
                tag.className = 'tag-filter';
                tag.dataset.tag = `prefix-${prefix.toLowerCase()}`;
                tag.textContent = prefix;
                tagContainer.appendChild(tag);
            });
            
            // Create credit range tags
            ['Low (1-2)', 'Medium (3-4)', 'High (5+)'].forEach((label, index) => {
                const tag = document.createElement('button');
                tag.className = 'tag-filter';
                tag.dataset.tag = ['credits-low', 'credits-medium', 'credits-high'][index];
                tag.textContent = label;
                tagContainer.appendChild(tag);
            });
            
            // Create prerequisite status tags
            const prereqTag = document.createElement('button');
            prereqTag.className = 'tag-filter';
            prereqTag.dataset.tag = 'no-prerequisites';
            prereqTag.textContent = 'No Prerequisites';
            tagContainer.appendChild(prereqTag);
        },
        
        // Clear all filters
        clearAllFilters() {
            // Reset filter state
            this.state.activeFilters = {
                prerequisites: true,
                requiredFor: true
            };
            
            this.state.semesterFilter = 'all';
            this.state.creditsRange = { min: 1, max: 8 };
            this.state.searchQuery = '';
            this.state.tagFilters = [];
            
            // Reset UI elements
            document.getElementById('semester-filter').value = 'all';
            document.getElementById('credits-min').value = 1;
            document.getElementById('credits-max').value = 8;
            document.getElementById('course-search').value = '';
            
            // Reset filter buttons
            document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
                const filterType = btn.dataset.filter;
                btn.classList.toggle('active', this.state.activeFilters[filterType]);
            });
            
            // Reset tag filters
            document.querySelectorAll('.tag-filter').forEach(tag => {
                tag.classList.remove('active');
            });
            
            this.updateCreditsRangeDisplay();
            this.applyFilters();
        },
        
        // Get current filter state (for external use)
        getFilterState() {
            return { ...this.state };
        }
    };
    
    // Initialize filters when DOM is loaded
    filters.init();
    
    // Make filters available globally
    window.ptFilters = filters;
});