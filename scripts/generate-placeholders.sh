#!/bin/bash
# Generate placeholder webp images for development
# Requires ImageMagick (brew install imagemagick)
# Run: bash scripts/generate-placeholders.sh

BOOKS_DIR="src/assets/books"
WIDTH=1080
HEIGHT=1610

generate_page() {
  local book=$1
  local page_num=$2
  local color=$3
  local gender=$4
  local output_path="$BOOKS_DIR/$book/Pages/$gender/page_$(printf '%03d' $page_num).webp"
  
  convert -size ${WIDTH}x${HEIGHT} "xc:$color" \
    -font Helvetica -pointsize 80 -fill white -gravity center \
    -annotate 0 "$book\nPage $page_num\n($gender)" \
    "$output_path" 2>/dev/null || \
  echo "Skipped $output_path (ImageMagick not installed)"
}

echo "Generating placeholder images..."

# ElDragonValiente - blue/teal
for i in $(seq 5 20); do
  generate_page "ElDragonValiente" $i "#61bfce" "boy"
  generate_page "ElDragonValiente" $i "#61bfce" "girl"
done

# LaEstrellaPerdida - dark blue
for i in $(seq 5 18); do
  generate_page "LaEstrellaPerdida" $i "#1a237e" "boy"
  generate_page "LaEstrellaPerdida" $i "#1a237e" "girl"
done

# ElOsoDormilon - brown
for i in $(seq 5 22); do
  generate_page "ElOsoDormilon" $i "#4e342e" "boy"
  generate_page "ElOsoDormilon" $i "#4e342e" "girl"
done

echo "Done! (If ImageMagick is not installed, empty placeholder files were kept)"
echo "Install ImageMagick: brew install imagemagick"
