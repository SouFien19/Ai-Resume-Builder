# 🎨 Admin Dashboard Design System - Quick Reference

## 🎯 Color Gradients

### **Headers**

```tsx
// Main Dashboard
from-pink-600 via-orange-600 to-red-600

// Resume Management
from-pink-600 via-purple-600 to-orange-600

// AI Monitoring
from-purple-600 via-pink-600 to-orange-600

// Analytics
from-blue-600 via-cyan-600 to-teal-600

// Revenue
from-green-600 via-emerald-600 to-teal-600
```

### **Stats Card Colors**

```tsx
// Blue Theme
gradient: "from-blue-500 to-cyan-600";
bg: "from-blue-500 to-cyan-500";

// Green Theme
gradient: "from-green-500 to-emerald-600";
bg: "from-green-500 to-emerald-500";

// Purple Theme
gradient: "from-purple-500 to-indigo-600";
bg: "from-purple-500 to-indigo-500";

// Pink Theme
gradient: "from-pink-500 to-rose-600";
bg: "from-pink-500 to-rose-500";

// Orange Theme
gradient: "from-orange-500 to-amber-600";
bg: "from-orange-500 to-amber-500";
```

---

## 🎭 Animation Presets

### **Card Entrance**

```tsx
initial={{ opacity: 0, scale: 0.9, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
```

### **Card Hover**

```tsx
whileHover={{ scale: 1.03, y: -5 }}
```

### **Button Hover**

```tsx
whileHover={{ scale: 1.05, y: -2 }}
whileTap={{ scale: 0.95 }}
```

### **Floating Icon**

```tsx
animate={{
  y: [0, -8, 0],
  rotate: [0, 5, 0]
}}
transition={{
  duration: 3,
  repeat: Infinity,
  ease: 'easeInOut'
}}
```

### **Header Fade In**

```tsx
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, ease: 'easeOut' }}
```

---

## 📐 Layout System

### **Spacing**

```css
gap-6        /* 24px grid gap */
p-6          /* 24px padding */
space-y-6    /* 24px vertical spacing */
```

### **Rounded Corners**

```css
rounded-2xl  /* 16px - cards */
rounded-xl   /* 12px - buttons, inputs */
rounded-lg   /* 8px - badges */
```

### **Shadows**

```css
shadow-lg           /* default */
shadow-xl           /* hover state */
blur-xl             /* 20px glow */
blur-2xl            /* 40px glow */
```

---

## 🎨 StatsCard Template

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
  whileHover={{ scale: 1.03, y: -5 }}
  className="relative group"
>
  {/* Glow Background */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />

  {/* Card Container */}
  <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow p-6 overflow-hidden">
    {/* Decorative Blob */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-10 rounded-full -mr-16 -mt-16" />

    <div className="relative">
      {/* Icon and Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-600 text-sm font-semibold">Title</span>
        <motion.div
          className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg text-white"
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
      </div>

      {/* Value */}
      <motion.div
        className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-cyan-600 bg-clip-text text-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        1,234
      </motion.div>

      {/* Context */}
      <p className="text-sm text-gray-500 mt-1">Context text</p>
    </div>
  </div>
</motion.div>
```

---

## 📊 ChartCard Template

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5, duration: 0.5 }}
  whileHover={{ y: -5 }}
  className="relative group"
>
  {/* Glow Background */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

  {/* Card Container */}
  <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow p-6">
    <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
      Chart Title
    </h2>
    {/* Chart Component */}
    <ResponsiveContainer width="100%" height={300}>
      {/* Your chart here */}
    </ResponsiveContainer>
  </div>
</motion.div>
```

---

## 🎨 Button Variants

### **Primary Button**

```tsx
<motion.button
  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-orange-600 text-white font-semibold shadow-lg"
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
>
  Button Text
</motion.button>
```

### **Secondary Button**

```tsx
<motion.button
  className="px-4 py-2 rounded-xl bg-white text-gray-700 font-semibold border border-gray-200 hover:bg-gray-50 shadow-md"
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
>
  Button Text
</motion.button>
```

### **Time Selector Button**

```tsx
<motion.button
  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
    isActive
      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
  }`}
  whileHover={{ scale: 1.05, y: -2 }}
  whileTap={{ scale: 0.95 }}
>
  7D
</motion.button>
```

---

## 🎯 Typography Scale

```tsx
// Headers
text-4xl md:text-5xl  // Main titles
text-3xl              // Section titles
text-xl               // Card titles
text-lg               // Subtitles

// Body Text
text-sm font-semibold  // Card labels
text-3xl font-bold     // Card values
text-sm font-medium    // Context text
```

---

## 📱 Responsive Grid

```tsx
// 1 column mobile, 2 tablet, 3 desktop
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// 1 column mobile, 2 tablet, 4 desktop
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

// 1 column mobile, 2 desktop (charts)
grid-cols-1 lg:grid-cols-2
```

---

## 🎨 CSS Animations

```css
/* In globals.css */

/* Gradient animation */
.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 5s ease infinite;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Usage */
className="bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 bg-clip-text text-transparent animate-gradient"
```

---

## 🔧 Common Patterns

### **Header with Time Selector**

```tsx
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
  <div>
    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent animate-gradient">
      Dashboard Title
    </h1>
    <p className="text-gray-600 mt-3 text-lg">Description</p>
  </div>

  <motion.div className="flex gap-2">
    {[7, 14, 30, 90].map((days, index) => (
      <motion.button key={days} /* ... */ />
    ))}
  </motion.div>
</div>
```

### **Stats Grid**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {stats.map((stat, index) => (
    <StatsCard key={index} delay={index * 0.1} {...stat} />
  ))}
</div>
```

### **Charts Grid**

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <ChartCard title="Chart 1" delay={0.5}>
    {/* Chart component */}
  </ChartCard>
  <ChartCard title="Chart 2" delay={0.6}>
    {/* Chart component */}
  </ChartCard>
</div>
```

---

## ✅ Checklist for New Dashboards

- [ ] Import Framer Motion: `import { motion } from 'framer-motion'`
- [ ] Animated gradient header with `animate-gradient`
- [ ] Stats cards with `delay: index * 0.1`
- [ ] Floating icons with y/rotate animation
- [ ] Glow backgrounds with `blur-xl`
- [ ] Hover effects with `whileHover`
- [ ] Staggered entrance animations
- [ ] Rounded corners `rounded-2xl`
- [ ] Shadows `shadow-lg` → `shadow-xl`
- [ ] Responsive grid layout
- [ ] Consistent spacing `gap-6`, `p-6`

---

**Quick Reference Complete!**
Use this guide when creating new dashboards or components. 🎨✨
