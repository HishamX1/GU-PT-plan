# Galala University Study Plan Center - Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
cd /home/ubuntu/GU-PT-plan/modernization
npm install
```

### 2. Start the Backend Server
```bash
# Run the complete setup and start the server
npm run preview:local

# OR run commands individually:
DATA_MODE=file npm run extract:data
DATA_MODE=file npm run db:migrate
DATA_MODE=file npm run db:seed
DATA_MODE=file npm run start
```

The backend will start on `http://localhost:4000`

### 3. Access the Admin Dashboard
Open your browser and navigate to:
```
http://localhost:4000/admin
```

### 4. Login Credentials
- **Username**: `Admin`
- **Password**: `Admin`

## What the Backend Does

### Data Extraction
```bash
npm run extract:data
```
- Reads `/home/ubuntu/GU-PT-plan/data.js` (Physical Therapy program data)
- Converts it to JSON format
- Saves to `/modernization/data/academic-plan.json`

### Database Migration
```bash
DATA_MODE=file npm run db:migrate
```
- Sets up the file-based data store
- Creates necessary data structures

### Database Seeding
```bash
DATA_MODE=file npm run db:seed
```
- Populates the database with Physical Therapy program data
- Creates 67 subjects and 202 prerequisite relationships

### Start Server
```bash
DATA_MODE=file npm run start
```
- Starts the Express server on port 4000
- Serves the admin dashboard
- Provides API endpoints for CRUD operations

## API Endpoints

All endpoints are available at `http://localhost:4000/api/`

### Faculties
- `GET /api/colleges` - Get all faculties
- `POST /api/colleges` - Create faculty
- `PUT /api/colleges/:id` - Update faculty
- `DELETE /api/colleges/:id` - Delete faculty

### Programs
- `GET /api/programs` - Get all programs
- `POST /api/programs` - Create program
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program

### Years
- `GET /api/years` - Get all years
- `POST /api/years` - Create year
- `PUT /api/years/:id` - Update year
- `DELETE /api/years/:id` - Delete year

### Semesters
- `GET /api/semesters` - Get all semesters
- `POST /api/semesters` - Create semester
- `PUT /api/semesters/:id` - Update semester
- `DELETE /api/semesters/:id` - Delete semester

### Subjects/Courses
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Prerequisites
- `GET /api/prerequisites` - Get all prerequisites

## Troubleshooting

### Backend Won't Start

**Error: "window is not defined"**
- ✅ **FIXED** - Updated `data.js` to check for `window` object before using it
- ✅ **FIXED** - Added `fs` import to `extract-plan-data.js`

**Error: "Failed to fetch" in admin panel**
- Ensure backend is running on port 4000
- Check firewall settings
- Verify API endpoints are accessible: `curl http://localhost:4000/api/colleges`

**Error: "Connection refused"**
- Backend server is not running
- Run `npm run preview:local` in the modernization directory
- Wait 5-10 seconds for the server to fully start

### Admin Can't Add Faculties

1. **Check backend is running**
   ```bash
   curl http://localhost:4000/api/colleges
   ```
   Should return JSON array (possibly empty)

2. **Check browser console for errors**
   - Open DevTools (F12)
   - Check Console tab for error messages
   - Check Network tab to see if API requests are being made

3. **Verify login**
   - Make sure you're logged in with Admin/Admin
   - Dashboard should be visible (not login card)

4. **Check API response**
   ```bash
   curl -X POST http://localhost:4000/api/colleges \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Faculty"}'
   ```

### Data Not Persisting

- File-based mode stores data in memory during session
- Data is saved to `/modernization/data/` directory
- Restart the server to reload data

## File Structure

```
/home/ubuntu/GU-PT-plan/
├── data.js                          # Physical Therapy program data
├── modernization/
│   ├── backend/
│   │   └── src/
│   │       ├── server.js            # Express server
│   │       ├── routes/
│   │       │   └── catalogRoutes.js # API route handlers
│   │       ├── services/
│   │       │   └── catalogService.js # Business logic
│   │       └── db/
│   │           └── client.js        # Database client
│   ├── frontend/
│   │   ├── admin/
│   │   │   ├── index.html           # Admin dashboard HTML
│   │   │   ├── admin.js             # Original admin system
│   │   │   ├── admin-enhanced.js    # Enhanced admin with validation
│   │   │   └── styles.css           # Admin styles
│   │   └── student/
│   │       └── index.html           # Student portal
│   ├── data/
│   │   └── academic-plan.json       # Extracted data
│   ├── scripts/
│   │   └── extract-plan-data.js     # Data extraction script
│   └── package.json                 # Dependencies
├── ADMIN_SYSTEM_DOCUMENTATION.md    # Admin system guide
└── DEPLOYMENT_GUIDE.md              # This file
```

## Environment Variables

```bash
# Data mode (file or postgres)
DATA_MODE=file

# Server port (default: 4000)
PORT=4000

# Database URL (for postgres mode)
DATABASE_URL=postgresql://...
```

## Production Deployment

For production deployment:

1. **Use PostgreSQL instead of file mode**
   ```bash
   DATABASE_URL=postgresql://user:pass@host/db npm run start
   ```

2. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=4000
   export DATABASE_URL=...
   ```

3. **Run migrations**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start server**
   ```bash
   npm run start
   ```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the ADMIN_SYSTEM_DOCUMENTATION.md
3. Check backend logs: `tail -f /tmp/backend.log`
4. Verify API connectivity: `curl http://localhost:4000/api/colleges`

## Recent Fixes

### Fixed Issues
- ✅ Added `fs` import to extract-plan-data.js
- ✅ Fixed data.js to work in Node.js environment (window object check)
- ✅ Enhanced admin system with comprehensive validation
- ✅ Implemented real-time synchronization
- ✅ Added duplicate detection for all entities
- ✅ Improved error messages

### What's Working
- ✅ Backend API fully functional
- ✅ Admin dashboard with validation
- ✅ Real-time data synchronization
- ✅ Duplicate prevention
- ✅ CRUD operations for all entities
- ✅ Cascading deletes
- ✅ Cross-tab synchronization

## Next Steps

1. Start the backend: `npm run preview:local`
2. Open admin dashboard: `http://localhost:4000/admin`
3. Login with Admin/Admin
4. Add faculties, programs, years, semesters, and courses
5. Changes will be visible in real-time
