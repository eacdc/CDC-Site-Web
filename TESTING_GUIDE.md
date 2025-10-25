# Testing Guide - CDC Web App Fixes

## What Was Fixed
Machine names and process data were not displaying after login due to API property name mismatches between backend and frontend.

## How to Test

### 1. Restart Backend Server
The backend code has been updated, so you need to restart the server:

```bash
cd backend
# Stop the current server (Ctrl+C if running)
npm start
# Or if using PM2:
pm2 restart all
```

### 2. Test Login Flow

1. **Open the CDC Web App**
   - Navigate to your CDC Web App URL
   - Or open `CDC Web App/index.html` directly

2. **Login**
   - Enter username (e.g., `Hasan`)
   - Select database (KOL or AHM)
   - Click "Sign In"

3. **Verify Machine Display**
   - ✅ You should now see machine cards with:
     - Machine icon
     - **Machine Name** (this was missing before)
     - Machine ID below the name
   - ✅ Cards should be clickable

### 3. Test Machine Selection

1. **Click on any machine card**
   - ✅ Should navigate to search section
   - ✅ Selected machine name should appear at the top

### 4. Test Process Search

1. **Manual Entry Tab**
   - Enter a job card number
   - Click "Search"
   - ✅ Process list should display with all details:
     - Client name
     - Job name
     - Component name
     - PWO number
     - Schedule quantity
     - Produced quantity

2. **QR Scanner Tab** (if testing on mobile/tablet)
   - Switch to QR tab
   - Scan a QR code
   - ✅ Should fetch and display processes

### 5. Test Process Actions

1. **Start Process**
   - Find a process with paper issued
   - Click "Start" button
   - ✅ Should start successfully
   - ✅ Should show running process screen

2. **Complete Process**
   - On running process screen
   - Click "Complete" button
   - Enter production and wastage quantities
   - Click "Submit"
   - ✅ Should complete successfully

3. **Cancel Process**
   - On running process screen
   - Click "Cancel" button
   - Confirm cancellation
   - ✅ Should cancel successfully

## Expected Behavior

### Before Fix ❌
- Login successful but machine cards showed "undefined" for names
- Machine IDs showed as "ID: undefined"
- Process details might have been missing or incorrect

### After Fix ✅
- Login shows machine cards with proper names
- Machine IDs display correctly
- All process details display properly
- Start, Complete, Cancel operations work correctly

## API Endpoints Being Used

All endpoints now use the correct format:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | GET | User authentication and machine list |
| `/api/processes/pending` | GET | Get processes for job card |
| `/api/processes/start` | POST | Start a process |
| `/api/processes/complete` | POST | Complete a process |
| `/api/processes/cancel` | POST | Cancel a process |

## Property Names Reference

### Machine Object
```javascript
{
  MachineID: 1,
  MachineName: "Machine Name",
  DepartmentID: 10,
  ProductUnitID: 5
}
```

### Process Object
```javascript
{
  ProcessID: 123,
  ProcessName: "Process Name",
  JobBookingJobCardContentsID: 456,
  PWONo: "PWO123",
  PWODate: "2024-01-01",
  Client: "Client Name",
  JobName: "Job Name",
  ComponentName: "Component",
  FormNo: "FORM_001",
  ScheduleQty: 1000,
  QtyProduced: 500,
  PaperIssuedQty: 1000,
  CurrentStatus: "Pending",
  JobCardContentNo: "JC123"
}
```

## Troubleshooting

### If machines still not showing:
1. Clear browser cache and reload
2. Check browser console for errors (F12 → Console tab)
3. Verify backend is running and accessible
4. Check backend logs for errors

### If processes not loading:
1. Verify the job card number exists in the database
2. Check browser network tab (F12 → Network) for failed requests
3. Look at backend logs for SQL errors

### If operations fail:
1. Check that all required stored procedures exist in the database
2. Verify database connection strings are correct
3. Check backend environment variables (DB_SERVER, DB_USER, etc.)

## Additional Resources
- See `MAPPING_FIXES.md` for detailed list of all changes made
- Backend API logs: Check `backend/logs/auth.log` and `backend/logs/process-start.log`

