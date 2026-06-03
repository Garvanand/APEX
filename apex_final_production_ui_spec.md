# APEX Final Production UI Specification
## Visual Identity, Component Architecture, and Layout System
### Version: 1.0.0-FINAL-RELEASE

This specification defines the final, launch-ready user interface system for APEX (Adaptive Presence & Execution Intelligence). The visual identity combines **Apple's** spatial layouts, **Linear's** functional keyboard-first boundaries, **Arc Browser's** layout controls, and **Tesla's** telemetry indicators.

---

## 1. iQOO VISUAL LANGUAGE & GLOBAL TOKENS

### 1.1 Color Distribution Rules
The interface utilizes a dark-first color scheme optimized for AMOLED displays, structured strictly on a **90% Black & White / 10% Yellow** layout:

*   **90% Base Canvas (Grayscale)**:
    *   `Bg-Primary`: `#0A0A0A` (100% black base for AMOLED pixel shutoff).
    *   `Bg-Secondary`: `#121212` (Container cards, navigation bars, panels).
    *   `Bg-Interactive`: `#181818` (Hover states, active select cells).
    *   `Border-Default`: `#2C2C2C` (1px solid default bounds).
    *   `Border-Muted`: `#1F1F1F` (1px solid nested separators).
    *   `Text-Primary`: `#FFFFFF` (Titles, primary telemetry readings).
    *   `Text-Secondary`: `#A5A5A5` (Body copy, timestamps, inactive states).
*   **10% Focal Accents (iQOO Yellow - #FFD400)**:
    *   Must **never** be used for general borders, branding backgrounds, or decorative lines.
    *   Reserved exclusively for:
        1.  **Urgency**: Deadlines nearing critical margins (e.g. less than 4h remaining).
        2.  **Intelligence**: Active classification shifts and agent overrides.
        3.  **Action**: Primary execute actions and toggle anchors.
        4.  **Attention**: Currently active task highlights and focus countdown clocks.

### 1.2 Typography System

| Token Name | Font Family | Size (px) | Line Height | Weight | Letter Spacing | Application |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Display XL` | Cabinet Grotesk | 48px | 52px (1.08) | 800 (ExtraBold) | -0.04em | Countdown timers, focus percentages |
| `Display LG` | Cabinet Grotesk | 36px | 40px (1.11) | 700 (Bold) | -0.03em | Primary telemetry scores |
| `H1` | Cabinet Grotesk | 24px | 28px (1.16) | 700 (Bold) | -0.02em | Screen headers, modal titles |
| `H2` | Inter | 20px | 26px (1.30) | 600 (SemiBold) | -0.01em | Card headers, panel sections |
| `H3` | Inter | 16px | 22px (1.37) | 600 (SemiBold) | 0.00em | Inner group titles, options headers |
| `Body` | Inter | 14px | 20px (1.42) | 400 (Regular) | 0.00em | Chat summaries, logs text |
| `Caption` | Inter | 11px | 16px (1.45) | 500 (Medium) | +0.02em | Timestamps, sync latency markers |
| `Overline` | Inter | 10px | 12px (1.20) | 700 (Bold) | +0.08em | Small capitalized labels |
| `Code` | JetBrains Mono | 12px | 16px (1.33) | 500 (Medium) | 0.00em | Trace outputs, system parameters |

---

### 1.3 Spacing Constants
All layout configurations are defined on an 8px grid system:
*   `space-1` (4px): Badge padding, border offsets.
*   `space-2` (8px): Input inner padding, chip gaps, small button heights.
*   `space-3` (12px): List item spacing, inner card padding.
*   `space-4` (16px): Card outer padding, layout grid columns gutter.
*   `space-5` (24px): Page side margins, modal container gaps.
*   `space-6` (32px): Desktop margins, hero offsets.
*   `space-7` (48px): System section dividers.

---

## 2. MOTION SYSTEM & INTERACTION CURVES

Visual transitions are configured using exact spring physics parameters:

```typescript
// Production Spring Curve Mappings
export const motionSprings = {
  // Used for snappy keyboard selections, command palettes, and active focus chimes
  snappy: {
    stiffness: 750,
    damping: 38,
    mass: 0.8
  },
  // Used for layout re-flows, collapsible sidebars, and expanding panel cards
  smooth: {
    stiffness: 420,
    damping: 30,
    mass: 1.0
  },
  // Active under Fatigued / Overloaded states to ease visual load
  restorative: {
    stiffness: 160,
    damping: 22,
    mass: 1.4
  }
};

// CSS Transition Timing Fallbacks
export const motionTimings = {
  durationMicro: "80ms",     // micro-interactions (e.g. checkbox selections)
  durationFast: "150ms",     // buttons color fade sweeps, hover states
  durationNormal: "280ms",   // page sliding animations, modal windows slide-ins
  durationSlow: "450ms"      // full-screen layout shifts
};
```

---

## 3. MOBILE APP INTERFACE SPECIFICATIONS (13 Screens)

All mobile viewports are sized at **390px x 844px**.

### SCREEN 1: SPLASH SCREEN

```
+------------------------------------------+
|                                          |
|                                          |
|                                          |
|                   ( )                    |
|                  APEX                    |
|                                          |
|                                          |
|        [ 12ms P2P Bridge Active ]        |
|                                          |
+------------------------------------------+
```

*   **Visual Composition**: Monolithic centered layout on pure `#000000` canvas. Visual anchor is a thin, dynamic concentric ring circle vector that pulsates at 0.5Hz, centered above the minimal product wordmark.
*   **Layout Grid**: 4 Columns | Margin: 24px | Gutter: 16px.
*   **Component Hierarchy**:
    ```text
    └─ Frame [390x844, Fill: #000000]
       └─ CenterWrapper [Auto Layout: Vertical, Align: Center, Gap: 24]
          ├─ PulseRingVector [Height: 120, Width: 120, Stroke: 1px #FFFFFF]
          ├─ Text ["APEX", Style: H1, Color: #FFFFFF]
          └─ StatusBadge [Auto Layout: Horizontal, Padding: 6 12, Fill: #121212, Border: 1px #2C2C2C, Radius: 4]
             ├─ SyncIndicator [Circle: 6x6, Fill: #00D26A]
             └─ Text ["12ms P2P Bridge Active", Style: Caption, Color: #FFFFFF]
    ```
*   **Card Hierarchy**: Not applicable (flat layout).
*   **Motion Behavior**: On mount, `PulseRingVector` scales up from `0.85x` to `1.0x` and transitions opacity from `0` to `1.0` using `motionSprings.smooth`. The `SyncIndicator` pulses color brightness from 50% to 100% every 1.5 seconds.
*   **Empty State**: Not applicable.
*   **Loading State**: Active during P2P handshake loops. Circular progress indicator (12x12px, stroke 1px, `#FFFFFF`) replaces `SyncIndicator` when connecting.
*   **Error State**: If bridge fails to link: `SyncIndicator` fill shifts to Danger Red `#FF4D4F`. Status text changes to: "BRIDGE SYNCHRONIZATION TIMEOUT". An action card slides up from bottom: "BOOT OFFLINE SYSTEM" (Height: 48px, Background: `#121212`, Border: `1px solid #FF4D4F`).

---

### SCREEN 2: ONBOARDING

*   **Visual Composition**: Structured form card layout. Uses progressive disclosure to prompt student information fields. Dark canvas separation with solid `#2C2C2C` border rules.
*   **Layout Grid**: 4 Columns | Margin: 24px | Gutter: 16px.
*   **Component Hierarchy**:
    ```text
    └─ Frame [390x844, Fill: #0A0A0A]
       └─ FormContainer [Auto Layout: Vertical, Padding: 32 24, Gap: 32]
          ├─ HeaderSection [Auto Layout: Vertical, Gap: 8]
          │  ├─ Text ["Welcome to APEX", Style: H1]
          │  └─ Text ["Set up your profile to sync cognitive baselines.", Style: Body, Color: #A5A5A5]
          ├─ FieldGroup [Auto Layout: Vertical, Gap: 20]
          │  ├─ InputField [Label: "University", Text: "Stanford University"]
          │  └─ InputField [Label: "Major", Text: "Computer Science"]
          └─ CTASection [Auto Layout: Vertical, Position: Absolute Bottom, Margin: 32]
             └─ BtnPrimary [Height: 56, Fill: #FFFFFF, Text: "INITIALIZE CALIBRATION"]
    ```
*   **Card Hierarchy**: Flat workspace. Inputs use `#121212` background cards with `4px` corner radii.
*   **Motion Behavior**: Keyboard slides up with standard iOS/Android transition timings (`250ms`). The `FormContainer` shifts upward by `80px` to prevent field obstruction.
*   **Empty State**: Text inputs show placeholder text in `#A5A5A5`.
*   **Loading State**: When validating profile credentials, `BtnPrimary` label shifts to a loading spinner.
*   **Error State**: Invalid entries highlight input field border with `#FF4D4F` and display helper text: "University system connection failed."

---

### SCREEN 3: PERMISSIONS FLOW

*   **Visual Composition**: Stacked list of telemetry switch components. High information density focused on explaining exactly what signals are captured.
*   **Layout Grid**: 4 Columns | Margin: 24px | Gutter: 16px.
*   **Component Hierarchy**:
    ```text
    └─ Frame [390x844, Fill: #0A0A0A]
       └─ ListView [Auto Layout: Vertical, Padding: 24, Gap: 12]
          ├─ TitleBlock ["Telemetry Authorizations", Sub: "Enable biometric capture sensors"]
          ├─ PermissionCard [Title: "Keystroke Latency", Active: True]
          ├─ PermissionCard [Title: "Notifications Override", Active: True]
          ├─ PermissionCard [Title: "Camera Eye-Gaze Tracking", Active: False]
          ├─ PermissionCard [Title: "Ambient Decibel Levels", Active: True]
          └─ FooterActions [Auto Layout: Horizontal, Position: Bottom, Align: Split]
             ├─ TextLink ["Skip all", Color: #A5A5A5]
             └─ BtnPrimary [Width: 180, Height: 48, Fill: #FFFFFF, Text: "CONFIRM"]
    ```
*   **Card Hierarchy**:
    *   `PermissionCard`: Height `68px`, Fill `#121212`, Border `1px solid #2C2C2C`.
*   **Motion Behavior**: Toggling permission switches animates switch knob position horizontally (`duration: 120ms`) using linear curves.
*   **Empty State**: Not applicable.
*   **Loading State**: Gray skeletons replace cards during baseline OS checks.
*   **Error State**: Denying eye-gaze tracking displays a warning tag inside the card: "State Agent accuracy will decrease."

---

### SCREEN 4: COGNITIVE DASHBOARD

```
+------------------------------------------+
|  [Avatar]       [ COGNITIVE ]      [Bridge]
|
|                 FLOW ACTIVE
|                     94%
|
|            ( Bezier Sparkline )
|
|  [ HRV: 72ms ]          [ Gaze: 96% ]
|  [ Idle: 4% ]           [ Noise: 38dB ]
|
|             [ MANUAL OVERRIDE ]
+------------------------------------------+
```

*   **Visual Composition**: Telemetry dashboard display. Main screen element is the 94% Focus score displayed in Accent-Yellow, centered within a glowing circular ring path representing active focus intensity.
*   **Layout Grid**: 4 Columns | Margin: 16px | Gutter: 12px.
*   **Component Hierarchy**:
    ```text
    └─ Frame [390x844, Fill: #0A0A0A]
       ├─ NavigationHeader [Height: 48, Auto Layout: Horizontal, Split]
       ├─ StatusCardHero [Height: 240, Auto Layout: Vertical, Align: Center, Gap: 16]
       │  ├─ StateBadge ["FLOW STATE", Color: #00D26A]
       │  ├─ ScoreText ["94%", Style: Display XL, Color: #FFD400]
       │  └─ SparklineCanvas [Height: 64, Width: 326]
       ├─ GridSignals [2x2 Auto Layout Grid, Gap: 12]
       │  ├─ SignalBox [Title: "HRV Stability", Value: "72ms", Color: #00D26A]
       │  ├─ SignalBox [Title: "Gaze Fixation", Value: "96%", Color: #00D26A]
       │  ├─ SignalBox [Title: "Typing Cadence", Value: "Normal", Color: #00D26A]
       │  └─ SignalBox [Title: "Ambient Audio", Value: "38dB", Color: #FFFFFF]
       └─ ActionSection [Position: Fixed Bottom, Margin: 24]
          └─ BtnSecondary ["MANUAL OVERRIDE", Width: Fill, Height: 50, Border: 1px #2C2C2C]
    ```
*   **Card Hierarchy**:
    *   `SignalBox`: Height `78px`, Width `168px`, Background `#121212`, Border `1px solid #2C2C2C`.
*   **Motion Behavior**: Sparkline path draws from left to right on screen load (`duration: 1200ms`, `curve: Curves.easeOutQuad`). Tapping a `SignalBox` displays a detailed metrics graph overlay using `motionSprings.snappy`.
*   **Empty State**: If sensor data is disconnected, `ScoreText` displays `--` in `#A5A5A5` and the sparkline displays a flat horizontal dotted line.
*   **Loading State**: Sweeping shimmers cover the grid boxes.
*   **Error State**: If P2P synchronization drops: Header displays: "SENSOR OFFLINE" (Color `#FF4D4F`).

---

### SCREEN 5: DEADLINE DASHBOARD

*   **Visual Composition**: Vertical timeline with status blocks. Timeline nodes use Accent-Yellow only when assignments are due in less than 6 hours.
*   **Layout Grid**: 4 Columns | Margin: 16px | Gutter: 12px.
*   **Component Hierarchy**:
    ```text
    └─ Frame [390x844, Fill: #0A0A0A]
       ├─ HeaderRow [Title: "DEADLINES", ViewToggle: Timeline | List]
       ├─ TimelineScrollArea [Overflow: Scroll, Padding: 16, Row]
       │  ├─ TimelineLine [Width: 2, Fill: #2C2C2C]
       │  └─ DeadlinesStack [Auto Layout: Vertical, Gap: 16]
       │     ├─ DeadlineCard [Urgent, Title: "Compiler Project 3", Risk: 92%, Color: #FF4D4F]
       │     ├─ DeadlineCard [Default, Title: "Machine Learning Lab", Risk: 45%, Color: #FFFFFF]
       │     └─ DeadlineCard [Default, Title: "Database Midterm Review", Risk: 12%, Color: #FFFFFF]
       └─ FAB [Size: 56x56, Circle, Position: Absolute Bottom Right, Fill: #FFD400]
    ```
*   **Card Hierarchy**:
    *   `DeadlineCard`: Height `110px`, Width `320px`. Left border colored by risk state (`#FF4D4F` or `#FFFFFF`).
*   **Motion Behavior**: Tapping a card expands its height from `110px` to `240px` to show subtasks, using `motionSprings.smooth`. Remaining items in stack shift downward dynamically.
*   **Empty State**: If zero deadlines are synced: Screen displays a clean checkbox icon and text: "No deadlines remaining. Focus targets clean."
*   **Loading State**: Skeletons slide in from bottom.
*   **Error State**: If calendar sync fails: Displays top banner: "Sync Error: Local Cache Displayed" (Color `#FFB800`).

---

### SCREEN 6: AGENT CONTROL CENTER

*   **Visual Composition**: Grid layout displaying diagnostics status for the 5 agents. Visual theme uses thin borders (`#2C2C2C`) and grayscale metrics. Accent-Yellow is used only on the status dot of the agent currently performing actions.
*   **Layout Grid**: 4 Columns | Margin: 16px | Gutter: 12px.
*   **Component Hierarchy**:
    ```text
    └─ Frame [390x844, Fill: #0A0A0A]
       └─ Column [Padding: 16, Gap: 24]
          ├─ HeaderSection [Title: "Agent Matrix", Sub: "5 threads running"]
          ├─ GridAgents [2 Columns, Gap: 12]
          │  ├─ AgentCard [Name: "State Agent", Status: "Active", AccentDot: #0A0A0A]
          │  ├─ AgentCard [Name: "Deadline Sentinel", Status: "Auditing", AccentDot: #FFD400]
          │  └─ AgentCard [Name: "Environment Sculptor", Status: "Standby", AccentDot: #0A0A0A]
          ├─ DetailedParametersBox [Height: 200, Fill: #121212, Border: 1px #2C2C2C]
          └─ AutonomySliderCard [Height: 90, Fill: #121212]
    ```
*   **Card Hierarchy**:
    *   `AgentCard`: Height `100px`, Width `170px`. Background `#121212`.
    *   `AutonomySliderCard`: Height `90px`, Width `358px`.
*   **Motion Behavior**: Selecting an agent card slides the DetailedParametersBox panel up by `16px` while fading content in over `180ms`.
*   **Empty State**: Not applicable.
*   **Loading State**: Shimmer sweep across the grid layout.
*   **Error State**: If an agent thread crashes: The target `AgentCard` displays a broken connection warning: "Thread Interrupted" (Color `#FF4D4F`).

---

### SCREEN 7: FOCUS SESSION

```
+------------------------------------------+
|                 [ DEEP ]                 |
|                                          |
|                                          |
|                  45:00                   |
|                                          |
|                                          |
|           [ Emergency Exit ]             |
+------------------------------------------+
```

*   **Visual Composition**: Minimalist black screen. Visual focus is on the large countdown clock, with a glowing pulse ring behind it indicating focus levels. Accent-Yellow is only used for the focus timer text.
*   **Layout Grid**: Single centered viewport | Margins: 32px.
*   **Component Hierarchy**:
    ```text
    └─ Frame [390x844, Fill: #000000]
       └─ CenterStack
          ├─ PulsingRadialBg [Height: 340, Width: 340, Gradient: #FFD400 (5% alpha) -> transparent]
          ├─ TimerText ["45:00", Style: Display XL, Color: #FFD400]
          ├─ TaskName ["CS301 COMPILER LAB 3", Style: Overline, Color: #FFFFFF]
          └─ ExitButton [Height: 56, Width: 56, Position: Absolute Bottom, Circle, Border: 1px #FF4D4F]
    ```
*   **Card Hierarchy**: Flat layout (zero cards).
*   **Motion Behavior**: `PulsingRadialBg` runs a continuous scale cycle (oscillating between `0.9x` and `1.1x` over `8000ms`, `curve: Curves.easeInOutSine`).
*   **Empty State**: Not applicable.
*   **Loading State**: Screen fades from black to active focus state over `800ms`.
*   **Error State**: If tracking sensors drop connection: Focus screen displays a warning icon and text: "Sensor connection lost. Please check phone bridge."

---

### SCREEN 8: VOICE CAPTURE

*   **Visual Composition**: Recording waveform display. Visual elements are grayscale, with a red recording dot. Accent-Yellow is used only for the dynamic transcript match highlighting.
*   **Layout Grid**: 4 Columns | Margin: 16px | Gutter: 12px.
*   **Component Hierarchy**:
    ```text
    └─ Frame [390x844, Fill: #0A0A0A]
       └─ Column [Padding: 16, Gap: 24]
          ├─ HeaderSection [Title: "Voice Notes", Duration: "02:15"]
          ├─ WaveformPanel [Height: 140, Fill: #121212, Border: 1px #2C2C2C]
          ├─ TranscriptPreviewBox [Height: 220, Fill: #121212, Padding: 16]
          │  └─ RichText ["The compiler parses grammar structures into an AST...", HighlightWord: "AST", HighlightColor: #FFD400]
          └─ RecordControlsRow [Height: 100, Align: Center]
             └─ BtnRecordToggle [Height: 64, Width: 64, Circular, Fill: #FF4D4F]
    ```
*   **Card Hierarchy**:
    *   `WaveformPanel`: Width `358px`, Height `140px`.
    *   `TranscriptPreviewBox`: Width `358px`, Height `220px`.
*   **Motion Behavior**: Soundwave bars scale up and down dynamically based on microphone input levels. Highlighting active words shifts smoothly as transcript compiles.
*   **Empty State**: Transcript box displays placeholder text in `#A5A5A5` before recording starts.
*   **Loading State**: Sweeping loader inside transcription area during note processing.
*   **Error State**: If access to mic is blocked: Screen displays warning: "Permission Error: Enable Microphone Access in settings."

---

### SCREEN 9: PEER RADAR

*   **Visual Composition**: Aggregated notifications feed. Layout is clean with grayscale elements. Accent-Yellow is used only for the relevance score badge of high-priority messages.
*   **Layout Grid**: 4 Columns | Margin: 16px | Gutter: 12px.
*   **Component Hierarchy**:
    ```text
    └─ Frame [390x844, Fill: #0A0A0A]
       └─ Column [Padding: 16, Gap: 16]
          ├─ NavigationHeader [Title: "Group Radar"]
          ├─ DigestFeedScroll [Overflow: Scroll, Auto Layout: Vertical, Gap: 12]
          │  ├─ DigestCard [Source: Slack, Content: "Exam schedule moved to Friday.", Relevance: "94%", BadgeColor: #FFD400]
          │  ├─ DigestCard [Source: Discord, Content: "Study group meeting at 4 PM.", Relevance: "68%", BadgeColor: #2C2C2C]
          │  └─ DigestCard [Source: Canvas, Content: "Homework 2 graded.", Relevance: "42%", BadgeColor: #2C2C2C]
          └─ BottomNavBar
    ```
*   **Card Hierarchy**:
    *   `DigestCard`: Height `110px`, Width `358px`, Fill `#121212`, Border `1px solid #2C2C2C`.
*   **Motion Behavior**: Swiping left on a card reveals action items. The card shifts left by `90px` using `motionSprings.snappy` on pull gesture.
*   **Empty State**: If radar feeds are empty: Displays: "Peer channels quiet. No new notifications."
*   **Loading State**: Shimmer cards.
*   **Error State**: Connection errors display warning badge on header: "Offline Cache Active" (Color `#FFB800`).

---

### SCREEN 10: SESSION ANALYTICS

*   **Visual Composition**: Performance metrics display. Focus timeline is visual highlight, shown via a line graph. Accent-Yellow is used only for the average focus efficiency metric.
*   **Layout Grid**: 4 Columns | Margin: 16px | Gutter: 12px.
*   **Component Hierarchy**:
    ```text
    └─ Frame [390x844, Fill: #0A0A0A]
       └─ ScrollView [Padding: 16]
          ├─ MetricCardGroup [Auto Layout: Horizontal, Gap: 8]
          │  ├─ StatBox [Label: "Flow Time", Value: "12.4h"]
          │  ├─ StatBox [Label: "Focus Score", Value: "88%", HighlightColor: #FFD400]
          │  └─ StatBox [Label: "Shielded Distractions", Value: "42"]
          ├─ StateDistributionDonut [Height: 200, Fill: #121212]
          ├─ TimelineGraphCard [Height: 220, Fill: #121212, Border: 1px #2C2C2C]
          └─ BottomNavBar
    ```
*   **Card Hierarchy**:
    *   `StatBox`: Height `80px`, Width `114px`. Background `#121212`.
    *   `TimelineGraphCard`: Height `220px`, Width `358px`.
*   **Motion Behavior**: Donut segments animate from 0 to target values on load (`duration: 800ms`, `curve: Curves.easeOutCubic`).
*   **Empty State**: If no data exists: Displays: "No data logged. Complete a focus block to view analytics."
*   **Loading State**: Skeletons slide in from bottom.
*   **Error State**: Database sync errors display warning banner: "Local logs only."

---

### SCREEN 11: RECOVERY MODE

*   **Visual Composition**: Triage layout. Black background with red border highlights. Accent-Yellow is not used to prevent visual clutter; warning elements are strictly crimson red.
*   **Layout Grid**: 4 Columns | Margin: 24px | Gutter: 16px.
*   **Component Hierarchy**:
    ```text
    └─ Frame [390x844, Fill: #000000]
       └─ Column [Padding: 24, Gap: 32]
          ├─ AlertHeader [Icon: Warning (Red), Title: "OVERLOAD ACTIVE", Color: #FF4D4F]
          ├─ DescriptionBox [Fill: #1F0D0E, Border: 1px #FF4D4F, Padding: 16]
          │  └─ Text ["Biometric strain critical. Est. work remaining: 4h. Option: Delegate tasks.", Color: #FFFFFF]
          ├─ TriageChecklistStack [Auto Layout: Vertical, Gap: 12]
          │  ├─ ActionRow [Title: "Draft Extension Request", Icon: Compose]
          │  ├─ ActionRow [Title: "De-prioritize non-essential items", Icon: Calendar]
          │  └─ ActionRow [Title: "Delegate task to study partner", Icon: Share]
          └─ BtnDeescalate [Height: 56, Fill: #121212, Border: 1px #FF4D4F, Text: "DE-ESCALATE SYSTEM"]
    ```
*   **Card Hierarchy**:
    *   `DescriptionBox`: Height `90px`, Width `342px`.
    *   `ActionRow`: Height `72px`, Width `342px`, Background `#121212`.
*   **Motion Behavior**: Selecting an ActionRow expands details via `motionSprings.smooth`, shifting lower items down.
*   **Empty State**: Not applicable.
*   **Loading State**: Running automation tasks shows progress bar overlay inside cards.
*   **Error State**: If email composition fails: Card displays: "Composition failed. Save draft locally."

---

### SCREEN 12: SETTINGS

*   **Purpose**: Configuration options for system rules, integrations, and preferences.
*   **User Goal**: Customize notification schedules and privacy controls.
*   **Information Hierarchy**:
    1.  Header: "SETTINGS" (H1)
    2.  Section: "ACCOUNT" (Overline)
    3.  Rows: Option selections (Settings Rows Stack)
*   **Component Tree**:
    ```text
    └─ Frame [390x844, Fill: #0A0A0A]
       └─ ListView [Padding: 16]
          ├─ SectionTitle ["INTEGRATIONS", Color: #A5A5A5]
          ├─ SettingsRow [Label: "Canvas LMS Link", Status: "Linked"]
          ├─ SettingsRow [Label: "Google Calendar Sync", Status: "Linked"]
          ├─ SectionTitle ["SYSTEM OPTIONS", Color: #A5A5A5]
          ├─ SettingsRow [Label: "Eye-Gaze Calibration"]
          └─ SettingsRow [Label: "Device Handover Settings"]
    ```
*   **Exact Layout**:
    *   `SettingsRow`: Height `56px`, Width `358px`. Background `#121212`, Bottom Border `1px solid #1F1F1F`.
*   **Interaction States**:
    *   `SettingsRow`: Hover highlights item background to `#181818`. Tap triggers sliding page transition.
*   **Empty State**: Not applicable.
*   **Loading State**: Skeletons.
*   **Error State**: Invalid configuration values display: "Error: Input format invalid."

---

### SCREEN 13: PROFILE

*   **Purpose**: Displays user account metrics, active course lists, and local database storage stats.
*   **User Goal**: Check profile statistics and manage data exports.
*   **Information Hierarchy**:
    1.  User details: Name and Major (Avatar Section)
    2.  Data summary: Focus stats (Profile Metrics Card)
    3.  Actions: Export/Disconnect client (Button Stack)
*   **Component Tree**:
    ```text
    └─ Frame [390x844, Fill: #0A0A0A]
       └─ Column [Padding: 24, Gap: 24]
          ├─ UserAvatarBlock [Centered]
          │  ├─ Image [Size: 80x80, Circle]
          │  ├─ Title: "Garv Anand" [Style: H2]
          │  └─ Subtitle: "Computer Science" [Style: Body, Color: #A5A5A5]
          ├─ AnalyticsMetricCard [Height: 140, Fill: #121212, Border: 1px #2C2C2C]
          │  ├─ Title: "Baseline Parameters"
          │  └─ StatsRow [Typing WPM: 82, Average HRV: 64ms]
          └─ ActionButtons [Auto Layout: Vertical, Gap: 12]
             ├─ BtnSecondary ["EXPORT COGNITIVE RECORD", Width: Fill, Height: 50]
             └─ BtnSecondary ["DISCONNECT APEX", Width: Fill, Height: 50, Color: #FF4D4F]
    ```
*   **Exact Layout**:
    *   `AnalyticsMetricCard`: Width `342px`, Height `140px`. Padding `16px`.
*   **Interaction States**:
    *   `BtnSecondary (Disconnect)`: Hover: border `#FF4D4F`, text `#FF4D4F`. Tap triggers confirmations modal.
*   **Empty State**: Not applicable.
*   **Loading State**: Shimmers.
*   **Error State**: Failed data exports display: "Export interrupted. Recheck server connections."

---

## 4. DESKTOP APP WORKSPACE DESIGN (6 Screen Environments)

All desktop canvases are configured for **1440px x 900px** with custom drag frames.

### SCREEN 1: ADAPTIVE WORKSPACE DASHBOARD

```
+-------------------------------------------------------------------------------+
|  Title Bar (Height: 40px) [Traffic Lights]                             [Sync] |
+------------------+------------------------------------------------------------+
|                  |  Workspace: CS301 Compiler Lab                             |
|                  |                                                            |
|  COLLAPSED       |  Active Focus Target: "Verify AST parsing trees"           |
|  SIDEBAR         |                                                            |
|  (Width: 64px)   |  ( Spline Telemetry Waveforms Visualizer Canvas )           |
|                  |                                                            |
|                  |  +------------------------------------------------------+  |
|                  |  | State Agent status: Flow State calibrated (94% conf) |  |
|                  |  +------------------------------------------------------+  |
+------------------+------------------------------------------------------------+
```

*   **Visual Composition**: Layout changes based on the user's active cognitive state.
*   **Layout Grid**: 12 Columns | Margins: 32px | Gutter: 24px.
*   **Screen Layout Variants**:
    *   **Under Flow State**: Focus is on the active task. Left sidebar automatically collapses to `64px` icon-only view. All secondary widget boxes (e.g., chat logs, diagnostics charts) fade to `10%` opacity. Active task title displays in white, with focus timer countdown shown in Accent-Yellow.
    *   **Under Distracted State**: Layout splits into: Left col-span-8 containing a countdown timer, Right col-span-4 displaying a distraction log list showing app switches. A warning banner alerts user: "Distraction Alert: Discord active" (Color `#FFB800`).
    *   **Under Fatigued State**: Spacing and margins scale up by `50%` to reduce visual noise. Layout colors shift to warm blue/indigo tones. Larger font sizes are used, and background elements are simplified.
    *   **Under Overloaded State**: Triage layout activates. Layout splits into: Left col-span-8 displaying an urgent task list, Right col-span-4 displaying an Emergency Recovery button (Fill: `#1F0D0E`, Border: `#FF4D4F`, Text: `#FF4D4F`).
*   **Components & Widgets**:
    *   `Sidebar`: Collapsed width `64px`, expanded width `240px`. Border-Right `1px solid #1F1F1F`.
    *   `Active Task Card`: Sized `720px x 380px` in Flow mode, centered on main canvas. Contains active focus target: "Verify AST parsing trees" (Style: H1).
*   **Interaction & Motion**: Toggling states updates layouts using Framer Motion animations (`stiffness: 420, damping: 30`, layout transitions `duration: 450ms`).

---

### SCREEN 2: DEEP WORK MODE

*   **Visual Composition**: Viewport takeover layout. Background is pure `#000000` to minimize distraction. Canvas features a large countdown timer, with secondary monitors running dark blank screens.
*   **Layout Grid**: Single centered panel.
*   **Components & Widgets**:
    *   `Countdown HUD`: Centered. Focus timer: "45:12" (Display XL, size `120px`, Color `#FFD400`).
    *   `Active Target Tag`: Positioned above timer. Fill `#1C1C1C`, Border `1px solid #FFD400`, Radius `4px`.
    *   `Control Watchdog Icon`: Anchored bottom right. Displays blocked app logs on hover.
*   **Interaction & Motion**: Exiting requires holding the `ESC` key for 2 seconds. A progress outline circle fills along the screen edges as they hold, resetting if released early.

---

### SCREEN 3: DEADLINE WAR ROOM

*   **Visual Composition**: High-density task tracking workspace. Visual focus is on the risk assessment banner. Colors are grayscale, with red risk indicators.
*   **Layout Grid**: 12 Columns | Gutter: 20px | Padding: 32px.
*   **Components & Widgets**:
    *   `Status Banner`: Width `Fill`, Height `60px`. Background `#1F0D0E`, Border-Bottom `1px solid #FF4D4F`. Text: "DEADLINE THREAT LEVEL: HIGH" (Color `#FF4D4F`).
    *   `Task List Panel` (col-span-8): Vertical list of prioritized subtasks (each Height `72px`).
    *   `Peer Radar Panel` (col-span-4): Live feed showing project updates from team members (Background `#121212`).
*   **Interaction & Motion**: Dragging subtasks to re-order them runs smooth drag-and-drop animations. Completing a task runs a strike-through transition on the text.

---

### SCREEN 4: RESEARCH WORKSPACE

*   **Visual Composition**: Split layout designed for reading and taking notes. Left panel displays research papers, right panel shows a markdown editor.
*   **Layout Grid**: 12 Columns | Gutter: 24px.
*   **Components & Widgets**:
    *   `PDF Viewer Panel` (col-span-6): PDF canvas. Highlights text selections in `#FFD400` with 30% opacity.
    *   `Credibility Badge`: Positioned above PDF. Displays publisher reliability metrics (e.g., "Source Verified", Color `#00D26A`).
    *   `Markdown Note Editor` (col-span-6): Plain-text editor interface (Background `#121212`).
    *   `Reference Timeline`: Anchored at bottom (Height `120px`). Displays research timeline of papers read.
*   **Interaction & Motion**: Selecting text in the PDF viewer creates a draggable snippet card. Dropping the card into the note editor inserts a formatted citation block.

---

### SCREEN 5: WRITING WORKSPACE

*   **Visual Composition**: Three-column layout optimized for writing and reviewing logical arguments. Outline navigation is on the left, editor in the center, and Socratic panel on the right.
*   **Layout Grid**: Col 1 (Outline): 15% | Col 2 (Editor): 60% | Col 3 (Socratic Panel): 25%.
*   **Components & Widgets**:
    *   `Outline Panel`: Displays document header hierarchy (Background `#0A0A0A`).
    *   `Editor Panel`: Word processor editor (Width `540px` max, optimized for `65ch` reading lengths).
    *   `Socratic Auditor Panel`: Displays logical warnings generated by LLM analysis. Weak assertions in editor text are highlighted with an orange underline.
*   **Interaction & Motion**: Hovering over highlighted text focuses the corresponding Socratic counterpoint card in the right panel.

---

### SCREEN 6: AGENT ACTIVITY MONITOR

*   **Visual Composition**: Technical dashboard view displaying diagnostics status for the 5 agents. Visual styling is clean and minimal.
*   **Layout Grid**: 12 Columns | Left Panel: 35% Width | Right Panel: 65% Width.
*   **Components & Widgets**:
    *   `Agents List` (Left Pane): Displays active agents, thread status, and resource usage metrics.
    *   `Orchestrator Visualizer` (Right Pane): Mermaid-style diagram showing real-time agent message queue and conflicts.
    *   `Log Console`: Terminal logs viewer (JetBrains Mono font, Background `#0A0A0A`).
*   **Interaction & Motion**: Logs scroll in real-time, pausing if the user scrolls up. Double-clicking a log line displays detailed JSON parameter payloads.

---

## 5. FIGMA CANVAS INVENTORY SHEET

### 5.1 Frame Dimensions & Autolayout Matrix

| Artboard Name | Width (px) | Height (px) | Grid Settings | Auto-Layout Direction | Padding & Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MOB_01_Splash` | 390 | 844 | 4 Columns, Margin: 24 | Vertical | `Padding: 56 24 32 24`, `Gap: 0` |
| `MOB_02_Onboarding` | 390 | 844 | 4 Columns, Margin: 24 | Vertical | `Padding: 32 24 32 24`, `Gap: 32` |
| `MOB_03_Permissions` | 390 | 844 | 4 Columns, Margin: 24 | Vertical | `Padding: 24 24 24 24`, `Gap: 12` |
| `MOB_04_Cognitive` | 390 | 844 | 4 Columns, Margin: 16 | Vertical (Scroll) | `Padding: 16 16 16 16`, `Gap: 24` |
| `MOB_05_Deadline` | 390 | 844 | 4 Columns, Margin: 16 | Vertical | `Padding: 16 16 16 16`, `Gap: 16` |
| `MOB_06_AgentMatrix` | 390 | 844 | 4 Columns, Margin: 16 | Vertical | `Padding: 16 16 16 16`, `Gap: 24` |
| `MOB_07_FocusMode` | 390 | 844 | Centered Viewport | Vertical (Center) | `Padding: 56 32 56 32`, `Gap: 48` |
| `MOB_08_VoiceCapture` | 390 | 844 | 4 Columns, Margin: 16 | Vertical | `Padding: 16 16 16 16`, `Gap: 24` |
| `MOB_09_PeerRadar` | 390 | 844 | 4 Columns, Margin: 16 | Vertical | `Padding: 16 16 16 16`, `Gap: 16` |
| `MOB_10_SessionStats` | 390 | 844 | 4 Columns, Margin: 16 | Vertical (Scroll) | `Padding: 16 16 16 16`, `Gap: 24` |
| `MOB_11_Recovery` | 390 | 844 | 4 Columns, Margin: 24 | Vertical | `Padding: 24 24 24 24`, `Gap: 32` |
| `MOB_12_Settings` | 390 | 844 | 4 Columns, Margin: 16 | Vertical | `Padding: 16 16 16 16`, `Gap: 12` |
| `MOB_13_Profile` | 390 | 844 | 4 Columns, Margin: 24 | Vertical | `Padding: 24 24 24 24`, `Gap: 24` |
| `DSK_01_Dashboard` | 1440 | 900 | 12 Columns, Margin: 32 | Horizontal | `Padding: 0 32 32 0`, `Gap: 24` |
| `DSK_02_DeepHUD` | 1440 | 900 | Centered Frame | Vertical (Center) | `Padding: 0 0 0 0`, `Gap: 32` |
| `DSK_03_WarRoom` | 1440 | 900 | 12 Columns, Margin: 32 | Vertical | `Padding: 32 32 32 32`, `Gap: 20` |
| `DSK_04_Research` | 1440 | 900 | 12 Columns, Margin: 32 | Horizontal | `Padding: 0 32 32 0`, `Gap: 24` |
| `DSK_05_Writer` | 1440 | 900 | Three Column Flex | Horizontal | `Padding: 0 0 0 0`, `Gap: 0` |
| `DSK_06_Diagnostics` | 1440 | 900 | 12 Columns, Margin: 32 | Horizontal | `Padding: 0 32 32 0`, `Gap: 24` |

---

### 5.2 Naming Conventions & Design Variables
Design variable aliases mapped inside Figma files:
*   `color/fill/bg_primary` -> `#0A0A0A`
*   `color/fill/bg_secondary` -> `#121212`
*   `color/fill/accent_yellow` -> `#FFD400`
*   `color/stroke/border_default` -> `#2C2C2C`
*   `font/family/display` -> `Cabinet Grotesk`
*   `font/family/body` -> `Inter`
*   `font/family/mono` -> `JetBrains Mono`

---

## 6. ANTIGRAVITY HIGH-FIDELITY GENERATOR PROMPTS

### 6.1 Mobile Application Development Prompt (Flutter)

```text
Build a launch-ready Flutter UI Page (home_page.dart) representing the APEX mobile companion application.
The screen frame is 390x844px. The design follows a strict premium visual style (Apple × Linear) for 120Hz AMOLED panels.
Theme color variables must use exact Hex strings: Bg-Primary #000000 (AMOLED pixel disable), Bg-Secondary #121212, Accent-Yellow #FFD400, Success-Green #00D26A, Muted-Gray #A5A5A5, Border-Default #2C2C2C.
Layout grid uses 4 Columns (Side margin: 16px, Gutter gap: 12px).
Visual Hierarchy layout must contain:
1. Header Bar: Height 48px, horizontal layout. Displays a circular profile avatar (size 36x36px) and P2P connection badge showing '12ms latency' in Success-Green, indicating sync with the iQOO Office Kit bridge.
2. Cognitive State Hero Card: Width 358px, Height: 200px. Background is deep emerald #0A1C12, border is 1px Success-Green, corner radius is 16px. Displays 'FLOW ACTIVE' (H2 in Success-Green) and a large focus efficiency score '94%' (Display XL). Bottom of card displays a custom spline bezier curve area chart showing attention metrics.
3. Active Tasks Stack: Vertical gap 12px. Includes context cards (Height: 90px) displaying task titles, risk parameters from Deadline Sentinel, and template names from Environment Sculptor. Swiping left on a card reveals action items.
4. Float Bar: Sized 280x50px, bottom-fixed overlay containing: target focus mode switch, voice capture, and summon agent core.
Make components highly detailed. Implement smooth transitions when switching states.
```

---

### 6.2 Desktop Application Development Prompt (Tauri + React/TS)

```text
Build a launch-ready React component (Dashboard.tsx) for the APEX Tauri desktop app (1440x900px, custom borderless layout).
Aesthetic: Dark Tesla UI panels, Linear-inspired keyboard shortcuts metadata, and Raycast modal blur layers.
Theme colors: Bg-Primary #0A0A0A, Bg-Secondary #121212, Accent-Yellow #FFD400, Border #2C2C2C, Alert-Red #FF4D4F, Muted #A5A5A5.
Implement these panels:
1. TitleBar: Custom header (Height: 40px, Drag region data-tauri-drag-region) containing Traffic Lights (Close, Minimize, Maximize) left-aligned with Apple styling.
2. Sidebar Panel: Width 240px, background #0A0A0A, border-right 1px solid #1F1F1F. Show Navigation links stack with an active left highlight indicator. Anchored bottom widget details active agent telemetry heartbeat pulses.
3. Adaptive Grid Area: 12-Column Responsive layout grid (Gap: 24px, Margin: 32px) containing:
   - Left Pane (col-span-8): Focus Timer Card (Height: 620px) displaying 'CS301 Lab: 32m left' (H1) and a canvas rendering dynamic waveform frequencies representing focus levels.
   - Right Pane (col-span-4): Deadline Sentinel panel displaying urgent alerts list. Alert row-items must show assignment titles, risk scores (e.g. 92% in red), and action buttons.
Provide high-fidelity layouts, clean TypeScript metrics, and responsive auto-layout structures.
```
