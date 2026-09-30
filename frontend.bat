@echo off
echo Creating frontend directory structure...

:: Create app routes (quoting paths to safely handle parentheses and brackets)
mkdir "src\app\(app)\brands\[brandId]"
mkdir "src\app\(app)\brief\new"
mkdir "src\app\(app)\packs\[packId]"
mkdir "src\app\(app)\calendar"
mkdir "src\app\(app)\eval"

:: Create component directories
mkdir src\components\ui
mkdir src\components\providers
mkdir src\components\effects
mkdir src\components\landing
mkdir src\components\brands
mkdir src\components\brief
mkdir src\components\pack
mkdir src\components\calendar
mkdir src\components\eval

:: Create hooks and lib directories
mkdir src\hooks
mkdir src\lib

:: Create app router files
type nul > src\app\layout.tsx
type nul > src\app\globals.css
type nul > src\app\page.tsx
type nul > "src\app\(app)\layout.tsx"
type nul > "src\app\(app)\brands\page.tsx"
type nul > "src\app\(app)\brands\[brandId]\page.tsx"
type nul > "src\app\(app)\brief\new\page.tsx"
type nul > "src\app\(app)\packs\[packId]\page.tsx"
type nul > "src\app\(app)\calendar\page.tsx"
type nul > "src\app\(app)\eval\page.tsx"

:: Create components - providers
type nul > src\components\providers\convex-provider.tsx
type nul > src\components\providers\smooth-scroll.tsx

:: Create components - effects
type nul > src\components\effects\custom-cursor.tsx
type nul > src\components\effects\wave-background.tsx
type nul > src\components\effects\magnetic.tsx
type nul > src\components\effects\reveal.tsx
type nul > src\components\effects\tilt-card.tsx

:: Create components - landing
type nul > src\components\landing\navbar.tsx
type nul > src\components\landing\hero.tsx
type nul > src\components\landing\character-carousel.tsx
type nul > src\components\landing\steps.tsx
type nul > src\components\landing\cta-card.tsx
type nul > src\components\landing\footer.tsx

:: Create components - brands
type nul > src\components\brands\brand-form.tsx
type nul > src\components\brands\past-posts-input.tsx
type nul > src\components\brands\voice-profile-card.tsx
type nul > src\components\brands\brand-picker.tsx

:: Create components - brief
type nul > src\components\brief\brief-form.tsx
type nul > src\components\brief\platform-picker.tsx
type nul > src\components\brief\generation-progress.tsx

:: Create components - pack
type nul > src\components\pack\post-card.tsx
type nul > src\components\pack\post-editor.tsx
type nul > src\components\pack\review-flags.tsx
type nul > src\components\pack\image-frame.tsx
type nul > src\components\pack\regenerate-menu.tsx
type nul > src\components\pack\trends-panel.tsx

:: Create components - calendar
type nul > src\components\calendar\calendar-grid.tsx
type nul > src\components\calendar\slot-card.tsx
type nul > src\components\calendar\auto-schedule-dialog.tsx

:: Create components - eval
type nul > src\components\eval\report-cards.tsx
type nul > src\components\eval\rating-table.tsx

:: Create hooks files
type nul > src\hooks\use-mouse-position.ts
type nul > src\hooks\use-selected-brand.ts
type nul > src\hooks\use-reduced-motion.ts

:: Create lib files
type nul > src\lib\utils.ts
type nul > src\lib\gsap.ts
type nul > src\lib\motion.ts
type nul > src\lib\constants.ts

echo Frontend structure created successfully!
pause