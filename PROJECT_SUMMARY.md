# Galala University Study Plan Center - Project Summary

## Overview

The Galala University Study Plan Center is a comprehensive, database-driven web application that enables students to browse academic study plans and allows administrators to manage faculties, programs, years, semesters, and courses without coding. The system features real-time data synchronization, ensuring students see updates immediately after administrators make changes.

## Architecture

### Technology Stack

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11 + Drizzle ORM
- **Database**: MySQL/TiDB
- **Authentication**: Manus OAuth
- **Deployment**: Manus Hosting

### Project Structure

```
gu-study-plan-center/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Landing page with faculty selection
│   │   │   ├── Faculty.tsx           # Faculty programs view
│   │   │   ├── Program.tsx           # Program years view
│   │   │   ├── Year.tsx              # Year semesters view
│   │   │   ├── Semester.tsx          # Semester courses with prerequisites
│   │   │   ├── Admin.tsx             # Admin dashboard
│   │   │   └── NotFound.tsx
│   │   ├── components/               # Reusable UI components
│   │   ├── lib/trpc.ts               # tRPC client setup
│   │   ├── App.tsx                   # Main routing
│   │   └── index.css                 # Global styles
│   └── public/                       # Static assets
├── server/
│   ├── routers.ts                    # tRPC procedures (public + admin)
│   ├── db.ts                         # Database query helpers
│   └── _core/                        # Framework infrastructure
├── drizzle/
│   ├── schema.ts                     # Database schema
│   ├── migrations/                   # Auto-generated migrations
│   └── seeds/
│       └── 002_seed_pt_data.sql      # Physical Therapy data seed
├── shared/                           # Shared constants and types
└── package.json
```

## Database Schema

The system implements a hierarchical relational structure:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `faculties` | Academic faculties | id, name, code, description |
| `programs` | Degree programs within faculties | id, facultyId, name, code, totalYears |
| `years` | Academic years within programs | id, programId, yearNumber, name |
| `semesters` | Semesters within years | id, yearId, semesterNumber, name |
| `courses` | Individual courses within semesters | id, semesterId, code, name, credits, description |
| `coursePrerequisites` | Course dependency relationships | courseId, prerequisiteId |
| `users` | User accounts with role-based access | id, openId, name, email, role (admin/user) |

## Key Features

### Student Portal

1. **Landing Page**: Displays Galala University branding with faculty selection cards
2. **Faculty Browsing**: Students can select a faculty to view available programs
3. **Program Navigation**: Browse programs within a faculty with year information
4. **Study Plan Viewer**: Navigate through years and semesters to view courses
5. **Course Details**: View course information including:
   - Course code and name
   - Credit hours
   - Prerequisites (if any)
   - Courses that require this course as a prerequisite
6. **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Admin Dashboard

1. **Authentication**: Protected routes with role-based access control (admin only)
2. **Faculty Management**: Create, read, update, and delete faculties
3. **Program Management**: Manage programs within faculties
4. **Year Management**: Define academic years for programs
5. **Semester Management**: Organize courses into semesters
6. **Course Management**: Add and manage courses with credits and descriptions
7. **Prerequisite Management**: Define course dependencies
8. **Real-time Synchronization**: Changes immediately visible to students

### Real-time Updates

- Uses tRPC query invalidation for automatic data refresh
- Students see admin changes without page reload
- Optimistic updates for better UX

## API Procedures

### Public Procedures (Student Portal)

```typescript
trpc.studyPlan.faculties.useQuery()
trpc.studyPlan.facultyByCode.useQuery({ code })
trpc.studyPlan.programsByFacultyId.useQuery({ facultyId })
trpc.studyPlan.yearsByProgramId.useQuery({ programId })
trpc.studyPlan.semestersByYearId.useQuery({ yearId })
trpc.studyPlan.coursesBySemesterId.useQuery({ semesterId })
trpc.studyPlan.courseById.useQuery({ id })
```

### Protected Procedures (Admin Only)

```typescript
// Faculties
trpc.admin.createFaculty.useMutation()
trpc.admin.updateFaculty.useMutation()
trpc.admin.deleteFaculty.useMutation()

// Programs
trpc.admin.createProgram.useMutation()
trpc.admin.updateProgram.useMutation()
trpc.admin.deleteProgram.useMutation()

// Years, Semesters, Courses, Prerequisites
// Similar CRUD operations for each entity
```

## Data Migration

The Physical Therapy program data from the original `data.js` has been converted into a structured database format with:

- **Faculty**: Faculty of Physical Therapy (PT)
- **Program**: Bachelor of Physical Therapy (BPT) - 5 years
- **10 Semesters**: With 60+ courses total
- **Prerequisites**: Complex prerequisite relationships between courses
- **Credits**: Accurate credit hours for each course

### Seed Data

The seed file (`drizzle/seeds/002_seed_pt_data.sql`) contains:
- 1 Faculty
- 1 Program
- 5 Years
- 10 Semesters
- 60+ Courses
- 100+ Prerequisite relationships

## Styling & Theme

- **Color Scheme**: Blue-based theme with gradients
- **Typography**: Clean, modern sans-serif fonts
- **Components**: shadcn/ui for consistent, accessible UI
- **Responsive**: Mobile-first design with Tailwind breakpoints
- **Animations**: Smooth transitions and hover effects

## Authentication & Authorization

- **OAuth Integration**: Manus OAuth for secure authentication
- **Role-based Access**: Users have either `admin` or `user` role
- **Protected Routes**: Admin dashboard requires admin role
- **Session Management**: Secure cookie-based sessions

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
# (Automatically injected by Manus platform)

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Development

```bash
# Start dev server (runs on http://localhost:3000)
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## Testing

Unit tests are included for critical functionality:

```bash
pnpm test
```

Test files are located in `server/*.test.ts` and follow the Vitest framework.

## Deployment

The application is deployed on Manus Hosting with:

- Automatic HTTPS
- Custom domain support
- Environment variable management
- Database hosting
- Automatic backups

### Publishing

1. Create a checkpoint: `webdev_save_checkpoint`
2. Click the "Publish" button in the Management UI
3. Configure custom domain (optional)

## Future Enhancements

1. **Advanced Prerequisite Visualization**: Graph-based prerequisite diagram
2. **Student Planning Tools**: Course planning and schedule builder
3. **Notifications**: Email/SMS notifications for program updates
4. **Analytics**: Admin dashboard with enrollment statistics
5. **Multi-language Support**: Support for multiple languages
6. **Mobile App**: Native mobile applications
7. **API Documentation**: OpenAPI/Swagger documentation
8. **Audit Logging**: Track all admin changes

## Contributing

To contribute to this project:

1. Create a new branch for your feature
2. Make your changes
3. Write/update tests
4. Create a pull request to the original repository

## License

This project is part of Galala University and follows institutional policies.

## Support

For support or questions, contact the development team or submit an issue to the repository.

---

**Project Version**: 1.0.0  
**Last Updated**: April 3, 2026  
**Status**: Development Complete - Ready for Review
