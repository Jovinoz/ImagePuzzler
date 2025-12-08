# ImagePuzzler - Functional Specification

## Product Overview

ImagePuzzler is a two-part application system consisting of:
1. **Builder Application** - A visual editor for creating interactive image-based quiz games
2. **Player Application** - A standalone game file that plays the quiz created in the builder

The builder allows users to create engaging visual puzzles where viewers see a cropped portion of an image with a question, click to reveal the full image with an answer, and progress through multiple images in sequence.

## Use Cases

### Primary Use Case
An educator wants to create a geography quiz. They:
1. Upload photos of famous landmarks
2. Crop interesting architectural details from each photo
3. Add questions like "What landmark is this?"
4. Position answers on the full image pointing to relevant features
5. Export a single file that students can open and play

### Secondary Use Cases
- Training materials (identify equipment from partial views)
- Art education (identify paintings from details)
- Product knowledge quizzes (identify products from close-ups)
- Memory games for therapy or education

## Builder Application

### Visual Design

#### Color Scheme
- Primary gradient: Purple-blue gradient (vibrant, modern)
- Background: Full-screen gradient backdrop
- Cards: White rounded cards with shadows for content areas
- Accent color: Purple-blue for headings, buttons, and highlights
- Text: Dark gray on white for readability

#### Layout Philosophy
- Clean, uncluttered interface
- Responsive design that adapts to screen size
- Prominent visual hierarchy
- Consistent spacing and shadows for depth

### Main Interface Sections

#### 1. Header
**Position:** Top of page, centered

**Content:**
- Application title: "ImagePuzzler"
- Current project name displayed next to title (when set)
- Browser tab shows: "ImagePuzzler - [Project Name]"

**Visual Style:**
- Large, bold white text
- Text shadow for depth against gradient background

#### 2. Thumbnail Gallery

**Position:** Below header, spans full width

**Purpose:** Visual overview of all images in the project with drag-and-drop management

**Visual Design:**
- White card with rounded corners
- Heading: "Images (count)" in purple accent color
- Grid layout of square thumbnails
- Dashed border around thumbnail area to indicate drop zone

**Thumbnail Items:**
- Square aspect ratio, uniform size
- 3-pixel border (gray normally, purple when active/selected)
- Image fills thumbnail (cropped to fit)
- Numbered badge in top-left corner showing sequence
- Delete button (X) in top-right corner (appears on hover)
- Caption text at bottom showing question text (if set)
- Active thumbnail has purple border and subtle glow

**"Add Image" Card:**
- Dashed purple border
- Large "+" symbol in center
- Text: "Add Image"
- Light gray gradient background
- Hover effect: shifts to light purple tint

**Drag and Drop Behavior:**
- Entire gallery area accepts image file drops
- Visual feedback: border color changes when dragging over
- Thumbnails can be dragged to reorder
- Supports dropping multiple image files simultaneously
- Supports selecting multiple files via file picker
- Invalid files are skipped with notification

**Interaction:**
- Click thumbnail to select/edit that image
- Click "+" card to open file picker
- Drag files anywhere in gallery area to add
- Drag thumbnails to reorder sequence
- Hover thumbnail to reveal delete button
- Click delete to remove image

#### 3. Canvas Area

**Position:** Below gallery, left side (or above controls on small screens)

**Purpose:** Main editing workspace for the currently selected image

**Visual Design:**
- White rounded card with padding
- Displays full image (scaled to fit, max width ~1200px)
- Canvas maintains image aspect ratio
- Crosshair cursor when hovering

**Canvas Elements:**
- Background: The uploaded image
- Rectangle selection: Semi-transparent overlay with blue outline
- Question text: Overlaid at specified position
- Answer text: Overlaid at specified position with color and optional stroke

**Selection Rectangle:**
- User draws by click-and-drag on canvas
- Blue outline, semi-transparent fill
- Shows exactly what will be cropped in the game
- Can be redrawn by making a new selection

**Text Overlays:**
- Question text appears in a designated area
- Answer text can be dragged to any position on the canvas
- Answer has visual affordance when draggable (cursor changes)
- Text displays with configured size, color, and stroke

#### 4. Controls Panel

**Position:** Right side of canvas (or below canvas on small screens)

**Purpose:** Configure all properties for the current image

**Visual Design:**
- White rounded card with padding
- Organized in logical sections with spacing
- Clear labels for all inputs
- Consistent input styling

**Control Sections:**

**Section 1: Instructions**
- Italic gray text: "Click and drag on the image to select a region"

**Section 2: Question Settings**
- Label: "Question"
  - Text input field for question text
- Label: "Size"
  - Number input (range: 10-200, default: 72)

**Section 3: Answer Settings**
- Label: "Answer"
  - Text input field for answer text
- Label: "Size"
  - Number input (range: 10-200, default: 72)
- Label: "Color"
  - Color picker input (default: white)
- Checkbox: "Add outline (better visibility)"
  - When checked, adds black stroke around answer text

**Section 4: Preview**
- Button: "Preview Game Animation"
  - Shows full-screen preview of how this image will appear in the game
  - Demonstrates the reveal animation

**Section 5: Save Project**
- Button: "Save Project"
  - Saves all images and settings to a ZIP file
  - Uses project name as filename

**Section 6: Generate Game**
- Button: "Generate Playable Game"
  - Exports a standalone HTML file containing the complete game
  - Uses project name as filename

**Section 7: Reset**
- Button: "Reset All" (secondary styling, less prominent)
  - Clears all data and starts over

#### 5. Project Settings

**Position:** Below controls panel, always visible

**Purpose:** Configure project metadata and game appearance

**Visual Design:**
- White rounded card
- Centered "Load Project" button at top
- Settings fields below with clear labels
- Separated from button by a subtle divider line

**Settings Fields:**

1. **Project Name**
   - Purpose: Internal name for organizing work
   - Used as default filename when saving
   - Displayed in builder's title bar and browser tab

2. **Game Title**
   - Purpose: Title shown on game's title page and browser tab
   - Defaults to project name if left empty
   - Placeholder shows current default

3. **Explanation**
   - Purpose: Instructions shown on game's title page
   - Describes how to play the game
   - Appears below title before starting

4. **Next Button Label**
   - Purpose: Text shown on button to advance to next question
   - If left empty: No button shown, user clicks anywhere to advance
   - Placeholder: "Leave empty to click anywhere"

5. **Progress Label**
   - Purpose: Shows current position in game
   - Supports placeholders: {current} and {total}
   - Example: "Slide {current} of {total}"
   - If left empty: No progress indicator shown

6. **Completion Message**
   - Purpose: Message shown when all questions are answered
   - Displayed on final screen before "Play Again" button
   - If left empty: Shows default message

**Load Project Button:**
- Opens file picker to select a project ZIP file
- Restores all images, settings, and metadata
- Replaces current project entirely

### User Workflows

#### Creating a New Project

1. User opens builder (sees empty gallery with "+" card)
2. User adds images by:
   - Clicking "+" card to select files
   - Dragging files onto gallery
   - Either method supports multiple files at once
3. First image automatically selected and displayed on canvas
4. User draws selection rectangle by clicking and dragging on image
5. User enters question text
6. User enters answer text
7. User adjusts answer position by dragging the text on canvas
8. User customizes answer color and size as needed
9. User clicks next thumbnail to configure second image
10. Repeat steps 4-8 for each image
11. User sets project name and game settings
12. User saves project (creates ZIP file)
13. User generates game (creates HTML file)

#### Editing an Existing Project

1. User clicks "Load Project"
2. User selects previously saved ZIP file
3. All images appear in thumbnail gallery
4. All settings are restored
5. User clicks any thumbnail to edit that image
6. Changes are automatically saved to working state
7. User saves project when done to update ZIP file

#### Reordering Images

1. User clicks and drags a thumbnail
2. Visual feedback shows dragging state
3. User drops on another thumbnail's position
4. Images reorder in sequence
5. Numbering updates automatically

#### Previewing Animation

1. User clicks "Preview Game Animation"
2. Full-screen modal appears with black background
3. Animation plays showing:
   - Cropped section fades in with question below
   - User clicks cropped area
   - Cropped section zooms/moves to fit full image context
   - Full image appears
   - Answer text fades in
   - "Next" button or instruction appears
4. User closes preview with X button or escape

### Responsive Behavior

#### Large Screens (>1400px)
- Canvas and controls appear side-by-side
- Canvas takes remaining space (minimum 800px)
- Controls fixed at 400px width
- Maximizes available space for image editing

#### Medium Screens (800-1400px)
- Canvas appears above controls
- Both sections span full width
- Maintains usability with vertical scroll

#### Small Screens (<800px)
- All sections stack vertically
- Full width for all elements
- Touch-friendly controls
- Canvas scales to fit screen

## Player Application (Generated Game)

### Visual Design

**Color Scheme:** Matches builder with purple-blue gradient background

**Layout:** Full-screen, centered content

### Game Flow

#### Start Screen

**Visual Design:**
- Centered white card with rounded corners
- Large title (configurable via builder)
- Explanation text (configurable via builder)
- Large "Start Game" button

**Content:**
- Title: Game title from builder (or default)
- Description: Explanation from builder (or default)
- Button: "Start Game"

**Interaction:**
- Click "Start Game" to begin first question

#### Question Screen

**Visual Elements:**

1. **Cropped Image Section**
   - Displays selected rectangle from original image
   - Centered on screen
   - Sized to 75% of screen (leaving room for question)
   - Smooth fade-in animation (0.4 seconds)

2. **Question Text**
   - Appears below cropped image
   - Configured font size from builder
   - White text with shadow for visibility
   - Fades in simultaneously with image (0.4 seconds)

3. **Progress Indicator** (if configured)
   - Top-right corner
   - White rounded badge with shadow
   - Shows current position using configured format
   - Updates for each question

4. **Instruction/Button** (if configured)
   - Bottom center of screen
   - Either:
     - Button with configured label text, OR
     - "Click to reveal" instruction if no button
   - Pulsing animation to draw attention

**Animation Sequence:**

1. **Initial Display** (0.4s)
   - Cropped image fades in from transparent
   - Question text fades in from transparent
   - Both elements appear together smoothly

2. **User Click**
   - User clicks on cropped image area
   - Triggers reveal animation

3. **Reveal Animation** (2.0s total)
   - Cropped section smoothly scales up and repositions (1.2s)
   - Transforms to match its position in full image
   - Question text fades out (0.4s)
   - Full image fades in behind (1.0s)
   - After transformation completes:
     - Answer text fades in (0.8s)
     - Next button appears (if configured)
     - Screen becomes clickable everywhere (if no button)

**Interaction:**
- First click: Reveals full image and answer
- Second click/button: Advances to next question
- If button configured: Must click button to advance
- If no button: Click anywhere after reveal to advance

#### Completion Screen

**Visual Design:**
- Returns to start screen layout
- White centered card

**Content:**
- Title: "Game Complete!"
- Message: Configured completion message (or default)
- Button: "Play Again"

**Interaction:**
- Click "Play Again" to restart from first question
- All animations and interactions repeat

### Animation Details

**Timing:**
- Fade-in: 0.4 seconds (fast, smooth)
- Zoom/transform: 1.2 seconds (smooth, natural)
- Answer reveal: 0.8 seconds (gradual)
- All animations use easing curves for natural motion

**Visual Effects:**
- Text has dark shadows for readability on any background
- Optional stroke on answer text (configured in builder)
- Smooth transitions prevent jarring visual changes
- Progress indicator updates smoothly between questions

## File Formats

### Project Files (.zip)

**Purpose:** Save work in progress for later editing

**Contents:**
- `project.json` - All metadata and configurations
  - Image references (filenames)
  - Rectangle coordinates for each image
  - Question and answer data for each image
  - Project settings and game configuration
- `images/` folder - All uploaded images
  - Original filenames preserved
  - Full resolution retained

**Usage:**
- Load into builder to continue editing
- Share with others to collaborate
- Archive for future reference

### Game Files (.html)

**Purpose:** Standalone playable game

**Characteristics:**
- Single HTML file, no external dependencies
- Images embedded as data within file
- Works completely offline
- Can be shared via any method (email, USB, web hosting)
- Opens in any modern web browser
- File size depends on number and size of images

**Filename:** Uses project name (e.g., "Geography Quiz.html")

**Browser Tab Title:** Uses configured game title

## Key Features Summary

### Builder Features
- ✅ Multiple image support with visual thumbnail gallery
- ✅ Drag-and-drop file upload (single or multiple files)
- ✅ Visual rectangle selection on images
- ✅ Configurable question and answer text
- ✅ Answer positioning via drag-and-drop
- ✅ Customizable text size, color, and stroke
- ✅ Thumbnail reordering via drag-and-drop
- ✅ Preview animation before export
- ✅ Project save/load (ZIP format)
- ✅ Configurable game UI text (button labels, progress format, messages)
- ✅ Single-file game export (HTML)
- ✅ Responsive layout for different screen sizes
- ✅ Browser tab shows current project name

### Player Features
- ✅ Smooth fade-in animations
- ✅ Click-to-reveal interaction
- ✅ Full image zoom/pan reveal
- ✅ Configurable advancement (button or click-anywhere)
- ✅ Progress tracking with custom format
- ✅ Completion screen with replay option
- ✅ Fully offline capable
- ✅ No external dependencies
- ✅ Works on desktop and mobile browsers

## Design Principles

### Simplicity
- Minimal learning curve
- Clear visual hierarchy
- Obvious interaction patterns
- No hidden features or complex menus

### Visual Appeal
- Modern gradient aesthetics
- Smooth animations throughout
- Consistent spacing and shadows
- Professional appearance

### Flexibility
- Customizable text and colors
- Configurable game UI
- Support for any image size
- Adaptable layout for any screen

### Reliability
- Auto-save working state
- Clear feedback for all actions
- Graceful error handling
- Works offline once loaded

### Accessibility
- Large, clear text
- High contrast options
- Keyboard navigation support
- Touch-friendly controls

## Technical Requirements (User Perspective)

### Builder Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- No installation needed
- No internet connection needed (after loading)
- Enough disk space for images and exports

### Player Requirements
- Any modern web browser
- No internet connection needed
- No plugins or extensions required
- Works on desktop and mobile devices

## Distribution Model

### Builder Distribution
- Can be distributed as:
  - Three-file package (index.html, style.css, app.js)
  - Single HTML file (all-in-one, ~150 KB)
- Both options work identically
- Single-file version ideal for simple distribution

### Game Distribution
- Always single HTML file
- Can be:
  - Emailed as attachment
  - Hosted on any web server
  - Shared via cloud storage
  - Copied to USB drive
  - Embedded in learning management systems
- Recipient only needs to open in browser

## Future Enhancement Possibilities

### Builder Enhancements
- Audio narration support
- Timer/countdown option
- Multiple choice answers
- Scoring system
- Branching logic
- Image filters/effects
- Batch operations on multiple images
- Templates for common use cases
- Cloud save/sync
- Collaboration features

### Player Enhancements
- Keyboard shortcuts for navigation
- Fullscreen mode toggle
- Printable summary view
- Results export (for assessment)
- Accessibility improvements
- Multiple language support
- Social sharing features
- Embedded analytics

### Additional Features
- Video support instead of images
- Audio questions/answers
- Drawing/annotation tools
- Interactive hotspots on images
- Zoom functionality in player
- Mobile app versions
- LMS/SCORM integration
