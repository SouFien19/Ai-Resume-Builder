# 🎯 Bundle Optimization Guide

## Reduce Unused JavaScript (~415 KiB savings)

### Current Issues:

```
✗ Framer Motion: ~150 KB unused (importing entire library)
✗ Lucide React: ~80 KB unused (importing all icons)
✗ Radix UI: ~60 KB unused (unused components)
✗ Clerk SDK: ~50 KB unused (unused hooks/components)
✗ Other libraries: ~75 KB unused
```

---

## 🔧 Optimizations Applied

### 1. **Framer Motion - Tree-Shaking**

#### ❌ Before (Importing everything):

```typescript
import { motion, AnimatePresence } from "framer-motion";
```

#### ✅ After (Import only what you need):

```typescript
import { motion } from "framer-motion/dist/framer-motion";
// OR use LazyMotion for even smaller bundle
import { LazyMotion, domAnimation, m } from "framer-motion";

function MyComponent() {
  return (
    <LazyMotion features={domAnimation}>
      <m.div animate={{ opacity: 1 }} />
    </LazyMotion>
  );
}
```

**Savings**: ~120 KB

---

### 2. **Lucide React - Individual Imports**

#### ❌ Before:

```typescript
import { User, Mail, Lock, Settings, Menu } from "lucide-react";
```

#### ✅ After:

```typescript
import User from "lucide-react/dist/esm/icons/user";
import Mail from "lucide-react/dist/esm/icons/mail";
import Lock from "lucide-react/dist/esm/icons/lock";
```

**Savings**: ~60 KB

---

### 3. **Clerk SDK - Targeted Imports**

#### ❌ Before:

```typescript
import { useAuth, useUser, useClerk, SignIn, SignUp } from "@clerk/nextjs";
```

#### ✅ After (Only import what page uses):

```typescript
// sign-in page only needs:
import { SignIn } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

// sign-up page only needs:
import { SignUp } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
```

**Savings**: ~30 KB

---

### 4. **Remove Unused Dependencies**

Run bundle analyzer to find unused packages:

```bash
npm run build
ANALYZE=true npm run build
```

Then remove unused packages:

```bash
# Example: If you're not using these, remove them
npm uninstall @radix-ui/react-accordion  # Not used on sign-in
npm uninstall recharts  # Not used on auth pages
npm uninstall date-fns  # Not used on auth pages
```

---

### 5. **Code Splitting Configuration**

Update `next.config.js`:

```javascript
module.exports = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@clerk/nextjs",
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          // Separate vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            priority: 10,
          },
          // Separate Clerk chunk (lazy load)
          clerk: {
            test: /[\\/]node_modules[\\/]@clerk[\\/]/,
            name: "clerk",
            priority: 20,
          },
          // Separate UI library chunks
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|framer-motion)[\\/]/,
            name: "ui",
            priority: 15,
          },
        },
      };
    }
    return config;
  },
};
```

---

### 6. **Dynamic Imports for Heavy Components**

```typescript
// Instead of:
import ResumeEditor from "@/components/ResumeEditor";

// Use:
const ResumeEditor = dynamic(() => import("@/components/ResumeEditor"), {
  loading: () => <div>Loading editor...</div>,
  ssr: false, // Disable SSR for client-only components
});
```

---

## 📊 Expected Results

| Optimization               | Bundle Size Reduction | Load Time Improvement |
| -------------------------- | --------------------- | --------------------- |
| Framer Motion Tree-Shaking | ~120 KB               | ~0.8s faster          |
| Lucide Individual Imports  | ~60 KB                | ~0.4s faster          |
| Clerk Targeted Imports     | ~30 KB                | ~0.2s faster          |
| Remove Unused Deps         | ~75 KB                | ~0.5s faster          |
| Code Splitting             | ~130 KB (lazy loaded) | ~1.0s faster initial  |
| **TOTAL**                  | **~415 KB**           | **~2.9s faster** ⚡   |

---

## 🚀 Implementation Priority

### Phase 1 (Today - 30 mins):

1. ✅ Add LazyMotion for Framer Motion
2. ✅ Use individual Lucide icon imports
3. ✅ Update next.config.js with code splitting

### Phase 2 (Tomorrow - 1 hour):

4. Remove unused dependencies
5. Implement dynamic imports for heavy components
6. Run bundle analyzer and optimize further

### Phase 3 (This week - 2 hours):

7. Implement route-based code splitting
8. Add service worker for caching
9. Optimize font loading strategy

---

## 🧪 Testing

After optimizations, run:

```bash
# 1. Build production bundle
npm run build

# 2. Analyze bundle
ANALYZE=true npm run build

# 3. Check bundle sizes
ls -lh .next/static/chunks/

# 4. Run Lighthouse again
npm run lighthouse
```

Expected Lighthouse score: **85-90** (from 71)

---

## 📝 Verification Checklist

- [ ] Bundle size reduced by at least 300 KB
- [ ] No broken functionality after tree-shaking
- [ ] Lighthouse performance score > 85
- [ ] TBT (Total Blocking Time) < 200ms
- [ ] FCP (First Contentful Paint) < 1.0s
- [ ] LCP (Largest Contentful Paint) < 2.0s

---

## 🔗 Resources

- [Next.js Code Splitting](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Framer Motion LazyMotion](https://www.framer.com/motion/lazy-motion/)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Tree-shaking Best Practices](https://webpack.js.org/guides/tree-shaking/)
