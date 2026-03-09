# Demo Recording Guide

Technical setup and checklist for recording ECA demo videos.

---

## Equipment

### Screen Recording
- **macOS**: Screen Studio ($89, best quality) or OBS Studio (free)
- **Resolution**: 1920x1080 logical, 2x Retina (3840x2160 capture)
- **Frame rate**: Record at 60fps, export at 30fps
- **Format**: H.264, high quality preset
- **Audio**: External mic (Blue Yeti, Rode NT-USB, or similar), NOT laptop mic

### Cursor
- Use a large, clean cursor theme
- Enable click highlighting (Screen Studio has this built in)
- Move cursor deliberately - no jittery movements

---

## Browser Setup

### Chrome Configuration
1. Open Chrome in a clean profile (no extensions, no bookmarks bar)
2. Navigate to the app URL
3. Enter full-screen app mode: View -> Always Show Toolbar in Full Screen (OFF)
4. Or use Chrome's "Create Shortcut" -> "Open as window" for cleanest look
5. Disable browser notifications

### Window
- Position: centered on screen
- Size: exactly 1920x1080 (use a window sizing tool like Rectangle)
- Background: plain dark wallpaper (no desktop icons visible)

### Developer Tools
- Closed and hidden
- Console: clear any errors before recording

---

## App Setup

### Theme
- Use **dark mode** (the app default and most photogenic)
- Verify: click the theme toggle in the top-right toolbar area

### Language Mode
- Set to **Legal** (professional terminology)
- The "Legal/Plain" toggle in the AppBar should show "Legal"

### Demo Mode
- Navigate with `?demo=true` URL param to activate demo banner
- Or ensure the demo matter name starts with "DEMO-"
- Demo banner shows tour launch buttons

### Demo Account
```
Email: attorney@lawfirm.com
Password: Eca$Demo2026!
```

### Demo Data Requirements
- At least one matter with 100+ processed documents
- Enron matter (3,000+ docs) is ideal: matter `b0b4e94f-887d-485e-9166-f16ca565b7f6`
- Documents must be fully processed (text extracted, embeddings generated)
- At least some documents tagged as "relevant" for review/export scenes

### Pre-Recording Checklist
- [ ] App is running (production: app.ecasses.com, or local: localhost:3000)
- [ ] Logged in as demo account
- [ ] Dark mode active
- [ ] Legal language mode active
- [ ] Demo data loaded and searchable
- [ ] Browser clean (no bookmarks bar, no extensions visible)
- [ ] Notifications silenced (Do Not Disturb on macOS)
- [ ] Desktop clean (no icons, dark wallpaper)
- [ ] Recording software tested (audio levels, resolution)
- [ ] Cursor highlighting enabled
- [ ] Close all other apps (no dock bounce or notification popups)

---

## Recording Tips

### Pacing
- Wait 1-2 seconds after each click before moving the cursor
- Let animations complete before proceeding
- If something loads, show the loading state - don't cut it
- Speak slightly slower than conversational pace

### Click Sequences
- Move cursor to target
- Pause 0.5s (let viewer see where you're about to click)
- Click
- Pause 1s (let viewer see the result)
- Move to next target

### Mistakes
- Record each scene/step as a separate take
- If you make a mistake, stop, reset the UI state, and re-record that take
- Editing is easier than trying to nail it in one shot

### Narration
- Record voiceover separately from screen capture (easier to edit)
- Or record together if you're comfortable (Screen Studio supports this)
- Script is a guide, not verbatim - natural delivery is better than robotic reading
- Emphasize key differentiators: citations, defensibility, volume reduction

---

## Post-Production

### Editing
- Trim dead air (cursor sitting still with no narration)
- Add subtle transitions between scenes (0.3s crossfade, not fancy effects)
- Add text overlays for key stats ("95% volume reduction", "70.7% precision")
- Add chapter markers for the Feature Tour and Deep Dive videos

### Export Settings
- **Format**: H.264 MP4
- **Resolution**: 1920x1080
- **Bitrate**: 8-12 Mbps for YouTube, 4-6 Mbps for website embed
- **Audio**: AAC, 192kbps stereo

### Thumbnails
- Create a custom thumbnail for each video
- Include the ECA logo and video title
- Use a screenshot from the most visually impressive scene
- Dark background matching app aesthetic

---

## Video Destinations

| Video | Duration | Platform | Notes |
|-------|----------|----------|-------|
| Sizzle Reel | 60s | LinkedIn, Twitter, website hero | Auto-play muted, captions required |
| Feature Tour | 3-4 min | YouTube, website /how-it-works, sales deck | Chapter markers |
| Deep Dive | 8-10 min | YouTube, sales follow-up | Unlisted or gated |

### Captions
- All videos need captions (many viewers watch muted)
- Use YouTube's auto-caption and edit for accuracy
- Export SRT files for website embed players
