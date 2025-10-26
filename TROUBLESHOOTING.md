# Machine Selection Not Working - Troubleshooting

## Problem
After clicking on machine cards, the app is not navigating to the process search screen.

## Quick Tests

### Test 1: Check If New Code Is Loaded

1. **Open CDC Web App** in your browser
2. **Press F12** to open Developer Tools
3. **Click on "Console" tab**
4. **Login** and click on any machine card
5. **Look for this message**: `Machine selected: [Machine Name]`

**Result:**
- ✅ **If you see the message**: Code is loaded, there's a different issue
- ❌ **If you DON'T see the message**: Browser is using cached old code

### Test 2: Check For JavaScript Errors

In the same Console tab:
- Look for any **red error messages**
- Common errors:
  - `Cannot read property 'classList' of null` → Element not found
  - `[element] is not defined` → Missing DOM element
  - `Uncaught TypeError` → Code error

### Test 3: Check If Elements Exist

In the Console tab, type these commands one by one and press Enter:

```javascript
document.getElementById('search-section')
document.getElementById('machine-section')
document.getElementById('process-list-section')
```

**Expected result:** Each should show `<section id="...">` 
**Bad result:** Shows `null` → HTML element is missing

---

## Solutions

### Solution 1: Clear Browser Cache (Try This First)

#### Chrome/Edge:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"
5. **Hard reload**: `Ctrl + Shift + R` or `Ctrl + F5`

#### Firefox:
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Click "Clear Now"
4. Reload: `Ctrl + F5`

### Solution 2: Incognito/Private Mode

1. Open browser in **Incognito/Private mode**
2. Navigate to your CDC Web App URL
3. Test if clicking machines works now

**If it works**: Browser cache was the issue

### Solution 3: Check HTML File

Make sure `index.html` has all section IDs:

```html
<section id="login-section" class="card">...</section>
<section id="machine-section" class="hidden">...</section>
<section id="search-section" class="card hidden">...</section>
<section id="process-list-section" class="hidden">...</section>
<section id="running-process-section" class="card hidden">...</section>
```

### Solution 4: Check Script Loading

In browser Console, type:
```javascript
typeof showSearchSection
```

**Expected**: `"function"`
**Bad**: `"undefined"` → Script didn't load

If undefined, check:
```html
<script src="script.js" defer></script>
```

Is in your `index.html` before `</body>`

---

## Advanced Debugging

### Check Event Listener

In Console after login, type:
```javascript
// Check if machine cards have click handlers
document.querySelectorAll('.machine-card').length
```

Should return number of machines (e.g., 5)

Then:
```javascript
// Click first machine programmatically
document.querySelector('.machine-card').click()
```

Watch if console shows "Machine selected: ..."

### Check State Object

```javascript
// In console after clicking machine
state.selectedMachine
```

Should show machine object with properties

### Manual Navigation Test

```javascript
// In console, try navigating manually
showSearchSection()
```

If this works but clicking doesn't, the click handler isn't attached.

---

## Common Issues

### Issue 1: Browser Cache
**Symptom**: Old behavior persists
**Fix**: Hard reload with Ctrl+Shift+R

### Issue 2: Wrong HTML File
**Symptom**: Elements not found
**Fix**: Verify you're opening the correct `index.html`

### Issue 3: JavaScript Disabled
**Symptom**: Nothing works
**Fix**: Enable JavaScript in browser settings

### Issue 4: CORS Errors (if using file://)
**Symptom**: API calls fail
**Fix**: Use a local server or deploy properly

---

## Report Issues

If none of these work, collect this info:

1. **Browser Console errors** (screenshot)
2. **Network tab** - Check if script.js loads (status 200)
3. **Elements tab** - Check if all sections exist
4. **Console output** when clicking machine
5. **Browser and version**

Then share these details for further help.

