# Property Name Casing Fix - Complete Solution

## Problem
After clicking on machine names, navigation was not working in both the web app and mobile app due to inconsistent property name casing (camelCase vs PascalCase).

## Root Cause
The backend was updated to return both camelCase and PascalCase properties to support both apps, but the frontend code was not handling both formats consistently, causing navigation and data display issues.

## Solution
Made both the web app and mobile app **fully compatible** with both property name formats (camelCase and PascalCase).

---

## Changes Made

### 1. Backend (`backend/src/routes.js`)
✅ Already returns **BOTH** camelCase and PascalCase for all properties:
- Machine data: `machineId` + `MachineID`, `machineName` + `MachineName`, etc.
- Process data: `pwoNo` + `PWONo`, `processId` + `ProcessID`, etc.

### 2. Web App (`CDC Web App/script.js`)

#### Machine Selection
- ✅ `renderMachines()` - Handles both property formats
- ✅ `selectMachine()` - Handles both property formats
- ✅ Machine click handler - Now finds machines regardless of casing
- ✅ Added console logging for debugging

#### Process Search & Display
- ✅ `searchProcesses()` - Gets machineId from both formats
- ✅ `showProcessList()` - Gets machineName from both formats
- ✅ `renderProcessList()` - Handles both CurrentStatus/currentStatus and PWODate/pwoDate
- ✅ `renderProcessCards()` - Extracts all properties with fallback to both formats
- ✅ `renderProcessAction()` - Compares using both property formats
- ✅ `getProcessKey()` - Builds keys using both property formats

#### Process Operations
- ✅ `startProcess()` - Extracts all parameters with format fallbacks
- ✅ `completeProcess()` - Extracts all parameters with format fallbacks
- ✅ `cancelProcess()` - Extracts all parameters with format fallbacks

### 3. Mobile App (Flutter/Dart)

#### `dart_files/lib/models/machine.dart`
```dart
factory Machine.fromJson(Map<String, dynamic> json) {
  // Handle both camelCase and PascalCase
  final machineIdValue = json['machineId'] ?? json['MachineID'];
  final machineNameValue = json['machineName'] ?? json['MachineName'];
  final departmentIdValue = json['departmentId'] ?? json['DepartmentID'];
  final productUnitIdValue = json['productUnitId'] ?? json['ProductUnitID'];
  
  return Machine(
    machineId: int.parse(machineIdValue.toString()),
    machineName: machineNameValue.toString(),
    departmentId: departmentIdValue == null ? null : int.tryParse(departmentIdValue.toString()),
    productUnitId: productUnitIdValue == null ? null : int.tryParse(productUnitIdValue.toString()),
  );
}
```

#### `dart_files/lib/models/process.dart`
```dart
factory Process.fromJson(Map<String, dynamic> json) {
  // Handle both camelCase and PascalCase for ALL properties
  return Process(
    pwoNo: (json['pwoNo'] ?? json['PWONo'])?.toString() ?? '',
    pwoDate: (json['pwoDate'] ?? json['PWODate'])?.toString() ?? '',
    client: (json['client'] ?? json['Client'])?.toString() ?? '',
    jobName: (json['jobName'] ?? json['JobName'])?.toString() ?? '',
    // ... etc for all properties
  );
}
```

---

## Testing Steps

### Web App Testing

1. **Login & Machine Selection**
   ```
   ✅ Open CDC Web App
   ✅ Login with username and database
   ✅ Machine cards should display with names and IDs
   ✅ Click on any machine card
   ✅ Should navigate to search screen immediately
   ```

2. **Process Search**
   ```
   ✅ Enter a job card number (manual entry)
   ✅ Click "Search"
   ✅ Should navigate to process list screen
   ✅ All process details should display correctly
   ```

3. **Process Operations**
   ```
   ✅ Click "Start" on a process
   ✅ Should start successfully
   ✅ Click "Complete" and submit
   ✅ Should complete successfully
   ```

### Mobile App Testing

1. **Login & Machine Selection**
   ```
   ✅ Open CDC Mobile App
   ✅ Login with username and database
   ✅ Machine list should display with names
   ✅ Tap on any machine
   ✅ Should navigate to process details screen
   ```

2. **Process Search**
   ```
   ✅ Scan QR code or enter job card manually
   ✅ Process list should display
   ✅ All details should be visible
   ```

3. **Process Operations**
   ```
   ✅ Start a process
   ✅ Complete a process
   ✅ All operations should work correctly
   ```

---

## Key Benefits

### ✅ Zero Breaking Changes
- Both apps work simultaneously
- No coordination needed between deployments
- Existing installations continue to work

### ✅ Defensive Coding
- Every property access checks both formats
- Graceful fallback ensures robustness
- Console logging for debugging (web app)

### ✅ Future-Proof
- Easy to migrate to single format later
- Clear pattern for adding new properties
- Documentation for developers

---

## Deployment

### Backend
```bash
cd backend
npm start
# Or with PM2:
pm2 restart all
```

### Web App
- No deployment needed (static files)
- Just refresh browser to get latest `script.js`
- Clear cache if necessary

### Mobile App
```bash
cd dart_files
flutter clean
flutter pub get
flutter run
```

---

## Developer Guidelines

When adding new API properties:

1. **Backend** - Return both formats:
```javascript
{
  newProperty: value,  // camelCase for mobile
  NewProperty: value   // PascalCase for web
}
```

2. **Web App** - Extract with fallback:
```javascript
const newProperty = data.NewProperty || data.newProperty;
```

3. **Mobile App** - Extract with null coalescing:
```dart
newProperty: (json['newProperty'] ?? json['NewProperty'])?.toString() ?? '',
```

---

## Troubleshooting

### If navigation still doesn't work:

1. **Clear Browser Cache**
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - Clear browser cache completely

2. **Check Console**
   - Open browser DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for API responses

3. **Verify Backend**
   - Check backend is running
   - Test login API: `GET /api/auth/login?username=test&database=KOL`
   - Verify response has both camelCase and PascalCase

4. **Mobile App**
   - Run `flutter clean` and rebuild
   - Check debug console for errors
   - Verify API responses in network logs

---

## Status: ✅ COMPLETE

Both web app and mobile app now handle property name casing consistently and work correctly.

