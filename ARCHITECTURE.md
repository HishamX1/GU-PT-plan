# Scalable Study Plan Architecture

## Overview
This document describes the scalable, multi-file architecture for the GU Study Plan Center that allows unlimited faculties without file bloat.

## Directory Structure

```
data/
├── index.json                          # Master index of all faculties
└── faculties/
    ├── PT/                             # Physical Therapy Faculty
    │   ├── faculty.json                # Faculty metadata
    │   ├── programs.json               # All programs in this faculty
    │   ├── years.json                  # All years across programs
    │   ├── semesters.json              # All semesters across years
    │   └── courses.json                # All courses across semesters
    ├── ENG/                            # Engineering Faculty
    │   ├── faculty.json
    │   ├── programs.json
    │   ├── years.json
    │   ├── semesters.json
    │   └── courses.json
    └── [FACULTY_CODE]/                 # Each faculty gets its own directory
        ├── faculty.json
        ├── programs.json
        ├── years.json
        ├── semesters.json
        └── courses.json
```

## File Formats

### data/index.json
Master index of all faculties (lightweight, fast to load)
```json
{
  "faculties": [
    {
      "id": "fac-123-abc",
      "code": "PT",
      "name": "Faculty of Physical Therapy",
      "description": "...",
      "path": "faculties/PT"
    },
    {
      "id": "fac-456-def",
      "code": "ENG",
      "name": "Faculty of Engineering",
      "description": "...",
      "path": "faculties/ENG"
    }
  ]
}
```

### data/faculties/[CODE]/faculty.json
Faculty metadata
```json
{
  "id": "fac-123-abc",
  "code": "PT",
  "name": "Faculty of Physical Therapy",
  "description": "Comprehensive physical therapy education program",
  "createdAt": "2026-04-10T00:00:00Z",
  "updatedAt": "2026-04-10T00:00:00Z"
}
```

### data/faculties/[CODE]/programs.json
All programs in this faculty
```json
{
  "programs": [
    {
      "id": "prog-789-ghi",
      "facultyId": "fac-123-abc",
      "code": "BPT",
      "name": "Bachelor of Physical Therapy",
      "duration": 4,
      "description": "4-year undergraduate program",
      "createdAt": "2026-04-10T00:00:00Z"
    }
  ]
}
```

### data/faculties/[CODE]/years.json
All years across programs in this faculty
```json
{
  "years": [
    {
      "id": "year-101-jkl",
      "programId": "prog-789-ghi",
      "yearNumber": 1,
      "description": "Foundation Year",
      "createdAt": "2026-04-10T00:00:00Z"
    }
  ]
}
```

### data/faculties/[CODE]/semesters.json
All semesters across years in this faculty
```json
{
  "semesters": [
    {
      "id": "sem-202-mno",
      "yearId": "year-101-jkl",
      "semesterNumber": 1,
      "description": "Fall 2024",
      "startDate": "2024-09-01",
      "endDate": "2024-12-31",
      "createdAt": "2026-04-10T00:00:00Z"
    }
  ]
}
```

### data/faculties/[CODE]/courses.json
All courses across semesters in this faculty
```json
{
  "courses": [
    {
      "id": "course-303-pqr",
      "semesterId": "sem-202-mno",
      "code": "PT101",
      "name": "Introduction to Physical Therapy",
      "credits": 3,
      "description": "Foundational course covering basic PT principles",
      "prerequisites": [],
      "createdAt": "2026-04-10T00:00:00Z"
    },
    {
      "id": "course-404-stu",
      "semesterId": "sem-202-mno",
      "code": "PT102",
      "name": "Musculoskeletal Assessment",
      "credits": 4,
      "description": "Advanced assessment techniques",
      "prerequisites": ["PT101"],
      "createdAt": "2026-04-10T00:00:00Z"
    }
  ]
}
```

## Benefits of This Architecture

1. **Scalability**: Each faculty is independent, no file bloat
   - 1 faculty = ~5KB
   - 60 faculties = ~300KB total (vs. 1 monolithic file)

2. **Performance**: Lazy loading by faculty
   - Load only the faculty the user selects
   - Reduces initial page load time

3. **Maintainability**: Clear separation of concerns
   - Easy to find and edit specific faculty data
   - Easy to backup/restore individual faculties

4. **Concurrency**: Multiple admins can edit different faculties
   - No file locking issues
   - Changes don't conflict

5. **Growth**: Easy to add new faculties
   - Just create a new directory with 5 JSON files
   - No need to modify existing files

## Admin Dashboard Workflow

1. **Load Master Index**: Fetch `data/index.json` to get list of all faculties
2. **Display Faculties**: Show all faculties in dropdown/list
3. **Select Faculty**: User picks a faculty
4. **Load Faculty Data**: Fetch all 5 JSON files for that faculty
5. **Display Data**: Show programs, years, semesters, courses for selected faculty
6. **Add/Edit/Delete**: Update the appropriate JSON file and save
7. **Update Index**: If adding new faculty, update `data/index.json`

## Student Portal Workflow

1. **Load Master Index**: Fetch `data/index.json`
2. **Display Faculties**: Show all faculties as cards
3. **Select Faculty**: User clicks a faculty
4. **Load Faculty Data**: Fetch all 5 JSON files for that faculty
5. **Display Hierarchy**: Faculty → Programs → Years → Semesters → Courses
6. **Navigate**: User can drill down through the hierarchy

## Error Handling

- If a faculty directory is missing, show "Faculty data unavailable"
- If a JSON file is malformed, fall back to empty array
- If network fails, use cached data from localStorage
- Graceful degradation: Show what's available, hide what's not

## Migration Path

1. Start with current localStorage-based system
2. Generate `data/index.json` with all faculties
3. For each faculty, create `data/faculties/[CODE]/` directory
4. Generate the 5 JSON files for each faculty
5. Update admin dashboard to use new structure
6. Update student portal to use new structure
7. Keep localStorage as fallback cache for offline support
