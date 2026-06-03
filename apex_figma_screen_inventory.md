# APEX Figma Screen Inventory & Design-to-Code Specification
## Version 1.0.0
### Scope: Mobile Companion App (Flutter) & Desktop Client (Tauri + React/Next.js)

This document is the official design translation blueprint for APEX (Adaptive Presence & Execution Intelligence). It maps the UI layouts, component trees, typography, spacing grids, interaction triggers, and responsive behaviors to Figma-ready canvas structures, allowing designers and engineers to maintain absolute alignment.

---

## 1. FIGMA CANVAS SETUP & SYSTEM TOKENS

### 1.1 Canvas Setup & Grids
To ensure pixel-perfect conversion, Figma files must utilize the following base configurations:

*   **Global Spacing Unit**: 8px grid. All gaps, margins, paddings, and absolute positioning offsets must be multiples of 8px (with 4px exceptions for micro-spacings).
*   **Mobile Artboard Size**: **390px x 844px** (Figma Preset: iPhone 13 / 14 / 15 or 19.8:9 Android viewport).
*   **Desktop Artboard Size**: **1440px x 900px** (Figma Preset: MacBook Pro 14" default).
*   **Figma Layout Grid**:
    *   **Mobile**: 4 Columns | Margin: 16px | Gutter: 16px | Stretch constraints.
    *   **Desktop**: 12 Columns | Margin: 32px | Gutter: 24px | Max-width 1440px.

---

### 1.2 Spacing & Auto Layout Tokens

| Token Name | Pixel Value | Figma Auto Layout Binding | Primary Application |
| :--- | :--- | :--- | :--- |
| `space-1` | 4px | Padding / Gap: 4px | Inner micro-spacing, badges, avatar borders |
| `space-2` | 8px | Padding / Gap: 8px | Button padding, small list item gaps, inputs |
| `space-3` | 16px | Padding / Gap: 16px | Inner card padding, content item gaps |
| `space-4` | 24px | Padding / Gap: 24px | Outer card padding, standard layout gaps, modal margins |
| `space-5` | 32px | Padding / Gap: 32px | Page margins (Desktop), section dividers |
| `space-6` | 48px | Padding / Gap: 48px | Hero layout gaps, empty state heights |
| `space-7` | 64px | Padding / Gap: 64px | Absolute focus canvas margins (Flow Mode) |
| `space-10`| 128px | Padding / Gap: 128px | Socratic canvas margins (Fatigue/Overload mode) |

---

### 1.3 Color Palette Mappings
All colors must be registered as local document styles in Figma:

```json
{
  "Fills": {
    "Bg-Primary": { "hex": "#0A0A0A", "opacity": 1.0, "usage": "Default screen base canvas background" },
    "Bg-Secondary": { "hex": "#121212", "opacity": 1.0, "usage": "Default card, container, and sidebar background" },
    "Bg-Overlay": { "hex": "#181818", "opacity": 1.0, "usage": "Interactive surfaces, hover overrides" },
    "Bg-Glass": { "hex": "#121212", "opacity": 0.7, "blur": "20px", "usage": "Overlay windows, command palettes" },
    "Accent-Yellow": { "hex": "#FFD400", "opacity": 1.0, "usage": "Laser focus primary action color" }
  },
  "Borders": {
    "Border-Default": { "hex": "#2C2C2C", "opacity": 1.0, "width": 1.0 },
    "Border-Muted": { "hex": "#1F1F1F", "opacity": 1.0, "width": 1.0 },
    "Border-Accent": { "hex": "#FFD400", "opacity": 1.0, "width": 1.5 }
  },
  "States / Agents": {
    "State-Flow": { "hex": "#00D26A", "opacity": 1.0, "usage": "Flow state accents, completion green" },
    "State-Distracted": { "hex": "#FFB800", "opacity": 1.0, "usage": "Distraction warning orange" },
    "State-Fatigued": { "hex": "#00A3FF", "opacity": 1.0, "usage": "Restorative fatigue blue" },
    "State-Overloaded": { "hex": "#FF4D4F", "opacity": 1.0, "usage": "Overload warning red" },
    "Agent-State": { "hex": "#FF4500", "usage": "State Agent Indicator" },
    "Agent-Deadline": { "hex": "#FF0055", "usage": "Deadline Sentinel Indicator" },
    "Agent-Environment": { "hex": "#00F5FF", "usage": "Environment Sculptor Indicator" },
    "Agent-Peer": { "hex": "#7B2CBF", "usage": "Peer Radar Indicator" },
    "Agent-Socratic": { "hex": "#00FF87", "usage": "Socratic Challenger Indicator" }
  }
}
```

---

### 1.4 Typography Scale

| Figma Style Name | Font Family | Size (px/pt) | Line Height (px/pt) | Weight | Letter Spacing | Mapping |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Display XL` | Cabinet Grotesk / Plus Jakarta | 48px | 52px | ExtraBold (800) | -0.04em | Timers, focus percentages |
| `Display LG` | Cabinet Grotesk / Plus Jakarta | 36px | 40px | Bold (700) | -0.03em | Primary dashboard metrics |
| `Heading XL` | Cabinet Grotesk / Plus Jakarta | 24px | 28px | Bold (700) | -0.02em | Module header titles, card titles |
| `Heading LG` | Inter | 20px | 26px | SemiBold (600) | -0.01em | Modal headers, sub-sections |
| `Heading MD` | Inter | 16px | 22px | SemiBold (600) | 0.00em | Settings headers, table headers |
| `Heading SM` | Inter | 14px | 20px | SemiBold (600) | +0.01em | Small item titles, active sidebar items|
| `Body Large` | Inter | 16px | 24px | Regular (400) | 0.00em | Socratic prompts, reading content |
| `Body Medium`| Inter | 14px | 20px | Regular (400) | 0.00em | General body copy, descriptions |
| `Body Small` | Inter | 12px | 18px | Regular (400) | +0.01em | Contextual tips, metadata labels |
| `Caption` | Inter | 10px | 14px | Medium (500) | +0.03em | Small metadata, sync states |
| `Overline` | Inter | 10px | 12px | Bold (700) | +0.08em | Small capitalized labels (e.g. AGENT) |
| `Code Large` | JetBrains Mono | 14px | 20px | Regular (400) | -0.01em | Code editor blocks, logs |
| `Code Small` | JetBrains Mono | 12px | 16px | Medium (500) | 0.00em | Micro-terminal telemetry |

---

## 2. MOBILE COMPANION APP SCREEN INVENTORY (13 Screens)

All mobile layouts assume a target size of **390px x 844px**.

### SCREEN 1: ONBOARDING FLOW (5 Sub-Screens)
*   **Auto Layout Setup**: Vertical layout | Alignment: Top-Center | Padding: Top 56px, Bottom 32px, Horizontal 24px | Gap: 0px.

#### Sub-Screen 1.1: Welcome Frame
*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #000000]
       ├─ Stepper-Indicator [Height: 4px, Width: Fill, 1 of 5 Completed]
       ├─ Logo-Reveal-Container [Height: 280px, Width: Fill, Auto Layout: Center]
       │  └─ Shifting-Wave-SVG [180x180, Color: #FFD400, Vector outline]
       ├─ Text-Content-Block [Auto Layout: Vertical, Gap: 12px]
       │  ├─ Title: "APEX" [Typography: Display LG, Fill: #FFFFFF]
       │  └─ Subtitle: "Your Cognitive Operating Layer" [Typography: Body Large, Fill: #B0B0B0]
       └─ Bottom-CTA-Block [Position: Anchored to Bottom, Width: Fill, Padding: 24px]
          └─ Btn-Primary: "INITIALIZE BRIDGE" [Height: 56px, Auto Layout: Center, Fill: #FFD400, Corner Radius: 4px]
    ```
*   **Interaction States**:
    *   `Btn-Primary`: Default: Fill `#FFD400`, Text `#0A0A0A`. Hover: Fill `#E5BE00`. Pressed: Scale down to 98% (using Smart Animate).

#### Sub-Screen 1.2: Identity Setup
*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #000000]
       ├─ Stepper-Indicator [Height: 4px, Width: Fill, 2 of 5 Completed]
       ├─ Form-Container [Auto Layout: Vertical, Gap: 24px, Padding: Top 32px]
       │  ├─ Input-Field: University Name [Height: 60px, Auto Layout, Border: 1px #2C2C2C, Radius: 4px]
       │  │  ├─ Search-Icon [20x20, Fill: #B0B0B0]
       │  │  └─ Text: "Enter University..." [Typography: Body Medium, Fill: #555555]
       │  ├─ Chip-Selector-Group [Auto Layout: Horizontal, Wrap, Gap: 8px]
       │  │  ├─ Chip-Item (Selected) [Height: 40px, Fill: #121212, Border: 1px #FFD400, Radius: 4px]
       │  │  └─ Chip-Item (Default) x3 [Height: 40px, Fill: #121212, Border: 1px #2C2C2C, Radius: 4px]
       │  └─ Drag-Upload-Box [Height: 120px, Width: Fill, Border: 1px Dashed #B0B0B0, Radius: 4px, Auto Layout: Center]
       │     └─ Text: "Upload .ICS or Sync Canvas" [Typography: Body Medium, Fill: #B0B0B0]
       └─ Nav-Buttons [Auto Layout: Horizontal, Gap: 16px, Anchored to Bottom]
          ├─ Btn-Secondary: "BACK" [Height: 56px, Fill: Transparent, Border: 1px #2C2C2C]
          └─ Btn-Primary: "NEXT" [Height: 56px, Fill: #FFD400]
    ```
*   **Interaction States**:
    *   `Input-Field`: Focused state highlights border in `#FFD400` and displays autocomplete drop-down overlay.
    *   `Chip-Item`: Tap changes border from `#2C2C2C` to `#FFD400`.

#### Sub-Screen 1.3: Permission Authorization
*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #000000]
       ├─ Stepper-Indicator [Height: 4px, Width: Fill, 3 of 5 Completed]
       ├─ Header-Text [Title: "Permissions Required", Sub: "Enable biometric telemetry mapping"]
       ├─ Scrollable-Card-List [Auto Layout: Vertical, Gap: 12px, Overflow: Scroll]
       │  └─ Permission-Card x6 [Height: 72px, Width: Fill, Auto Layout: Horizontal, Fill: #121212, Radius: 8px]
       │     ├─ Icon-Box [24x24, Color: #B0B0B0]
       │     ├─ Content-Box [Auto Layout: Vertical, Gap: 4px, Width: Fill]
       │     │  ├─ Title: "Accessibility" [Typography: Heading SM, Fill: #FFFFFF]
       │     │  └─ Sub: "Track app switches & keyboard latency" [Typography: Caption, Fill: #B0B0B0]
       │     └─ Toggle-Switch [Width: 48px, Height: 26px, Radius: 13px, Fill: #2C2C2C]
       │        └─ Thumb-Node [22x22, Circular, Fill: #FFFFFF, Position: Left]
       └─ Nav-Buttons [Auto Layout: Horizontal, Gap: 16px, Anchored to Bottom]
    ```
*   **Interaction States**:
    *   `Toggle-Switch`: Inactive: Fill `#2C2C2C`, Thumb left. Active: Fill `#00D26A`, Thumb slides right.

#### Sub-Screen 1.4: Calibration Test
*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #000000]
       ├─ Stepper-Indicator [Height: 4px, Width: Fill, 4 of 5 Completed]
       ├─ Test-Header [Title: "Calibration Baseline", Sub: "Phase 1: Typing Dynamics"]
       ├─ Text-Prompt-Card [Height: 140px, Fill: #121212, Border: 1px #2C2C2C, Padding: 16px]
       │  └─ Paragraph: [Typography: Body Large, Fill: #FFFFFF, Line-Height: 1.6]
       ├─ Text-Input-Area [Height: 180px, Width: Fill, Border: 1px #FFD400, Radius: 4px]
       └─ Bottom-Progress-Bar [Height: 8px, Width: Fill, Fill: #2C2C2C]
          └─ Active-Fill [Width: 33%, Fill: #FFD400]
    ```

#### Sub-Screen 1.5: Agent Introductions
*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #000000]
       ├─ Stepper-Indicator [Height: 4px, 5 of 5 Completed]
       ├─ Carousel-Container [Auto Layout: Horizontal, Gap: 16px, Center-Clip]
       │  └─ Agent-Card [Width: 260px, Height: 340px, Fill: #121212, Border: 1px #2C2C2C, Radius: 8px]
       │     ├─ Avatar-Visual [Lottie SVG, Shape: Pendulum (Deadline Sentinel), Color: #FF0055]
       │     ├─ Agent-Title: "DEADLINE SENTINEL" [Typography: Heading XL, Color: #FF0055]
       │     ├─ Description: "Calculates academic urgency coefficients." [Typography: Body Medium, Color: #B0B0B0]
       │     └─ Autonomy-Priority-Control [Auto Layout: Horizontal, Gap: 8px]
       │        ├─ Label: "Priority Level" [Typography: Caption]
       │        └─ Step-Dots [Width: 60px, 3 of 5 active]
       └─ Launch-Button: "ENTER WORKSPACE" [Height: 56px, Fill: #FFD400]
    ```

---

### SCREEN 2: HOME SCREEN
*   **Auto Layout Setup**: Vertical | Padding: Top 48px, Horizontal 16px, Bottom 90px | Gap: 24px | Scroll: Vertical.

```
+------------------------------------------+
|  Figma Frame Constraints: Width: 390px, Height: 844px
|  Auto Layout: Vertical
|
|  [Header Bar] (Height: 48px, Gap: Auto)
|  ├─ Profile Avatar (36x36px)
|  ├─ Sync Mode Badge (Latency: 12ms)
|  └─ Office Bridge Indicator (Green Dot)
|
|  [State Hero Card] (Height: 200px, Radius: 16px)
|  ├─ State: "FLOW STATE" (Heading 2, #FFFFFF)
|  ├─ Efficiency: "94%" (Display XL, #FFD400)
|  └─ 2H Timeline Area (Sparkline Vector Path)
|
|  [Active Tasks List] (Gap: 12px)
|  ├─ Context Card 1 (Height: 90px, Swipe Left Target)
|  └─ Context Card 2 (Height: 90px)
|
|  [Quick Action Bar] (Float Overlay, Height: 50px, Bottom: 106px)
|  ├─ Focus Target Button
|  ├─ Mic Voice Button
|  ├─ Summon Agent Core
|  └─ Plus Add Button
|
|  [Bottom Navigation Bar] (Fixed Bottom, Height: 72px)
+------------------------------------------+
```

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #0A0A0A]
       ├─ Header-Bar [Height: 48px, Auto Layout: Horizontal, Align: Center-Split]
       │  ├─ Profile-Group [Auto Layout: Horizontal, Gap: 8px]
       │  │  ├─ Avatar-Frame [36x36, Radius: 18, Image]
       │  │  └─ User-Name [Typography: Heading SM]
       │  └─ Sync-Badge [Height: 24px, Fill: #121212, Border: 1px #00D26A, Radius: 4px]
       │     ├─ Green-Dot [6x6, Fill: #00D26A]
       │     └─ Latency-Text: "12ms P2P" [Typography: Caption]
       ├─ State-Card-Hero [Height: 200px, Width: Fill, Radius: 16px, Fill: #0A1C12, Border: 1px #00D26A]
       │  ├─ Header-Row [Auto Layout: Horizontal, Split]
       │  │  ├─ State-Name: "FLOW ACTIVE" [Typography: Heading LG, Color: #00D26A]
       │  │  └─ Score: "94%" [Typography: Display LG, Color: #FFFFFF]
       │  ├─ Sparkline-Canvas [Height: 64px, Width: Fill, Vector Path (Bezier Curve)]
       │  └─ Active-Task-Label: "Task: CS301 Compiler Lab" [Typography: Body Small]
       ├─ Context-List-Section [Auto Layout: Vertical, Gap: 12px]
       │  ├─ Section-Title: "ACTIVE SCULPT" [Typography: Overline, Color: #B0B0B0]
       │  ├─ Card-Context-A [Height: 90px, Width: Fill, Fill: #121212, Border: 1px #2C2C2C, Radius: 8px]
       │  │  ├─ Row-Split [Auto Layout: Horizontal, Center-Split]
       │  │  │  ├─ Left-Group [Auto Layout: Vertical, Gap: 4px]
       │  │  │  │  ├─ Task-Title: "CS301 Compiler Design" [Typography: Heading SM]
       │  │  │  │  └─ Subtext: "Deadline Sentinel: High Urgency" [Typography: Body Small, Color: #FF0055]
       │  │  │  └─ Badge-Urgency: "82%" [Typography: Code Large, Color: #FF0055]
       │  └─ Card-Context-B [Height: 90px, Width: Fill, Fill: #121212, Border: 1px #2C2C2C, Radius: 8px]
       ├─ Quick-Action-Bar [Height: 50px, Width: 280px, Position: Absolute, Bottom: 106px, Horizontal Center, Fill: #121212, Opacity: 0.75, Backdrop Blur, Radius: 25px]
       │  └─ Icons-Layout [Auto Layout: Horizontal, Space-Around, Align: Center]
       │     ├─ Btn-Focus-Mode [24x24, Target Crosshair]
       │     ├─ Btn-Voice-Capture [24x24, Microphone]
       │     ├─ Btn-Summon-Core [36x36, Rotating Concentric Circles]
       │     └─ Btn-Quick-Task [24x24, Plus Sign]
       └─ Bottom-Nav-Bar [Height: 72px, Position: Fixed Bottom, Fill: #0A0A0A, Border-Top: 1px #1C1C1C]
          └─ Tabs-Container [Auto Layout: Horizontal, Space-Evenly, Align: Center]
             ├─ Tab-Home [Selected, Accent Dash below, Width: 48px]
             ├─ Tab-Deadlines [Unselected, Width: 48px]
             ├─ Tab-Agents [Unselected, Width: 48px]
             └─ Tab-Insights [Unselected, Dot alert badge on top-right, Width: 48px]
    ```
*   **Interaction & Responsive Details**:
    *   `Card-Context-A`: Figma prototype swipe left reveals a delete trash icon block (`#FF4D4F`), swipe right reveals a snooze clock icon block (`#FFB800`).
    *   Responsive behavior: Auto Layout set to "Fill Container" horizontally; scale elements relative to frame.

---

### SCREEN 3: COGNITIVE STATE DASHBOARD
*   **Auto Layout Setup**: Vertical | Padding: Top 24px, Bottom 32px, Horizontal 16px | Gap: 20px | Scrollable.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #0A0A0A]
       ├─ Navigation-Bar [Height: 48px, Auto Layout: Horizontal, Back Arrow + Title + Options Gear]
       ├─ Pulse-Visualizer-Container [Height: 220px, Auto Layout: Center]
       │  ├─ Dynamic-Pulse-Rings [Vector Circles, Concentric, Stroke: 0.75px #FF4500]
       │  └─ Center-Metric [Typography: Display XL, Color: #FFFFFF, "88%"]
       ├─ Historical-Toggles [Height: 32px, Auto Layout: Horizontal, Gap: 8px]
       │  ├─ Toggle-1H [Selected, Fill: #FFD400, Text: #0A0A0A]
       │  ├─ Toggle-24H [Unselected, Fill: #121212, Text: #B0B0B0]
       │  └─ Toggle-7D [Unselected, Fill: #121212, Text: #B0B0B0]
       ├─ Area-Chart-Card [Height: 200px, Width: Fill, Fill: #121212, Border: 1px #2C2C2C]
       │  └─ Bezier-Area-Path [Gradient Fill: #FFD400 -> Transparent, Gridlines: #1F1F1F]
       ├─ Signal-Grid [Auto Layout: Vertical, Gap: 8px]
       │  ├─ Grid-Row-1 [Auto Layout: Horizontal, Gap: 8px]
       │  │  ├─ Mini-Card-HRV [Width: 165px, Height: 74px, Fill: #121212, Border: 1px #2C2C2C]
       │  │  │  ├─ HRV-Value: "68ms" [Typography: Code Large]
       │  │  │  └─ HRV-Status [Status Indicator Dot: Green]
       │  │  └─ Mini-Card-Gaze [Width: 165px, Height: 74px, Fill: #121212, Border: 1px #2C2C2C]
       │  └─ Grid-Row-2 [Auto Layout: Horizontal, Gap: 8px]
       └─ Btn-Override [Height: 50px, Width: Fill, Fill: #121212, Border: 1px #2C2C2C, Text: "MANUAL OVERRIDE"]
    ```

---

### SCREEN 4: DEADLINE DASHBOARD
*   **Auto Layout Setup**: Vertical | Padding: Top 24px, Horizontal 16px | Gap: 16px.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #0A0A0A]
       ├─ Tab-Views-Header [Height: 48px, Auto Layout: Horizontal, Split]
       │  ├─ Title: "DEADLINES" [Typography: Heading XL]
       │  └─ Toggle-Group [Auto Layout: Horizontal, Gap: 4px]
       │     ├─ Tab-Timeline [Active, Icon Only]
       │     ├─ Tab-Calendar [Inactive, Icon Only]
       │     └─ Tab-List [Inactive, Icon Only]
       ├─ Filter-Section [Auto Layout: Horizontal, Gap: 8px, Width: Scroll]
       │  ├─ Chip-Filter-All [Active, Fill: #FFD400]
       │  ├─ Chip-Filter-CS301 [Inactive, Fill: #121212]
       │  └─ Chip-Filter-MTH202 [Inactive, Fill: #121212]
       ├─ Vertical-Timeline-Area [Overflow: Scroll, Auto Layout: Horizontal, Gap: 16px]
       │  ├─ Line-Vector-Canvas [Width: 20px, Height: 500px, Dotted vertical line]
       │  └─ Cards-Stack [Auto Layout: Vertical, Gap: 12px, Width: Fill]
       │     ├─ Deadline-Card-Urgent [Height: 110px, Border-Gradient: Red Accent #FF4D4F, Radius: 8px]
       │     │  ├─ Card-Header [Title: "Compiler Lab 3 Resubmit", Time: "Due in 4h"]
       │     │  ├─ Progress-Bar [Height: 4px, Fill: #1F1F1F, Active-Fill: 90% Red]
       │     │  └─ Metrics-Telemetry [Est. Work: 3.5h, Risk: 88%]
       │     ├─ Deadline-Card-Normal [Height: 110px, Border: 1px #FFB800]
       │     └─ Deadline-Card-Safe [Height: 110px, Border: 1px #00D26A]
       └─ FAB-Syllabus-Scan [Dimension: 56x56, Circular, Position: Floating Bottom Right, Fill: #FFD400]
          └─ Camera-Icon [24x24, Color: #0A0A0A]
    ```

---

### SCREEN 5: AGENT CENTER
*   **Auto Layout Setup**: Vertical | Padding: Top 24px, Horizontal 16px | Gap: 20px.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #0A0A0A]
       ├─ Header [Title: "AGENT HUB", Sub: "5 Agents Configured & Active"]
       ├─ Agent-Status-Grid [Auto Layout: Vertical, Gap: 12px]
       │  ├─ Row-1 [Auto Layout: Horizontal, Gap: 12px]
       │  │  ├─ Agent-Grid-Card-State [Width: 160px, Height: 100px, Fill: #121212, Radius: 8px]
       │  │  │  ├─ Dot-Indicator [Color: #00D26A]
       │  │  │  ├─ Agent-Name: "STATE AGENT" [Typography: Heading SM]
       │  │  │  └─ Active-Task: "Active Monitoring" [Typography: Caption]
       │  │  └─ Agent-Grid-Card-Deadline [Width: 160px, Height: 100px, Fill: #121212, Radius: 8px]
       │  └─ Row-2 [Auto Layout: Horizontal, Gap: 12px]
       ├─ Focus-Agent-Detail-Pane [Auto Layout: Vertical, Gap: 16px, Padding: 16px, Fill: #121212, Radius: 8px]
       │  ├─ Agent-Title-Block [Auto Layout: Horizontal, Gap: 12px]
       │  │  ├─ Avatar-Icon [32x32, Shape: Triangular Chevron, Color: #FF0055]
       │  │  └─ Title: "DEADLINE SENTINEL" [Typography: Heading LG]
       │  ├─ Metric-Row [Accuracy: "89% (Brier Score)", Core: "Llama-3.1-8B"]
       │  └─ Execution-Settings [Auto Layout: Vertical, Gap: 8px]
       │     └─ Switch-Widget-LMS [Label: "Canvas Sync Autonomy"]
       └─ Autonomy-Scale-Section [Auto Layout: Vertical, Gap: 12px]
          ├─ Label: "AUTONOMY LEVEL" [Typography: Overline, Color: #B0B0B0]
          ├─ Slider-Bar-Widget [Height: 32px, Auto Layout: Center-Y]
          │  ├─ Track-Line [Height: 4px, Fill: #2C2C2C, Active-Fill: 50% #FFD400]
          │  └─ Thumb-Icon [16x16, 45-deg Rotated Square, Fill: #FFD400]
          └─ Scale-Labels [Auto Layout: Horizontal, Split, Labels: "Co-Pilot", "Guardian", "Autonomous"]
    ```

---

### SCREEN 6: FOCUS MODE
*   **Auto Layout Setup**: Vertical | Padding: Top 56px, Bottom 56px, Horizontal 24px | Gap: 48px.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #000000]
       ├─ Mode-Selector [Auto Layout: Horizontal, Centered, Gap: 16px]
       │  ├─ Mode-Light [Inactive, Text Color: #B0B0B0]
       │  ├─ Mode-Deep [Active, Text Color: #FFD400, Underline: 2px #FFD400]
       │  └─ Mode-Extreme [Inactive, Text Color: #B0B0B0]
       ├─ Timer-Focus-Area [Auto Layout: Vertical, Align: Center, Gap: 24px]
       │  ├─ Focus-State-Breathing-Bg [Dimension: 320x320, Radial Gradient: #00D26A -> Transparent]
       │  ├─ Countdown-Clock: "50:00" [Typography: Display XL, Font: JetBrains Mono]
       │  └─ Active-Target-Label: "COMPILER LAB 3 ANALYSIS" [Typography: Body Large]
       ├─ Distraction-Shield-Feed [Auto Layout: Vertical, Center-Align, Gap: 8px]
       │  ├─ Shield-Icon [24x24, Color: #00D26A]
       │  └─ Blocked-Stat-Text: "12 Distractions Shields Active" [Typography: Caption]
       └─ Btn-Emergency-Exit [Dimension: 56x56, Circular, Border: 1.5px #FF4D4F, Position: Bottom-Center]
          ├─ Ring-Outline-Vector [Circular stroke, Fill progress: 0%]
          └─ Cross-Icon [20x20, Color: #FF4D4F]
    ```
*   **Interaction States**:
    *   `Btn-Emergency-Exit`: Default: Hollow with red outlines. Tap-and-hold (Figma prototype interaction) triggers keyframe animation mapping progress fill to 100% over 3s, switching artboard to Home Screen.

---

### SCREEN 7: VOICE CAPTURE
*   **Auto Layout Setup**: Vertical | Padding: Top 24px, Horizontal 16px | Gap: 24px.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #0A0A0A]
       ├─ Record-Status-Bar [Height: 32px, Auto Layout: Horizontal, Split]
       │  ├─ Indicator-Pulse [Dot: Red, Text: "RECORDING..."]
       │  └─ Timer: "04:22" [Typography: Code Large]
       ├─ Waveform-Canvas-Card [Height: 120px, Width: Fill, Fill: #121212, Border: 1px #2C2C2C]
       │  └─ Waveform-Frequencies-Bands [Vector path, 32 vertical bars, Fill: #FFD400, Height: Dynamic]
       ├─ Transcript-Preview-Panel [Height: 200px, Width: Fill, Fill: #121212, Padding: 16px, Overflow: Scroll]
       │  └─ Live-Text: "The professor states that compilers parse code into trees..." [Typography: Body Large, Color: #FFFFFF]
       ├─ Metadata-Tags [Auto Layout: Horizontal, Gap: 8px]
       │  ├─ Tag-Lecture [Fill: #1C1C1C, Text: "CS301"]
       │  ├─ Tag-Date [Fill: #1C1C1C, Text: "Lecture Notes"]
       │  └─ Btn-Edit-Tags [Icon: Edit]
       └─ Btn-Record-Control [Dimension: 72x72, Circular, Position: Bottom-Center, Fill: #FFD400]
          └─ Inner-Square [24x24, Shape: Square with 4px border radius, Fill: #0A0A0A]
    ```

---

### SCREEN 8: INSIGHTS FEED
*   **Auto Layout Setup**: Vertical | Padding: Top 24px, Horizontal 16px | Gap: 16px | Scrollable.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #0A0A0A]
       ├─ Title-Bar [Title: "INSIGHTS FEED"]
       ├─ Filter-Row [Auto Layout: Horizontal, Gap: 8px]
       │  ├─ Chip-All [Active, Fill: #FFD400]
       │  ├─ Chip-Warnings [Inactive, Fill: #121212]
       │  └─ Chip-Patterns [Inactive, Fill: #121212]
       ├─ Feed-Cards-Container [Auto Layout: Vertical, Gap: 12px]
       │  ├─ Insight-Card-Warning [Height: 160px, Width: Fill, Border: 1px #FF4D4F, Fill: #121212, Radius: 8px]
       │  │  ├─ Header [Label: "URGENT THREAT", Icon: Alert-Red]
       │  │  ├─ Content: "Deadline Sentinel detects high failure risk for Compiler Design Lab."
       │  │  └─ Action: "Activate Extreme Focus Block" [Btn-Secondary, Fill: #FF4D4F]
       │  ├─ Insight-Card-Pattern [Height: 140px, Width: Fill, Border: 1px #FFB800]
       │  │  ├─ Content: "You tend to lose focus on CS301 assignments after 90 minutes."
       │  │  └─ Action: "Schedule 10m Break" [Btn-Secondary, Fill: #FFB800]
       │  └─ Insight-Card-Milestone [Height: 120px, Width: Fill, Border: 1px #00D26A]
       │     └─ Content: "Consistent Flow! You maintained a 92% Focus Score."
       └─ Bottom-Nav-Bar [Height: 72px]
    ```

---

### SCREEN 9: PEER RADAR
*   **Auto Layout Setup**: Vertical | Padding: Top 24px, Horizontal 16px | Gap: 16px.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #0A0A0A]
       ├─ View-Toggle-Header [Title: "PEER RADAR"]
       │  ├─ Toggle-Group [Channels | Digest | Group Heatmaps]
       ├─ Search-Bar [Height: 40px, Border: 1px #2C2C2C]
       ├─ Radar-Digest-Stack [Auto Layout: Vertical, Gap: 12px, Overflow: Scroll]
       │  ├─ Digest-Card-Discord [Height: 130px, Width: Fill, Fill: #121212, Radius: 8px]
       │  │  ├─ Card-Header [Icon: Discord (24x24), Name: "#CS301-STUDY-GROUP", Time: "14m ago"]
       │  │  ├─ Summary-Text: "Project deadlines rescheduled to Monday. Meeting scheduled at 4pm."
       │  │  ├─ Relevance-Badge: "Relevance: 89%" [Color: #00D26A]
       │  │  └─ Card-Action-Row [Auto Layout: Horizontal, Gap: 12px]
       │  │     ├─ Action-Btn: "Quick Reply" [Text Link, Color: #FFD400]
       │  │     └─ Action-Btn: "Open Discord" [Text Link, Color: #B0B0B0]
       │  └─ Digest-Card-Canvas [Height: 130px, Border: 1px #2C2C2C]
       └─ Bottom-Nav-Bar [Height: 72px]
    ```

---

### SCREEN 10: SESSION HISTORY
*   **Auto Layout Setup**: Vertical | Padding: Top 24px, Horizontal 16px | Gap: 16px | Scrollable.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #0A0A0A]
       ├─ Header [Title: "HISTORY"]
       ├─ History-Groups-Stack [Auto Layout: Vertical, Gap: 20px]
       │  ├─ Group-Date-Divider [Label: "TODAY - 03 June 2026", Typography: Overline]
       │  ├─ History-Item-Card [Height: 120px, Width: Fill, Fill: #121212, Radius: 8px]
       │  │  ├─ Header-Row [Title: "CS301 Compiler Lab", Time: "09:00 - 11:30"]
       │  │  ├─ Metric-Row [Duration: "2h 30m", Avg-Focus: "84%"]
       │  │  └─ Stacked-State-Bar [Height: 8px, Width: Fill, Radius: 4px]
       │  │     ├─ Flow-Segment [Width: 60%, Fill: #00D26A]
       │  │     ├─ Distracted-Segment [Width: 20%, Fill: #FFB800]
       │  │     ├─ Fatigued-Segment [Width: 15%, Fill: #00A3FF]
       │  │     └─ Overloaded-Segment [Width: 5%, Fill: #FF4D4F]
       │  └─ History-Item-Card-B [Height: 120px, Width: Fill, Fill: #121212]
       └─ Bottom-Nav-Bar [Height: 72px]
    ```

---

### SCREEN 11: ANALYTICS
*   **Auto Layout Setup**: Vertical | Padding: Top 24px, Horizontal 16px | Gap: 20px | Scrollable.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #0A0A0A]
       ├─ Filter-Bar [Auto Layout: Horizontal, Split]
       │  ├─ Title: "ANALYTICS"
       │  └─ Toggle [WEEKLY | MONTHLY | YEAR]
       ├─ Summary-Stats-Row [Auto Layout: Horizontal, Gap: 8px]
       │  ├─ Stat-Card-A [Width: 105px, Height: 80px, Fill: #121212]
       │  │  ├─ Label: "Total Focus"
       │  │  └─ Value: "18.5h"
       │  ├─ Stat-Card-B [Width: 105px, Height: 80px, Fill: #121212]
       │  └─ Stat-Card-C [Width: 105px, Height: 80px, Fill: #121212]
       ├─ Donut-Chart-Card [Height: 220px, Width: Fill, Fill: #121212, Radius: 8px]
       │  ├─ Header: "Cognitive State Distribution"
       │  ├─ Donut-Graphic [Center Donut Ring, Vector, Segments: Green, Orange, Blue, Red]
       │  └─ Chart-Legends [Auto Layout: Horizontal, Wrap, Gap: 8px]
       ├─ Bar-Chart-Card: Productivity Categories [Height: 240px, Width: Fill, Fill: #121212]
       └─ Bottom-Nav-Bar [Height: 72px]
    ```

---

### SCREEN 12: SETTINGS
*   **Auto Layout Setup**: Vertical | Padding: Top 24px, Horizontal 16px | Gap: 8px | Scrollable.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #0A0A0A]
       ├─ Title-Header [Title: "SETTINGS"]
       ├─ Settings-Group [Auto Layout: Vertical, Gap: 1px, Fill: #1C1C1C]
       │  ├─ Setting-Row-Account [Height: 56px, Fill: #121212, Auto Layout: Split]
       │  │  ├─ Left [Icon: User, Label: "User Account"]
       │  │  └─ Right [Icon: Chevron-Right]
       │  ├─ Setting-Row-Agents [Height: 56px, Fill: #121212]
       │  ├─ Setting-Row-Integrations [Height: 56px, Fill: #121212]
       │  │  ├─ Left [Icon: Integrations, Label: "Integrations"]
       │  │  └─ Right [Label: "Canvas Connected", Text Color: #00D26A]
       │  ├─ Setting-Row-Privacy [Height: 56px, Fill: #121212]
       │  ├─ Setting-Row-Appearance [Height: 56px, Fill: #121212]
       │  ├─ Setting-Row-Notifications [Height: 56px, Fill: #121212]
       │  └─ Setting-Row-About [Height: 56px, Fill: #121212]
       └─ Bottom-Nav-Bar [Height: 72px]
    ```

---

### SCREEN 13: EMERGENCY RECOVERY MODE
*   **Auto Layout Setup**: Vertical | Padding: Top 40px, Horizontal 16px, Bottom 40px | Gap: 24px.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [390x844, Fill: #000000]
       ├─ Alert-Header [Auto Layout: Horizontal, Gap: 12px, Align: Center-Y]
       │  ├─ Warning-Icon [32x32, Color: #FF4D4F]
       │  └─ Heading: "EMERGENCY TRIAGE ACTIVE" [Typography: Heading XL, Color: #FF4D4F]
       ├─ Status-Assessment-Card [Height: 100px, Width: Fill, Fill: #1F0D0E, Border: 1px #FF4D4F, Radius: 8px]
       │  └─ Content [Typography: Body Medium, Text: "3 assignments due in 12 hours. State Agent reports Cognitive Overload. Recommendation: Action reduction."]
       ├─ Action-Stack-Triage [Auto Layout: Vertical, Gap: 16px]
       │  ├─ Triage-Card-1 [Height: 80px, Width: Fill, Fill: #121212, Border: 1px #2C2C2C, Radius: 4px]
       │  │  ├─ Title: "One-Tap Delegation" [Typography: Heading SM]
       │  │  └─ Subtext: "Request peer study summaries for Compiler Lab" [Typography: Caption]
       │  ├─ Triage-Card-2 [Height: 80px, Width: Fill, Fill: #121212, Border: 1px #2C2C2C]
       │  │  ├─ Title: "Draft Extension Request" [Typography: Heading SM]
       │  │  └─ Subtext: "Auto-compose Canvas mail to Professor" [Typography: Caption]
       │  └─ Triage-Card-3 [Height: 80px, Width: Fill, Fill: #121212, Border: 1px #2C2C2C]
       │     ├─ Title: "Reschedule Study Block" [Typography: Heading SM]
       │     └─ Subtext: "Clear non-essential calendar items" [Typography: Caption]
       └─ Btn-Deescalate [Height: 56px, Width: Fill, Fill: Transparent, Border: 1.5px #B0B0B0, Text: "DE-ESCALATE SYSTEM"]
    ```

---

## 3. DESKTOP APP SCREEN INVENTORY (12 Screens)

All desktop layouts assume a target size of **1440px x 900px**.

### SCREEN 1: ADAPTIVE WORKSPACE DASHBOARD
*   **Auto Layout Setup**: Horizontal | Grid Layout constraints | Margins: 32px | Gutter: 24px.

```
+-------------------------------------------------------------------------------+
|  Layout: Horizontal Flex/Auto Layout. Width: 1440px, Height: 900px
|
|  [Collapsible Sidebar] ----------------> [Main Content Area] (Width: Fill)
|  (Width: 240px)                           ├─ [Custom Title Bar] (Height: 40px)
|  ├─ Logo Block (Height: 60px)              └─ [Adaptive Grid Area] (12-Col Layout)
|  ├─ Nav Menu (Gap: 8px)                       ├─ Left Span (col-span-8): Active focus
|  └─ Agent Heartbeat (Bottom)                  └─ Right Span (col-span-4): Sentinel Warnings
+-------------------------------------------------------------------------------+
```

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [1440x900, Fill: #0A0A0A]
       ├─ TitleBar-Custom [Height: 40px, Width: Fill, Position: Absolute Top, Drag Region, Fill: #0A0A0A, Border-Bottom: 1px #121212]
       │  └─ Traffic-Lights [Auto Layout: Horizontal, Gap: 8px, Margin-Left: 16px]
       │     ├─ Close-Dot [12x12, Red Fill, Opacity 20%]
       │     ├─ Min-Dot [12x12, Yellow Fill, Opacity 20%]
       │     └─ Max-Dot [12x12, Green Fill, Opacity 20%]
       ├─ Main-Workspace [Width: Fill, Height: Fill, Auto Layout: Horizontal]
       │  ├─ Sidebar-Container [Width: 240px, Height: Fill, Fill: #0A0A0A, Border-Right: 1px #1F1F1F, Auto Layout: Vertical]
       │  │  ├─ Brand-Block [Height: 60px, Padding: 16px]
       │  │  │  └─ Text: "APEX CLIENT" [Typography: Heading XL, Color: #FFD400]
       │  │  ├─ Nav-Items [Auto Layout: Vertical, Gap: 8px, Padding: 16px]
       │  │  │  ├─ Nav-Link (Selected) [Height: 40px, Fill: #121212, Left indicator bar 3px #FFD400]
       │  │  │  ├─ Nav-Link (Default) x4 [Height: 40px, Fill: Transparent]
       │  │  │  └─ Nav-Link (Default) [Height: 40px, Fill: Transparent]
       │  │  └─ Agent-Heartbeat-Anchor [Height: 80px, Position: Bottom, Padding: 16px]
       │  └─ Grid-Dashboard-Content [Width: Fill, Height: Fill, Padding: 32px, Auto Layout: Vertical, Gap: 24px]
       │     ├─ Row-Dashboard-Header [Auto Layout: Horizontal, Split]
       │     │  ├─ Title: "ADAPTIVE WORKSPACE" [Typography: Display LG]
       │     │  └─ State-Badge [Label: "FLOW ACTIVE", Fill: #00D26A, Text: #000000]
       │     └─ Grid-Columns-12 [Auto Layout: Horizontal, Gap: 24px, Width: Fill]
       │        ├─ Left-Workspace-Card [Width: 0, Flex-Grow: 8 (col-span-8), Height: 620px, Fill: #121212, Radius: 8px, Padding: 24px]
       │        │  ├─ Focus-Widget-Container
       │        │  │  ├─ Time-Indicator: "CS301 Lab: 32m left" [Typography: Heading XL]
       │        │  │  └─ Visualizer-Canvas [Height: 400px, Waveforms Graph]
       │        └─ Right-Sentinel-Panel [Width: 0, Flex-Grow: 4 (col-span-4), Height: 620px, Fill: #121212, Radius: 8px, Padding: 24px]
       │           ├─ Header: "Deadline Sentinel" [Typography: Heading MD]
       │           └─ Alerts-List [Auto Layout: Vertical, Gap: 16px]
       │              ├─ Alert-Row-1 [Urgency Risk: 92%, Title: "Lab 3 Deadline Reschedule"]
       │              └─ Alert-Row-2 [Urgency Risk: 45%]
    ```

---

### SCREEN 2: AGENT ACTIVITY MONITOR
*   **Auto Layout Setup**: Horizontal Split View | Left Panel: 35% Width (504px) | Right Panel: 65% Width (936px).

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [1440x900, Fill: #0A0A0A]
       ├─ Sidebar-Container [Width: 240px, Height: Fill]
       └─ Monitor-Body [Width: Fill, Height: Fill, Auto Layout: Horizontal]
          ├─ Panel-Left-Agents [Width: 420px, Height: Fill, Border-Right: 1px #1F1F1F, Padding: 24px]
          │  ├─ Panel-Header [Title: "SYSTEM AGENTS", Count: "5 Online"]
          │  └─ Agent-Status-List [Auto Layout: Vertical, Gap: 12px]
          │     ├─ Agent-Card-Active [Height: 90px, Fill: #121212, Border: 1px #FF4D4F (Active Selected)]
          │     │  ├─ Name: "State Agent" [Typography: Heading SM]
          │     │  └─ Stat: "Ingesting telemetry..." [Typography: Caption, Color: #FF4D4F]
          │     ├─ Agent-Card-Idle x4 [Height: 90px, Fill: #121212, Border: 1px #2C2C2C]
          │     └─ Agent-Card-Idle [Height: 90px]
          └─ Panel-Right-Diagnostics [Width: Fill, Height: Fill, Padding: 24px, Auto Layout: Vertical, Gap: 20px]
             ├─ Diagnostics-Header [Title: "State Agent Live Analytics", Accuracy: "94% Model Confidence"]
             ├─ Graph-Canvas-Mermaid [Height: 260px, Width: Fill, Vector-Flow Diagram representing agent dependencies]
             ├─ Console-Output-Logs [Width: Fill, Height: 240px, Fill: #121212, Border: 1px #1F1F1F, Radius: 4px, Padding: 16px]
             │  └─ Logs-Text [Typography: Code Small, Font: JetBrains Mono, Lines: 12]
             └─ Btn-Restart-Threads [Height: 40px, Width: 200px, Fill: #181818, Border: 1px #2C2C2C, Text: "RESTART AGENT RUNTIMES"]
    ```

---

### SCREEN 3: LIVE WORKSPACE CONTROLS
*   **Auto Layout Setup**: Horizontal Split Layout | Panel 1: 30% Width (432px) | Panel 2: 45% Width (648px) | Panel 3: 25% Width (360px).

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [1440x900, Fill: #0A0A0A]
       ├─ Sidebar-Container [Width: 240px]
       └─ Controls-Workspace [Width: Fill, Auto Layout: Horizontal, Gap: 20px, Padding: 24px]
          ├─ Panel-App-Blockers [Width: 320px, Fill: #121212, Radius: 8px, Padding: 20px]
          │  ├─ Title: "APPLICATION FILTERING"
          │  ├─ Active-Blocklist-Group [Auto Layout: Vertical, Gap: 8px]
          │  │  ├─ App-Row [App: "Chrome.exe", Status: "Blocked", Color: #FF4D4F]
          │  │  └─ App-Row [App: "Discord.exe", Status: "Blocked", Color: #FF4D4F]
          │  └─ Add-Rule-Input [Height: 40px, Border: 1px #2C2C2C]
          ├─ Panel-Display-Arrangement [Width: 500px, Auto Layout: Vertical, Gap: 16px]
          │  ├─ Title: "SCREEN ARRANGER CANVAS"
          │  └─ Arrangement-Canvas-Box [Height: 420px, Width: Fill, Fill: #0A0A0A, Border: 1px #2C2C2C, Radius: 8px, Position: Relative]
          │     ├─ Monitor-Frame-1 [Width: 220px, Height: 140px, Fill: #121212, Center Position]
          │     │  └─ Window-Thumbnail [App: "VSCode.exe", Position: Left]
          │     └─ Monitor-Frame-2 [Width: 220px, Height: 140px, Fill: #121212]
          └─ Panel-Decision-Queue [Width: Fill, Fill: #121212, Radius: 8px, Padding: 20px]
             ├─ Title: "PENDING INTERVENTIONS"
             └─ Queue-Cards [Auto Layout: Vertical, Gap: 12px]
                └─ Intervention-Card [Height: 110px, Border: 1px #FFB800]
                   ├─ Query: "Block Slack Client?"
                   └─ Controls [Button-Approve (Green), Button-Deny (Gray)]
    ```

---

### SCREEN 4: KNOWLEDGE HUB
*   **Auto Layout Setup**: Horizontal Layout | Navigation Pane: 20% (288px) | Main Editor: 55% (792px) | AI Panel: 25% (360px).

```
+-------------------------------------------------------------------------------+
|  Layout: Three-column layout. Width: 1440px
|
|  [Nav Sidebar] (288px)   |  [Central Markdown Editor] (792px) | [AI Sidebar] (360px)
|  ├─ Notebooks index      |  ├─ Document Title (32px, Bold)    | ├─ Key Concepts list
|  ├─ Tag Category filter  |  ├─ Markdown Body Area (Scrollable)| ├─ Challenge Prompts
|  └─ Graph Toggle Switch  |  └─ Visual Concept Graph Canvas    | └─ Flashcards Widget
+-------------------------------------------------------------------------------+
```

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [1440x900, Fill: #0A0A0A]
       ├─ Sidebar-Container [Width: 240px]
       └─ Knowledge-Workspace [Width: Fill, Height: Fill, Auto Layout: Horizontal]
          ├─ Col-Nav-Index [Width: 220px, Height: Fill, Border-Right: 1px #1F1F1F, Padding: 16px]
          │  ├─ Section: "NOTEBOOKS" [Typography: Overline]
          │  ├─ Folder-List [Auto Layout: Vertical, Gap: 8px]
          │  │  ├─ Folder-Item [Active, Icon: Folder, Name: "Computer Science"]
          │  │  └─ Folder-Item [Inactive]
          │  └─ Section: "TAGS" [Auto Layout: Horizontal, Wrap, Gap: 6px]
          ├─ Col-Editor-Canvas [Width: Fill, Height: Fill, Padding: 32px, Auto Layout: Vertical, Gap: 24px]
          │  ├─ Note-Title-Input: "CS301 Compiler Design Notes" [Typography: Display LG, Fill: #FFFFFF, Border: None]
          │  ├─ View-Toggle [Toggle-Editor (Active) | Toggle-Graph]
          │  ├─ Editor-Body-Container [Width: Fill, Height: Fill, Overflow: Scroll]
          │  │  └─ Text-Block: "# Introduction to LL Parsing..." [Typography: Body Large, Line-Height: 1.6, Limit-Width: 520px]
          │  └─ Graph-Canvas-D3 [Height: 400px, Width: Fill, Border: 1px #2C2C2C, Vector Graph Nodes showing connections]
          └─ Col-AI-Context [Width: 320px, Height: Fill, Border-Left: 1px #1F1F1F, Padding: 20px, Auto Layout: Vertical, Gap: 20px]
             ├─ Concepts-Card [Fill: #121212, Radius: 8px, Padding: 16px]
             │  ├─ Title: "EXTRACTED CONCEPTS" [Typography: Overline]
             │  └─ Tags-List [Tags: "LL Parsing", "AST Representation", "Grammar"]
             ├─ Key-Insights-List [Auto Layout: Vertical, Gap: 12px]
             │  └─ Insight-Item [Title: "Compiler Flow", Description: "Parsers transform text streams into AST layouts."]
             └─ Flashcard-Interactive [Height: 140px, Fill: #121212, Border: 1px #00FF87, Radius: 8px]
                ├─ Card-Header [Label: "SOCRATIC FLASHCARD", Color: #00FF87]
                └─ Question: "Explain the difference between LL and LR parsers." [Typography: Body Medium]
    ```

---

### SCREEN 5: RESEARCH WORKSPACE
*   **Auto Layout Setup**: Horizontal Split Layout | Left Pane: 50% Width (720px) | Right Pane: 50% Width (720px).

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [1440x900, Fill: #0A0A0A]
       ├─ Sidebar-Container [Width: 240px]
       └─ Research-Workspace [Width: Fill, Auto Layout: Horizontal]
          ├─ Pane-Left-Viewer [Width: 600px, Height: Fill, Border-Right: 1px #1F1F1F, Padding: 20px]
          │  ├─ Viewer-Header [Document: "Parsing_Paper.pdf", Page: "12 of 34"]
          │  ├─ PDF-Render-Area [Height: Fill, Width: Fill, Fill: #FFFFFF (White paper fallback), Border: 1px #2C2C2C, Radius: 4px]
          │  │  └─ Text-Lines [Representing paper print layouts, Highlight Overlay: Yellow #FFD400 (30% alpha)]
          │  └─ Credibility-Card [Height: 48px, Auto Layout: Horizontal, Green Accent, Text: "Credibility Score: 96%"]
          └─ Pane-Right-Notebook [Width: Fill, Height: Fill, Padding: 20px, Auto Layout: Vertical, Gap: 20px]
             ├─ Notebook-Header [Title: "CS301 Paper Analysis Draft"]
             ├─ Notes-Editor [Height: 400px, Width: Fill, Fill: #121212, Border: 1px #2C2C2C, Padding: 16px]
             │  └─ Markdown-Notes-Text [Citations appended automatically]
             └─ Citation-Timeline-Widget [Height: 120px, Width: Fill, Fill: #121212, Border: 1px #2C2C2C, Radius: 8px]
                ├─ Header: "Research Trail"
                └─ Scrubber-Timeline-Horizontal [Horizontal line with nodes representing papers visited]
    ```

---

### SCREEN 6: WRITING WORKSPACE
*   **Auto Layout Setup**: Horizontal Layout | Col 1 (Outline): 15% (216px) | Col 2 (Editor): 60% (864px) | Col 3 (Socratic): 25% (360px).

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [1440x900, Fill: #0A0A0A]
       ├─ Sidebar-Container [Width: 240px]
       └─ Writer-Workspace [Width: Fill, Auto Layout: Horizontal]
          ├─ Col-Outline [Width: 180px, Border-Right: 1px #1F1F1F, Padding: 16px]
          │  ├─ Section: "OUTLINE" [Typography: Overline]
          │  └─ Header-Tree [Auto Layout: Vertical, Gap: 12px]
          │     ├─ Outline-Item-H1 [Label: "1. Abstract", Active state indicator]
          │     ├─ Outline-Item-H2 [Label: "1.1 Introduction"]
          │     └─ Outline-Item-H2 [Label: "1.2 Scope Analysis"]
          ├─ Col-Central-Writer [Width: Fill, Padding: 48px, Auto Layout: Vertical, Align: Center-X]
          │  ├─ Title-Input: "Compiler Performance Analysis" [Typography: Display LG]
          │  └─ Text-Writer-Area [Width: 540px, Height: Fill, Overflow: Scroll]
          │     └─ Paragraph-Block: "This research compiles semantic execution algorithms..." [Underline: Orange #FFB800]
          └─ Col-Socratic-Challenger [Width: 320px, Border-Left: 1px #1F1F1F, Padding: 20px, Auto Layout: Vertical, Gap: 20px]
             ├─ Header-Status [Title: "Argument Audit", Score: "72% Logical Strength", Color: #FFB800]
             └─ Challenges-Stack [Auto Layout: Vertical, Gap: 16px]
                └─ Challenge-Card-Logic [Fill: #121212, Border: 1px #FFB800, Padding: 16px]
                   ├─ Title: "INSUFFICIENT PROOF IN INTRODUCTION"
                   ├─ Quote: "...algorithms are optimal."
                   ├─ Counterpoint: "Have you compared performance against linear arrays?"
                   └─ Action-Btn: "Insert Counter-argument" [Btn-Primary, Fill: #FFB800]
    ```

---

### SCREEN 7: DEEP WORK MODE
*   **Auto Layout Setup**: Absolute Viewport Takeover | Center Positioned HUD.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [1440x900, Fill: #000000]
       ├─ Pulse-Background [Radial Gradient: Fill: #FFD400 (5% opacity), Scale: 100%, Dimension: Full Canvas]
       ├─ Minimal-HUD-Container [Auto Layout: Vertical, Align: Center, Gap: 32px, Center-Screen Position]
       │  ├─ Active-Task-Tag [Height: 28px, Fill: #1C1C1C, Border: 1px #FFD400, Radius: 4px]
       │  │  └─ Label: "DEEP WORK ACTIVE: COMPILER LAB" [Typography: Overline, Color: #FFD400]
       │  ├─ Focus-Countdown: "45:12" [Typography: Display XL, Font: JetBrains Mono, Size: 96px, Color: #FFFFFF]
       │  ├─ Progress-Ring-HUD [Dimension: 360x360, Center circular ring, Stroke-Dash: 75%]
       │  └─ Audio-Controller [Auto Layout: Horizontal, Gap: 16px, Align: Center]
       │     ├─ Icon-Prev [20x20]
       │     ├─ Track-Playing: "Binaural Focus Beat - 40Hz" [Typography: Body Medium, Color: #B0B0B0]
       │     └─ Icon-Next [20x20]
       ├─ Process-Watchdog-Widget [Height: 40px, Position: Fixed Bottom Right, Padding: 16px]
       │  └─ Watchdog-Text: "Environment Sculptor active. 4 blocks executed." [Typography: Caption]
       └─ Exit-Hint [Position: Bottom Center, Label: "Press and hold ESC for 2 seconds to exit mode"]
    ```

---

### SCREEN 8: DEADLINE WAR ROOM
*   **Auto Layout Setup**: Vertical | Grid Layout constraints | Margins: 24px | Gutter: 16px.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [1440x900, Fill: #0A0A0A]
       ├─ Status-Header-Bar [Height: 56px, Width: Fill, Fill: #1F0D0E, Border-Bottom: 1px #FF4D4F, Auto Layout: Horizontal, Split]
       │  ├─ Triage-Label: "DEADLINE RISK PROFILE: CRITICAL" [Typography: Heading MD, Color: #FF4D4F]
       │  └─ Buffer-Metric: "Buffer: 42m (Avg Task: 2.5h)" [Typography: Code Large, Color: #FF4D4F]
       ├─ Grid-Body [Auto Layout: Horizontal, Gap: 16px, Width: Fill, Padding-Top: 16px]
       │  ├─ Col-Triage-Decomposition [Width: 0, Flex-Grow: 7 (col-span-7), Auto Layout: Vertical, Gap: 16px]
       │  │  ├─ Panel-Title [Title: "TRIAGE SEQUENCE"]
       │  │  └─ Triage-Stack [Auto Layout: Vertical, Gap: 12px]
       │  │     ├─ Task-Row-A [Height: 64px, Fill: #121212, Border: 1px #FF4D4F, Radius: 4px]
       │  │     │  ├─ Checkbox [Selected, Color: #FF4D4F]
       │  │     │  ├─ Title: "Implement Parser Grammar" [Typography: Heading SM]
       │  │     │  └─ Time-Allocation: "Timer: 30m" [Typography: Code Small]
       │  │     ├─ Task-Row-B [Height: 64px, Fill: #121212, Border: 1px #2C2C2C]
       │  │     └─ Task-Row-C [Height: 64px, Fill: #121212, Border: 1px #2C2C2C]
       │  ├─ Col-Peer-Radar [Width: 0, Flex-Grow: 5 (col-span-5), Fill: #121212, Padding: 20px, Radius: 8px]
       │  │  ├─ Header-Title: "PEER ALERTS LOG"
       │  │  └─ Radar-Feed [Auto Layout: Vertical, Gap: 12px]
       │  │     ├─ Feed-Row-Discord [Slack Update: "Resubmission link is active now"]
       │  │     └─ Feed-Row-Canvas [LMS Notice: "Late submission policy updated"]
       └─ Suggestion-Bar-Resources [Height: 140px, Position: Fixed Bottom, Width: Fill, Fill: #121212, Border-Top: 1px #2C2C2C, Padding: 20px]
          ├─ Label: "SENTINEL SUGGESTED REFERENCE PAPERS"
          └─ Document-Links-Row [Auto Layout: Horizontal, Gap: 16px]
             ├─ Doc-Link-A [Width: 200px, Height: 60px, Fill: #1C1C1C]
             └─ Doc-Link-B [Width: 200px, Height: 60px, Fill: #1C1C1C]
    ```

---

### SCREEN 9: SESSION REPLAY
*   **Auto Layout Setup**: Vertical Split View | Player Frame: 70% Height (630px) | Controls Timeline: 30% Height (270px).

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [1440x900, Fill: #0A0A0A]
       ├─ Sidebar-Container [Width: 240px]
       └─ Replay-Workspace [Width: Fill, Auto Layout: Vertical]
          ├─ Player-Area [Height: 520px, Width: Fill, Fill: #121212, Padding: 24px, Auto Layout: Vertical, Align: Center]
          │  ├─ Screen-Capture-Placeholder [Height: 400px, Width: 720px, Fill: #0A0A0A, Border: 2px Solid #FFD400]
          │  │  └─ Watermark: "FLOW ACTIVE FRAME" [Typography: Overline]
          │  └─ Sync-Charts-Area [Height: 60px, Width: Fill, Spline Charts mapping Attention and Key Events]
          └─ Scrubber-Timeline-Pane [Height: 220px, Width: Fill, Fill: #121212, Border-Top: 1px #2C2C2C, Padding: 20px]
             ├─ Control-Buttons-Row [Auto Layout: Horizontal, Gap: 16px, Align: Center-Y]
             │  ├─ Btn-PlayPause [Icon: Play, Size: 24x24]
             │  ├─ Speed-Selector [Toggle: 1x | 2x | 4x]
             │  └─ Time-Label: "01:22:15 / 02:30:00" [Typography: Code Large]
             └─ Timeline-Canvas [Height: 80px, Width: Fill, Position: Relative]
                ├─ Track-Bg [Height: 12px, Width: Fill, Fill: #2C2C2C, Radius: 6px]
                ├─ Flow-Zones [Vector overlays on Track, Color-Coded by State: Green, Yellow, Blue]
                └─ Active-Scrubber-Handle [Height: 40px, Width: 2px, Color: #FFD400, Position: Absolute Left 45%]
    ```

---

### SCREEN 10: ANALYTICS DASHBOARD
*   **Auto Layout Setup**: Vertical | Grid Layout constraints | Margins: 32px | Gutter: 24px | Scrollable.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [1440x900, Fill: #0A0A0A]
       ├─ Sidebar-Container [Width: 240px]
       └─ Analytics-Workspace [Width: Fill, Padding: 32px, Auto Layout: Vertical, Gap: 24px]
          ├─ Header-Bar [Title: "PRODUCTIVITY ANALYTICS", Date-Range: "Weekly Summary"]
          ├─ Top-Metric-Row [Auto Layout: Horizontal, Gap: 24px]
          │  ├─ Card-Metric-A [Width: 320px, Height: 120px, Fill: #121212, Radius: 8px]
          │  │  ├─ Label: "Average Flow Duration"
          │  │  └─ Value: "74 minutes" [Typography: Display LG]
          │  ├─ Card-Metric-B [Width: 320px, Height: 120px, Fill: #121212]
          │  └─ Card-Metric-C [Width: 320px, Height: 120px, Fill: #121212]
          ├─ Middle-Visuals-Row [Auto Layout: Horizontal, Gap: 24px]
          │  ├─ Heatmap-Card [Width: 540px, Height: 320px, Fill: #121212, Radius: 8px, Padding: 20px]
          │  │  ├─ Title: "Cognitive Focus Heatmap"
          │  │  └─ Grid-Squares [Matrix of focus boxes]
          │  └─ Actions-Chart-Card [Width: 540px, Height: 320px, Fill: #121212, Radius: 8px, Padding: 20px]
          │     ├─ Title: "Agent Interventions Block Rates"
          │     └─ Bar-Graph-Vector [Bar charts detailing blocked apps]
          └─ Bottom-Chart-Full [Width: Fill, Height: 260px, Fill: #121212, Radius: 8px, Padding: 20px]
             ├─ Title: "Deadline Buffer Calibration Accuracy"
             └─ Spline-Lines-Graph [Vector layout comparing estimated time with actual duration]
    ```

---

### SCREEN 11: COMMAND CENTER (RAYCAST-INSPIRED)
*   **Auto Layout Setup**: Absolute Overlay Modal Center | Width: 680px | Height: Auto.

```
+-------------------------------------------------------------+
|  Figma Overlay Modal Frame: Width: 680px, Height: 420px max
|  Backdrop Blur: 25px, Opacity: 80% Background #121212
|  Auto Layout: Vertical
|
|  [Fuzzy Finder Search Input Bar] (Height: 56px)
|  ├─ Search Icon (20x20px, #B0B0B0)
|  ├─ Input Text: "Deep..." (Typography: iQOO Sans Light, 20px)
|  └─ Platform Key Badge: "ESC" (Right Aligned)
|
|  [Search Results List Container] (Auto Layout Stack)
|  ├─ Selected Row (Height: 44px, Fill: #FFD400 w/ 15% opacity, Yellow border)
|  │  ├─ Command: "Toggle Deep Work Mode" (#FFFFFF, Bold)
|  │  └─ Action Shortcut Badge: "ENTER" (Right Aligned)
|  ├─ Default Row 1: "Socratic Challenger: Resume Drill"
|  ├─ Default Row 2: "Deadline Sentinel: Check Syllabus"
|  └─ Default Row 3: "Environment Sculptor: Quiet Presets"
|
|  [Helper Footer Bar] (Height: 28px, Fill: #181818)
+-------------------------------------------------------------+
```

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard-Mask-Overlay [1440x900, Fill: #000000, Opacity: 50%, Backdrop Blur: 8px]
       └─ Command-Center-Modal [Width: 680px, Height: 380px, Fill: #121212, Opacity: 80%, Backdrop-Blur: 25px, Border: 1px Linear-Gradient, Radius: 8px, Position: Center-Aligned, Offset-Top: 120px]
          ├─ Search-Input-Row [Height: 56px, Width: Fill, Border-Bottom: 1px #2C2C2C, Auto Layout: Horizontal, Align: Center-Y, Padding: 16px]
          │  ├─ Search-Icon [20x20, Color: #B0B0B0]
          │  ├─ Input-Text: "Deep..." [Typography: Heading LG, Color: #FFFFFF]
          │  └─ Shortcut-Badge [Label: "ESC", Typography: Code Small, Fill: #1C1C1C]
          ├─ Results-List-Section [Auto Layout: Vertical, Gap: 4px, Padding: 8px, Height: 290px, Overflow: Scroll]
          │  ├─ Row-Result-Selected [Height: 44px, Width: Fill, Fill: rgba(254, 212, 0, 0.15), Border: 1.5px Solid #FFD400, Radius: 4px, Auto Layout: Horizontal, Split, Padding: 12px]
          │  │  ├─ Item-Label: "Toggle Deep Work Mode" [Typography: Heading SM, Color: #FFFFFF]
          │  │  └─ Target-Badge [Label: "ENTER", Fill: #121212]
          │  ├─ Row-Result-Default [Height: 44px, Width: Fill, Auto Layout: Horizontal, Split, Padding: 12px]
          │  │  ├─ Item-Label: "Socratic Challenger: Resume Drill" [Typography: Heading SM, Color: #B0B0B0]
          │  │  └─ Target-Badge [Label: "⌘1", Fill: Transparent]
          │  ├─ Row-Result-Default [Height: 44px, Label: "Deadline Sentinel: Check Syllabus"]
          │  └─ Row-Result-Default [Height: 44px, Label: "Environment Sculptor: Quiet Presets"]
          └─ Status-Footer-Bar [Height: 28px, Width: Fill, Fill: #181818, Border-Top: 1px #1F1F1F, Auto Layout: Horizontal, Split, Padding: 8px]
             ├─ Navigation-Label: "Use ↑↓ arrows to select" [Typography: Caption]
             └─ Settings-Label: "Press TAB for actions" [Typography: Caption]
    ```

---

### SCREEN 12: AGENT LOGS
*   **Auto Layout Setup**: Vertical | Margins: 24px | Gutter: 16px | Terminal Scrollable.

*   **Figma Component Hierarchy**:
    ```
    └─ Artboard [1440x900, Fill: #0A0A0A]
       ├─ Sidebar-Container [Width: 240px]
       └─ Logs-Workspace [Width: Fill, Auto Layout: Vertical]
          ├─ Header-Filter-Bar [Height: 44px, Width: Fill, Border-Bottom: 1px #1F1F1F, Auto Layout: Horizontal, Split, Padding: 12px]
          │  ├─ Left-Filters [Auto Layout: Horizontal, Gap: 8px]
          │  │  ├─ Checkbox-State [Checked, Label: "State"]
          │  │  ├─ Checkbox-Deadline [Checked, Label: "Deadline"]
          │  │  └─ Checkbox-Sculptor [Checked, Label: "Sculptor"]
          │  └─ Log-Control-Toggles [Auto-Scroll: On | Clear Output]
          ├─ Output-Terminal-Console [Width: Fill, Height: Fill, Fill: #0A0A0A, Border: 1px #1F1F1F, Padding: 16px, Overflow: Scroll]
          │  └─ Console-Lines [Typography: Code Small, Font: JetBrains Mono, Line-Height: 1.5, Auto Layout: Vertical, Gap: 4px]
          │     ├─ Line-Log-Info: "[09:00:15.122] [INFO] [StateAgent] Keystroke baseline calibrated. HRV stability: 92%" [Color: #00D26A]
          │     ├─ Line-Log-Warn: "[09:05:32.411] [WARN] [DeadlineSentinel] Buffer estimation drops below 30% thresholds" [Color: #FFB800]
          │     ├─ Line-Log-Error: "[09:12:10.005] [ERROR] [EnvironmentSculptor] Windows Hook execution denied by OS registry" [Color: #FF4D4F]
          │     └─ Line-Log-Debug: "[09:15:00.000] [DEBUG] [PeerRadar] Ingested 12 Slack messages in background thread" [Color: #B0B0B0]
          └─ Action-Footer-Bar [Height: 40px, Border-Top: 1px #1F1F1F, Auto Layout: Horizontal, Align: Center-Right, Padding: 8px]
             └─ Btn-Export-Logs [Height: 28px, Fill: #181818, Border: 1px #2C2C2C, Text: "EXPORT DATA ARCHIVE"]
    ```

---

## 4. FIGMA COMPONENT STATES MATRIX

The following component configurations must be built as Figma variants with correct interactive prototyping loops.

### 4.1 Buttons & Inputs Variants

| Component | State | Figma Variant Parameter | Visual Style Properties |
| :--- | :--- | :--- | :--- |
| **Btn-Primary** | Default | `State = Default` | Fill: `#FFD400` | Text: `#0A0A0A` | Border: None |
| | Hover | `State = Hover` | Fill: `#E5BE00` | Text: `#0A0A0A` |
| | Pressed | `State = Pressed` | Scale: 98% (Smart Animate, 100ms spring) |
| | Disabled | `State = Disabled` | Fill: `#2C2C2C` | Text: `#666666` |
| **Btn-Secondary**| Default | `State = Default` | Fill: `#181818` | Text: `#FFFFFF` | Border: 1px `#2C2C2C` |
| | Hover | `State = Hover` | Fill: `#222222` | Border: 1px `#444444` |
| | Pressed | `State = Pressed` | Scale: 98% |
| **Input-Field** | Idle | `Focused = False` | Fill: `#121212` | Border: 1px `#2C2C2C` | Text: `#555555` |
| | Active / Focus| `Focused = True` | Fill: `#121212` | Border: 1px `#FFD400` | Text: `#FFFFFF` |
| | Error | `Error = True` | Border: 1px `#FF4D4F` | Helper Text: `#FF4D4F` |
| **Toggle-Switch**| Off | `Active = False` | Track: `#2C2C2C` | Thumb: Left Align |
| | On | `Active = True` | Track: `#00D26A` | Thumb: Right Align |

---

### 4.2 Interactive Cards Variants

| Card Component | Trigger Event | State Result | Visual Shift | Prototyping Action |
| :--- | :--- | :--- | :--- | :--- |
| **Context-Card** | Swipe Left | Dismiss Action | Shift Left `-120px` | Reveal Trash container (`#FF4D4F`) |
| | Swipe Right | Snooze Action | Shift Right `+120px` | Reveal Clock container (`#FFB800`) |
| | Hover | Highlight Profile | Border transitions to `#FFD400` | Pointer shifts to Hand cursor |
| **Deadline-Card** | Mouse Click | Expand Card | Height shifts from `110px` to `260px` | Reveal subtasks and metrics details |
| **Agent-Card** | Click | Focus Panel | Screen fades to details card | Navigation routes to selected details |

---

### 4.3 Cognitive State Visual Overrides
When the global context shifts, layouts and color configurations update across screens:

*   **Flow State Override**:
    *   Fills: Backgrounds shift to pure `#000000` (AMOLED shutdown).
    *   Borders: Transition to Accent Yellow `#FFD400` or Success Green `#00D26A`.
    *   Opacity: Non-focused layout nodes (e.g., sidebars, navigation) fade to `10%` opacity. Hover restores opacity.
*   **Overloaded State Override**:
    *   Fills: Backgrounds add a `5%` Red overlay (`#1C0A0C`).
    *   Borders: Accent outlines transition to Warning Red `#FF4D4F`.
    *   Alert chimes: Flashing border prompts active triage dashboard.

---

## 5. DESIGN-TO-CODE LAYOUT RULES (Figma to Flutter/React)

To convert Figma configurations into code (CSS / Tailwind / Flutter Dart), use the following translation mappings:

### 5.1 Auto Layout to CSS Flexbox & Flutter Layouts

| Figma Auto Layout Parameter | CSS Grid / Flex Equivalent | Flutter Dart Layout Equivalent |
| :--- | :--- | :--- |
| **Direction**: Vertical `↓` | `display: flex; flex-direction: column;` | `Column(children: [...])` |
| **Direction**: Horizontal `→` | `display: flex; flex-direction: row;` | `Row(children: [...])` |
| **Direction**: Wrap `↩` | `display: flex; flex-wrap: wrap;` | `Wrap(spacing: gap, children: [...])` |
| **Spacing**: Gap value `px` | `gap: value;` | `SizedBox(height: gap)` or `gap` parameter |
| **Padding**: Horizontal / Vertical | `padding: V_value H_value;` | `padding: EdgeInsets.symmetric(...)` |
| **Constraints**: Fill Container | `width: 100%;` / `flex-grow: 1;` | `Expanded(child: ...)` |
| **Constraints**: Hug Contents | `width: fit-content;` | `MainAxisSize.min` |
| **Constraints**: Fixed Width/Height | `width: value;` / `height: value;` | `SizedBox(width: val, height: val)` |

### 5.2 Responsive & Adaptability Matrix

#### Sidebar Collapsing Behavior (Desktop/Laptop Breakpoints)
*   **Breakpoint `lg` (>1024px)**: Sidebar Expanded (`Width: 240px`, labels visible).
*   **Breakpoint `md` (768px - 1023px)**: Sidebar Collapsed (`Width: 64px`, labels hidden, icons centered).
*   **Breakpoint `sm` (<768px)**: Sidebar Hidden (`display: none`). Bottom Navigation Bar visible (`height: 72px`).

#### Multi-Column Telemetry Wrap (Responsive Grids)
*   **Desktop (12 Columns)**: Main grid features Left-Span col-span-8, Right-Span col-span-4.
*   **Tablet (8 Columns)**: Wrap layouts. Main grid goes full width col-span-8. Right-Span wraps below.
*   **Mobile (4 Columns)**: All cards expand to fill full container width, stacking vertically. Scroll offsets lock to vertical index.

---

This concludes the APEX Figma Screen Inventory and Visual System translation rules.
