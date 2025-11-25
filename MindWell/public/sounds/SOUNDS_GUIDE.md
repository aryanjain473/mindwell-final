# Complete Guide: Which Sounds to Download and Where to Get Them

## Required Sound Files for Music & Sound Therapy Game

You need to download **8 audio files** and place them in this directory (`public/sounds/`).

---

## 📋 Sound List with Download Links

### 1. 🌧️ **rain.mp3** - Gentle Rain Sounds
**What to look for:** Soft, steady rain without thunder
- **FreeSound.org**: Search "rain gentle" or "rain soft"
  - Direct link: https://freesound.org/search/?q=rain+gentle
  - Recommended: Look for files with "CC0" license (free to use)
  - Duration: 3-5 minutes (will loop)
  
- **Zapsplat**: https://www.zapsplat.com/sound-effect-categories/weather-sounds/
  - Search: "rain gentle" or "rain loop"
  
- **YouTube Audio Library**: https://studio.youtube.com/channel/UC/music
  - Search: "rain sounds" in the free music library

**File name must be:** `rain.mp3`

---

### 2. 🌊 **ocean.mp3** - Ocean Waves
**What to look for:** Calming ocean waves, beach sounds
- **FreeSound.org**: Search "ocean waves" or "beach waves"
  - Direct link: https://freesound.org/search/?q=ocean+waves
  - Look for: Continuous wave sounds, not single crashes
  
- **Pixabay**: https://pixabay.com/music/search/ocean/
  - Many free ocean wave tracks available
  
- **YouTube Audio Library**: Search "ocean" or "waves"

**File name must be:** `ocean.mp3`

---

### 3. 🌲 **forest.mp3** - Forest/Nature Sounds
**What to look for:** Birds, rustling leaves, peaceful forest ambience
- **FreeSound.org**: Search "forest ambience" or "nature sounds"
  - Direct link: https://freesound.org/search/?q=forest+ambience
  - Look for: Ambient forest sounds with birds
  
- **Pixabay**: https://pixabay.com/music/search/forest/
  - Many nature sound tracks
  
- **YouTube Audio Library**: Search "forest" or "nature"

**File name must be:** `forest.mp3`

---

### 4. 💧 **waterfall.mp3** - Waterfall Sounds
**What to look for:** Flowing water, waterfall ambience
- **FreeSound.org**: Search "waterfall" or "flowing water"
  - Direct link: https://freesound.org/search/?q=waterfall
  - Look for: Continuous flowing water sounds
  
- **Zapsplat**: Search "waterfall" or "water flow"
  
- **Pixabay**: https://pixabay.com/music/search/waterfall/

**File name must be:** `waterfall.mp3`

---

### 5. ⛈️ **thunder.mp3** - Thunderstorm
**What to look for:** Distant thunder with rain (not too loud)
- **FreeSound.org**: Search "thunderstorm distant" or "thunder rain"
  - Direct link: https://freesound.org/search/?q=thunderstorm
  - Look for: Distant, calming thunder (not scary/loud)
  
- **Zapsplat**: Search "thunderstorm" or "distant thunder"
  
- **Pixabay**: Search "thunderstorm"

**File name must be:** `thunder.mp3`

---

### 6. 🔥 **fireplace.mp3** - Fireplace Crackling
**What to look for:** Fire crackling, cozy fireplace sounds
- **FreeSound.org**: Search "fireplace" or "fire crackling"
  - Direct link: https://freesound.org/search/?q=fireplace
  - Look for: Continuous crackling sounds
  
- **Zapsplat**: Search "fireplace" or "fire crackling"
  
- **Pixabay**: https://pixabay.com/music/search/fireplace/

**File name must be:** `fireplace.mp3`

---

### 7. 🐦 **birds.mp3** - Birds Chirping
**What to look for:** Morning birds, peaceful bird sounds
- **FreeSound.org**: Search "birds chirping" or "morning birds"
  - Direct link: https://freesound.org/search/?q=birds+chirping
  - Look for: Calming bird sounds, not too many at once
  
- **Pixabay**: https://pixabay.com/music/search/birds/
  
- **YouTube Audio Library**: Search "birds"

**File name must be:** `birds.mp3`

---

### 8. ⚪ **white-noise.mp3** - White Noise
**What to look for:** Soothing white noise, static-like sound
- **FreeSound.org**: Search "white noise" or "pink noise"
  - Direct link: https://freesound.org/search/?q=white+noise
  - Look for: Smooth, consistent white noise
  
- **Pixabay**: Search "white noise"
  
- **Alternative**: You can generate white noise online at:
  - https://mynoise.net/NoiseMachines/whiteNoiseGenerator.php

**File name must be:** `white-noise.mp3`

---

## 🎯 Quick Download Guide

### Option 1: FreeSound.org (Recommended - Easiest)

1. Go to: https://freesound.org
2. Create a free account (required for downloads)
3. For each sound:
   - Search the sound name (e.g., "rain gentle")
   - Filter by: **CC0 License** (free, no attribution needed)
   - Click on a sound
   - Click "Download" button
   - Save as the exact filename (e.g., `rain.mp3`)

**Best searches:**
- "rain gentle loop"
- "ocean waves loop"
- "forest ambience"
- "waterfall continuous"
- "thunderstorm distant"
- "fireplace crackling loop"
- "birds chirping morning"
- "white noise smooth"

---

### Option 2: Pixabay (No Account Needed)

1. Go to: https://pixabay.com/music/
2. Search for each sound type
3. Filter by: **Free** and **No attribution required**
4. Download directly
5. Rename to exact filename

---

### Option 3: YouTube Audio Library

1. Go to: https://studio.youtube.com
2. Click "Audio Library" in left menu
3. Browse or search for sounds
4. Download (all are free to use)
5. Rename to exact filename

---

## 📝 File Naming Rules

**IMPORTANT:** Files must be named EXACTLY as shown:
- ✅ `rain.mp3` (correct)
- ❌ `Rain.mp3` (wrong - capital R)
- ❌ `rain-sound.mp3` (wrong - extra text)
- ❌ `rain.wav` (wrong - must be .mp3)

**All files must be:**
- Named exactly as listed above
- In `.mp3` format (or `.wav` if you update the code)
- Placed in `public/sounds/` folder

---

## 🎵 File Quality Recommendations

- **Format**: MP3
- **Bitrate**: 128 kbps or higher (192 kbps recommended)
- **Duration**: 3-5 minutes (will loop automatically)
- **File Size**: Under 5MB each
- **Sample Rate**: 44.1 kHz

---

## ✅ Quick Checklist

After downloading, verify:
- [ ] All 8 files are in `public/sounds/` folder
- [ ] File names match exactly (case-sensitive)
- [ ] All files are `.mp3` format
- [ ] Files play when you double-click them
- [ ] File sizes are reasonable (under 5MB each)

---

## 🚀 Testing Your Files

1. Start your development server: `npm run dev`
2. Go to: Wellness Games → Music & Sound Therapy
3. Try selecting each sound
4. If a sound doesn't play, check:
   - File name is correct
   - File is in `public/sounds/` folder
   - File format is MP3
   - Browser console for errors

---

## 💡 Pro Tips

1. **Look for "loop" versions** - These are designed to loop seamlessly
2. **Test before using** - Make sure sounds are calming, not jarring
3. **Keep files small** - Compress if needed (use online MP3 compressor)
4. **Use CC0 license** - No attribution needed, completely free
5. **Download multiple options** - Try different versions to find the best one

---

## 🔗 Direct Download Links (Example)

Here are some example direct links (may require FreeSound account):

- Rain: https://freesound.org/search/?q=rain+gentle+loop&f=license%3A%22cc0%22
- Ocean: https://freesound.org/search/?q=ocean+waves+loop&f=license%3A%22cc0%22
- Forest: https://freesound.org/search/?q=forest+ambience&f=license%3A%22cc0%22

**Note:** Always check the license before using. CC0 = completely free, no restrictions.

---

## 📞 Need Help?

If you can't find a specific sound:
1. Try different search terms
2. Check multiple sources
3. You can use placeholder sounds temporarily
4. Consider generating sounds using online tools

**Good luck! 🎵**

