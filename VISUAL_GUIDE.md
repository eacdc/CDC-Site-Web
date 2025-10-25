# CDC Web App - Visual Guide

This guide provides a visual description of the application's design and layout.

## 🎨 Color Scheme

### Primary Colors
```
Background (Dark Blue):  #0f172a ████████
Card Background (Slate): #1e293b ████████
Primary (Indigo):        #6366f1 ████████
Success (Green):         #22c55e ████████
Warning (Orange):        #f59e0b ████████
Danger (Red):            #ef4444 ████████
Text (Light):            #e2e8f0 ████████
Text Muted (Gray):       #94a3b8 ████████
Border (Dark Slate):     #334155 ████████
```

## 📱 Screen Layouts

### 1. Login Screen
```
┌─────────────────────────────────────┐
│ 🏭 CDC Process Management           │ ← Header (Dark)
├─────────────────────────────────────┤
│                                     │
│     ┌─────────────────────┐        │
│     │                     │        │
│     │  Welcome to CDC     │        │
│     │  Process Management │        │ ← Card (Center)
│     │                     │        │
│     │  [Username Input]   │        │
│     │  [Database Select]  │        │
│     │                     │        │
│     │    [Sign In Btn]    │        │
│     │                     │        │
│     └─────────────────────┘        │
│                                     │
├─────────────────────────────────────┤
│ © 2024 CDC                          │ ← Footer
└─────────────────────────────────────┘
```

### 2. Machine Selection Screen
```
┌─────────────────────────────────────┐
│ 🏭 CDC | User: John (KOL)   [🚪]    │ ← Header + User Info
├─────────────────────────────────────┤
│                                     │
│        Select Machine               │
│  Choose a machine to start          │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │  🏭      │  │  🏭      │        │
│  │ Machine1 │  │ Machine2 │        │ ← Machine Cards (Grid)
│  │ ID: 101  │  │ ID: 102  │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │  🏭      │  │  🏭      │        │
│  │ Machine3 │  │ Machine4 │        │
│  │ ID: 103  │  │ ID: 104  │        │
│  └──────────┘  └──────────┘        │
│                                     │
├─────────────────────────────────────┤
│ © 2024 CDC                          │
└─────────────────────────────────────┘
```

### 3. Search Screen (QR Scanner)
```
┌─────────────────────────────────────┐
│ 🏭 CDC | User: John (KOL)   [🚪]    │
├─────────────────────────────────────┤
│  [← Back]                           │
│                                     │
│       Search Job Card               │
│                                     │
│  ┌─────────────────────┐            │
│  │ Machine: Machine1   │            │ ← Info Card
│  └─────────────────────┘            │
│                                     │
│  ┌─────────┬───────────┐            │
│  │ 📷 QR   │ ✏️ Manual │            │ ← Tabs
│  ├─────────┴───────────┤            │
│  │                     │            │
│  │  ┌─────────────┐   │            │
│  │  │             │   │            │
│  │  │   CAMERA    │   │            │ ← QR Scanner
│  │  │    VIEW     │   │            │
│  │  │             │   │            │
│  │  └─────────────┘   │            │
│  │                     │            │
│  │ Position QR code    │            │
│  │ within the frame    │            │
│  └─────────────────────┘            │
│                                     │
├─────────────────────────────────────┤
│ © 2024 CDC                          │
└─────────────────────────────────────┘
```

### 4. Search Screen (Manual Entry)
```
┌─────────────────────────────────────┐
│ 🏭 CDC | User: John (KOL)   [🚪]    │
├─────────────────────────────────────┤
│  [← Back]                           │
│                                     │
│       Search Job Card               │
│                                     │
│  ┌─────────────────────┐            │
│  │ Machine: Machine1   │            │
│  └─────────────────────┘            │
│                                     │
│  ┌─────────┬───────────┐            │
│  │  📷 QR  │ ✏️ Manual │            │ ← Active Tab
│  ├─────────┴───────────┤            │
│  │                     │            │
│  │  Job Card Number    │            │
│  │  [Input Field...]   │            │ ← Input
│  │                     │            │
│  │    [Search Btn]     │            │
│  │                     │            │
│  └─────────────────────┘            │
│                                     │
├─────────────────────────────────────┤
│ © 2024 CDC                          │
└─────────────────────────────────────┘
```

### 5. Process List Screen
```
┌─────────────────────────────────────┐
│ 🏭 CDC | User: John (KOL)   [🚪]    │
├─────────────────────────────────────┤
│  [← Back]                           │
│                                     │
│      Process Details                │
│                                     │
│  ┌─────────────────────┐            │
│  │ Machine: Machine1   │            │
│  │ Job Card: JC001     │            │ ← Info Card
│  └─────────────────────┘            │
│                                     │
│  ▶️ Running Processes      [2]      │ ← Running Section
│  ┌─────────────────────────────┐    │
│  │ 1 Process A (123)          │    │
│  │ Client: XYZ | Job: ABC     │    │ ← Process Card
│  │ Schedule: 100 | Prod: 50   │    │   (Orange)
│  │          [View Status]      │    │
│  └─────────────────────────────┘    │
│                                     │
│  📋 Pending Processes    [5 of 8]   │ ← Pending Section
│  ┌─────────────────────────────┐    │
│  │ 3 Process B (124)          │    │
│  │ Client: ABC | Job: XYZ     │    │ ← Process Card
│  │ Schedule: 200 | Prod: 0    │    │   (Blue/White)
│  │            [Start]          │    │
│  └─────────────────────────────┘    │
│                                     │
│        [Load More]                  │ ← Load More Button
│                                     │
├─────────────────────────────────────┤
│ © 2024 CDC                          │
└─────────────────────────────────────┘
```

### 6. Running Process Screen
```
┌─────────────────────────────────────┐
│ 🏭 CDC | User: John (KOL)   [🚪]    │
├─────────────────────────────────────┤
│  [← Back]                           │
│                                     │
│      Running Process                │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ▶️ Process A (123)         │    │
│  │ Client: XYZ                │    │
│  │ Job: ABC Component: P1     │    │ ← Process Details
│  │ PWO: PWO001                │    │   (Orange Card)
│  │                            │    │
│  │ Schedule: 100  Prod: 50    │    │
│  │ [Cancel]     [Complete]    │    │ ← Action Buttons
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │         ⏱️                  │    │
│  │   Production Time          │    │ ← Timer Card
│  │      01:23:45              │    │   (Green)
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Complete Production       │    │
│  │                            │    │
│  │  Production Qty: [____]    │    │ ← Complete Form
│  │  Wastage Qty: [____]       │    │   (Blue)
│  │                            │    │
│  │  [Cancel]      [Submit]    │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│ © 2024 CDC                          │
└─────────────────────────────────────┘
```

## 📱 Mobile View (< 768px)

### Process Card (Mobile)
```
┌───────────────────┐
│ 1 Process Name    │ ← Single column
│ Client: XYZ       │
│ Job: ABC          │
│ Component: P1     │
│ PWO: PWO001       │
│ ─────────────     │
│ Schedule: 100     │
│ Produced: 50      │
│ ─────────────     │
│   [Start]         │ ← Full-width button
└───────────────────┘
```

### Machine Card (Mobile)
```
┌───────────────────┐
│      🏭           │
│   Machine Name    │ ← Single column
│   ID: 101         │
└───────────────────┘
```

## 💻 Desktop View (> 1025px)

### Process Card (Desktop)
```
┌─────────────────────────────────────────┐
│ 1 Process Name                [Actions] │ ← Horizontal layout
│                                          │
│ 🏢 Client: XYZ    💼 Job: ABC           │ ← Two columns
│ 📦 Component: P1  📄 PWO: PWO001        │
│                                          │
│ Schedule: 100  |  Produced: 50          │ ← Inline quantities
└─────────────────────────────────────────┘
```

### Machine Grid (Desktop)
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│   🏭    │ │   🏭    │ │   🏭    │ │   🏭    │
│Machine1 │ │Machine2 │ │Machine3 │ │Machine4 │ ← 4 columns
│ ID: 101 │ │ ID: 102 │ │ ID: 103 │ │ ID: 104 │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

## 🎨 Component Styles

### Buttons

#### Primary Button
```
┌─────────────────┐
│   Sign In       │ ← Indigo gradient, white text
└─────────────────┘
     Hover: Lifts up with shadow
```

#### Secondary Button
```
┌─────────────────┐
│   Cancel        │ ← Transparent, border, gray text
└─────────────────┘
     Hover: Background becomes darker
```

#### Success Button
```
┌─────────────────┐
│   Complete      │ ← Green, white text
└─────────────────┘
```

#### Danger Button
```
┌─────────────────┐
│   Cancel        │ ← Red, white text
└─────────────────┘
```

### Input Fields
```
┌─────────────────────────┐
│ Username                │ ← Dark background
│ [Enter username...]     │   Border on focus
└─────────────────────────┘
```

### Process Status Indicators

#### Running (Orange)
```
┌─────────────────────┐
│ ▶️ Process Name    │ ← Orange background
│ ...                │   Orange accent
└─────────────────────┘
```

#### In Queue (Green)
```
┌─────────────────────┐
│ ✓ Process Name     │ ← Green accent
│ ...                │   White/slate background
└─────────────────────┘
```

#### Paper Not Issued (Gray)
```
┌─────────────────────┐
│ 🚫 Process Name    │ ← Gray background
│ ...                │   Dimmed, unclickable
└─────────────────────┘
```

## 🎯 Interactive Elements

### Loading State
```
     ⟳
  Loading...
```

### Empty State
```
    📋
No processes found
No pending processes
 for this job card
```

### Timer Display
```
  ⏱️
Production Time
   01:23:45
```

### Badges

#### Quantity Badge
```
┌──────────┐
│ Schedule │ ← Green border
│   100    │   Large number
└──────────┘
```

#### Count Badge
```
┌───┐
│ 5 │ ← Small, rounded
└───┘   Orange/Blue
```

#### Status Badge
```
┌────────────┐
│ Running ⚡ │ ← Colored background
└────────────┘
```

## 📐 Spacing & Typography

### Spacing Scale
```
xs:  4px  (0.25rem)
sm:  8px  (0.5rem)
md:  16px (1rem)
lg:  24px (1.5rem)
xl:  32px (2rem)
2xl: 48px (3rem)
```

### Font Sizes
```
xs:   12px (0.75rem)  - Small labels
sm:   14px (0.875rem) - Body text
base: 16px (1rem)     - Default
lg:   18px (1.125rem) - Sub-headings
xl:   20px (1.25rem)  - Section titles
2xl:  24px (1.5rem)   - Card titles
3xl:  30px (1.875rem) - Page titles
```

### Border Radius
```
sm: 6px   - Small elements
md: 8px   - Buttons, inputs
lg: 12px  - Cards, containers
xl: 16px  - Large sections
```

## 🌈 Gradient Effects

### Primary Gradient (Indigo to Purple)
```
────────────────────→
#6366f1 to #8b5cf6
(Used for buttons, headers)
```

### Background Gradient
```
↓
#0b1220 (top)
  to
#0f172a (bottom)
```

### Card Glow Effect
```
Radial gradient overlay:
rgba(99,102,241,0.08)
(Subtle glow at top of cards)
```

## 💡 Visual Hierarchy

### Priority Levels
```
1. Primary Actions    → Bright colors, prominent
2. Secondary Actions  → Muted colors, borders
3. Information       → Gray text
4. Background        → Dark, recessive
```

### Size Hierarchy
```
Page Title         → Largest (30px)
Section Headers    → Large (24px)
Card Titles        → Medium (20px)
Body Text          → Base (16px)
Labels/Meta        → Small (14px)
Tiny Text          → Smallest (12px)
```

## 🎭 States & Feedback

### Button States
```
Normal:  [  Button  ]
Hover:   [↑ Button  ] ← Lifts, brighter
Active:  [↓ Button  ] ← Pressed down
Loading: [⟳ Button  ] ← Spinner
Disabled: [ Button  ] ← Dimmed, no hover
```

### Card States
```
Normal:  ┌──────┐
         │ Card │
         └──────┘

Hover:   ┌──────┐
         │ Card │ ← Lifts, border glow
         └──────┘
         
Active:  ┌──────┐
         │ Card │ ← Highlighted border
         └──────┘
```

## 🔲 Icons

All icons are inline SVG from Material Design Icons set:
- 🏭 Factory (Logo)
- 📋 List (Processes)
- 📷 Camera (QR Scanner)
- ✏️ Edit (Manual Entry)
- ▶️ Play (Running/Start)
- ✓ Check (Complete)
- ✕ Close (Cancel)
- ⏱️ Timer (Production Time)
- 🚪 Logout
- ← Back Arrow
- ↑ ↓ Expand/Collapse

## 📊 Layout Grid

### Desktop (3 Columns)
```
┌───┬───┬───┐
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ 4 │ 5 │ 6 │
└───┴───┴───┘
```

### Tablet (2 Columns)
```
┌─────┬─────┐
│  1  │  2  │
├─────┼─────┤
│  3  │  4  │
└─────┴─────┘
```

### Mobile (1 Column)
```
┌───────────┐
│     1     │
├───────────┤
│     2     │
├───────────┤
│     3     │
└───────────┘
```

---

**Design System Version**: 1.0
**Color Palette**: Dark Theme
**Typography**: System Fonts
**Icons**: Material Design (SVG)
**Grid**: Flexbox + CSS Grid
**Animations**: CSS Transitions

