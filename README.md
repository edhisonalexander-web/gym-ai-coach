# 🏋️ Gym AI Coach

AI-powered gym exercise detection and form analysis app

## 📱 Platforms
- iOS
- Android

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g eas-cli`
- Expo account (free): https://expo.dev

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/edhisonalexander-web/gym-ai-coach.git
cd gym-ai-coach

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

### Running on Devices

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📦 Building for Production

### Android (Google Play Store)

```bash
# Build APK for Play Store
npm run build:android

# Or use EAS
eas build --platform android --profile production
```

### iOS (App Store)

```bash
# Build IPA for App Store
npm run build:ios

# Or use EAS
eas build --platform ios --profile production
```

## 🔥 Firebase Setup

This project uses Firebase for:
- Authentication
- Firestore Database
- Storage

### Firebase Configuration

Your Firebase config is in `firebaseConfig.js`

To add Firebase to iOS and Android:

1. **Android**: Download `google-services.json` from Firebase Console
2. **iOS**: Download `GoogleService-Info.plist` from Firebase Console

### Firebase Services Available

```javascript
import { auth, db, storage } from './firebaseConfig';

// Authentication
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Firestore
import { getDoc, setDoc, collection, query } from 'firebase/firestore';

// Storage
import { ref, uploadBytes, getBytes } from 'firebase/storage';
```

## 📋 Project Structure

```
gym-ai-coach/
├── App.js                 # Main app component
├── firebaseConfig.js      # Firebase configuration
├── app.json              # Expo configuration
├── eas.json              # EAS build configuration
├── package.json          # Dependencies
├── babel.config.js       # Babel configuration
└── README.md             # This file
```

## 🔐 Environment Variables

Create a `.env` file (not tracked by git):

```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
```

## 📚 Useful Links

- [Expo Documentation](https://docs.expo.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Documentation](https://reactnative.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

Created by Edhison Alexander