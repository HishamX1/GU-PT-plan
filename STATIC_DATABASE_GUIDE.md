# Galala University Study Plan Center - Static Database Guide

## Overview

The Study Plan Center now uses a **hybrid static-database system** that allows administrators to manage academic data through a web interface while students view the data dynamically. All data is stored in JSON files within the repository, making it a true "static database" that works on GitHub Pages.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GitHub Pages (Static)                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐         ┌──────────────────┐      │
│  │   Admin Panel    │         │  Student Portal  │      │
│  │  (Edit Data)     │         │  (View Data)     │      │
│  └────────┬─────────┘         └────────┬─────────┘      │
│           │                            │                 │
│           └────────────┬───────────────┘                 │
│                        │                                 │
│           ┌────────────▼───────────────┐                │
│           │   JSON Database Files      │                │
│           │  (data/faculties.json)     │                │
│           │  (data/programs.json)      │                │
│           │  (data/years.json)         │                │
│           │  (data/semesters.json)     │                │
│           │  (data/courses.json)       │                │
│           └────────────────────────────┘                │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Database Structure

### Faculties (`data/faculties.json`)
```json
{
  "faculties": [
    {
      "id": "fac-001",
      "name": "Faculty of Physical Therapy",
      "code": "PT",
      "description": "Physical Therapy and Rehabilitation Sciences",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Programs (`data/programs.json`)
```json
{
  "programs": [
    {
      "id": "prog-001",
      "facultyId": "fac-001",
      "name": "Bachelor of Physical Therapy",
      "code": "BPT",
      "description": "4-year Bachelor's degree",
      "duration": 4,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Years (`data/years.json`)
```json
{
  "years": [
    {
      "id": "year-001",
      "programId": "prog-001",
      "yearNumber": 1,
      "description": "First Year - Foundational Courses",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Semesters (`data/semesters.json`)
```json
{
  "semesters": [
    {
      "id": "sem-001",
      "yearId": "year-001",
      "semesterNumber": 1,
      "description": "Fall Semester - Year 1",
      "startDate": "2024-09-01",
      "endDate": "2024-12-31",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Courses (`data/courses.json`)
```json
{
  "courses": [
    {
      "id": "course-001",
      "semesterId": "sem-001",
      "code": "PT101",
      "name": "Introduction to Physical Therapy",
      "description": "Fundamentals of physical therapy practice",
      "credits": 3,
      "prerequisites": [],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## How It Works

### For Administrators

1. **Access Admin Panel**
   - URL: `https://hishamx1.github.io/GU-PT-plan/modernization/frontend/admin/admin-database.html`
   - No login required (works on static hosting)

2. **Manage Data**
   - Add/Edit/Delete faculties, programs, years, semesters, and courses
   - All changes are made to JSON files in the repository
   - Changes are committed to GitHub automatically (with GitHub API integration)

3. **Real-time Updates**
   - Students see changes within 5 seconds (auto-refresh)
   - No server required - everything is static

### For Students

1. **Access Student Portal**
   - URL: `https://hishamx1.github.io/GU-PT-plan/modernization/frontend/student/student-database.html`
   - Browse faculties → programs → years → semesters → courses
   - View course details and prerequisites

2. **Real-time Synchronization**
   - Auto-refresh every 5 seconds
   - See admin changes immediately
   - Cross-tab synchronization (changes visible across all browser tabs)

## File Locations

```
/home/ubuntu/GU-PT-plan/
├── data/
│   ├── faculties.json      # Faculty data
│   ├── programs.json       # Program data
│   ├── years.json          # Academic year data
│   ├── semesters.json      # Semester data
│   └── courses.json        # Course data
│
├── modernization/
│   └── frontend/
│       ├── admin/
│       │   └── admin-database.html    # Admin interface
│       └── student/
│           └── student-database.html  # Student portal
```

## Adding Data Manually

If you want to add data directly to JSON files:

1. **Edit the JSON file** (e.g., `data/faculties.json`)
2. **Add a new entry** with unique ID
3. **Commit to GitHub**
4. **Students see changes** within 5 seconds (auto-refresh)

Example - Adding a new faculty:
```json
{
  "faculties": [
    {
      "id": "fac-001",
      "name": "Faculty of Physical Therapy",
      "code": "PT",
      "description": "Physical Therapy and Rehabilitation Sciences",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "fac-002",
      "name": "Faculty of Engineering",
      "code": "ENG",
      "description": "Engineering and Technology",
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

## Admin Panel Features

### Tabs
- **🏢 Faculties** - Manage academic faculties
- **📖 Programs** - Manage degree programs
- **📅 Years** - Manage academic years
- **🎓 Semesters** - Manage semesters
- **📚 Courses** - Manage courses with prerequisites

### Operations
- ✅ **Add** - Create new entries
- ✅ **View** - See all existing entries
- ✅ **Edit** - Modify existing entries (with GitHub API)
- ✅ **Delete** - Remove entries (with GitHub API)

### Validation
- Duplicate prevention for all entity types
- Required field validation
- Numeric validation (credits ≥ 1, year ≥ 1)
- Course code auto-conversion to uppercase

## Student Portal Features

### Navigation
- Browse by Faculty → Program → Year → Semester → Courses
- Breadcrumb navigation for easy backtracking
- Responsive design for mobile and desktop

### Information Display
- Course code and credits
- Course description
- Prerequisites (if any)
- Semester and year information

### Real-time Updates
- Auto-refresh every 5 seconds
- See admin changes immediately
- No page reload required

## GitHub API Integration

For full functionality (edit/delete operations), you need to:

1. **Create a GitHub Personal Access Token**
   - Go to: https://github.com/settings/tokens/new
   - Select scopes: `repo`
   - Copy the token

2. **Use in Admin Panel**
   - Paste token in "GitHub Token" field
   - Click "Test Connection"
   - Now you can save changes to repository

3. **How It Works**
   - Admin makes changes in the UI
   - Changes are committed to GitHub via API
   - Students see changes within 5 seconds

## Troubleshooting

### Admin Can't Add Faculties

**Issue**: "Failed to fetch" error
- **Solution**: Ensure you're accessing the correct URL
- **Check**: Browser console (F12) for error details

### Students Don't See New Data

**Issue**: Changes not visible in student portal
- **Solution**: Wait 5 seconds (auto-refresh interval)
- **Check**: Refresh the page manually (Ctrl+R)
- **Verify**: Check that JSON files were properly updated

### GitHub Token Not Working

**Issue**: "Invalid token" error
- **Solution**: Create a new token with `repo` scope
- **Check**: Token is not expired
- **Verify**: Token has not been revoked

### JSON File Syntax Error

**Issue**: "Error loading data" message
- **Solution**: Check JSON syntax (use JSONLint.com)
- **Verify**: All quotes are properly closed
- **Check**: No trailing commas in arrays/objects

## Performance

- **Load Time**: < 1 second (static files)
- **Auto-refresh**: Every 5 seconds
- **Sync Delay**: < 5 seconds (admin to student)
- **Scalability**: Supports unlimited entries (JSON file size dependent)

## Security

### Public Data
- All data is public (GitHub Pages)
- No sensitive information should be stored
- Student portal is read-only

### Admin Panel
- Requires GitHub token for modifications
- Token is stored locally in browser (not transmitted)
- Recommend using a token with limited scope

### Best Practices
- Use strong, unique GitHub tokens
- Regenerate tokens periodically
- Never commit tokens to repository
- Use environment variables for production

## Future Enhancements

- [ ] Advanced prerequisite visualization
- [ ] Bulk import (CSV/Excel)
- [ ] Data export (PDF/Excel)
- [ ] Audit trail/version control
- [ ] Role-based access control
- [ ] Circular prerequisite detection
- [ ] Course conflict detection
- [ ] Student enrollment tracking

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review JSON file syntax
3. Check browser console for errors
4. Verify GitHub token permissions
5. Clear browser cache and reload

## Example Workflow

### Adding a New Faculty

1. **Admin Panel**
   - Go to "Faculties" tab
   - Enter faculty name: "Faculty of Engineering"
   - Enter code: "ENG"
   - Enter description: "Engineering and Technology"
   - Click "Add Faculty"

2. **Behind the Scenes**
   - New faculty added to `data/faculties.json`
   - Committed to GitHub
   - localStorage event triggered

3. **Student Portal**
   - Within 5 seconds, new faculty appears in dropdown
   - Students can click to view programs
   - No page refresh needed

### Adding a New Course

1. **Admin Panel**
   - Go to "Courses" tab
   - Select semester
   - Enter course code: "PT201"
   - Enter course name: "Advanced Physical Therapy"
   - Enter credits: 4
   - Enter prerequisites: "PT101"
   - Click "Add Course"

2. **Behind the Scenes**
   - New course added to `data/courses.json`
   - Committed to GitHub
   - localStorage event triggered

3. **Student Portal**
   - Within 5 seconds, new course appears in semester
   - Prerequisites are displayed
   - Credits are shown

## Conclusion

The static database system provides a simple, scalable solution for managing academic data without requiring a backend server. All data is stored in JSON files that can be easily version controlled, backed up, and shared across the organization.

Perfect for:
- ✅ Small to medium institutions
- ✅ GitHub Pages hosting
- ✅ Static site generators
- ✅ Offline-first applications
- ✅ Easy data management without coding
