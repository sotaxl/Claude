#!/bin/bash
# Run this script to generate PNG icons from the SVG source using rsvg-convert or Inkscape.
# The SVG source is below — save it as icon.svg then run:
#   rsvg-convert -w 16  -h 16  icon.svg -o icon-16.png
#   rsvg-convert -w 48  -h 48  icon.svg -o icon-48.png
#   rsvg-convert -w 128 -h 128 icon.svg -o icon-128.png

cat > icon.svg << 'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#0f0f0f"/>
  <!-- Outer ring -->
  <circle cx="64" cy="64" r="46" fill="none" stroke="white" stroke-width="6" opacity="0.9"/>
  <!-- Middle ring -->
  <circle cx="64" cy="64" r="28" fill="none" stroke="white" stroke-width="5" opacity="0.6"/>
  <!-- Centre dot -->
  <circle cx="64" cy="64" r="8" fill="white"/>
</svg>
SVG

echo "icon.svg written. Now run the rsvg-convert commands above."
