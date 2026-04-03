# Galala University Study Plan Center - Demo Walkthrough

## Overview
This document provides a step-by-step walkthrough of the Galala University Study Plan Center application, covering both the student portal and admin dashboard experiences.

---

## Part 1: Student Portal

### 1.1 Landing Page
**URL**: `/`

**Features**:
- **Header**: Displays "Galala University Study Plan Center" with GU logo (gold background)
- **User Greeting**: Shows "Welcome, [User Name]" and Admin Dashboard button (if admin)
- **Hero Section**: "Explore Your Academic Path" with descriptive tagline
- **Feature Cards**: Three cards showcasing key benefits:
  - Complete Programs
  - Prerequisites
  - Always Updated
- **Faculty Selection**: Grid of available faculties with icons
- **Footer**: Galala University branding and copyright

**Colors**: 
- Primary: #002147 (Oxford Blue)
- Secondary: #8C1D40 (Burgundy)
- Accent: #FFD700 (Gold)

### 1.2 Faculty View
**URL**: `/faculty/:facultyId`

**Flow**:
1. Click on a faculty card from the landing page
2. View faculty name, code, and description
3. See list of available programs for that faculty
4. Each program card shows:
   - Program name and code
   - Duration (number of years)
   - Brief description
   - "View Study Plan" link

### 1.3 Program View
**URL**: `/program/:programId`

**Flow**:
1. Click on a program from the faculty view
2. See program title and academic years
3. Each year card displays:
   - Year number
   - Year name
   - "View Semesters" link

### 1.4 Year View
**URL**: `/year/:yearId`

**Flow**:
1. Click on a year from the program view
2. See all semesters for that academic year
3. Each semester card shows:
   - Semester number
   - Semester name
   - "View Courses" link

### 1.5 Semester View (Study Plan)
**URL**: `/semester/:semesterId`

**Flow**:
1. Click on a semester from the year view
2. View all courses for that semester
3. Each course card displays:
   - Course code and name
   - Credit hours
   - Prerequisites (if any)
   - Course description
4. Click on a course to see detailed information including:
   - Full course description
   - Prerequisites (linked courses)
   - Courses that require this course as prerequisite
   - Credit hours and course code

**Real-time Synchronization**:
- Student portal automatically refreshes data every 2 seconds
- When admin adds/updates courses, changes appear immediately on student view
- Tab visibility detection: refreshes when tab becomes active

---

## Part 2: Admin Dashboard

### 2.1 Admin Authentication
**Access**: Click "Admin Dashboard" button on landing page (only visible to admin users)

**Protection**:
- Only users with `role: "admin"` can access
- Non-admin users see "Access Denied" message
- Redirects to home page

### 2.2 Admin Dashboard Header
**URL**: `/admin`

**Features**:
- Back button to return to home
- "Admin Dashboard" title
- Subtitle: "Manage faculties, programs, and courses"
- Galala University gradient background

### 2.3 Faculty Management Tab

#### Add Faculty
1. Click "Add Faculty" button
2. Dialog opens with form fields:
   - **Faculty Name** (required): e.g., "Faculty of Physical Therapy"
   - **Faculty Code** (required): e.g., "PT"
   - **Description** (optional): Faculty description
3. Click "Save" to create
4. Success toast notification appears
5. Faculty list updates in real-time
6. Students see new faculty immediately on landing page

#### Edit Faculty
1. Click edit icon (pencil) on faculty row
2. Dialog opens with pre-filled form
3. Update any field
4. Click "Save" to update
5. Faculty list refreshes
6. Students see updated information immediately

#### Delete Faculty
1. Click delete icon (trash) on faculty row
2. Confirmation dialog appears
3. Confirm deletion
4. Faculty removed from list
5. Students no longer see this faculty

#### Faculty List Display
- Table showing all faculties with columns:
  - Name
  - Code
  - Description
  - Actions (Edit, Delete)
- Hover effects on rows
- Empty state message if no faculties exist

### 2.4 Programs Tab
**Status**: Framework ready for future implementation
- Placeholder message: "Programs management coming soon..."
- Will allow CRUD operations for programs within faculties

### 2.5 Years Tab
**Status**: Framework ready for future implementation
- Placeholder message: "Years management coming soon..."
- Will allow CRUD operations for academic years

### 2.6 Courses Tab
**Status**: Framework ready for future implementation
- Placeholder message: "Courses management coming soon..."
- Will allow CRUD operations for courses and prerequisites

---

## Part 3: Real-time Synchronization

### How It Works
1. **Admin Action**: Admin creates/updates/deletes a faculty
2. **Backend**: tRPC mutation processes the change
3. **Database**: Change is persisted
4. **Student Portal**: Automatic refresh triggers
5. **UI Update**: Students see new data without page reload

### Refresh Mechanisms
- **Polling**: Every 2 seconds, all study plan queries are invalidated
- **Tab Visibility**: When student switches back to the tab, data refreshes
- **Manual Refresh**: Browser refresh always gets latest data

### Example Scenario
1. Student is viewing Physical Therapy faculty
2. Admin adds new "Faculty of Engineering"
3. Within 2 seconds, student sees new faculty on landing page
4. Admin adds new program to Physical Therapy
5. Within 2 seconds, student sees new program when viewing PT faculty

---

## Part 4: Design & Branding

### Color Scheme
- **Primary**: #002147 (Oxford Blue) - Headers, buttons, text
- **Secondary**: #8C1D40 (Burgundy) - Hover states, accents
- **Accent**: #FFD700 (Gold) - Borders, highlights, badges
- **Background**: #F8F9FA (Light Gray) - Page backgrounds
- **Text**: #191919 (Dark Gray) - Main text color

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Headings**: Bold, color: primary (#002147)
- **Body Text**: Regular weight, color: dark gray

### Responsive Design
- **Mobile**: Single column layout, optimized touch targets
- **Tablet**: 2-column grid for cards
- **Desktop**: 3-column grid, full width layouts

### Animations & Transitions
- **Hover Effects**: Cards lift up, borders highlight
- **Transitions**: 0.3s smooth transitions on all interactive elements
- **Loading States**: Spinner animation with primary color
- **Scrollbar**: Custom styled scrollbar matching theme

---

## Part 5: Testing Checklist

### Student Portal
- [ ] Landing page loads with Galala branding
- [ ] Faculty cards display correctly
- [ ] Can navigate through faculty → program → year → semester → courses
- [ ] Course details show prerequisites correctly
- [ ] Real-time updates work (admin adds faculty, student sees it within 2 seconds)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] All colors match Galala University theme

### Admin Dashboard
- [ ] Only admin users can access
- [ ] Can create new faculty
- [ ] Can edit existing faculty
- [ ] Can delete faculty with confirmation
- [ ] Form validation works (required fields)
- [ ] Success/error toast notifications appear
- [ ] Faculty list updates after CRUD operations
- [ ] Students see changes immediately

### Real-time Synchronization
- [ ] Admin creates faculty → student sees it within 2 seconds
- [ ] Admin updates faculty → student sees changes immediately
- [ ] Admin deletes faculty → student sees removal immediately
- [ ] Tab visibility detection works (refresh on tab switch)
- [ ] Multiple browser tabs stay synchronized

---

## Part 6: Deployment Instructions

### Prerequisites
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL database
- Manus OAuth credentials

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/HishamX1/GU-PT-plan.git
   cd GU-PT-plan
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Set Environment Variables**
   Create `.env` file with:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/gu_study_plan
   JWT_SECRET=your-secret-key
   VITE_APP_ID=your-app-id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://portal.manus.im
   ```

4. **Push Database Migrations**
   ```bash
   pnpm db:push
   ```

5. **Seed Physical Therapy Data** (Optional)
   ```bash
   mysql -h localhost -u user -p gu_study_plan < drizzle/seeds/002_seed_pt_data.sql
   ```

6. **Start Development Server**
   ```bash
   pnpm dev
   ```

7. **Build for Production**
   ```bash
   pnpm build
   ```

8. **Start Production Server**
   ```bash
   pnpm start
   ```

### Database Schema
The application uses the following main tables:
- `faculties` - Academic faculties
- `programs` - Degree programs
- `years` - Academic years
- `semesters` - Semesters within years
- `courses` - Individual courses
- `coursePrerequisites` - Course prerequisite relationships
- `users` - User accounts with roles (admin/user)

---

## Part 7: Key Features Summary

✅ **Student Portal**
- Browse faculties and programs
- View complete study plans
- See course prerequisites
- Real-time data updates

✅ **Admin Dashboard**
- Manage faculties (CRUD)
- Protected admin routes
- Form validation
- Real-time student synchronization

✅ **Design & UX**
- Galala University branding
- Responsive design
- Smooth animations
- Custom scrollbar styling

✅ **Real-time Features**
- Automatic data refresh every 2 seconds
- Tab visibility detection
- Query invalidation on admin changes
- Instant student view updates

✅ **Database**
- Relational schema with integrity constraints
- Prerequisite tracking
- User role management
- Scalable design

---

## Part 8: Future Enhancements

The following features are ready for implementation:
- [ ] Program CRUD operations
- [ ] Year CRUD operations
- [ ] Semester CRUD operations
- [ ] Course CRUD operations
- [ ] Prerequisite management interface
- [ ] Student course enrollment tracking
- [ ] GPA calculation
- [ ] Course progress tracking
- [ ] Email notifications for admin actions
- [ ] Advanced search and filtering

---

## Support & Troubleshooting

### Issue: Admin dashboard not loading
**Solution**: Ensure user has `role: "admin"` in database

### Issue: Real-time updates not working
**Solution**: Check browser console for errors, verify database connection

### Issue: Faculty not appearing for students
**Solution**: Verify faculty is created in database, check real-time sync is working

### Issue: Database migrations failing
**Solution**: Ensure MySQL is running and DATABASE_URL is correct

---

## Contact & Questions
For questions or issues, please refer to the project README or create an issue in the GitHub repository.
