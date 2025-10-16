# 🧪 Auth Performance Testing Guide

## Quick Test Checklist

### Test 1: Sign-In Performance ⚡

1. Open browser: `http://localhost:3000/sign-in`
2. **Open DevTools Console** (F12)
3. Look for performance logs:
   ```
   [Auth Performance] sign-in-page-load: 1234.56ms
   ```
4. **Expected**: < 1.5 seconds ✅

### Test 2: Private Browsing Mode 🔒

1. **Open Incognito/Private window** (Ctrl+Shift+N)
2. Navigate to: `http://localhost:3000`
3. **Check console** - should see:
   ```
   [SafeStorage] localStorage not available, using fallback
   ```
4. **Expected**: Cookie banner still works, no crashes ✅

### Test 3: Storage Safety 💾

1. Open DevTools Console (F12)
2. Run these commands:

   ```javascript
   // Test 1: Safe get
   localStorage.getItem("cookie-consent");

   // Test 2: Safe set (should never crash)
   for (let i = 0; i < 10000; i++) {
     localStorage.setItem("test" + i, "a".repeat(1000));
   }
   ```

3. **Expected**: Graceful handling of quota exceeded ✅

### Test 4: Cookie Consent 🍪

1. Go to homepage: `http://localhost:3000`
2. Wait 1.5 seconds
3. Cookie banner appears in **bottom-right corner**
4. Click **"Accept All"** or **"Customize"**
5. Refresh page
6. **Expected**: Banner doesn't reappear ✅

### Test 5: Expired Token Cleanup 🧹

1. Open DevTools → Application tab → Local Storage
2. Look for keys starting with `__clerk_` or `clerk-`
3. Manually set an expired token (if any exist)
4. Refresh page
5. **Check console**:
   ```
   [Auth] Removed expired token: __clerk_db_jwt_abc123
   ```
6. **Expected**: Old tokens automatically removed ✅

### Test 6: Rate Limiting 🚫

1. Go to sign-in page
2. Try to submit form **6+ times rapidly**
3. **Check console**:
   ```
   [Auth] Rate limit exceeded for sign-in
   ```
4. **Expected**: Blocked after 5 attempts in 1 minute ✅

### Test 7: Animation Performance 🎨

1. Open DevTools → Performance tab
2. Start recording
3. Navigate to `/sign-in`
4. Stop recording after page loads
5. **Check FPS** in timeline
6. **Expected**: Consistent 55-60 FPS ✅

---

## Performance Benchmarks

### Target Metrics:

- **Sign-In Page Load**: < 1.5s
- **Sign-Up Page Load**: < 1.5s
- **First Clerk Request**: < 700ms
- **Cookie Consent Render**: < 100ms
- **Animation FPS**: > 55 FPS

### Check Performance:

```javascript
// Run in browser console
performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd;
```

Should be < 1500ms

---

## Common Issues & Solutions

### Issue: "localStorage is not defined"

**Cause**: SSR trying to access localStorage
**Solution**: Already fixed with `SafeStorage` wrapper ✅

### Issue: "QuotaExceededError"

**Cause**: localStorage full (usually 5-10MB limit)
**Solution**: Auto-cleanup in `SafeStorage` ✅

### Issue: Cookie banner appears every time

**Cause**: localStorage not persisting choice
**Solution**: Check if private browsing is enabled ✅

### Issue: Slow sign-in (> 3s)

**Check console for**:

```
⚠️ [Auth Performance] Slow sign-in-page-load: 4567.89ms
```

**Possible causes**:

- Slow network connection
- Clerk API latency
- Too many browser extensions

---

## Debug Commands

### Check Storage Usage:

```javascript
// Run in browser console
let total = 0;
for (let key in localStorage) {
  total += localStorage[key].length;
}
console.log("localStorage usage:", total, "bytes");
```

### Test Safe Storage:

```javascript
// Should never crash
SafeStorage.set("test", "Hello");
console.log(SafeStorage.get("test")); // "Hello"

SafeStorage.setJSON("data", { name: "Test" });
console.log(SafeStorage.getJSON("data", {})); // { name: 'Test' }
```

### Monitor Auth Performance:

```javascript
// Check performance entries
performance.getEntriesByType("navigation");
performance.getEntriesByType("resource");
```

---

## Success Criteria ✅

All tests should pass with:

- ✅ No console errors
- ✅ Fast load times (< 1.5s)
- ✅ Smooth animations (> 55 FPS)
- ✅ Works in private browsing
- ✅ Handles quota exceeded
- ✅ Rate limiting active
- ✅ Expired tokens cleaned

---

## Performance Report Template

After testing, document results:

```markdown
## Test Results

### Sign-In Page Performance

- Load time: X.XXs
- First Clerk request: XXXms
- FPS: XX

### Sign-Up Page Performance

- Load time: X.XXs
- First Clerk request: XXXms
- FPS: XX

### Storage Safety

- Private browsing: ✅/❌
- Quota exceeded: ✅/❌
- SSR safe: ✅/❌

### Cookie Consent

- Appears: ✅/❌
- Persists choice: ✅/❌
- Works in private: ✅/❌

### Rate Limiting

- Blocks after 5 attempts: ✅/❌
- Resets after 1 minute: ✅/❌

### Overall: ✅ PASS / ❌ FAIL
```

---

**Ready to test? Start with Test 1 and work through the checklist!** 🚀
