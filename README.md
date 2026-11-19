# ElderEase

**Technology made simpler, safer, and easier for everyone.**

ElderEase is a front-end design-thinking prototype exploring how a simplified smartphone interface can reduce common usability barriers experienced by older adults and people who benefit from accessible interfaces.

## Problem statement
Some older adults may find smartphone interfaces difficult to use because of small text, small touch targets, complex navigation, and visual accessibility barriers.

## Proposed solution
ElderEase demonstrates a simplified home screen with large action cards, clear navigation, adjustable text size, high-contrast mode, extra spacing, and optional read-aloud instructions.

## Features
- Elder-friendly defaults: larger starting text (Large), bigger minimum font sizes, 56px touch targets, a big "← Home" button on every inner page, longer-lasting messages, reduced motion respected
- **Welcome screen first**: choose language, text size, contrast and voice help before the dashboard opens (reopen it any time with the 🌐 button)
- Large, clearly labelled action cards
- Emergency contact (editable, saved on device) on the welcome page and the Get help page; demo calls only
- Daily pills: mark as taken, add/remove pills, progress bar, resets every day, read aloud
- Messages: three sample messages with read-aloud and one-tap replies
- Feedback & testing: rating, comments, five usability tasks, testing log and CSV download
- New text is translated into English, Hindi and Kannada (Tamil shows English for the new parts until translated)
- Sample contacts and simulated call confirmation
- Help screen with an emergency-information demonstration
- Language option: English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ) and Tamil (தமிழ்), including read-aloud in the chosen language
- Adjustable text size with five levels: Small, Normal, Large, Larger, Largest
- High-contrast mode
- Extra spacing between action cards
- Settings (text size, contrast, spacing) are remembered on the device
- Keyboard-friendly: skip link, visible focus, Escape closes dialogs
- Browser text-to-speech for page instructions and sample messages
- Responsive layout for desktop, tablet, and mobile

## Run locally
1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. For the best experience, use Chrome or Edge and allow speech output if prompted by your device.

No build tools or package installation are required.

## Publish with GitHub Pages
1. Create a public GitHub repository named `ElderEase`.
2. Upload `index.html`, `style.css`, `script.js`, `translations.js`, `README.md`, and the `documentation` folder.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select **main** and **/(root)**, then Save.
6. Wait for GitHub Pages to publish the site. The URL will appear in the Pages section.

## Important prototype limitations
- Contacts are sample data and are not stored or synced.
- Call buttons are demonstrations and do not place calls.
- The emergency screen does not contact emergency services.
- Speech depends on browser and device support; Hindi and Kannada voices must be installed on the device.
- Telugu, Marathi and Bengali appear under "Other languages" but are not translated yet, so the app opens in English. To add one, copy the `en` block in `translations.js`, translate it, and remove `pending:true` from its `LANG_META` entry.
- Hindi and Kannada text was written for this prototype and should be reviewed by a native speaker before real use.
- This prototype is not a medical or emergency-response product.

## Design-thinking process
See [`documentation/design-thinking-process.md`](documentation/design-thinking-process.md).

## Evidence used to inform the problem
- [Effect of Age on the Touchscreen Manipulation Ability of Community-Dwelling Adults](https://pubmed.ncbi.nlm.nih.gov/33669980/)
- [How to design font size for older adults: A systematic literature review with a mobile device](https://pubmed.ncbi.nlm.nih.gov/35978796/)
- [Studying Older People with Visual Impairments Using Mainstream Smartphones with the Aid of the EziSmart Keypad and Apps](https://pubmed.ncbi.nlm.nih.gov/30371445/)

These studies informed the problem framing; they do not constitute user testing or prove that this prototype improves outcomes.
