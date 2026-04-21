# HIV Risk Tracker

A privacy-first, offline-ready Progressive Web App (PWA) designed to help users track sexual health risks, manage screening history, and receive personalized clinical guidance based on WHO and CDC standards.

## 🌟 Key Features

- **WHO-Aligned Risk Engine**: Calculates risk scores for individual encounters based on partner status, gender identity, act type, and preventative measures (PrEP/Condoms/Circumcision).
- **Privacy First**: 100% serverless. Your health data never leaves your device. All data is stored locally in your browser's `localStorage`.
- **Smart Guidance**: Personalized advice that adapts to your profile and history. It provides proactive recommendations (like PrEP for key populations) even before encounters are logged, alongside emergency alerts (PEP windows) and routine health maintenance.
- **Data Portability**: Full Export/Import functionality. Move your health history between devices securely via JSON backups.
- **Daily Reminders**: Optional system notifications to help you stay consistent with your logs.
- **Offline Ready**: Works without an internet connection once installed, thanks to Service Worker integration.

## 🧬 Clinical Philosophy

The app is built with a focus on:
1. **Inclusivity**: Respects varied gender identities (Cis, Trans, Non-binary) and sexual roles without making generalized assumptions.
2. **Prioritization**: Guidance is tiered (Emergency > Clinical > Personal > Routine) to ensure critical information like PEP (Post-Exposure Prophylaxis) windows aren't missed.
3. **Plain Language**: Complex medical risk is translated into actionable, easy-to-understand advice.

## 💾 Data Management

### Exporting Data
Users can download their entire profile and history as a `.json` file from the **Settings** tab. This allows for manual backups and migration to other browsers.

### Importing Data
Backups can be restored at any time. The app performs a validation check to ensure the file integrity before overwriting the local state. **Note: Importing will overwrite your current local data.**

## �️ Tech Stack

- **Core**: HTML5, CSS3 (Vanilla), JavaScript (ES6+).
- **PWA**: Service Workers for offline caching and Manifest for mobile installation.
- **UI**: Modern glassmorphism design with Material Symbols for a premium, accessible feel.

## �🚀 Installation & Usage

1. **Clone the repository** to your local machine.
2. **Open `index.html`** in a modern browser.
3. **Install as PWA**: For the best experience, use the "Add to Home Screen" or "Install App" option in your browser menu.
4. **Log your first encounter**: Use the "+" button to start tracking.
5. **Configure your profile**: Fill in your identity and protection methods in the "My Profile" tab for more accurate guidance.

## ⚖️ Disclaimer

*This application is an educational tool and does not provide medical diagnoses. Always consult with a healthcare professional or visit a sexual health clinic for testing and personalized medical advice. This tool uses generalized WHO data for estimation purposes.*
