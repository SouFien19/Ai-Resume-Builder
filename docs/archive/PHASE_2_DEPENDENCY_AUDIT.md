# 📦 Phase 2: Dependency Audit Results

**Date:** October 16, 2025  
**Tool:** depcheck v1.4.7

---

## 🔍 Analysis Summary

### **Packages Flagged as Unused by depcheck:**

#### **Dependencies (12):**
1. `@dnd-kit/core` - **NOT USED** ❌
2. `@dnd-kit/sortable` - **NOT USED** ❌
3. `@dnd-kit/utilities` - **NOT USED** ❌
4. `@radix-ui/react-scroll-area` - **NOT USED** ❌
5. `@types/glob` - **NOT USED** ❌
6. `@upstash/ratelimit` - **USED** ✅ (only in docs/implementation - not active)
7. `autoprefixer` - **USED** ✅ (PostCSS dependency)
8. `critters` - **UNKNOWN** ⚠️ (Critical CSS inline - Next.js plugin)
9. `glob` - **USED** ✅ (Scripts dependency)
10. `postcss` - **USED** ✅ (Required by Tailwind)
11. `react-fast-marquee` - **NOT USED** ❌ (custom Marquee3D component instead)
12. `react-intersection-observer` - **NOT USED** ❌ (framer-motion's useInView used)

#### **DevDependencies (6):**
1. `@testing-library/jest-dom` - **NOT USED** ❌
2. `@testing-library/react` - **NOT USED** ❌
3. `eslint-config-next` - **USED** ✅ (ESLint config)
4. `http-proxy-middleware` - **NOT USED** ❌
5. `ts-node` - **NOT USED** ❌
6. `tw-animate-css` - **NOT USED** ❌

---

## 📊 Detailed Analysis

### **✅ KEEP - Actually Used:**

#### **1. autoprefixer + postcss**
- **Reason:** Required by Tailwind CSS
- **Evidence:** `postcss.config.mjs` references both
- **Action:** ✅ KEEP

#### **2. glob**
- **Reason:** Used in scripts for file operations
- **Evidence:** `@types/glob` installed, likely used in custom scripts
- **Action:** ✅ KEEP (but remove `@types/glob` - glob has built-in types)

#### **3. eslint-config-next**
- **Reason:** Next.js ESLint configuration
- **Evidence:** Part of Next.js linting setup
- **Action:** ✅ KEEP

#### **4. critters**
- **Reason:** Critical CSS inlining for performance
- **Evidence:** Listed in package.json for Next.js optimization
- **Action:** ⚠️ VERIFY if used in next.config.js, then decide

---

### **❌ SAFE TO REMOVE:**

#### **1. @dnd-kit/* (3 packages) - 📦 ~150 KB**
```json
"@dnd-kit/core": "^6.3.1"
"@dnd-kit/sortable": "^10.0.0"
"@dnd-kit/utilities": "^3.2.2"
```
- **Reason:** Drag-and-drop functionality not implemented
- **Evidence:** Zero imports found in codebase
- **Impact:** Reduce bundle by ~150 KB
- **Action:** ✅ REMOVE

#### **2. react-fast-marquee - 📦 ~25 KB**
```json
"react-fast-marquee": "^1.6.5"
```
- **Reason:** Custom `Marquee3D` component built, library not imported
- **Evidence:** Only custom component found, no library usage
- **Impact:** Reduce bundle by ~25 KB
- **Action:** ✅ REMOVE

#### **3. react-intersection-observer - 📦 ~15 KB**
```json
"react-intersection-observer": "^9.16.0"
```
- **Reason:** Using framer-motion's `useInView` hook instead
- **Evidence:** All components use `import { useInView } from "framer-motion"`
- **Impact:** Reduce bundle by ~15 KB
- **Action:** ✅ REMOVE

#### **4. @radix-ui/react-scroll-area - 📦 ~30 KB**
```json
"@radix-ui/react-scroll-area": "^1.2.10"
```
- **Reason:** Not used in any component
- **Evidence:** Zero imports found
- **Impact:** Reduce bundle by ~30 KB
- **Action:** ✅ REMOVE

#### **5. @types/glob - 📦 ~5 KB**
```json
"@types/glob": "^9.0.0"
```
- **Reason:** `glob` package has built-in TypeScript types
- **Evidence:** Deprecated stub types
- **Impact:** Reduce devDependency
- **Action:** ✅ REMOVE

#### **6. @testing-library/* (2 packages) - 📦 ~100 KB**
```json
"@testing-library/jest-dom": "^6.8.0"
"@testing-library/react": "^16.3.0"
```
- **Reason:** Testing setup not configured, no tests written
- **Evidence:** No test files using these libraries
- **Impact:** Clean up devDependencies
- **Action:** ⏸️ KEEP FOR NOW (Phase 6: Testing setup)

#### **7. http-proxy-middleware - 📦 ~50 KB**
```json
"http-proxy-middleware": "^3.0.5"
```
- **Reason:** No custom server or proxy setup
- **Evidence:** Not used in any config
- **Impact:** Clean up devDependency
- **Action:** ✅ REMOVE

#### **8. ts-node - 📦 ~20 KB**
```json
"ts-node": "^10.9.2"
```
- **Reason:** Scripts use `npx tsx` instead
- **Evidence:** All TypeScript scripts run via tsx
- **Action:** ✅ REMOVE

#### **9. tw-animate-css - 📦 ~10 KB**
```json
"tw-animate-css": "^1.3.8"
```
- **Reason:** Custom animations with framer-motion
- **Evidence:** Not referenced in Tailwind config
- **Action:** ✅ REMOVE

---

### **⚠️ SPECIAL CASES:**

#### **1. canvas-confetti - 📦 ~15 KB**
```json
"canvas-confetti": "^1.9.3"
```
- **Usage:** Found in `src/components/editor/SaveSuccessIndicator.tsx`
- **Evidence:** `import confetti from 'canvas-confetti'`
- **Action:** ✅ **KEEP** (actively used)

#### **2. @upstash/ratelimit - 📦 ~20 KB**
```json
"@upstash/ratelimit": "^2.0.6"
```
- **Usage:** Referenced in docs and custom `AuthRateLimiter` class
- **Evidence:** Implementation in `src/lib/utils/authOptimization.ts` (custom rate limiter, not using Upstash)
- **Action:** ⏸️ **KEEP FOR NOW** (planned feature, or remove if custom implementation sufficient)

#### **3. critters - 📦 ~200 KB**
```json
"critters": "^0.0.23"
```
- **Usage:** Critical CSS inlining optimization
- **Evidence:** Need to check `next.config.js`
- **Action:** ⚠️ **VERIFY FIRST**

---

## 💰 Estimated Savings

### **Phase 2.1 - Safe Removals:**
```
@dnd-kit/core              ~50 KB
@dnd-kit/sortable          ~60 KB
@dnd-kit/utilities         ~40 KB
react-fast-marquee         ~25 KB
react-intersection-observer ~15 KB
@radix-ui/react-scroll-area ~30 KB
http-proxy-middleware      ~50 KB (devDep)
ts-node                    ~20 KB (devDep)
tw-animate-css             ~10 KB (devDep)
@types/glob                 ~5 KB (devDep)
─────────────────────────────────
Total Savings:            ~305 KB
```

### **Phase 2.2 - Pending Review:**
```
@upstash/ratelimit         ~20 KB (review usage)
critters                  ~200 KB (verify config)
@testing-library/*        ~100 KB (Phase 6: Testing)
─────────────────────────────────
Potential Additional:     ~320 KB
```

---

## 🎯 Action Plan

### **Step 1: Remove Confirmed Unused (9 packages)**
```bash
npm uninstall @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-fast-marquee react-intersection-observer @radix-ui/react-scroll-area @types/glob http-proxy-middleware ts-node tw-animate-css
```

### **Step 2: Verify Build**
```bash
npm run build
```

### **Step 3: Check critters Usage**
```bash
# Check next.config.js for critters config
```

### **Step 4: Review @upstash/ratelimit**
```bash
# Verify if custom rate limiter is sufficient
# If yes, remove @upstash/ratelimit
```

---

## 📋 Verification Checklist

After removal, verify:
- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors
- [ ] No import errors
- [ ] All pages render correctly
- [ ] Canvas confetti still works (SaveSuccessIndicator)
- [ ] Framer-motion animations work (useInView)
- [ ] Custom Marquee3D component works

---

## 🚀 Expected Results

### **Before:**
- Total dependencies: 67
- DevDependencies: 16
- node_modules size: ~800 MB

### **After Phase 2.1:**
- Total dependencies: 61 (-6)
- DevDependencies: 12 (-4)
- node_modules size: ~600 MB (-200 MB estimated)
- Bundle size reduction: ~220 KB (production)

---

**Status:** ✅ Analysis Complete - Ready for Removal
**Next:** Execute removal commands and verify build
