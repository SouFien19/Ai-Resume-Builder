# Quick Testing Guide

## 🎯 Priority Testing Order

### 1️⃣ CRITICAL: Test Sidebar Navigation (2 minutes)

**What to test:** All navigation links work correctly

1. **Open the dashboard:** Go to `/dashboard`
2. **Click each sidebar link:**
   - ✅ Dashboard → Should navigate to `/dashboard`
   - ✅ Resumes → Should navigate to `/dashboard/resumes`
   - ✅ AI Studio → Should navigate to `/dashboard/ai-studio`
   - ✅ Templates → Should navigate to `/dashboard/templates`
   - ✅ Analytics → Should navigate to `/dashboard/analytics`
   - ✅ Settings → Should navigate to `/dashboard/settings`
3. **Check active state:** Current page should be highlighted in pink/orange gradient
4. **Test logo:** Click "ResumeCraft" logo → Should navigate to `/dashboard`
5. **Test recent resumes:** Click any recent resume → Should navigate to edit page
6. **Mobile test:** Resize to mobile, open menu, test all links

**Expected:** All links work, no redirects to wrong pages, smooth navigation

---

### 2️⃣ HIGH: Test Skills Input (3 minutes)

**What to test:** Modern tag/chip interface with autocomplete

1. **Go to:** `/dashboard/resumes/create` (or edit any resume)
2. **Navigate to Skills step**

**Test Tag Creation:**

- Type "JavaScript" and press `Space` → Tag should appear
- Type "React" and press `Enter` → Tag should appear
- Tags should have pink/orange gradient with X buttons

**Test Deletion:**

- Click X on a tag → Tag should disappear with animation
- Empty the input, press `Backspace` → Last tag should be deleted

**Test Autocomplete:**

- Type "reac" → Should see suggestions like "React", "React Native"
- Type "pyth" → Should see "Python", "PyTorch"
- Use `Arrow Down/Up` to navigate suggestions
- Press `Enter` to select highlighted suggestion

**Test Limits:**

- Add 20 skills → Counter should show "20/20 skills"
- Try to add more → Input should be disabled
- Counter should turn orange at 17+, red at 20

**Test Animations:**

- All transitions should be smooth
- No lag or flickering

---

### 3️⃣ HIGH: Test Password Validation (2 minutes)

**What to test:** Strength meter and criteria checklist

**Where to find:**

- Registration page
- Settings → Change Password
- Or create a test component

**Test Strength Meter:**

1. Type "abc" → Should show **Weak** (red bar, 1/3 filled)
2. Type "Abcdef1!" → Should show **Medium** (yellow bar, 2/3 filled)
3. Type "MyP@ssw0rd123" → Should show **Strong** (green bar, 3/3 filled)

**Test Criteria Checklist:**

- Each criterion should show ✗ (gray) when not met
- Each criterion should show ✓ (green) when met
- Check all 5 criteria:
  - At least 8 characters
  - Contains uppercase letter
  - Contains lowercase letter
  - Contains number
  - Contains special character

**Test Show/Hide:**

- Click eye icon → Password should become visible
- Click again → Password should be hidden

**Test Confirm Password:**

- Type different passwords → Red X, "Passwords do not match"
- Type matching passwords → Green ✓, "Passwords match"

---

### 4️⃣ MEDIUM: Test Skill Suggestions API (2 minutes)

**What to test:** Intelligent contextual suggestions

**Method 1: Direct API Test**

```bash
# Autocomplete search
curl "http://localhost:3000/api/ai/suggest-skills?query=react&limit=5"

# Contextual suggestions
curl "http://localhost:3000/api/ai/suggest-skills?existingSkills=React,Python&limit=5"
```

**Expected Response:**

```json
{
  "results": ["Next.js", "Redux", "TypeScript", "Django", "Flask"],
  "count": 5,
  "source": "contextual"
}
```

**Method 2: UI Test (Integrated)**

- Already tested in Skills Input (autocomplete suggestions come from this API)
- Add "React" → Should see "Next.js", "Redux", "TypeScript" suggested
- Add "Python" → Should see "Django", "Flask", "FastAPI" suggested

---

## 🐛 Common Issues & Solutions

### Issue: Navigation not working

- **Check:** Browser console for errors
- **Solution:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- **Solution:** Clear browser cache

### Issue: Skills autocomplete not showing

- **Check:** Network tab, look for `/api/ai/suggest-skills` calls
- **Solution:** Type at least 2 characters
- **Solution:** Wait 300ms (debounce delay)

### Issue: Password strength not updating

- **Check:** Make sure password has at least 1 character
- **Solution:** Clear input and type again

### Issue: API returning errors

- **Check:** Server logs for quota exceeded
- **Fallback:** Rule-based suggestions will activate automatically

---

## ✅ Success Criteria

### All tests pass when:

- ✅ All sidebar links navigate correctly
- ✅ Tags can be added with Space/Enter
- ✅ Tags can be removed with X or Backspace
- ✅ Autocomplete shows relevant suggestions
- ✅ Skill counter updates correctly
- ✅ Password strength meter shows correct level
- ✅ All 5 criteria show ✓ or ✗
- ✅ Show/hide password works
- ✅ Confirm password shows match indicator
- ✅ API returns relevant skill suggestions
- ✅ No console errors
- ✅ Smooth animations throughout

---

## 🚀 Ready for Production?

**Checklist:**

- [ ] All navigation links tested ✓
- [ ] Skills input tested on desktop ✓
- [ ] Skills input tested on mobile ✓
- [ ] Password validation tested ✓
- [ ] API endpoints tested ✓
- [ ] No console errors ✓
- [ ] Performance is acceptable ✓
- [ ] User experience feels smooth ✓

**If all checked:** Deploy to production! 🎉

---

## 📞 Need Help?

**Common Questions:**

**Q: Where can I use the new PasswordInput component?**
A: Import from `@/components/auth/PasswordInput` or `@/components/auth/PasswordConfirmation`

**Q: How do I customize the skills limit?**
A: Change the `maxSkills` prop: `<SkillsInput maxSkills={30} />`

**Q: Can I disable API autocomplete?**
A: Yes: `<SkillsInput enableAutocompletedFromAPI={false} />`

**Q: How do I add more skill relationships?**
A: Edit `src/lib/ai/skill-suggestions.ts` and add to `skillRelationships` object

---

## 📊 Performance Metrics

**Expected Performance:**

- Navigation: < 100ms (instant)
- Skills autocomplete: < 500ms (300ms debounce + 200ms API)
- Password validation: < 50ms (real-time)
- Tag animations: 200ms (smooth)

**If slower:**

- Check network tab
- Check for Redux dev tools overhead
- Check for excessive re-renders

---

## 🎓 For Developers

**Component Usage Examples:**

```typescript
// Skills Input
import { SkillsInput } from "@/components/forms/SkillsInput";

<SkillsInput
  value={skills}
  onChange={setSkills}
  maxSkills={20}
  placeholder="ex: JavaScript"
  enableAutocompletedFromAPI={true}
/>;

// Password Input
import { PasswordInput } from "@/components/auth/PasswordInput";

<PasswordInput
  value={password}
  onChange={setPassword}
  showStrengthMeter={true}
  showCriteria={true}
/>;

// Password Confirmation
import { PasswordConfirmation } from "@/components/auth/PasswordConfirmation";

<PasswordConfirmation
  password={password}
  confirmPassword={confirmPassword}
  onPasswordChange={setPassword}
  onConfirmPasswordChange={setConfirmPassword}
/>;
```

**API Usage:**

```typescript
// GET autocomplete
const response = await fetch("/api/ai/suggest-skills?query=react&limit=10");
const { results } = await response.json();

// GET contextual suggestions
const response = await fetch(
  "/api/ai/suggest-skills?existingSkills=React,Python"
);
const { results } = await response.json();

// POST AI-powered (requires auth)
const response = await fetch("/api/ai/suggest-skills", {
  method: "POST",
  body: JSON.stringify({ role: "Software Engineer", seniority: "Senior" }),
});
const { skills } = await response.json();
```

---

Happy testing! 🧪✨
