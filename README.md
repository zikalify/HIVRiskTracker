# HIV Risk Tracker

A privacy-first, offline-ready Progressive Web App (PWA) side project for personal health tracking. This is an educational tool that helps users organize sexual health information and screening history.

**Important:** This is an independent project and has not been medically validated, clinically tested, or endorsed by any healthcare organization.

## 🌟 Key Features

- **Risk Tracking**: Records encounters and calculates basic risk estimates based on partner status, gender identity, act type, and preventative measures (PrEP/Condoms/Circumcision) using publicly available health information.
- **WHO-Aligned Clinical Logic**: Evidence-based guidance for PrEP eligibility, PEP triggers, vaccine recommendations, and testing windows following WHO guidelines.
- **Privacy First**: 100% serverless. Your data never leaves your device. All information is stored locally in your browser's `localStorage`.
- **Personal Reminders**: Provides general health reminders and basic guidance based on your logged information. This is not medical advice.
- **Comprehensive Health Tracking**: Log and manage test results for HIV, Gonorrhea, Chlamydia, Syphilis, Hepatitis B & C, and Mpox with detailed result tracking and history.
- **Clinical Factor Monitoring**: Track STI status, new partners, injection drug use, and other clinical factors that affect risk assessment.
- **PrEP & PEP Management**: Track Pre-Exposure Prophylaxis (including on-demand 2-1-1 for MSM) and Post-Exposure Prophylaxis with start date monitoring and course guidance.
- **U=U Awareness**: Serodiscordant couple guidance highlighting that Undetectable = Untransmittable for HIV-positive partners on treatment.
- **Smart Validation**: Anatomical plausibility checks, future date prevention, and comprehensive schema validation for data imports.
- **Data Portability**: Full Export/Import functionality. Move your health history between devices securely via JSON backups with validation.
- **Daily Reminders**: Optional system notifications to help you stay consistent with your logs.
- **Offline Ready**: Works without an internet connection once installed, thanks to Service Worker integration with intelligent caching.

## 🎯 Design Principles

This personal project is built with these principles:
1. **Inclusivity**: Respects varied gender identities (Cis, Trans, Non-binary) and sexual roles.
2. **Organization**: Helps users organize their health information in one private place.
3. **Educational**: Provides general information based on publicly available health resources.

## 💾 Data Management

### Exporting Data
Users can download their entire profile and history as a `.json` file from the **Settings** tab. This allows for manual backups and migration to other browsers.

### Importing Data
Backups can be restored at any time. The app performs comprehensive schema validation to ensure file integrity and prevent corrupted data from being imported. **Note: Importing will overwrite your current local data.**

### Data Security Note
This app stores data locally in your browser using `localStorage`. Export files are **unencrypted JSON** by design — this allows for easy backup and migration, but means anyone with access to your export file can read its contents. Keep your export files secure and private.

## 🛠️ Tech Stack

- **Core**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **PWA**: Service Workers with intelligent caching for offline functionality and Manifest for mobile installation.
- **UI**: Modern glassmorphism design with custom CSS theming, responsive layout, and Material Symbols for a premium, accessible feel.
- **Icons**: Comprehensive PWA icon set (192px, 512px, maskable variants) for optimal display across devices.
- **Notifications**: Web Notifications API for daily reminders with service worker integration.

## 🚀 Try It Online

**Live Demo:** https://zikalify.github.io/HIVRiskTracker/

## 🚀 Installation & Usage

**Option 1: Use the Live Demo**
- Visit the link above in any modern browser
- No installation required

**Option 2: Local Installation**
1. **Clone the repository** to your local machine.
2. **Open `index.html`** in a modern browser.
3. **Install as PWA**: For the best experience, use the "Add to Home Screen" or "Install App" option in your browser menu.
4. **Log your first encounter**: Use the "+" button to start tracking.
5. **Configure your profile**: Fill in your identity, protection methods, and clinical factors in the "My Profile" tab for more accurate guidance.
6. **Set up testing history**: Log your latest test results for comprehensive risk assessment and personalized recommendations.

## ✅ Logic Validation

You can run local checks to catch regressions in risk/PEP logic:

- `npm run check:risk-matrix` — exhaustive combination sweep across user gender, partner gender, act type, partner status, condom use, and STI context.
- `npm run test:guidance` — targeted scenario checks for guidance logic.

The risk matrix script exits with a non-zero code if it finds outliers (for example, PEP on very low-risk routes or unexpected risk escalation in guarded combinations).

## ⚖️ Important Disclaimer

**This is a personal side project and NOT a medical device.**

- This application is for educational and organizational purposes only
- It does NOT provide medical diagnoses, treatment recommendations, or clinical advice
- Risk calculations are based on publicly available information and may not be accurate
- Always consult with qualified healthcare professionals for medical concerns
- This tool has NOT been medically validated, clinically tested, or approved by any regulatory body
- The creator is not a healthcare professional and this is not professional medical software

**For medical advice, testing, or treatment, please contact:**
- Your healthcare provider
- Local sexual health clinic
- Emergency services for urgent concerns

Use this tool at your own risk. The creator assumes no liability for any health decisions made based on this application.
