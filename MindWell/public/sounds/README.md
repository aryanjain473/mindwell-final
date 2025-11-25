# Music & Sound Files Directory

## Where to Place Your Audio Files

Place your audio files in this directory (`public/sounds/`). The following files are expected:

### Required Sound Files:

1. **rain.mp3** - Gentle rain sounds
2. **ocean.mp3** - Ocean waves
3. **forest.mp3** - Forest/nature sounds
4. **waterfall.mp3** - Waterfall sounds
5. **thunder.mp3** - Thunderstorm sounds
6. **fireplace.mp3** - Fireplace crackling
7. **birds.mp3** - Birds chirping
8. **white-noise.mp3** - White noise

## File Format Requirements

- **Format**: MP3 (recommended) or WAV
- **Quality**: 128kbps or higher for good quality
- **Duration**: Ideally 5-10 minutes (files will loop automatically)
- **File Size**: Keep files under 5MB each for faster loading

## Where to Get Free Calming Sounds

You can find free, royalty-free calming sounds from:

1. **FreeSound.org** - https://freesound.org
   - Search for: "rain", "ocean waves", "forest", etc.
   - Filter by: CC0 License (free to use)

2. **Zapsplat** - https://www.zapsplat.com
   - Free sound effects library
   - Requires free account

3. **YouTube Audio Library** - https://studio.youtube.com
   - Free music and sound effects
   - No copyright issues

4. **Pixabay** - https://pixabay.com/music/
   - Free music and sound effects
   - No attribution required

## Adding Custom Sounds

To add your own custom sounds:

1. Place the audio file in this directory (`public/sounds/`)
2. Update the `soundOptions` array in `MusicListeningGame.tsx`
3. Add a new entry with:
   - `id`: unique identifier (e.g., 'custom-sound')
   - `name`: display name
   - `description`: brief description
   - `icon`: emoji or icon
   - `file`: path to file (e.g., '/sounds/custom-sound.mp3')
   - `color`: Tailwind gradient classes

Example:
```typescript
{
  id: 'custom-sound',
  name: 'My Custom Sound',
  description: 'Description here',
  icon: '🎵',
  file: '/sounds/custom-sound.mp3',
  color: 'from-purple-400 to-pink-400'
}
```

## Notes

- Files in the `public` folder are served statically
- Paths should start with `/sounds/` (not `/public/sounds/`)
- Files are loaded on-demand when selected
- Audio files loop automatically during playback

