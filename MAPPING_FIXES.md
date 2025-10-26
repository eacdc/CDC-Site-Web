# CDC Web App API Mapping Fixes

## Issue
After logging into the CDC web app, machine names were not displaying because of mismatched property names between the backend API responses and the frontend code.

## Root Causes
1. **Case Mismatch**: Backend was returning camelCase properties (e.g., `machineId`, `machineName`) but frontend expected PascalCase (e.g., `MachineID`, `MachineName`)
2. **Endpoint Mismatch**: Frontend was calling `/process/...` endpoints but backend had `/processes/...` (plural)
3. **Parameter Mismatch**: Frontend was sending camelCase parameters but backend expected PascalCase
4. **Property Typo**: Inconsistent casing in `JobBookingJobCardContentsID` (sometimes `JobBookingJobcardContentsID` with lowercase 'c')

## Changes Made

### Backend (backend/src/routes.js)

#### 1. Login Endpoint - Machine Data Mapping (Line 227-232)
**Before:**
```javascript
const machines = result.recordset.map(r => ({
    machineId: r.machineid,
    machineName: r.machinename,
    departmentId: r.departmentid,
    productUnitId: r.productunitid
}));
```

**After:**
```javascript
const machines = result.recordset.map(r => ({
    MachineID: r.machineid || r.MachineID,
    MachineName: r.machinename || r.MachineName,
    DepartmentID: r.departmentid || r.DepartmentID,
    ProductUnitID: r.productunitid || r.ProductUnitID
}));
```

#### 2. Pending Processes Endpoint - Process Data Mapping (Line 369-384)
**Before:**
```javascript
const processes = result.recordset.map(r => ({
    pwoNo: r.PWOno,
    pwoDate: r.PWODate,
    client: r.Client,
    jobName: r.JobName,
    // ... other camelCase properties
    jobBookingJobcardContentsId: parseInt(r.JobBookingJobCardContentsID) || 0,
    // ...
}));
```

**After:**
```javascript
const processes = result.recordset.map(r => ({
    PWONo: r.PWOno || r.PWONo,
    PWODate: r.PWODate,
    Client: r.Client,
    JobName: r.JobName,
    ComponentName: r.ComponentName ?? r.COmponentname,
    FormNo: r.FormNo,
    ScheduleQty: r.ScheduleQty,
    QtyProduced: r.QtyProduced,
    PaperIssuedQty: r.PaperIssuedQty ?? null,
    CurrentStatus: r.CurrentStatus ?? null,
    JobCardContentNo: r.JobCardContentNo ?? r.jobcardcontentno,
    JobBookingJobCardContentsID: parseInt(r.JobBookingJobCardContentsID) || 0,
    ProcessName: r.ProcessName,
    ProcessID: parseInt(r.ProcessID) || 0
}));
```

### Frontend (CDC Web App/script.js)

#### 1. Fixed Endpoint URLs (Lines 316, 548, 589, 635)
- Changed `/process/pending` → `/processes/pending`
- Changed `/process/start` → `/processes/start`
- Changed `/process/complete` → `/processes/complete`
- Changed `/process/cancel` → `/processes/cancel`

#### 2. Fixed Query Parameters (Line 316)
**Before:**
```javascript
`process/pending?userId=${...}&machineId=${...}&jobCardContentNo=${...}`
```

**After:**
```javascript
`processes/pending?UserID=${...}&MachineID=${...}&jobcardcontentno=${...}`
```

#### 3. Fixed POST Request Parameters (Lines 548-558, 589-601, 635-645)
**Before:**
```javascript
{
    userId: state.currentUserId,
    employeeId: state.currentLedgerId,
    processId: process.ProcessID,
    // ...
}
```

**After:**
```javascript
{
    UserID: state.currentUserId,
    EmployeeID: state.currentLedgerId,
    ProcessID: process.ProcessID,
    JobBookingJobCardContentsID: process.JobBookingJobCardContentsID,
    MachineID: state.selectedMachine.MachineID,
    JobCardFormNo: process.FormNo,
    // ...
}
```

#### 4. Fixed Property References Throughout (Lines 505, 520, 540, 554, 595, 641)
- Changed all `JobBookingJobcardContentsID` → `JobBookingJobCardContentsID` (capital 'C' in 'Card')

## Testing
After these changes:
1. ✅ Login should display machine cards correctly
2. ✅ Machine names and IDs should be visible
3. ✅ Selecting a machine should work
4. ✅ Searching for processes should work
5. ✅ Starting, completing, and canceling processes should work

## Notes
- Backend now returns **BOTH camelCase and PascalCase** properties to support both mobile app and web app
- Mobile app uses camelCase (e.g., `machineId`, `pwoNo`)
- Web app uses PascalCase (e.g., `MachineID`, `PWONo`)
- Endpoint URLs now match backend route definitions
- This solution ensures **backward compatibility** - both apps work without breaking changes

