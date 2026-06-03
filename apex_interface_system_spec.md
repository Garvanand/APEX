# APEX Production-Ready Interface System Specification
## System Version: 1.0.0-PROD
### Authors: Principal Product Designer, Staff Frontend Engineer, Senior Flutter Engineer, Senior Tauri Engineer, Design Systems Lead, Founding CTO

This document details the visual and code architecture for APEX (Adaptive Presence & Execution Intelligence). The specifications below define the system components, layouts, interactions, animations, and execution tokens for the iQOO Mobile App (Flutter) and Desktop App (Tauri + React/TypeScript).

---

## PART 1: MOBILE APPLICATION (FLUTTER)

All screens are designed for 120Hz AMOLED panels (target size: **390px x 844px**, iPhone 13/14/15 equivalent aspect ratio).

### 1. Splash Screen

*   **Purpose**: Bootstraps the local app, runs secure token verification, and establishes the peer handshake over the iQOO Office Kit Bridge.
*   **User Goal**: Rapid, friction-free entry into the workspace under 400ms.
*   **Information Hierarchy**:
    1.  Morphing Cognitive Waveform (SVG Vector Animation)
    2.  Product Wordmark: "APEX" (Display XL)
    3.  Office Kit Bridge Status Indicator: "Syncing..." (Caption)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #000000]
       └─ Center
          └─ Column [MainAxisSize.min, Gap: 24]
             ├─ AnimatedWaveformContainer [Height: 180, Width: 180]
             │  └─ CustomPaint [SVG Waveform Generator Class]
             ├─ Text ["APEX", Style: Display XL, Color: #FFFFFF]
             └─ SyncStatusWidget [Height: 32]
                ├─ CircularProgressIndicator [Size: 12x12, StrokeWidth: 1.5, Color: #FFD400]
                └─ Text ["SYNCING TELEMETRY BRIDGE...", Style: Overline, Color: #A0A0A0]
    ```
*   **Exact Layout**:
    *   `Centering`: Absolutely centered on the vertical axis.
    *   `AnimatedWaveformContainer`: Width `180px`, Height `180px`.
    *   `Spacing`: `24px` gap below container, `16px` gap between "APEX" and Status widget.
    *   `Status Widget`: `Padding: 8px 12px`, Background `#121212`, Border `1px solid #2C2C2C`, Radius `4px`.
*   **Interaction States**:
    *   Non-interactive. Back key is disabled during initialization boot sequence.
*   **Animation Behavior**:
    *   *Waveform Morph*: Runs a continuous sinusoidal wave morph using `AnimationController` (`duration: 1800ms`, `curve: Curves.easeInOutSine`).
    *   *Entrance Transition*: Waveform scales up from `0.8x` to `1.0x` (`duration: 400ms`, `curve: Curves.easeOutCubic`) while opacity transitions from `0` to `1`.
*   **Empty State**: Not applicable.
*   **Loading State**: Active during app verification hooks.
*   **Error State**:
    *   If Bridge initialization fails: Waveform changes stroke color to `#FF4D4F`. The status label updates to: "BRIDGE CONNECTION TIMEOUT". Displays secondary action button: "LAUNCH OFFLINE SYSTEM" (Height `48px`, Width `220px`, Fill `#121212`, Border `1px solid #FF4D4F`).
*   **Accessibility Notes**:
    *   VoiceOver reads: "APEX initializing. Syncing device bridge." Semantic label on waveform: "Pulsing cognitive wave graphic."
*   **Developer Implementation Notes**:
    ```dart
    // Flutter execution implementation
    class WaveformPainter extends CustomPainter {
      final double animationValue;
      WaveformPainter(this.animationValue);
      @override
      void paint(Canvas canvas, Size size) {
        final paint = Paint()
          ..color = const Color(0xFFFFD400)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.0;
        final path = Path();
        for (double i = 0; i <= size.width; i++) {
          double y = size.height / 2 + math.sin((i / size.width * 2 * math.pi) + (animationValue * 2 * math.pi)) * 20;
          if (i == 0) path.moveTo(i, y); else path.lineTo(i, y);
        }
        canvas.drawPath(path, paint);
      }
      @override
      bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
    }
    ```

---

### 2. Onboarding Screen

*   **Purpose**: Gathers student identity profile details and imports academic schedules.
*   **User Goal**: Complete profile details under 90 seconds.
*   **Information Hierarchy**:
    1.  Heading: "Academic Profile Setup" (H1)
    2.  Helper text: "Select your major and sync schedules." (Body)
    3.  Input Form: University Autocomplete (Input Field)
    4.  Chip Selection: Active Major (Chip Group)
    5.  Drag-and-Drop: Canvas LMS Schedule Import (Import Card)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #000000, Safe Area]
       └─ SingleChildScrollView [Physics: ClampingScrollPhysics]
          └─ Column [Padding: 24, Gap: 32]
             ├─ HeaderBlock [Gap: 8]
             │  ├─ Text ["Academic Profile Setup", Style: H1]
             │  └─ Text ["Select your major and sync schedules.", Style: Body]
             ├─ FormBlock [Gap: 24]
             │  ├─ AutocompleteField [Label: "University"]
             │  ├─ ChipGroupField [Label: "Major"]
             │  └─ ImportCard [Label: "Canvas Import"]
             └─ CTAButton [Height: 56, Fill: #FFD400, Text: "CONTINUE"]
    ```
*   **Exact Layout**:
    *   `Margins`: `24px` horizontal padding.
    *   `AutocompleteField`: Height `56px`, Width `342px`.
    *   `Major Chips`: `Gap: 8px` vertical and horizontal. Chip height `40px`.
    *   `Import Card`: Height `140px`, Width `342px`, dashed border outline (`strokeDashArray: [6, 4]`).
    *   `CTAButton`: Height `56px`, anchored at the bottom with a `32px` margin from the system navigation area.
*   **Interaction States**:
    *   `AutocompleteField`: Inactive: Border `#2C2C2C`. Focus: Border `#FFD400`. Typeahead displays overlay list with max height `180px` containing matching institutions.
    *   `Chips`: Unselected: Fill `#121212`, Border `#2C2C2C`, Text `#A0A0A0`. Selected: Fill `#FFD400`, Text `#0A0A0A`, Border: None.
*   **Animation Behavior**:
    *   *Autocomplete Dropdown*: Expand dropdown height from `0px` to `180px` (`duration: 250ms`, `curve: Curves.easeOutCubic`).
    *   *Chip Select*: Scale spring effect on click (`stiffness: 600`, `damping: 25`).
*   **Empty State**:
    *   If import dashboard has no files: Displays dashed outline box with text "No file selected. Drag and drop .ICS file."
*   **Loading State**:
    *   During LMS sync query: The `ImportCard` changes to loading layout showing a linear progress indicator (`height: 2px`, color: `#FFD400`).
*   **Error State**:
    *   If API endpoint fails: Displays a toast message (`Border-Left: 3px solid #FF4D4F`, content: "Sync Failed. Please check network connections.").
*   **Accessibility Notes**:
    *   Form elements have accessible text labels: "Enter University Name", "Select Major", "Import Canvas Calendar".
*   **Developer Implementation Notes**:
    *   Disable page scroll animations when text keyboard is active. Use `MediaQuery.of(context).viewInsets.bottom` adjustments to prevent layout overflows.

---

### 3. Permissions Flow

*   **Purpose**: Authorizes background telemetry inputs (Accessibility, Notifications, Calendar, Microphones, Screen Stats).
*   **User Goal**: Approve permissions and review telemetry privacy features.
*   **Information Hierarchy**:
    1.  Header: "Telemetry Ingestion" (H1)
    2.  Subhead: "Select which signals APEX monitors." (Body)
    3.  Cards list: Permission options (Permission Card)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #000000]
       └─ ListView [Padding: 24, Gap: 16]
          ├─ HeaderSection
          ├─ PermissionCard [Title: "Accessibility", Sub: "App switches & latency"]
          ├─ PermissionCard [Title: "Notifications", Sub: "Agent alert routing"]
          ├─ PermissionCard [Title: "Calendar", Sub: "Deadlines Sentinel monitoring"]
          ├─ PermissionCard [Title: "Microphone", Sub: "Ambient noise capture"]
          └─ BottomBar [Auto Layout: Split]
             ├─ SkipLink [Text: "Skip for now"]
             └─ CTAButton [Height: 56, Fill: #FFD400, Text: "GRANT PERMISSIONS"]
    ```
*   **Exact Layout**:
    *   `PermissionCard`: Height `72px`, Width `342px`. Background `#121212`, Border `1px solid #2C2C2C`, Radius `8px`.
    *   `Content Alignment`: Left-aligned icon `24x24px`, center text labels (Width `200px`), right-aligned toggle switch (Width `48px`, Height `26px`).
*   **Interaction States**:
    *   `Toggle Switch`:
        *   Off: Track `#2C2C2C`, Thumb `#FFFFFF` (left-aligned).
        *   On: Track `#00D26A`, Thumb `#FFFFFF` (right-aligned).
        *   Disabled: Track `#121212`, Thumb `#A0A0A0` (50% opacity).
*   **Animation Behavior**:
    *   *Toggle Switch Slide*: Smooth linear translation (`duration: 150ms`, `curve: Curves.easeInOut`).
    *   *Card Highlight*: Hovering over card fades border from `#2C2C2C` to `#FFD400`.
*   **Empty State**: Not applicable.
*   **Loading State**: During platform authorization dialog requests.
*   **Error State**:
    *   If a permission is denied: The permission card shows an info icon on the right with a red label: "Limited Offline Mode Active" (Text Color `#FF4D4F`).
*   **Accessibility Notes**:
    *   VoiceOver reads: "Permission: Accessibility. Double tap to toggle switch."
*   **Developer Implementation Notes**:
    *   Use `permission_handler` plugin. Call `openAppSettings()` if system-level denials occur to guide users back.

---

### 4. Cognitive Dashboard

*   **Purpose**: Displays real-time focus states, telemetry trends, and manual overrides.
*   **User Goal**: Review focus levels and log current cognitive states.
*   **Information Hierarchy**:
    1.  Core Pulse Rings (Dynamic Vector Graphics)
    2.  Cognitive state label: "FLOW STATE - 94% focus" (H1)
    3.  History chart: Focus changes (Spline Chart)
    4.  Grid metrics: Sensor inputs (Signal Cards)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #0A0A0A, BottomNavigationBar]
       └─ SingleChildScrollView [Physics: BouncingScrollPhysics]
          └─ Column [Padding: 16, Gap: 24]
             ├─ PulseVisualizer [Height: 220]
             ├─ FocusChartCard [Height: 200]
             ├─ MetricsGrid [2x2 Grid]
             │  ├─ SignalCard [Label: "HRV Stability"]
             │  ├─ SignalCard [Label: "Gaze Anchor"]
             │  ├─ SignalCard [Label: "Typing Cadence"]
             │  └─ SignalCard [Label: "Ambient DB"]
             └─ ManualOverrideButton [Height: 50, Text: "MANUAL OVERRIDE"]
    ```
*   **Exact Layout**:
    *   `PulseVisualizer`: Sized `358px x 220px`. Background `#000000`, Radius `12px`. Inner pulse rings concentric circles (Radius `40`, `70`, `100px`), centered.
    *   `FocusChartCard`: Width `358px`, Height `200px`. Padding `16px`. Area spline graph inside.
    *   `SignalCard`: Width `171px`, Height `74px`. Background `#121212`, Radius `4px`.
*   **Interaction States**:
    *   `SignalCard`: Hover displays full tool-tip details. Tap opens description sheet.
    *   `ManualOverrideButton`: Default: Background `#121212`, Border `1px solid #2C2C2C`. Hover: Border `#FFD400`. Tap opens bottom sheets listing states (Flow, Distracted, Fatigued, Overloaded).
*   **Animation Behavior**:
    *   *Pulse Rings*: Continuous radius expansion from `0.7x` to `1.2x` (`duration: 1200ms` for Flow, `duration: 400ms` for Overloaded stress states).
    *   *Graph Tool-tip*: The vertical scrubber line tracks touch movements with dampening physics.
*   **Empty State**:
    *   If no sensor inputs are found: Displays a card with text "No biometric data synced. Please check iQOO watch bridge settings."
*   **Loading State**: Shown via shimmer gradients sweeping across widgets.
*   **Error State**:
    *   If connection to local sensor array drops: Shows alert banner: "Office Kit Link Offline - Fallback Local Latency Model Active" (Background `#FFB800`, Text `#0A0A0A`).
*   **Accessibility Notes**:
    *   High-contrast color modes map state colors clearly (Flow `#00D26A`, Distracted `#FFB800`, Fatigued `#00A3FF`, Overloaded `#FF4D4F`).
*   **Developer Implementation Notes**:
    *   Uses a WebSocket stream route `/api/v1/cognitive/stream`. Ingest updates via client `StreamBuilder` logic to avoid re-rendering layout structures.

---

### 5. Deadline Dashboard

*   **Purpose**: Organizes, scores, predicts, and lists academic deadlines.
*   **User Goal**: Review high-risk assignments and sync LMS pipelines.
*   **Information Hierarchy**:
    1.  Section Header: "DEADLINES" (H1)
    2.  Sync Status Widget (Caption)
    3.  Toggles: Views (Timeline, Calendar, List)
    4.  Cards list: Assignments (Deadline Card)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #0A0A0A, FAB]
       └─ Column [Padding: 16, Gap: 16]
          ├─ HeaderSection [Auto Layout: Split]
          ├─ ViewToggles [Height: 36]
          ├─ FilterGroup [Height: 40, Row]
          ├─ ListExpandedArea [Width: Fill, Height: Fill]
          │  └─ ListView.builder [Gap: 12]
          │     └─ DeadlineCard [Urgency: Critical, Risk: 92%]
          └─ FAB [Shape: Circular, Icon: Camera]
    ```
*   **Exact Layout**:
    *   `DeadlineCard`: Height `116px`, Width `358px`. Left side contains risk score border band (Width `4px`). Padding `16px`.
    *   `FAB`: Size `56x56px` circular layout, anchored at the bottom right (`Margin: 24px`). Fill `#FFD400`.
*   **Interaction States**:
    *   `DeadlineCard`: Tap triggers a card transition expand, growing height from `116px` to `240px` to show checklist details.
    *   `FAB`: Hover scales layout to `1.08x`. Pressed scales down to `0.95x`.
*   **Animation Behavior**:
    *   *Checklist Expand*: Interpolates container height bounds (`duration: 300ms`, `curve: Curves.fastOutSlowIn`).
    *   *FAB Click*: Rotates the icon 90 degrees while launching camera scanner interface.
*   **Empty State**:
    *   If no assignments exist: Displays a center illustration with text "Syllabus Index Clean. No upcoming deadlines."
*   **Loading State**:
    *   Shimmer placeholder layouts showing card margins.
*   **Error State**:
    *   LMS connection failures show warning badge on header: "LMS Cache Active" (Color `#FFB800`).
*   **Accessibility Notes**:
    *   Urgency score labels explicitly state: "Risk Score: 92 percent. Critical urgency."
*   **Developer Implementation Notes**:
    *   Avoid full re-builds during check action list updates. Cache list indexes locally using SQLite.

---

### 6. Agent Control Center

*   **Purpose**: Configures active models, diagnostics, and autonomy levels for the 5 agents.
*   **User Goal**: Review agent metrics and configure automation rules.
*   **Information Hierarchy**:
    1.  Overview Header: "Agent Status" (H1)
    2.  Grid: Agent metrics (Status Grid)
    3.  Slider Widget: Autonomy controls (Slider Card)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #0A0A0A]
       └─ SingleChildScrollView
          └─ Column [Padding: 16, Gap: 24]
             ├─ AgentGrid [2 Columns, Gap: 12]
             │  ├─ AgentStatusCard [State Agent, Hex: #FF4500]
             │  ├─ AgentStatusCard [Deadline Sentinel, Hex: #FF0055]
             │  ├─ AgentStatusCard [Environment Sculptor, Hex: #00F5FF]
             │  ├─ AgentStatusCard [Peer Radar, Hex: #7B2CBF]
             │  └─ AgentStatusCard [Socratic Challenger, Hex: #00FF87]
             ├─ DetailedAgentConfigPane [Height: 220, Fill: #121212]
             └─ AutonomyCard [Padding: 16, Radius: 8]
    ```
*   **Exact Layout**:
    *   `AgentStatusCard`: Width `171px`, Height `100px`. Background `#121212`, Radius `8px`. Top-right status dot `8x8px`.
    *   `AutonomyCard`: Width `358px`, Height `130px`. Includes autonomy slider (Track width `326px`, Track height `4px`, Thumb `16x16px`).
*   **Interaction States**:
    *   `AgentStatusCard`: Tap selects card, displaying active configuration parameters in the details pane.
    *   `Autonomy Slider`: Thumb draggable along horizontal track line. Snaps to labeled step anchors: "Co-Pilot", "Guardian", "Autonomous".
*   **Animation Behavior**:
    *   *Slider Snap*: Thumb bounces into place using a spring physics simulation (`stiffness: 800`, `damping: 30`).
    *   *Grid Card Select*: Selected card scales down slightly (`0.97x`) then expands to outline border of `#FFD400`.
*   **Empty State**: Not applicable.
*   **Loading State**: During parameter configuration saves: Displays a linear loading indicator overlay on the details pane.
*   **Error State**:
    *   If model sync fails: Details panel displays warning message "Unable to sync custom prompt settings with server."
*   **Accessibility Notes**:
    *   Autonomy levels have clear labels read by screen readers: "Autonomy level set to Co-Pilot mode."
*   **Developer Implementation Notes**:
    *   Store state variables locally using `SharedPreferences`. Run updates asynchronously to prevent interface blocks.

---

### 7. Focus Session

*   **Purpose**: Provides a distraction-free environment that hides UI noise.
*   **User Goal**: Activate deep focus blocks and monitor performance.
*   **Information Hierarchy**:
    1.  Level Selectors: Light, Deep, Extreme (Tabs)
    2.  Countdown Display: "50:00" (Display XL)
    3.  Target Title: "COMPILER LAB 3" (Heading XL)
    4.  Stats label: "12 distraction blocks active" (Caption)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #000000]
       └─ Center
          └─ Column [MainAxisSize.min, Gap: 48]
             ├─ FocusIntensitySelector [Row, Gap: 16]
             ├─ CountdownTimerSection
             │  ├─ WaveformPulse [Radial Gradient Canvas]
             │  ├─ TimerValue ["50:00", Style: Display XL]
             │  └─ TaskLabel ["COMPILER LAB 3", Style: H2]
             ├─ ShieldStatusWidget [Gap: 8]
             │  ├─ Icon [Shield]
             │  └─ Text ["12 Distraction Shields Active", Style: Caption]
             └─ BtnEmergencyExit [Size: 56x56, Circle, Color: #FF4D4F]
    ```
*   **Exact Layout**:
    *   `Artboard`: Pure black background (`#000000`) to disable AMOLED pixels and save battery.
    *   `CountdownTimerSection`: Centered. Waveform pulse diameter `280px`.
    *   `BtnEmergencyExit`: Positioned at the bottom center of the view. Border width `1.5px`, transparent fill.
*   **Interaction States**:
    *   `BtnEmergencyExit`: Requires a continuous press-and-hold interaction (3 seconds). Outer stroke fills up as you hold. Releasing early resets progress.
*   **Animation Behavior**:
    *   *Waveform Pulse*: Radial scale oscillates between `0.9x` and `1.1x` (`duration: 8000ms`, `curve: Curves.easeInOutSine`).
    *   *Emergency Exit Fill*: Stroke animation maps directly to hold duration.
*   **Empty State**: Not applicable.
*   **Loading State**: Shimmer loading overlay fades out upon focus activation.
*   **Error State**:
    *   If background API tracking fails: Red warning badge alerts user: "Distraction monitoring inactive. Re-enable accessibility settings."
*   **Accessibility Notes**:
    *   A warning chime plays if the user releases the emergency exit button early.
*   **Developer Implementation Notes**:
    *   Uses a `WakeLock` to keep the device screen on during active focus sessions.

---

### 8. Voice Capture

*   **Purpose**: Records audio inputs, creating real-time transcripts and action lists.
*   **User Goal**: Record lectures or notes and generate study checklists.
*   **Information Hierarchy**:
    1.  Status Indicator: "RECORDING..." (H2, Red Accent)
    2.  Real-time Waveform Canvas (Bar Graph)
    3.  Live transcript: Text preview (Body)
    4.  Save Action (CTA Button)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #0A0A0A]
       └─ Column [Padding: 16, Gap: 24]
          ├─ StatusHeader [Auto Layout: Split]
          │  ├─ LiveStatus [Dot: Red, Text: "RECORDING"]
          │  └─ TimerLabel ["04:22", Style: Code Large]
          ├─ WaveformCard [Height: 120, Width: Fill, Fill: #121212]
          ├─ TranscriptPreview [Height: 200, Fill: #121212, Padding: 16]
          ├─ MetadataRow [Gap: 8]
          └─ RecordButtonContainer [Height: 100, Center]
             └─ BtnRecordControl [Dimension: 72x72, Circle, Fill: #FFD400]
    ```
*   **Exact Layout**:
    *   `WaveformCard`: Width `358px`, Height `120px`. Background `#121212`, Radius `8px`. Inside features 32 vertical bars.
    *   `TranscriptPreview`: Width `358px`, Height `200px`. Background `#121212`, Radius `8px`.
    *   `BtnRecordControl`: Width `72px`, Height `72px`. Left/right centered at bottom.
*   **Interaction States**:
    *   `BtnRecordControl`: Tapping toggles between active recording and paused status.
    *   `MetadataRow`: Interactive tags. Tapping opens an options list.
*   **Animation Behavior**:
    *   *Waveform Amplitude*: Waveform frequency bars bounce dynamically using audio amplitude metrics.
    *   *Record Button Toggle*: Morph circle (`72x72px`) to square-circle (`56x56px`, `borderRadius: 12px`) during active recording (`duration: 250ms`).
*   **Empty State**:
    *   Empty transcript display displays: "Awaiting audio inputs. Speak to begin transcription."
*   **Loading State**: During audio uploads: Shows circular loader inside transcript box.
*   **Error State**:
    *   If audio hardware is blocked: Shows error toast: "Microphone Access Denied".
*   **Accessibility Notes**:
    *   Screen reader provides real-time notifications on transcription progress.
*   **Developer Implementation Notes**:
    *   Record audio locally in `.aac` format using `flutter_sound`. Compress file before uploading to `/api/v1/voice/upload` endpoint.

---

### 9. Peer Radar

*   **Purpose**: Aggregates, filters, and summarizes academic communication updates.
*   **User Goal**: Review chat summaries and check student project timelines.
*   **Information Hierarchy**:
    1.  Segmented Tabs: Channels, Digest, Heatmap
    2.  Timeline Filter (Row)
    3.  Feed list: Message cards (Digest Card)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #0A0A0A]
       └─ Column [Padding: 16, Gap: 16]
          ├─ TabHeaderSection [Channels | Digest | Group Heatmaps]
          ├─ SearchFilterRow [Gap: 8]
          ├─ DigestListArea [Height: Fill]
          │  └─ ListView.builder [Gap: 12]
          │     └─ DigestCard [Source: Discord, Relevance: 89%]
          └─ BottomNavigationBar
    ```
*   **Exact Layout**:
    *   `DigestCard`: Width `358px`, Height `130px`. Background `#121212`, Radius `8px`. Top row displays platform icon, channel title, and timestamp.
    *   `Relevance Badge`: Sized `110px x 24px`. Background `#1C1C1C`, Border `#00D26A`, text color `#00D26A` (located top-right).
*   **Interaction States**:
    *   `DigestCard`: Hover highlights card. Tapping expands layout details.
    *   `Quick Reply Button`: Tap expands inline text input area.
*   **Animation Behavior**:
    *   *Reply Panel*: Inline text editor slides out from the bottom edge (`duration: 300ms`, `curve: Curves.easeOutCubic`).
*   **Empty State**:
    *   If no peer updates are synced: Displays "Peer channels quiet. No academic notifications found."
*   **Loading State**: Shimmer cards with sweeping linear gradient details.
*   **Error State**:
    *   If connection to chat servers fails: Shows alert indicator: "Offline Cache Active. Message sync suspended."
*   **Accessibility Notes**:
    *   Accessible labels highlight message relevance metrics: "Relevance score is eighty-nine percent."
*   **Developer Implementation Notes**:
    *   Poll the `/api/v1/peer/radar` endpoint every 30 seconds to fetch updates when screen is active.

---

### 10. Session Analytics

*   **Purpose**: Displays focus performance logs and weekly analytics.
*   **User Goal**: Review cognitive load metrics and focus duration trends.
*   **Information Hierarchy**:
    1.  Date Selector Header (Tabs)
    2.  Metrics Summary (Row)
    3.  Donut Chart: Cognitive Load (Donut Card)
    4.  Category Metrics (Bar List Card)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #0A0A0A]
       └─ SingleChildScrollView
          └─ Column [Padding: 16, Gap: 24]
             ├─ RangeSelector [WEEK | MONTH | YEAR]
             ├─ MetricsOverview [Gap: 8]
             ├─ CognitiveLoadCard [Height: 220, Fill: #121212]
             ├─ CategoryBarChartCard [Height: 240, Fill: #121212]
             └─ BottomNavigationBar
    ```
*   **Exact Layout**:
    *   `MetricsOverview`: Row containing 3 cards (each Width `114px`, Height `80px`).
    *   `CognitiveLoadCard`: Width `358px`, Height `220px`. Center donut graph radius `60px`, stroke width `16px`.
    *   `CategoryBarChartCard`: Width `358px`, Height `240px`. Inside has vertical bar columns (each Width `24px`).
*   **Interaction States**:
    *   `Donut Segments`: Tapping a segment highlights the section and updates center text values with hours details.
    *   `Bar Graph`: Tap displays tool-tip overlays showing exact category focus minutes.
*   **Animation Behavior**:
    *   *Donut Animation*: Draws the donut segments from `0` to `360` degrees (`duration: 1000ms`, `curve: Curves.easeInOutSine`).
*   **Empty State**:
    *   If data logs are empty: Displays "No focus sessions logged. Start a session to view analytics."
*   **Loading State**: Shimmer graphics indicating chart sections.
*   **Error State**:
    *   If query database errors out: Displays "Failed to compile session metadata."
*   **Accessibility Notes**:
    *   Chart legends have high contrast color blocks mapping labels.
*   **Developer Implementation Notes**:
    *   Create clean charts using `fl_chart` library components. Format labels using tabular lining digits.

---

### 11. Recovery Mode

*   **Purpose**: Emergency dashboard providing prioritization workflows during overload.
*   **User Goal**: Manage academic stress indicators and task queues.
*   **Information Hierarchy**:
    1.  Alert Banner: "EMERGENCY RECOVERY" (H1, Red Accent)
    2.  Status summary card (Triage Summary)
    3.  Triage Actions (Checklist Cards Stack)
    4.  De-escalation option (Secondary Button)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #000000]
       └─ Column [Padding: 24, Gap: 32]
          ├─ WarningHeader [Gap: 12]
          │  ├─ Icon [Alert-Red, Size: 32]
          │  └─ Text ["EMERGENCY RECOVERY", Style: H1, Color: #FF4D4F]
          ├─ StatusCard [Height: 100, Fill: #1F0D0E, Border: 1px #FF4D4F]
          ├─ TriageStack [Auto Layout: Vertical, Gap: 16]
          │  ├─ ActionCard [Title: "One-Tap Delegation"]
          │  ├─ ActionCard [Title: "Draft Extension Request"]
          │  └─ ActionCard [Title: "Reschedule Study Block"]
          └─ BtnDeescalate [Height: 56, Border: 1px #B0B0B0, Text: "DE-ESCALATE SYSTEM"]
    ```
*   **Exact Layout**:
    *   `Artboard`: Pure black background (`#000000`).
    *   `StatusCard`: Width `342px`, Height `100px`. Fill `#1F0D0E`, Border `1px solid #FF4D4F`, Radius `8px`.
    *   `ActionCard`: Width `342px`, Height `80px`. Background `#121212`, Border `1px solid #2C2C2C`.
*   **Interaction States**:
    *   `ActionCard`: Tap displays options panel.
    *   `BtnDeescalate`: Pressing resets active recovery flags, returning interface to standard dashboards.
*   **Animation Behavior**:
    *   *Warning Header*: Accent red outline pulses on the screen container (`duration: 2000ms`, continuous loops).
*   **Empty State**: Not applicable.
*   **Loading State**: Displays loading spinners when automation runs are triggered.
*   **Error State**:
    *   If automatic draft fails: Card displays: "LMS draft failed. Please copy text manually."
*   **Accessibility Notes**:
    *   Critical status details read instantly upon screen loading.
*   **Developer Implementation Notes**:
    *   Use systemic overlays to block incoming alerts when this mode is active.

---

### 12. Settings

*   **Purpose**: Manages integrations, privacy filters, and theme profiles.
*   **User Goal**: Configure account parameters and integrations.
*   **Information Hierarchy**:
    1.  Title Header: "SETTINGS" (H1)
    2.  Group: Account configs (Settings Row)
    3.  Group: Integrations indexes (Settings Row)
    4.  Group: Privacy & Signal controls (Settings Row)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #0A0A0A]
       └─ ListView [Padding: 16]
          ├─ SectionHeader ["ACCOUNT"]
          ├─ SettingRow [Label: "User Profile"]
          ├─ SettingRow [Label: "Integrations", Status: "Canvas Linked"]
          ├─ SectionHeader ["SYSTEM"]
          ├─ SettingRow [Label: "Privacy Options"]
          ├─ SettingRow [Label: "Appearance Profile"]
          └─ SettingRow [Label: "Sync Status", Value: "1.0.0-rc3"]
    ```
*   **Exact Layout**:
    *   `SettingRow`: Width `358px`, Height `56px`. Background `#121212`, Bottom Border `1px solid #1F1F1F`.
    *   `Row Alignment`: Left-aligned option text, right-aligned status indicators and chevron icons.
*   **Interaction States**:
    *   `SettingRow`: Tap navigates to settings category. Hover highlights card fill to `#181818`.
*   **Animation Behavior**:
    *   *Page Transition*: Standard slide-in animations.
*   **Empty State**: Not applicable.
*   **Loading State**: Shimmer line boxes.
*   **Error State**:
    *   Integration errors display red warnings on rows.
*   **Accessibility Notes**:
    *   Labels describe active states, e.g., "Integrations settings. Canvas connected."
*   **Developer Implementation Notes**:
    *   Keep user settings synchronized with cloud databases via key-value stores.

---

### 13. Profile

*   **Purpose**: Displays student metrics and calibration baseline stats.
*   **User Goal**: Check baseline profile stats and system version info.
*   **Information Hierarchy**:
    1.  Avatar Widget (Profile Frame)
    2.  Name and Major Details: "Garv Anand - Computer Science" (H2)
    3.  Card Group: Calibration metrics (Metrics Card)
    4.  Sign-out Option (Primary Button)
*   **Component Tree**:
    ```text
    └─ Scaffold [Background: #0A0A0A]
       └─ Column [Padding: 24, Gap: 24]
          ├─ AvatarSection [Column, Centered]
          │  ├─ Image [Size: 80x80, Circle]
          │  ├─ Text ["Garv Anand", Style: H2]
          │  └─ Text ["Computer Science major", Style: Body]
          ├─ CalibrationCard [Padding: 16, Fill: #121212]
          │  ├─ Heading ["COGNITIVE BASELINE"]
          │  └─ Grid [Typing WPM: 82, Reaction Rate: 220ms, Reading WPM: 240]
          └─ BtnSignout [Height: 56, Text: "DISCONNECT CLIENT"]
    ```
*   **Exact Layout**:
    *   `AvatarSection`: Centered horizontally. Image `80x80px`.
    *   `CalibrationCard`: Width `342px`, Height `160px`. Background `#121212`, Radius `8px`.
*   **Interaction States**:
    *   `BtnSignout`: Hover: Fill `#FF4D4F`, text `#FFFFFF`. Tap triggers disconnection warning.
*   **Animation Behavior**:
    *   Disconnection triggers scale-down animations before returning to Welcome.
*   **Empty State**: Not applicable.
*   **Loading State**: Shimmer cards.
*   **Error State**: Disconnection failures show: "Unable to disconnect. Active synchronization is in progress."
*   **Accessibility Notes**:
    *   VoiceOver reads: "Profile page. Calibration baseline statistics: Typing WPM 82, Reaction 220ms."
*   **Developer Implementation Notes**:
    *   On sign-out, clear SQLite cache databases to protect user privacy.

---

## PART 2: DESKTOP APPLICATION (TAURI + REACT/TYPESCRIPT)

Designed for desktop aspect viewports (target size: **1440px x 900px**, custom borderless layout).

### 1. Adaptive Workspace Dashboard

*   **Purpose**: Landing screen display showing active cognitive states and workspace alerts.
*   **User Goal**: Monitor cognitive state trends and start focus sessions.
*   **Information Hierarchy**:
    1.  Custom Title Bar: Controls (TitleBar, Left-aligned)
    2.  Sidebar: Navigation panel (Collapsible Sidebar, Width 240px)
    3.  Main Viewport: Real-time dashboards (12-Col Layout Grid)
    4.  Section Left: Active focus metrics (col-span-8)
    5.  Section Right: Urgent task details (col-span-4)
*   **Component Tree**:
    ```text
    └─ AppLayout [Height: 900, Width: 1440, Row]
       ├─ CustomTitleBar [Height: 40, Position: Absolute Top]
       ├─ Sidebar [Width: 240, Collapsible]
       └─ ContentCanvas [Width: Fill, Auto Layout: Vertical]
          ├─ HeaderSection [Row, Padding: 32]
          └─ DashboardGrid [12 Columns, Gap: 24]
             ├─ FocusWidget [col-span-8, Height: 620]
             └─ SentinelAlertsWidget [col-span-4, Height: 620]
    ```
*   **Exact Layout**:
    *   `CustomTitleBar`: Height `40px`, drag region enabled. Left traffic light spacing: `16px` margin, `8px` gaps.
    *   `Sidebar`: Width `240px` (folds to `64px` icon-only view). Border-Right `1px solid #1F1F1F`.
    *   `ContentCanvas`: Width `Fill`, Padding `32px` margin borders, `24px` gutter gaps.
*   **Interaction States**:
    *   `Sidebar link`: Active hover: Background `#121212`, Left indicator `#FFD400` (Width `3px`).
    *   `Widget Cards`: Hover highlights borders. Right-click opens options dropdown list.
*   **Animation Behavior**:
    *   *Sidebar Fold*: Slides width from `240px` to `64px` using spring-physics loops (`stiffness: 400`, `damping: 30`).
    *   *Widget Morph*: State changes morph layouts smoothly using Framer Motion animations.
*   **Empty State**: Not applicable.
*   **Loading State**: Sweeping shimmer grids on widgets.
*   **Error State**:
    *   If database connection drops: Widgets display error message "Tauri Core Sync Interrupted" and show reconnection button.
*   **Accessibility Notes**:
    *   Keyboard navigation supports Tab indexing. Focus loops outline interactive cards.
*   **Developer Implementation Notes**:
    *   Uses Tauri IPC bindings `invoke("get_active_task")` to fetch data.

---

### 2. Agent Activity Monitor

*   **Purpose**: Displays Diagnostics status, conflict queues, and logs for the 5 agents.
*   **User Goal**: Track diagnostic parameters and override agent conflicts.
*   **Information Hierarchy**:
    1.  Header: "SYSTEM AGENTS" (H1)
    2.  Left Panel: Agent list cards (Split Panel 35% Width)
    3.  Right Panel: Live transaction log (Split Panel 65% Width)
*   **Component Tree**:
    ```text
    └─ AppLayout [Row]
       ├─ Sidebar
       └─ MonitorBody [Row, Width: Fill]
          ├─ PanelLeftAgents [Width: 420, Border-Right: 1px #1F1F1F]
          │  ├─ PanelHeader
          │  └─ AgentList [ListView, Gap: 12]
          └─ PanelRightDiagnostics [Width: Fill]
             ├─ DiagnosticsHeader
             ├─ ConflictQueueCanvas [Height: 260]
             ├─ ConsoleLogsBox [Height: 240, Background: #121212]
             └─ ActionButtonsRow
    ```
*   **Exact Layout**:
    *   `PanelLeftAgents`: Width `420px`. Includes 5 agent list items (each Height `90px`).
    *   `PanelRightDiagnostics`: Width `Fill`. Diagnostics graph canvas size: `Fill x 260px`.
*   **Interaction States**:
    *   `AgentListItem`: Tap selects target card, highlighting item with colored border details.
    *   `Log Console`: Scrollable log container. Double-clicking log line highlights text.
*   **Animation Behavior**:
    *   *Live Logs*: Stream entries fade in and slide up `10px` on insertion (`duration: 200ms`).
*   **Empty State**:
    *   If agents are offline: Console displays "Agent thread pools inactive."
*   **Loading State**: Shimmer boxes.
*   **Error State**:
    *   If threads crash: Displays warning: "Tauri Bridge Hook Interrupted. Restarting runtime engines..."
*   **Accessibility Notes**:
    *   Logs have high-contrast colors (Info `#00D26A`, Warn `#FFB800`, Error `#FF4D4F`).
*   **Developer Implementation Notes**:
    *   Ingest logs via WebSocket client streams to avoid re-rendering layout panels.

---

### 3. Deadline War Room

*   **Purpose**: Focused task workspace that displays checklists, risk scores, and peer updates.
*   **User Goal**: Manage urgent assignments and track milestones.
*   **Information Hierarchy**:
    1.  Warning Banner: "DEADLINE RISK PROFILE" (H1, Red Accent)
    2.  Left Column: Task checklists (Split col-span-7)
    3.  Right Column: Peer radar feed (Split col-span-5)
    4.  Bottom: Reference documentation (Suggested Resources Panel)
*   **Component Tree**:
    ```text
    └─ AppLayout [Row]
       ├─ Sidebar
       └─ WarRoomContainer [Column]
          ├─ RiskHeaderBar [Height: 56, Fill: #1F0D0E]
          ├─ MainGrid [Row, Gap: 16]
          │  ├─ ColTaskChecklist [col-span-7]
          │  └─ ColPeerRadar [col-span-5, Fill: #121212]
          └─ SuggestedResourcesBar [Height: 140, Fill: #121212]
    ```
*   **Exact Layout**:
    *   `RiskHeaderBar`: Height `56px`, Width `Fill`. Background `#1F0D0E`, Border-Bottom `1px solid #FF4D4F`.
    *   `ColTaskChecklist`: Padding `20px` margins. Contains task rows (each Height `64px`).
    *   `SuggestedResourcesBar`: Height `140px`, positioned at bottom center.
*   **Interaction States**:
    *   `TaskRow`: Hover: Border `#FF4D4F`. Click highlights row and updates resource links.
    *   `Resource Card`: Tap opens linked document in external workspace windows.
*   **Animation Behavior**:
    *   *Screen Alerts*: Visual red border alerts flash when risk metrics increase (`duration: 1500ms`).
*   **Empty State**: Not applicable.
*   **Loading State**: Sweep shimmer overlays.
*   **Error State**:
    *   If sync fails: Displays "Sync Alert: LMS connection lost. Offline checklists active."
*   **Accessibility Notes**:
    *   Warning screens utilize high contrast borders (`#FF4D4F`).
*   **Developer Implementation Notes**:
    *   Integrate window layout tiles using Tauri Window API bindings.

---

### 4. Workspace Sculptor Panel

*   **Purpose**: Manages active monitor configurations, allowed apps, and workspace templates.
*   **User Goal**: Arrange desktop layout containers and block distractive applications.
*   **Information Hierarchy**:
    1.  Header: "Workspace Controls" (H1)
    2.  Left Col: Blocker rules (Split Pane, Width 320px)
    3.  Center Col: Monitor layout canvas (Split Pane, Width 500px)
    4.  Right Col: Active templates (Split Pane, Width 360px)
*   **Component Tree**:
    ```text
    └─ AppLayout [Row]
       ├─ Sidebar
       └─ SculptorWorkspace [Row, Gap: 20]
          ├─ BlockListPanel [Width: 320, Fill: #121212]
          ├─ MonitorCanvasPanel [Width: 500]
          │  └─ ScreenCanvasBox [Height: 420]
          │     ├─ MonitorThumbnail [Center-X]
          │     └─ WindowThumbnail [Draggable]
          └─ TemplatesPanel [Width: Fill, Fill: #121212]
    ```
*   **Exact Layout**:
    *   `BlockListPanel`: Width `320px`. List items contain action badge controls (Height `32px`).
    *   `ScreenCanvasBox`: Width `Fill`, Height `420px`. Background `#0A0A0A`, Border `1px solid #2C2C2C`.
*   **Interaction States**:
    *   `WindowThumbnail`: Draggable. Can be placed into target Monitor frames to trigger workspace tile adjustments.
    *   `Template Card`: Click applies monitor arrangement layouts instantly.
*   **Animation Behavior**:
    *   *Drag Highlights*: Target drop zones highlight with a dashed `#FFD400` border overlay when window models hover nearby.
*   **Empty State**:
    *   Empty lists display: "All applications authorized. No active blocker rules."
*   **Loading State**: Shimmer placeholder grids.
*   **Error State**:
    *   If system-level process calls fail: Displays error box: "Tauri Hook Error: Process detection requires administrative permissions."
*   **Accessibility Notes**:
    *   Screen reader describes layouts: "Monitor 1 contains VSCode window. Monitor 2 contains reference browser."
*   **Developer Implementation Notes**:
    *   Call Win32 window management hooks inside rust-core thread pools to avoid locking UI rendering channels.

---

### 5. Research Workspace

*   **Purpose**: Analyzes documents, tracks source reliability, and extracts citations.
*   **User Goal**: Review PDFs and copy auto-formatted citation blocks.
*   **Information Hierarchy**:
    1.  Header: "Research Environment" (H1)
    2.  Left Pane: PDF document viewer (50% Split)
    3.  Right Pane: Notes markdown editor (50% Split)
    4.  Bottom Pane: Research history timeline (Citation Bar)
*   **Component Tree**:
    ```text
    └─ AppLayout [Row]
       ├─ Sidebar
       └─ ResearchWorkspace [Row]
          ├─ PaneLeftViewer [Width: 600]
          │  ├─ ViewerHeader
          │  ├─ PDFRenderBox [Height: Fill, Background: #FFFFFF]
          │  └─ CredibilityBadge [Height: 48, Color: #00D26A]
          └─ PaneRightNotebook [Width: Fill]
             ├─ NotebookHeader
             ├─ MarkdownNotesEditor [Height: 400]
             └─ CitationTimeline [Height: 120]
    ```
*   **Exact Layout**:
    *   `PDFRenderBox`: Width `Fill`, Height `Fill`. Background `#FFFFFF` (displays page text line blocks, highlights `#FFD400` overlay).
    *   `MarkdownNotesEditor`: Width `Fill`, Height `400px`. Background `#121212`, Padding `16px`.
    *   `CitationTimeline`: Width `Fill`, Height `120px`. Horizontal timeline tracks pages visited.
*   **Interaction States**:
    *   `PDF Text Selection`: Selecting text copies it to drag-preview models. Dropping snippets into markdown files appends citations.
*   **Animation Behavior**:
    *   *Drop Actions*: Snippet containers shrink slightly and fade out upon note insert.
*   **Empty State**:
    *   If no PDF is open: Viewer area displays "Drop research papers (.PDF) here to extract citation models."
*   **Loading State**: Spinner overlay on document loads.
*   **Error State**:
    *   Corrupted files prompt error trace: "Tauri Render Error: PDF file stream parse failure."
*   **Accessibility Notes**:
    *   PDF text content is fully readable by screen reader utilities.
*   **Developer Implementation Notes**:
    *   Implement PDF rendering pipelines using `pdfjs-dist` libraries.

---

### 6. Writing Workspace

*   **Purpose**: Writing editor integrated with Socratic argument checkers.
*   **User Goal**: Write documents and update logical arguments.
*   **Information Hierarchy**:
    1.  Left: Document Outline Tree (15% Width)
    2.  Center: Markdown Editor workspace (60% Width)
    3.  Right: Socratic logic suggestions (25% Width)
*   **Component Tree**:
    ```text
    └─ AppLayout [Row]
       ├─ Sidebar
       └─ WriterWorkspace [Row]
          ├─ ColOutline [Width: 180, Border-Right: 1px #1F1F1F]
          ├─ ColCentralWriter [Width: Fill, Padding: 48]
          │  ├─ TitleInput
          │  └─ TextWriterArea [Width: 540]
          └─ ColSocraticChallenger [Width: 320, Border-Left: 1px #1F1F1F]
             ├─ HeaderStatus [Color: #FFB800]
             └─ SocraticAlertsCardsStack [Gap: 16]
    ```
*   **Exact Layout**:
    *   `ColOutline`: Width `180px`. Header items list indent spacing: `12px` per layout depth.
    *   `TextWriterArea`: Width `540px` (locked to `65ch` length settings). Center-aligned.
    *   `ColSocraticChallenger`: Width `320px`. Background `#121212`.
*   **Interaction States**:
    *   `Outline Item`: Click shifts editor position directly to corresponding header sections.
    *   `Underlined Text (Logic alert)`: Hover flashes corresponding Socratic suggestions card.
*   **Animation Behavior**:
    *   *Suggestion Cards*: Fade in and slide up when typing breaks occur for longer than 2 seconds (`duration: 300ms`).
*   **Empty State**: Not applicable.
*   **Loading State**: Micro skeleton indicators.
*   **Error State**:
    *   If API connections disconnect: Socratic panel displays fallback alert: "Local Llama parser inactive. Logic evaluations paused."
*   **Accessibility Notes**:
    *   Socratic checks announce suggestions using clear text.
*   **Developer Implementation Notes**:
    *   Use a debounced text value observer (`500ms`) to query Socratic checking endpoints.

---

### 7. Socratic Challenge Workspace

*   **Purpose**: Active learning dashboard that runs question drills on course documents.
*   **User Goal**: Review concepts and complete study drills.
*   **Information Hierarchy**:
    1.  Drill Title: "Socratic Study Drill" (H1)
    2.  Left Col: Question pane (55% Split)
    3.  Right Col: Reference cards stack (45% Split)
*   **Component Tree**:
    ```text
    └─ AppLayout [Row]
       ├─ Sidebar
       └─ SocraticWorkspace [Row, Gap: 24, Padding: 32]
          ├─ QuestionPane [Width: Fill]
          │  ├─ ProgressIndicator [Height: 4]
          │  ├─ ChallengeText ["Define compiling algorithms...", Style: Display LG]
          │  ├─ AnswerInputBox [Height: 180, Border: 1px #2C2C2C]
          │  └─ BtnSubmitAnswer [Height: 48, Fill: #FFD400]
          └─ ReferencePanel [Width: 400, Fill: #121212]
             ├─ SectionHeader ["REFERENCE CONCEPTS"]
             └─ ConceptCardsStack [Gap: 12]
    ```
*   **Exact Layout**:
    *   `QuestionPane`: Padding `32px` margins. Answer box size: `Fill x 180px`.
    *   `ReferencePanel`: Width `400px`. Background `#121212`, Radius `8px`, Padding `20px`.
*   **Interaction States**:
    *   `BtnSubmitAnswer`: Default: Fill `#FFD400`. Pressed: Scale down to `0.97x`. Disabled until text values are inputted.
*   **Animation Behavior**:
    *   *Next Question*: Current question slides out to the left while next question container slides in from right (`duration: 350ms`, `curve: Curves.easeInOut`).
*   **Empty State**:
    *   If drills are complete: Displays "All drills checked. Focus metrics optimal."
*   **Loading State**: Sweep shimmers.
*   **Error State**:
    *   Submit errors display warning banner: "Review upload failed. Please resend."
*   **Accessibility Notes**:
    *   Interactive questions have high-contrast text tags (`#FFFFFF` on `#0A0A0A`).
*   **Developer Implementation Notes**:
    *   Run Socratic completions using model streaming configurations.

---

### 8. Analytics Center

*   **Purpose**: Displays focus metrics, cognitive state trends, and agent parameters.
*   **User Goal**: Monitor cognitive state trends and export reports.
*   **Information Hierarchy**:
    1.  Header: "Focus Metrics" (H1)
    2.  Stats Grid: Summary summaries (col-span-12)
    3.  Middle Pane Left: Focus Heatmap (col-span-6)
    4.  Middle Pane Right: Block actions (col-span-6)
    5.  Bottom Pane: Calibration accuracy (col-span-12)
*   **Component Tree**:
    ```text
    └─ AppLayout [Row]
       ├─ Sidebar
       └─ AnalyticsWorkspace [Column, Padding: 32]
          ├─ HeaderBar [Row]
          ├─ MetricOverviewRow [Gap: 24]
          ├─ ChartsGrid [Row, Gap: 24]
          │  ├─ FocusHeatmapCard [col-span-6, Height: 320]
          │  └─ InterventionChartCard [col-span-6, Height: 320]
          └─ ChartFull [Width: Fill, Height: 260]
    ```
*   **Exact Layout**:
    *   `MetricOverviewRow`: Horizontal layout. 3 stats cards (each Width `320px`, Height `120px`).
    *   `FocusHeatmapCard`: Width `540px`, Height `320px`. Background `#121212`, Radius `8px`.
    *   `ChartFull`: Width `1100px`, Height `260px`.
*   **Interaction States**:
    *   `Heatmap Square`: Hover displays date and focus stats tooltip.
    *   `BtnExport`: Click launches Tauri save dialog directory browser path.
*   **Animation Behavior**:
    *   *Chart Render*: Area lines draw with custom draw sweeps on initial loading (`duration: 800ms`).
*   **Empty State**: Not applicable.
*   **Loading State**: Shimmer cards.
*   **Error State**:
    *   If database query timeouts: Displays error banner: "Unable to retrieve database logs."
*   **Accessibility Notes**:
    *   Ensure focus tags use high-contrast color choices.
*   **Developer Implementation Notes**:
    *   Implement SVG analytics graphs using `Recharts` library components.

---

### 9. Session Replay

*   **Purpose**: Post-session playback dashboard to audit cognitive focus levels.
*   **User Goal**: Review focus levels and view screenshots.
*   **Information Hierarchy**:
    1.  Playback Canvas: Video frames (70% Height Split)
    2.  Controls Panel: Play/Pause toggles (30% Height Split)
    3.  Timeline Scrubber (Interactive Track Bar)
*   **Component Tree**:
    ```text
    └─ AppLayout [Row]
       ├─ Sidebar
       └─ ReplayWorkspace [Column]
          ├─ PlayerArea [Height: 520]
          │  ├─ ScreenCaptureFrame [Width: 720, Height: 400]
          │  └─ MetricChartArea [Height: 60]
          └─ ScrubberTimelinePane [Height: 220, Fill: #121212]
             ├─ ControlsRow
             └─ TimelineCanvas [Height: 80]
    ```
*   **Exact Layout**:
    *   `ScreenCaptureFrame`: Width `720px`, Height `400px`. Border `#FFD400`, centered inside player area.
    *   `ScrubberTimelinePane`: Height `220px`. Bottom border details `1px solid #2C2C2C`.
*   **Interaction States**:
    *   `Play/Pause`: Spacebar toggles playback. Hover highlights buttons.
    *   `Scrubber Handle`: Drag updates screenshots synchronously.
*   **Animation Behavior**:
    *   *Playback Scrubbing*: Video frames transition smoothly using transition buffers (`duration: 100ms`).
*   **Empty State**:
    *   If screenshots are deleted: Player displays warning placeholder "No visual logs saved during session."
*   **Loading State**: Spinner loader on frame transitions.
*   **Error State**:
    *   If index files are missing: Screen displays error: "Video directory path not resolved."
*   **Accessibility Notes**:
    *   Acoustic warnings identify timeline state changes.
*   **Developer Implementation Notes**:
    *   Store screenshots as local compressed files inside `%APPDATA%/apex/replays`.

---

### 10. Command Center

*   **Purpose**: Keyboard-driven overlay modal allowing system-wide shortcuts.
*   **User Goal**: Launch focus mode or switch active workspaces.
*   **Information Hierarchy**:
    1.  Fuzzy Input Bar: Query search (Height 56px)
    2.  List Area: Results options (Scrollable Stack)
    3.  Footer: Shortcut helper tags (Height 28px)
*   **Component Tree**:
    ```text
    └─ ArtboardMaskOverlay [Background: rgba(0,0,0,0.5), BackdropBlur]
       └─ CommandCenterModal [Width: 680, Height: 380, Center-Aligned]
          ├─ SearchInputRow [Height: 56, Border-Bottom: 1px #2C2C2C]
          ├─ ResultsListSection [Height: 290, Overflow: Scroll]
          │  ├─ RowResultSelected [Height: 44, Fill: rgba(254, 212, 0, 0.15)]
          │  └─ RowResultDefault x3 [Height: 44]
          └─ StatusFooterBar [Height: 28, Fill: #181818]
    ```
*   **Exact Layout**:
    *   `CommandCenterModal`: Width `680px`, Height `380px` max. Positioned `120px` below top viewport margin.
    *   `RowResult`: Width `664px`, Height `44px` (Padding `12px`).
*   **Interaction States**:
    *   `RowResultSelected`: Active outline `#FFD400` border, background `rgba(254, 212, 0, 0.15)`.
    *   `SearchInput`: Active focus ring. Esc clears input text.
*   **Animation Behavior**:
    *   *Modal Entrance*: Spring scale-up from `0.95x` to `1.0x` (`duration: 200ms`, `stiffness: 450`, `damping: 28`).
*   **Empty State**:
    *   If no matching commands exist: Displays: "No action items matching search queries."
*   **Loading State**: Rotating search icon loader.
*   **Error State**: Not applicable.
*   **Accessibility Notes**:
    *   Ensure all actions are accessible via keyboard shortcut bindings.
*   **Developer Implementation Notes**:
    *   Fuzzy matching algorithms run locally. Register shortcuts using Tauri `globalShortcut` bindings.

---

### 11. Settings

*   **Purpose**: Manages system integrations, directories, and keyboard shortcuts.
*   **User Goal**: Configure desktop integration options and shortcuts.
*   **Information Hierarchy**:
    1.  Header: "System Settings" (H1)
    2.  Split View Layout:
        *   Left: Navigation list options (Width 220px)
        *   Right: Settings fields container (Width Fill)
*   **Component Tree**:
    ```text
    └─ AppLayout [Row]
       ├─ Sidebar
       └─ SettingsWorkspace [Row, Padding: 32]
          ├─ ColSettingsNav [Width: 220, Border-Right: 1px #1F1F1F]
          └─ ColSettingsFields [Width: Fill, Padding-Left: 32]
             ├─ SettingSection ["INTEGRATIONS"]
             ├─ SettingSection ["HOTKEYS"]
             └─ SettingSection ["PRIVACY"]
    ```
*   **Exact Layout**:
    *   `ColSettingsNav`: Width `220px`. Vertical list items (each Height `40px`).
    *   `ColSettingsFields`: Width `Fill`. Includes form options (each Height `48px`, Width `500px`).
*   **Interaction States**:
    *   `Form Input`: Default: Border `#2C2C2C`. Focused: Border `#FFD400`.
*   **Animation Behavior**:
    *   Smooth transitions between settings tabs.
*   **Empty State**: Not applicable.
*   **Loading State**: Shimmer outlines.
*   **Error State**:
    *   Input errors display: "Format invalid. Please re-enter shortcut config."
*   **Accessibility Notes**:
    *   Fields contain high contrast label tags.
*   **Developer Implementation Notes**:
    *   Store desktop settings config files under directory path `%APPDATA%/apex/config.json`.

---

### 12. Agent Logs

*   **Purpose**: Diagnostics console showing agent raw telemetry streams.
*   **User Goal**: Review agent telemetry logs and export diagnostics logs.
*   **Information Hierarchy**:
    1.  Header Control: Log filters (Header Bar, Height 44px)
    2.  Console Output View: Raw text logs (Terminal Viewport)
    3.  Footer: Log exports config (Footer Bar, Height 40px)
*   **Component Tree**:
    ```text
    └─ AppLayout [Row]
       ├─ Sidebar
       └─ LogsWorkspace [Column]
          ├─ HeaderFilterBar [Height: 44, Border-Bottom: 1px #1F1F1F]
          ├─ OutputTerminalConsole [Width: Fill, Height: Fill, Fill: #0A0A0A]
          │  └─ ConsoleLines [Font: JetBrains Mono, Gap: 4]
          └─ ActionFooterBar [Height: 40, Border-Top: 1px #1F1F1F]
    ```
*   **Exact Layout**:
    *   `HeaderFilterBar`: Height `44px`, Width `Fill`. Inside contains checklist controls.
    *   `OutputTerminalConsole`: Width `Fill`, Height `Fill`. Background `#0A0A0A`, Border `1px solid #1F1F1F`.
*   **Interaction States**:
    *   `Log Lines`: Double-click expands line detail object arrays.
    *   `Auto-Scroll Toggle`: Checkbox filters terminal update logic.
*   **Animation Behavior**:
    *   Terminal lines scroll smoothly on incoming inputs.
*   **Empty State**:
    *   If trace log is empty: View displays: "Awaiting system inputs. Logs terminal empty."
*   **Loading State**: Scrolling trace loader symbols.
*   **Error State**:
    *   If log files lock: Displays warning: "Log file system locked by Tauri database engine."
*   **Accessibility Notes**:
    *   Ensure terminal text passes contrast AA levels (`#FFFFFF` on `#0A0A0A`).
*   **Developer Implementation Notes**:
    *   Utilize local tail stream logic on rust database folders.

---

## PART 3: DESIGN SYSTEM

APEX implements a premium dark-first visual language tailored for AMOLED displays.

### 3.1 Color Specification Table

| Name | Hex Value | Opacity | Application | CSS Variable |
| :--- | :--- | :--- | :--- | :--- |
| **Bg-Primary** | `#0A0A0A` | 100% | Base canvas screens | `--bg-primary` |
| **Bg-Secondary** | `#121212` | 100% | Main container panels | `--bg-secondary` |
| **Bg-Overlay** | `#181818` | 100% | Hover overrides | `--bg-overlay` |
| **Bg-Glass** | `#121212` | 75% | Command modal window | `--bg-glass` |
| **Accent-Yellow**| `#FFD400` | 100% | Focus button action | `--accent-yellow` |
| **Border-Default**| `#2C2C2C` | 100% | Standard borders | `--border-default` |
| **Success-Green** | `#00D26A` | 100% | Flow state indicators | `--success-green` |
| **Warning-Orange**| `#FFB800` | 100% | Distracted warnings | `--warning-orange` |
| **Danger-Red** | `#FF4D4F` | 100% | Overload alert state | `--danger-red` |

---

### 3.2 Spacing System

APEX layout rules follow the 8px Grid:
*   `space-1` (4px): Badge padding, micro borders.
*   `space-2` (8px): Inputs padding, chip margins, buttons horizontal gaps.
*   `space-3` (12px): Standard lists gaps, inner layout card margins.
*   `space-4` (16px): Outer layout card margins, dashboard gutter spacing.
*   `space-5` (24px): Standard window paddings, sections dividers.
*   `space-6` (32px): Desktop margins, header gaps.
*   `space-7` (48px): Hero section gaps, focus timers.

---

### 3.3 Typography Hierarchy

Display fonts: **Cabinet Grotesk** (Wide geometric). Body fonts: **Inter** (Neutral tracking). Monospace: **JetBrains Mono** (Numerics).

```css
/* Core system font settings */
.display-xl {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 48px;
  line-height: 52px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.display-lg {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 36px;
  line-height: 40px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.h1-spec {
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 24px;
  line-height: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.h2-spec {
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  line-height: 26px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.h3-spec {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 22px;
  font-weight: 600;
  letter-spacing: 0.00em;
}

.body-spec {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  letter-spacing: 0.00em;
}

.caption-spec {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  line-height: 14px;
  font-weight: 500;
  letter-spacing: +0.03em;
}
```

---

### 3.4 UI Component Systems

#### Button System
*   `Btn-Primary`: Height `40px` (Desktop) / `56px` (Mobile). Background `#FFD400`, Text `#0A0A0A` (Bold). Radius `4px` (Beveled).
*   `Btn-Secondary`: Height `40px` / `56px`. Background `#181818`, Border `1px solid #2C2C2C`, Text `#FFFFFF`.
*   `Btn-Danger`: Height `40px` / `56px`. Background `#FF4D4F`, Text `#FFFFFF`.

#### Card System
*   `Base-Card`: Background `#121212`, Border `1px solid #2C2C2C`, Radius `8px`, Padding `16px`.
*   `Interactive-Card`: Background `#121212`, Border `1px solid #2C2C2C`. Hover: Background `#181818`, Border `#FFD400`. Transition: `border 150ms ease`.

#### Modal System
*   `Overlay-Modal`: Background `rgba(0,0,0,0.5)`, Backdrop-blur `8px`. Width `600px` max. Enter scale: spring (`0.95x` to `1.0x`).

#### Toast System
*   `System-Toast`: Width `320px`. Background `#181818`, Border-Left `3px solid #FFD400`, Radius `4px`.

#### Navigation System
*   `Sidebar`: Collapsible. Width `240px` (Expanded) / `64px` (Collapsed). Active indicators `3px` left highlight `#FFD400`.

#### Agent Status System
Diagnostics statuses use agent avatars and glowing status indices:
*   State Agent: Glow `#FF4500` (8px blur, 10% opacity).
*   Deadline Sentinel: Glow `#FF0055` (12px blur, 15% opacity).
*   Environment Sculptor: Glow `#00F5FF` (6px blur, 12% opacity).
*   Peer Radar: Glow `#7B2CBF` (8px blur, 8% opacity).
*   Socratic Challenger: Glow `#00FF87` (10px blur, 15% opacity).

#### Animation System
APEX transitions use spring-physics interpolation templates:
*   `Snappy Spring`: `stiffness: 700`, `damping: 35` (For alerts, command modal launch).
*   `Smooth Spring`: `stiffness: 400`, `damping: 28` (For list card expansions, panel transitions).
*   `Muted/Restorative Spring`: `stiffness: 150`, `damping: 20` (Under fatigued/overloaded recovery states).

---

## PART 4: FIGMA-READY OUTPUT

All elements are designed to be imported as design variables and local styles.

### 4.1 Frame Definitions Table

| Artboard Name | Width (px) | Height (px) | Grid Settings | Auto Layout Rules |
| :--- | :--- | :--- | :--- | :--- |
| **MOB_01_Splash** | 390 | 844 | 4 Columns, 16 Margin | Direction: Vertical, Align: Center |
| **MOB_02_Onboarding** | 390 | 844 | 4 Columns, 16 Margin | Direction: Vertical, Gap: 24 |
| **MOB_03_Permissions** | 390 | 844 | 4 Columns, 16 Margin | Direction: Vertical, Gap: 16 |
| **MOB_04_Cognitive** | 390 | 844 | 4 Columns, 16 Margin | Scrollable vertical flex |
| **MOB_05_Deadline** | 390 | 844 | 4 Columns, 16 Margin | Direction: Vertical, Gap: 16 |
| **MOB_06_AgentCenter** | 390 | 844 | 4 Columns, 16 Margin | Scrollable vertical flex |
| **MOB_07_Focus** | 390 | 844 | 4 Columns, 16 Margin | Direction: Vertical, Align: Center |
| **MOB_08_Voice** | 390 | 844 | 4 Columns, 16 Margin | Direction: Vertical, Gap: 24 |
| **MOB_09_PeerRadar** | 390 | 844 | 4 Columns, 16 Margin | Direction: Vertical, Gap: 16 |
| **MOB_10_SessionStats**| 390 | 844 | 4 Columns, 16 Margin | Scrollable vertical flex |
| **MOB_11_Recovery** | 390 | 844 | 4 Columns, 16 Margin | Direction: Vertical, Gap: 24 |
| **MOB_12_Settings** | 390 | 844 | 4 Columns, 16 Margin | Direction: Vertical, Gap: 12 |
| **MOB_13_Profile** | 390 | 844 | 4 Columns, 16 Margin | Direction: Vertical, Gap: 24 |
| **DSK_01_Dashboard** | 1440 | 900 | 12 Columns, 32 Margin | Direction: Horizontal, Split Pane |
| **DSK_02_Diagnostics** | 1440 | 900 | 12 Columns, 32 Margin | Direction: Horizontal, Split Pane |
| **DSK_03_WarRoom** | 1440 | 900 | 12 Columns, 32 Margin | Direction: Horizontal, col-span Grid |
| **DSK_04_Sculptor** | 1440 | 900 | 12 Columns, 32 Margin | Direction: Horizontal, Split Pane |
| **DSK_05_Research** | 1440 | 900 | 12 Columns, 32 Margin | Direction: Horizontal, Split Pane |
| **DSK_06_Writer** | 1440 | 900 | 12 Columns, 32 Margin | Direction: Horizontal, 3 Columns |
| **DSK_07_Socratic** | 1440 | 900 | 12 Columns, 32 Margin | Direction: Horizontal, Split Pane |
| **DSK_08_Analytics** | 1440 | 900 | 12 Columns, 32 Margin | Scrollable vertical flex |
| **DSK_09_Replay** | 1440 | 900 | 12 Columns, 32 Margin | Split Vertical Playback Pane |
| **DSK_10_Command** | 680 | 380 | Centered Overlay | Direction: Vertical, Gap: 4 |
| **DSK_11_Settings** | 1440 | 900 | 12 Columns, 32 Margin | Direction: Horizontal, Split Pane |
| **DSK_12_Logs** | 1440 | 900 | 12 Columns, 32 Margin | Direction: Vertical, Terminal Flex |

---

### 4.2 Reusable Components Inventory
Maintain these component naming conventions in the design library:
*   `Molecule/Form/TextInput`: Standard textbox input.
*   `Molecule/Card/Deadline`:Urgency risk score item layout.
*   `Molecule/Card/AgentStatus`: Activity card.
*   `Organism/Sidebar/Desktop`: Sidebar menu navigation.
*   `Organism/Overlay/Command`: Raycast-inspired input.
*   `Atom/Indicator/BridgeSync`: Sync indicator badge.

---

## PART 5: ANTIGRAVITY GENERATION MODE

The prompts below are optimized for Antigravity code generation.

### 5.1 Mobile Application Development Prompt (Flutter)

```text
Build a production-grade Flutter UI screen (MOB_04_Cognitive) mapping the APEX real-time cognitive dashboard. The screen runs on 390x844px AMOLED layout.
Ensure visual execution matches: Nothing OS dotted styling, Apple glassmorphism overlay frames, and high-performance dark telemetry dashboards. 
Colors must use Hex values: Bg-Primary #000000 (AMOLED pixel disable), Bg-Secondary #121212, Accent-Yellow #FFD400, Success #00D26A, Muted #A0A0A0.
Include these components:
1. Custom Header Bar (Height: 48px, horizontal layout) with profile avatar frame and P2P sync bridge status badge displaying '12ms latency' in Success #00D26A.
2. Cognitive State Hero Card (Height: 220px, Width: Fill) containing state status 'FLOW ACTIVE' (Heading H2, #00D26A) and focus score '94%' (Display XL, #FFFFFF). Show a spline bezier curve area chart at the bottom of card showing attention metrics.
3. Signal Grid (2x2 layout, Gap: 12px) featuring four interactive cards (each Width: 171px, Height: 74px) representing HRV stability, gaze anchor accuracy, typing cadence latency, and ambient noise. Each card must show real-time metrics and a status indicator dot.
4. CTA Button (Height: 56px, Width: Fill) displaying 'MANUAL OVERRIDE' (Accent-Yellow border, transparent fill).
Ensure all widgets use clean mock data. Run smooth transitions on focus updates.
```

---

### 5.2 Desktop Application Development Prompt (Tauri + React/TS)

```text
Build a production-grade React layout (DSK_01_Dashboard) for the APEX Tauri desktop app (1440x900px, borderless setup).
Visual styling: Dark Tesla UI panels, Linear-inspired keyboard shortcuts metadata, and Raycast modal blur layers.
Theme colors: Bg-Primary #0A0A0A, Bg-Secondary #121212, Accent-Yellow #FFD400, Border #2C2C2C, Alert-Red #FF4D4F.
Implement these components:
1. TitleBar: Custom header (Height: 40px, Drag region data-tauri-drag-region) containing Traffic Lights (Close, Minimize, Maximize) left-aligned with Apple styling.
2. Collapsible Sidebar: Width 240px, background #0A0A0A, border-right 1px solid #1F1F1F. Show Navigation links stack with an active left highlight indicator. Anchored bottom widget details active agent telemetry heartbeat pulses.
3. Content Area: 12-Column Responsive layout grid (Gap: 24px, Margin: 32px) containing:
   - Left Pane (col-span-8): Focus Timer Card (Height: 620px) displaying 'CS301 Lab: 32m left' (H1) and a canvas rendering dynamic waveform frequencies representing focus levels.
   - Right Pane (col-span-4): Deadline Sentinel panel displaying urgent alerts list. Alert row-items must show assignment titles, risk scores (e.g. 92% in red), and action buttons.
Provide high-fidelity layouts, clean TypeScript metrics, and responsive auto-layout structures.
```
