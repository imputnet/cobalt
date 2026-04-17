#!/bin/bash
echo "Testing Cobalt UI Redesign..."
echo ""
echo "1. Checking Arabic translations..."
if [ -f "i18n/ar/general.json" ] && [ -f "i18n/ar/save.json" ]; then
  echo "✓ Arabic locale files found"
else
  echo "✗ Arabic locale files missing"
  exit 1
fi

echo ""
echo "2. Checking visualization component..."
if [ -f "src/components/visualization/AnimatedVisualization.svelte" ]; then
  echo "✓ Animated visualization component found"
else
  echo "✗ Visualization component missing"
  exit 1
fi

echo ""
echo "3. Checking sidebar modifications..."
if grep -q "IconSettings" src/components/sidebar/Sidebar.svelte && ! grep -q "IconHeart\|donate" src/components/sidebar/Sidebar.svelte; then
  echo "✓ Sidebar cleaned up (donate/updates removed)"
else
  echo "✗ Sidebar cleanup incomplete"
  exit 1
fi

echo ""
echo "4. Checking main page layout..."
if grep -q "visualization-wrapper" src/routes/+page.svelte; then
  echo "✓ Main page includes visualization wrapper"
else
  echo "✗ Visualization wrapper not found in main page"
  exit 1
fi

echo ""
echo "5. Checking CSS variables..."
if grep -q "glass-bg\|glass-blur\|--orange" src/app.css; then
  echo "✓ Glassmorphism CSS variables found"
else
  echo "✗ CSS variables missing"
  exit 1
fi

echo ""
echo "All tests passed!"
