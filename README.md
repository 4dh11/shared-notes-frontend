# Shared Notes Frontend

A modern, responsive note-taking application built with React and Vite, featuring both web and mobile (Android) support through Capacitor. The app includes rich text editing, theme customization, wallpaper backgrounds, and secure password authentication.

## 🚀 Features

### Core Features
- **Rich Text Editor**: Full-featured markdown editor with formatting toolbar
- **Note Management**: Create, edit, delete, and pin notes
- **Search Functionality**: Search through note titles and content
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Theming & Customization
- **Dark/Light Themes**: Toggle between dark and light modes
- **Custom Wallpapers**: Set background wallpapers with adjustable dimming
- **Preset Wallpapers**: Choose from pre-installed wallpaper options

### Security & Privacy
- **Password Protection**: Secure app access with password authentication
- **Session Management**: Secure token-based authentication
- **Password Change**: Change app password from settings

### Mobile Support
- **Android App**: Native Android app built with Capacitor
- **Mobile-Optimized UI**: Touch-friendly interface with mobile gestures
- **Offline Capabilities**: Works with cached data when offline

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 3.4.17
- **Mobile Framework**: Capacitor 7.4.2
- **Routing**: React Router DOM 7.7.1
- **HTTP Client**: Axios 1.11.0
- **Icons**: Lucide React 0.533.0
- **Notifications**: React Hot Toast 2.5.2

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Android Studio (for mobile development)
- Java Development Kit (JDK 11 or higher)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd shared-notes-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_API_URL=https://shared-notes-backend.onrender.com
# Or for local development:
# VITE_API_URL=http://localhost:5001
```

### 4. Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## 📱 Mobile Development (Android)

### Prerequisites for Mobile
- Android Studio installed and configured
- Android SDK (API level 22 or higher)
- Capacitor CLI: `npm install -g @capacitor/cli`

### Mobile Development Commands
```bash
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android

# Run on device/emulator
npx cap run android
```

### Mobile Configuration
The app is configured in `capacitor.config.json`:
- **App ID**: `com.adhi.sharednotes`
- **App Name**: Shared Notes
- **Backend URL**: https://shared-notes-backend.onrender.com
- **Theme**: Dark theme optimized for mobile

## 🎨 Project Structure

```
src/
├── components/
│   ├── Header.jsx           # App header with navigation
│   ├── NotePage.jsx         # Rich text editor component
│   ├── SettingsPage.jsx     # Settings and preferences
│   └── HomePage.jsx         # Home page component
├── contexts/
│   └── ThemeContext.jsx     # Theme and settings context
├── utils/
│   ├── api.js              # API configuration
│   ├── markdownToHtml.js   # Markdown to HTML converter
│   └── htmlToMarkdown.js   # HTML to Markdown converter
├── App.jsx                 # Main app component
├── App.css                 # Global styles
└── main.jsx               # App entry point
```

## 🌐 API Integration

The app connects to a backend API for:
- User authentication
- Note CRUD operations
- Settings management
- Wallpaper presets

### API Configuration
- **Base URL**: Configured via `VITE_API_URL` environment variable
- **Authentication**: Token-based authentication stored in sessionStorage
- **Proxy**: Vite dev server proxies `/api` requests to backend

## 🎯 Key Components

### NotePage Component
- Rich text editor with markdown support
- Formatting toolbar (bold, italic, headings, lists)
- Auto-save functionality
- Pin/unpin notes
- Undo/redo operations

### Settings Page
- Theme switching (dark/light)
- Wallpaper selection and dimming
- Password change functionality
- Responsive accordion layout

### Theme System
- Context-based theme management
- Persistent theme storage
- Dynamic CSS classes based on theme
- Wallpaper with adjustable opacity overlay

## 🔐 Authentication Flow

1. **Initial Load**: Check for existing token in sessionStorage/localStorage
2. **Login Modal**: Secure password input with show/hide toggle
3. **Token Storage**: Store authentication token in sessionStorage
4. **Auto Logout**: Clear tokens on app close/refresh
5. **Session Management**: Handle token expiration and refresh

## 📦 Build & Deployment

### Web Deployment
```bash
# Build for production
npm run build

# The dist/ folder contains the built application
# Deploy the dist/ folder to your hosting service
```

### Android Build
```bash
# Build web assets
npm run build

# Sync with Android project
npx cap sync android

# Open in Android Studio to build APK/AAB
npx cap open android
```

## 🎨 Customization

### Theming
- Modify theme colors in Tailwind configuration
- Add new themes in `ThemeContext.jsx`
- Customize component styles in individual components

### Wallpapers
- Add new wallpaper presets in the backend
- Modify wallpaper dimming ranges in settings
- Customize background application logic

### Editor Features
- Extend formatting options in `NotePage.jsx`
- Add new markdown conversion rules
- Implement additional editor shortcuts

## 🔍 Troubleshooting

### Common Issues

**Development server won't start**
- Ensure Node.js version is 16+
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

**Mobile build fails**
- Check Android Studio and SDK installation
- Ensure Java JDK 11+ is installed
- Verify Capacitor configuration in `capacitor.config.json`

**API connection issues**
- Verify backend URL in environment variables
- Check network connectivity
- Ensure backend server is running and accessible

**Authentication problems**
- Clear browser storage: localStorage and sessionStorage
- Check if backend authentication endpoint is working
- Verify password correctness

### Performance Tips
- Enable React DevTools for debugging
- Use browser DevTools Network tab to monitor API calls
- Check Console for JavaScript errors
- Monitor bundle size with `npm run build`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages
5. Push to your branch: `git push origin feature-name`
6. Create a Pull Request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the excellent framework
- Vite for the fast build tool
- Tailwind CSS for utility-first styling
- Capacitor for mobile integration
- Lucide for beautiful icons

---

**Note**: This frontend is designed to work with the Shared Notes backend API. Ensure the backend is running and accessible before starting development.
