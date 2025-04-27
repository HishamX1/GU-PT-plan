# GU-PT-plan

* This project creates an interactive hierarchical visualization of the Physical Therapy program
 * study plan at Galala University. It shows course prerequisites in a tree structure with smooth
 * transitions and animations.
 * 
 * Features:
 * - Hierarchical tree visualization showing course prerequisites
 * - "Newest prerequisites" logic that only shows the most recent unlocked prerequisites
 * - Smooth animations and transitions between views with minimal lag time
 * - Comprehensive filtering functionality
 * - Interactive UI with tooltips, modals, and navigation history
 * - Responsive design for all device sizes
 * - Galala University branding and design elements
 * 
 * Project Structure:
 * - index.html: Main HTML file
 * - styles.css: Main CSS file with core styles
 * - data.js: Course data structure with prerequisite relationships
 * - app.js: Main application logic
 * - assets/animations.css: Animation styles
 * - assets/animations.js: Animation functionality
 * - assets/filters.css: Filter component styles
 * - assets/filters.js: Filter functionality
 * - assets/galala-theme.css: Galala University theme styles
 * - assets/tester.css: Testing panel styles
 * - assets/tester.js: Testing utilities
 * - assets/images/: Logo and favicon SVG files
 * 
 * Implementation Notes:
 * - The getRecentPrerequisites function in data.js implements the "newest prerequisites" logic
 * - The hierarchical visualization is created in app.js with the renderCourseHierarchy function
 * - Animations are implemented in animations.js and animations.css
 * - Filtering functionality is implemented in filters.js and filters.css
 * - Testing utilities are available in development mode by adding ?testing=true to the URL
 * 
 * Browser Compatibility: Chrome, Edge are preferred. 
 * 
 * 
 * Created for Galala University, 2025 By Hisham_Abdelaal



