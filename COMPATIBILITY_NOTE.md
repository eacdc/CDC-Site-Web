# API Compatibility Note

## Dual-Format API Responses

The CDC backend API now returns data in **both camelCase and PascalCase** formats to support both the mobile app and web app simultaneously.

### Why Both Formats?

1. **Mobile App (Flutter/Dart)** - Expects camelCase properties
   - `machineId`, `machineName`, `pwoNo`, `processId`, etc.

2. **Web App (JavaScript)** - Expects PascalCase properties
   - `MachineID`, `MachineName`, `PWONo`, `ProcessID`, etc.

### Example Response

#### Machine Object
```json
{
  "machineId": 1,
  "machineName": "Printing Machine",
  "departmentId": 10,
  "productUnitId": 5,
  "MachineID": 1,
  "MachineName": "Printing Machine",
  "DepartmentID": 10,
  "ProductUnitID": 5
}
```

#### Process Object
```json
{
  "pwoNo": "PWO123",
  "pwoDate": "2024-01-01",
  "client": "ABC Corp",
  "jobName": "Print Job",
  "processId": 456,
  "PWONo": "PWO123",
  "PWODate": "2024-01-01",
  "Client": "ABC Corp",
  "JobName": "Print Job",
  "ProcessID": 456
}
```

### Benefits

✅ **Zero Breaking Changes** - Both apps work without modifications
✅ **Smooth Migration** - No coordination needed between mobile and web deployments
✅ **Future Flexibility** - Can gradually standardize on one format if needed

### Response Size Impact

- Increases response size by approximately 2x for property names
- Minimal impact on actual payload size since values are not duplicated
- Network performance impact is negligible for typical CDC operations

### Affected Endpoints

1. **`/api/auth/login`** - Returns machines array with both formats
2. **`/api/processes/pending`** - Returns processes array with both formats

### For Developers

When adding new properties to API responses:
1. Add the camelCase version for mobile app compatibility
2. Add the PascalCase version for web app compatibility
3. Document both in API specifications

Example:
```javascript
{
  // Mobile app (camelCase)
  newField: value,
  // Web app (PascalCase)
  NewField: value
}
```

### Future Considerations

If you need to standardize on one format in the future:
1. Choose the target format (recommend camelCase for JSON APIs)
2. Update one client app to use the new format
3. Test thoroughly
4. Deploy the client app update
5. Remove the old format from backend
6. Update the other client app
7. Deploy and test again

This approach ensures continuous operation without downtime.

