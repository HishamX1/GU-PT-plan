/**
 * Responsive Testing Module for Physical Therapy Program Study Plan
 * 
 * This file contains testing utilities to verify the website's functionality
 * across different screen sizes and ensure course relationships are displayed correctly.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Testing controller object
    const tester = {
        // Test configuration
        config: {
            screenSizes: [
                { name: 'Mobile', width: 375, height: 667 },
                { name: 'Tablet', width: 768, height: 1024 },
                { name: 'Laptop', width: 1366, height: 768 },
                { name: 'Desktop', width: 1920, height: 1080 }
            ],
            testCourses: [
                // Courses with complex prerequisite chains
                'BPT217', // Therapeutic Modalities - has multiple prerequisites
                'PTM322', // Cardiopulmonary - has many prerequisites
                'PTN552', // Neurology PT - complex chain
                // Courses with no prerequisites
                'BMS115', // Anatomy 1
                // Courses that are prerequisites for many others
                'BMS116', // Anatomy 2
                'BPT112'  // Kinesiology 1
            ]
        },
        
        // Test results storage
        results: {
            responsive: {},
            relationships: {},
            passed: 0,
            failed: 0,
            warnings: 0
        },
        
        // Initialize testing
        init() {
            console.log('🧪 Test Suite Initialized');
            this.setupTestingInterface();
        },
        
        // Set up testing interface
        setupTestingInterface() {
            // Create testing panel if in development mode
            if (this.isDevelopmentMode()) {
                this.createTestingPanel();
            }
        },
        
        // Check if in development mode
        isDevelopmentMode() {
            return window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.search.includes('testing=true');
        },
        
        // Create testing panel UI
        createTestingPanel() {
            const panel = document.createElement('div');
            panel.className = 'testing-panel';
            panel.innerHTML = `
                <div class="testing-header">
                    <h3>Testing Panel</h3>
                    <button id="close-testing-panel">×</button>
                </div>
                <div class="testing-content">
                    <div class="test-group">
                        <h4>Responsive Testing</h4>
                        <div class="test-buttons">
                            ${this.config.screenSizes.map(size => 
                                `<button class="test-btn responsive-test" data-width="${size.width}" data-height="${size.height}">
                                    ${size.name} (${size.width}×${size.height})
                                </button>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="test-group">
                        <h4>Relationship Testing</h4>
                        <div class="test-buttons">
                            <button class="test-btn" id="test-all-relationships">Test All Relationships</button>
                            <button class="test-btn" id="test-sample-courses">Test Sample Courses</button>
                        </div>
                    </div>
                    <div class="test-results">
                        <h4>Test Results</h4>
                        <div id="test-results-content">Run tests to see results</div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(panel);
            
            // Add event listeners
            document.getElementById('close-testing-panel').addEventListener('click', () => {
                panel.classList.toggle('minimized');
            });
            
            document.querySelectorAll('.responsive-test').forEach(btn => {
                btn.addEventListener('click', () => {
                    const width = parseInt(btn.dataset.width);
                    const height = parseInt(btn.dataset.height);
                    this.testResponsiveness(width, height);
                });
            });
            
            document.getElementById('test-all-relationships').addEventListener('click', () => {
                this.testAllRelationships();
            });
            
            document.getElementById('test-sample-courses').addEventListener('click', () => {
                this.testSampleCourses();
            });
        },
        
        // Test responsiveness for a specific screen size
        testResponsiveness(width, height) {
            console.log(`🧪 Testing responsiveness at ${width}×${height}`);
            
            // Store original dimensions
            const originalWidth = window.innerWidth;
            const originalHeight = window.innerHeight;
            
            // Simulate resize
            this.simulateResize(width, height);
            
            // Check UI elements
            setTimeout(() => {
                const results = this.checkResponsiveElements();
                
                // Store results
                this.results.responsive[`${width}x${height}`] = results;
                
                // Display results
                this.displayResults('responsive', `${width}×${height}`, results);
                
                // Restore original dimensions
                this.simulateResize(originalWidth, originalHeight);
            }, 500);
        },
        
        // Simulate window resize
        simulateResize(width, height) {
            // Create a resize event
            const resizeEvent = new Event('resize');
            
            // Override window inner dimensions
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: width
            });
            
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: height
            });
            
            // Dispatch the event
            window.dispatchEvent(resizeEvent);
        },
        
        // Check responsive elements
        checkResponsiveElements() {
            const results = {
                passed: [],
                failed: [],
                warnings: []
            };
            
            // Check header
            const header = document.querySelector('.gu-header');
            if (header) {
                if (window.innerWidth < 768 && header.offsetHeight < 100) {
                    results.warnings.push('Header might be too small on mobile');
                } else {
                    results.passed.push('Header displays correctly');
                }
            } else {
                results.failed.push('Header not found');
            }
            
            // Check sidebar
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                if (window.innerWidth < 768 && getComputedStyle(sidebar).position === 'sticky') {
                    results.warnings.push('Sidebar should not be sticky on mobile');
                } else {
                    results.passed.push('Sidebar positioning is appropriate');
                }
            } else {
                results.failed.push('Sidebar not found');
            }
            
            // Check visualization container
            const vizContainer = document.querySelector('.visualization-container');
            if (vizContainer) {
                if (vizContainer.scrollWidth > window.innerWidth) {
                    results.failed.push('Visualization container overflows screen width');
                } else {
                    results.passed.push('Visualization container fits within screen');
                }
            } else {
                results.failed.push('Visualization container not found');
            }
            
            // Check semester grid
            const semesterGrid = document.querySelector('.semester-grid');
            if (semesterGrid) {
                const gridStyle = getComputedStyle(semesterGrid);
                if (gridStyle.display === 'grid') {
                    results.passed.push('Semester grid uses CSS Grid layout');
                } else {
                    results.warnings.push('Semester grid should use CSS Grid layout');
                }
            }
            
            // Update overall counts
            this.results.passed += results.passed.length;
            this.results.failed += results.failed.length;
            this.results.warnings += results.warnings.length;
            
            return results;
        },
        
        // Test all course relationships
        testAllRelationships() {
            console.log('🧪 Testing all course relationships');
            
            const results = {
                passed: [],
                failed: [],
                warnings: []
            };
            
            // Check if all courses have requiredFor property
            const missingRequiredFor = courses.filter(c => !c.requiredFor);
            if (missingRequiredFor.length > 0) {
                results.failed.push(`${missingRequiredFor.length} courses missing requiredFor property`);
            } else {
                results.passed.push('All courses have requiredFor property');
            }
            
            // Check if all courses have recentPrerequisites property
            const missingRecentPrereqs = courses.filter(c => !c.recentPrerequisites);
            if (missingRecentPrereqs.length > 0) {
                results.failed.push(`${missingRecentPrereqs.length} courses missing recentPrerequisites property`);
            } else {
                results.passed.push('All courses have recentPrerequisites property');
            }
            
            // Verify bidirectional relationships
            let bidirectionalErrors = 0;
            
            courses.forEach(course => {
                // For each prerequisite, check if this course is in its requiredFor list
                if (course.prerequisites) {
                    course.prerequisites.forEach(prereqCode => {
                        const prereq = courses.find(c => c.code === prereqCode);
                        if (prereq && prereq.requiredFor) {
                            if (!prereq.requiredFor.some(c => c.code === course.code)) {
                                bidirectionalErrors++;
                                console.error(`Relationship error: ${prereqCode} should have ${course.code} in its requiredFor list`);
                            }
                        }
                    });
                }
            });
            
            if (bidirectionalErrors > 0) {
                results.failed.push(`${bidirectionalErrors} bidirectional relationship errors found`);
            } else {
                results.passed.push('All bidirectional relationships are valid');
            }
            
            // Verify recent prerequisites logic
            let recentPrereqErrors = 0;
            
            courses.forEach(course => {
                if (course.prerequisites && course.prerequisites.length > 0 && course.recentPrerequisites) {
                    // Get all direct prerequisite course objects
                    const allPrereqs = course.prerequisites
                        .map(code => courses.find(c => c.code === code))
                        .filter(c => c); // Filter out any undefined courses
                    
                    if (allPrereqs.length > 0) {
                        // Find the most recent semester(s)
                        const maxSemester = Math.max(...allPrereqs.map(p => p.semester));
                        
                        // Get prerequisites from the most recent semester
                        const recentPrereqs = allPrereqs.filter(p => p.semester === maxSemester);
                        
                        // Filter out prerequisites that are prerequisites of other prerequisites
                        const expectedRecentPrereqs = recentPrereqs.filter(prereq => {
                            return !recentPrereqs.some(otherPrereq => {
                                if (otherPrereq === prereq) return false;
                                return otherPrereq.prerequisites && 
                                       otherPrereq.prerequisites.includes(prereq.code);
                            });
                        });
                        
                        // Compare with actual recentPrerequisites
                        const actualCodes = course.recentPrerequisites.map(p => p.code).sort();
                        const expectedCodes = expectedRecentPrereqs.map(p => p.code).sort();
                        
                        if (JSON.stringify(actualCodes) !== JSON.stringify(expectedCodes)) {
                            recentPrereqErrors++;
                            console.error(`Recent prerequisites error for ${course.code}:`, 
                                         `Expected: ${expectedCodes.join(', ')}`, 
                                         `Actual: ${actualCodes.join(', ')}`);
                        }
                    }
                }
            });
            
            if (recentPrereqErrors > 0) {
                results.failed.push(`${recentPrereqErrors} recent prerequisites errors found`);
            } else {
                results.passed.push('All recent prerequisites are correctly identified');
            }
            
            // Store results
            this.results.relationships['all'] = results;
            
            // Display results
            this.displayResults('relationships', 'All Courses', results);
        },
        
        // Test sample courses
        testSampleCourses() {
            console.log('🧪 Testing sample courses');
            
            const results = {
                passed: [],
                failed: [],
                warnings: []
            };
            
            // Test each sample course
            this.config.testCourses.forEach(courseCode => {
                const course = courses.find(c => c.code === courseCode);
                
                if (!course) {
                    results.failed.push(`Course ${courseCode} not found`);
                    return;
                }
                
                // Check if course has expected properties
                if (!course.prerequisites) {
                    results.failed.push(`${courseCode} missing prerequisites property`);
                } else {
                    results.passed.push(`${courseCode} has prerequisites property`);
                }
                
                if (!course.requiredFor) {
                    results.failed.push(`${courseCode} missing requiredFor property`);
                } else {
                    results.passed.push(`${courseCode} has requiredFor property`);
                }
                
                if (!course.recentPrerequisites) {
                    results.failed.push(`${courseCode} missing recentPrerequisites property`);
                } else {
                    results.passed.push(`${courseCode} has recentPrerequisites property`);
                }
                
                // For courses with prerequisites, check recent prerequisites logic
                if (course.prerequisites && course.prerequisites.length > 0) {
                    // Verify recent prerequisites logic for this course
                    const allPrereqs = course.prerequisites
                        .map(code => courses.find(c => c.code === code))
                        .filter(c => c);
                    
                    if (allPrereqs.length > 0) {
                        // Find the most recent semester(s)
                        const maxSemester = Math.max(...allPrereqs.map(p => p.semester));
                        
                        // Get prerequisites from the most recent semester
                        const recentPrereqs = allPrereqs.filter(p => p.semester === maxSemester);
                        
                        // Filter out prerequisites that are prerequisites of other prerequisites
                        const expectedRecentPrereqs = recentPrereqs.filter(prereq => {
                            return !recentPrereqs.some(otherPrereq => {
                                if (otherPrereq === prereq) return false;
                                return otherPrereq.prerequisites && 
                                       otherPrereq.prerequisites.includes(prereq.code);
                            });
                        });
                        
                        // Compare with actual recentPrerequisites
                        const actualCodes = course.recentPrerequisites.map(p => p.code).sort();
                        const expectedCodes = expectedRecentPrereqs.map(p => p.code).sort();
                        
                        if (JSON.stringify(actualCodes) !== JSON.stringify(expectedCodes)) {
                            results.failed.push(`${courseCode} has incorrect recent prerequisites`);
                            console.error(`Recent prerequisites error for ${course.code}:`, 
                                         `Expected: ${expectedCodes.join(', ')}`, 
                                         `Actual: ${actualCodes.join(', ')}`);
                        } else {
                            results.passed.push(`${courseCode} has correct recent prerequisites`);
                        }
                    }
                }
            });
            
            // Store results
            this.results.relationships['samples'] = results;
            
            // Display results
            this.displayResults('relationships', 'Sample Courses', results);
        },
        
        // Display test results
        displayResults(type, label, results) {
            const resultsContainer = document.getElementById('test-results-content');
            
            if (!resultsContainer) return;
            
            const resultHTML = `
                <div class="test-result">
                    <h5>${type.charAt(0).toUpperCase() + type.slice(1)} Test: ${label}</h5>
                    <div class="result-summary">
                        <span class="result-passed">✅ ${results.passed.length} passed</span>
                        <span class="result-failed">❌ ${results.failed.length} failed</span>
                        <span class="result-warning">⚠️ ${results.warnings.length} warnings</span>
                    </div>
                    <div class="result-details">
                        ${results.failed.length > 0 ? `
                            <div class="result-section failed">
                                <h6>Failed Tests:</h6>
                                <ul>
                                    ${results.failed.map(msg => `<li>${msg}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${results.warnings.length > 0 ? `
                            <div class="result-section warnings">
                                <h6>Warnings:</h6>
                                <ul>
                                    ${results.warnings.map(msg => `<li>${msg}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${results.passed.length > 0 ? `
                            <div class="result-section passed">
                                <h6>Passed Tests:</h6>
                                <ul>
                                    ${results.passed.map(msg => `<li>${msg}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            resultsContainer.innerHTML = resultHTML;
        },
        
        // Run all tests
        runAllTests() {
            // Test responsiveness for all screen sizes
            this.config.screenSizes.forEach(size => {
                this.testResponsiveness(size.width, size.height);
            });
            
            // Test all relationships
            this.testAllRelationships();
            
            // Test sample courses
            this.testSampleCourses();
        },
        
        // Generate test report
        generateTestReport() {
            const report = {
                timestamp: new Date().toISOString(),
                summary: {
                    passed: this.results.passed,
                    failed: this.results.failed,
                    warnings: this.results.warnings,
                    total: this.results.passed + this.results.failed + this.results.warnings
                },
                responsive: this.results.responsive,
                relationships: this.results.relationships
            };
            
            console.log('📊 Test Report:', report);
            return report;
        }
    };
    
    // Initialize tester if in development mode
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.search.includes('testing=true')) {
        tester.init();
        
        // Make tester available globally
        window.ptTester = tester;
    }
});
