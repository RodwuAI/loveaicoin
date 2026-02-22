#!/bin/bash

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SRC_FILE="file:///Users/fiveowu/.openclaw/workspace/projects/lac/social-assets/src/design.html"
OUT_DIR="/Users/fiveowu/.openclaw/workspace/projects/lac/social-assets"

# Create output dir if not exists
mkdir -p "$OUT_DIR"

# 1. Twitter Avatar (400x400)
# We need to render just the #twitter-avatar element. 
# Headless chrome screenshot takes the whole viewport. We need to set window size exactly.
# Note: Chrome headless screenshot takes the *viewport*. We placed elements in separate divs.
# To screenshot individual elements cleanly, the easiest way with basic headless chrome is to
# have separate HTML files or use JS to hide others.
# Or simpler: Make the body size match the target and only show one element.
# Let's create temporary HTML files for each to ensure perfect sizing without extra whitespace.

# Function to generate single asset HTML
generate_html() {
    ID=$1
    WIDTH=$2
    HEIGHT=$3
    OUT_HTML="$OUT_DIR/temp_$ID.html"
    
    # Extract the styles and the specific div
    cat > "$OUT_HTML" <<EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');
        :root { --navy: #1B2D6B; --gold: #C5975B; --light-gold: #D4B88C; --white: #FFFFFF; }
        body { margin: 0; padding: 0; overflow: hidden; }
        
        /* Copying styles from main design file (simplified for compactness in script) */
        .container { position: relative; overflow: hidden; box-sizing: border-box; }
        
        .twitter-avatar { width: ${WIDTH}px; height: ${HEIGHT}px; background-color: var(--navy); display: flex; justify-content: center; align-items: center; }
        .twitter-avatar img { width: 280px; height: auto; }
        .twitter-avatar.white-bg { background-color: var(--white); }

        .twitter-banner { width: ${WIDTH}px; height: ${HEIGHT}px; background: linear-gradient(105deg, var(--white) 60%, #f4f6f9 100%); display: flex; flex-direction: row; padding: 60px 80px; position: relative; }
        .banner-left { flex: 1; display: flex; flex-direction: column; justify-content: center; z-index: 2; }
        .banner-logo-group { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        .banner-logo { width: 100px; height: auto; }
        .banner-title { font-size: 64px; font-weight: 700; color: var(--navy); margin: 0; letter-spacing: -1px; font-family: 'Inter', sans-serif; }
        .banner-right { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: flex-end; text-align: right; z-index: 2; }
        .banner-slogan-main { font-size: 48px; font-weight: 700; color: var(--navy); margin-bottom: 15px; font-family: 'Noto Sans SC', sans-serif; }
        .banner-slogan-sub { font-size: 28px; color: var(--gold); font-weight: 500; text-transform: uppercase; letter-spacing: 1px; font-family: 'Inter', sans-serif; }
        
        .accent-circle { position: absolute; border-radius: 50%; z-index: 1; }
        .ac-1 { width: 400px; height: 400px; border: 2px solid rgba(197, 151, 91, 0.1); top: -100px; right: -50px; }
        .ac-2 { width: 150px; height: 150px; background: var(--navy); opacity: 0.03; bottom: 50px; left: 400px; }
        .ac-3 { width: 20px; height: 20px; background: var(--gold); top: 120px; left: 80px; border-radius: 50%; }

        .discord-avatar { width: ${WIDTH}px; height: ${HEIGHT}px; background-color: var(--white); display: flex; justify-content: center; align-items: center; position: relative; }
        .discord-avatar img { width: 350px; }
        .discord-avatar::after { content: ''; position: absolute; width: 480px; height: 480px; border: 4px solid var(--gold); border-radius: 50%; opacity: 0.2; }

        .post-dark { width: ${WIDTH}px; height: ${HEIGHT}px; background-color: var(--navy); color: var(--white); display: flex; flex-direction: column; padding: 60px; position: relative; font-family: 'Inter', sans-serif; }
        .post-light { width: ${WIDTH}px; height: ${HEIGHT}px; background-color: var(--white); color: var(--navy); display: flex; flex-direction: column; padding: 60px; position: relative; font-family: 'Inter', sans-serif; }
        .post-header { display: flex; align-items: center; gap: 15px; }
        .post-logo { height: 40px; }
        .post-brand { font-size: 24px; font-weight: 700; letter-spacing: 1px; }
        .post-content { flex: 1; display: flex; align-items: center; justify-content: center; }
        .post-title-placeholder { font-size: 64px; font-weight: 700; text-align: center; line-height: 1.2; }
        .post-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255, 0.1); padding-top: 30px; }
        .post-light .post-footer { border-top: 1px solid rgba(27, 45, 107, 0.1); }
        .post-url { font-size: 24px; font-weight: 500; color: var(--gold); }
        .post-social-icons { display: flex; gap: 20px; opacity: 0.6; }
        .icon-box { width: 32px; height: 32px; background: currentColor; border-radius: 50%; }
    </style>
</head>
<body>
EOF
    
    # Extract the specific div content from the source file
    # We use sed to grab the block between <div id="$ID"... and the closing </div>
    # A bit hacky but sufficient for this specific controlled file.
    # Actually, let's just manually re-output the HTML content here to be safe and precise.
    
    if [ "$ID" == "twitter-avatar" ]; then
        echo '<div class="container twitter-avatar white-bg"><img src="/Users/fiveowu/.openclaw/workspace/projects/lac/lac-website/public/logo.png"></div>' >> "$OUT_HTML"
    elif [ "$ID" == "twitter-banner" ]; then
        echo '<div class="container twitter-banner"><div class="accent-circle ac-1"></div><div class="accent-circle ac-2"></div><div class="accent-circle ac-3"></div><div class="banner-left"><div class="banner-logo-group"><img src="/Users/fiveowu/.openclaw/workspace/projects/lac/lac-website/public/logo.png" class="banner-logo"><h1 class="banner-title">Love AI Coin</h1></div></div><div class="banner-right"><div class="banner-slogan-main">来自AI的第一封邀请函</div><div class="banner-slogan-sub">Learn to Mine, Embrace the Future</div></div></div>' >> "$OUT_HTML"
    elif [ "$ID" == "discord-avatar" ]; then
        echo '<div class="container discord-avatar"><img src="/Users/fiveowu/.openclaw/workspace/projects/lac/lac-website/public/logo.png"></div>' >> "$OUT_HTML"
    elif [ "$ID" == "post-dark" ]; then
        echo '<div class="container post-dark"><div class="post-header"><img src="/Users/fiveowu/.openclaw/workspace/projects/lac/lac-website/public/logo.png" class="post-logo" style="filter: brightness(100);"><span class="post-brand">LAC</span></div><div class="post-content"><div class="post-title-placeholder">YOUR HEADLINE<br>GOES HERE</div></div><div class="post-footer"><div class="post-url">loveaicoin.com</div><div class="post-social-icons"><div class="icon-box"></div><div class="icon-box"></div></div></div></div>' >> "$OUT_HTML"
    elif [ "$ID" == "post-light" ]; then
        echo '<div class="container post-light"><div class="post-header"><img src="/Users/fiveowu/.openclaw/workspace/projects/lac/lac-website/public/logo.png" class="post-logo"><span class="post-brand">LAC</span></div><div class="post-content"><div class="post-title-placeholder">YOUR HEADLINE<br>GOES HERE</div></div><div class="post-footer"><div class="post-url">loveaicoin.com</div><div class="post-social-icons"><div class="icon-box"></div><div class="icon-box"></div></div></div></div>' >> "$OUT_HTML"
    fi

    echo "</body></html>" >> "$OUT_HTML"
}

# Generate Screens
echo "Generating Twitter Avatar..."
generate_html "twitter-avatar" 400 400
"$CHROME" --headless --disable-gpu --no-sandbox --screenshot="$OUT_DIR/twitter-avatar.png" --window-size=400,400 "file://$OUT_DIR/temp_twitter-avatar.html"

echo "Generating Twitter Banner..."
generate_html "twitter-banner" 1500 500
"$CHROME" --headless --disable-gpu --no-sandbox --screenshot="$OUT_DIR/twitter-banner.png" --window-size=1500,500 "file://$OUT_DIR/temp_twitter-banner.html"

echo "Generating Discord Avatar..."
generate_html "discord-avatar" 512 512
"$CHROME" --headless --disable-gpu --no-sandbox --screenshot="$OUT_DIR/discord-avatar.png" --window-size=512,512 "file://$OUT_DIR/temp_discord-avatar.html"

echo "Generating Post Template Dark..."
generate_html "post-dark" 1200 675
"$CHROME" --headless --disable-gpu --no-sandbox --screenshot="$OUT_DIR/post-template-dark.png" --window-size=1200,675 "file://$OUT_DIR/temp_post-dark.html"

echo "Generating Post Template Light..."
generate_html "post-light" 1200 675
"$CHROME" --headless --disable-gpu --no-sandbox --screenshot="$OUT_DIR/post-template-light.png" --window-size=1200,675 "file://$OUT_DIR/temp_post-light.html"

# Cleanup
rm "$OUT_DIR"/temp_*.html
