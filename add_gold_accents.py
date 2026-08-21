from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

# Load the image
image_path = Path(r"d:\smart med\apps\web\public\images\website\home-hero-intelligence.png")
img = Image.open(image_path).convert('RGBA')

# Create a subtle gold overlay layer
gold_layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
gold_draw = ImageDraw.Draw(gold_layer)

# Gold color: #d6a756 (the accent color from the logo)
# Add subtle gold glows to badge/checkmark area (bottom right)
badge_center_x = int(img.width * 0.82)
badge_center_y = int(img.height * 0.75)

# Draw concentric circles around the badge for subtle glow
for radius in range(120, 50, 20):
    glow_alpha = int(40 * (1 - (radius - 50) / 70))
    glow_color = (214, 167, 86, glow_alpha)
    gold_draw.ellipse(
        [badge_center_x - radius, badge_center_y - radius,
         badge_center_x + radius, badge_center_y + radius],
        outline=glow_color,
        width=2
    )

# Add subtle gold accents to the scales (top right)
scales_center_x = int(img.width * 0.85)
scales_center_y = int(img.height * 0.15)

for radius in range(80, 30, 15):
    glow_alpha = int(35 * (1 - (radius - 30) / 50))
    glow_color = (214, 167, 86, glow_alpha)
    gold_draw.ellipse(
        [scales_center_x - radius, scales_center_y - radius,
         scales_center_x + radius, scales_center_y + radius],
        outline=glow_color,
        width=2
    )

# Blend the gold layer with the original image
gold_layer = gold_layer.filter(ImageFilter.GaussianBlur(radius=15))

# Composite the gold layer onto the original image
result = Image.alpha_composite(img, gold_layer)

# Save the modified image
result.save(image_path, 'PNG')
print(f"✓ Successfully added subtle gold accents to {image_path}")
print(f"  - Gold accent on badge/checkmark (bottom right)")
print(f"  - Gold accent on scales (top right)")
print(f"  - Subtle soft glows with 15px blur for smooth blending")
