# Test Images for Story 2-3: Upload Validation

This directory contains test images for validation testing.

## Files:

### Format Validation
- `sample.jpg` - Valid JPEG image (800x600)
- `sample.png` - Valid PNG image (to be created)
- `sample.webp` - Valid WebP image (to be created)
- `document.pdf` - Invalid format (non-image)

### Size Validation
- `large-image.jpg` - 11MB file (exceeds 10MB limit)
- `small-file.jpg` - Very small file (to be created, < 10KB)

### Resolution Validation
- `low-res.jpg` - 100x100px (below 200x200 minimum)
- `high-res.jpg` - 9000x9000px (above 8192x8192 maximum)
- `normal-res.jpg` - 1920x1080px (within limits)

### Complexity Validation
- `simple-subject.jpg` - Single subject, clear style
- `complex-scene.jpg` - Multiple subjects (>5), complex scene
- `blurry.jpg` - Blurry/low quality image

### For First-Time Guide
- `good-example-1.jpg` - Single subject, static scene
- `good-example-2.jpg` - Clear style features
- `bad-example-1.jpg` - Multiple subjects
- `bad-example-2.jpg` - Dynamic action scene

Note: Files marked "(to be created)" need to be generated or sourced.
