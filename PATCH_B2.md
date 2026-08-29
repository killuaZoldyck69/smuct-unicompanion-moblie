# PATCH B2: Mobile Build-Blocking Config Fixes

## 1. Overview of Fixes
This patch resolves configuration defects in `smuct-unicompanion-moblie` that cause EAS build failures, Play Store rejections, and runtime visual regressions.

1. **Crisp Adaptive Icons (`app.json`)**: Replaced blurry 60px favicon references with the dedicated high-resolution adaptive icon foreground, background, and monochrome assets.
2. **Splash Screen Configuration (`app.json`)**: Configured the missing `splash` definition using `src/assets/splash-screen.png` and `#f7f9fb` background.
3. **Missing Native Build Plugins (`app.json`)**: Added required build plugins (`expo-secure-store`, `expo-image-picker` with photo permission string, `@react-native-picker/picker`) to ensure native permissions and bindings are generated during EAS prebuild/build.
4. **TypeScript Version Alignment (`package.json`)**: Downgraded from pre-release `"typescript": "~6.0.3"` to Expo SDK 56 recommended `"~5.8.3"`.
5. **Reduced Bundle Weight (`package.json`)**: Moved `"react-native-web"` from runtime `dependencies` to `devDependencies`.
6. **Code Quality & Linting Baseline**: Added ESLint (`eslint`, `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-native`) and Prettier configs (`.eslintrc.json`, `.prettierrc`) and scripts (`npm run lint`, `npm run typecheck`).

---

## 2. Updated Configuration Files

### `app.json`
```json
{
  "expo": {
    "name": "smuct-unicompanion-mobile",
    "slug": "smuct-unicompanion-mobile",
    "version": "1.0.0",
    "scheme": "smuct-unicompanion",
    "orientation": "portrait",
    "icon": "./src/assets/icons8-university-60.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./src/assets/splash-screen.png",
      "resizeMode": "contain",
      "backgroundColor": "#f7f9fb"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./src/assets/android-icon-foreground.png",
        "backgroundImage": "./src/assets/android-icon-background.png",
        "monochromeImage": "./src/assets/android-icon-monochrome.png"
      },
      "predictiveBackGestureEnabled": false,
      "package": "com.killuazoldyck.smuctunicompanionmobile"
    },
    "web": {
      "favicon": "./src/assets/icons8-university-60.png"
    },
    "plugins": [
      "expo-router",
      "expo-sharing",
      "@react-native-community/datetimepicker",
      "expo-font",
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos."
        }
      ],
      "@react-native-picker/picker"
    ],
    "extra": {
      "router": {},
      "eas": {
        "projectId": "e5163abb-47dc-4ffe-9cf6-40b794db19a3"
      }
    }
  }
}
```

---

## 3. Verification & Validation Checklist

### Verification 1: Asset Existence & Paths
- [x] `./src/assets/android-icon-foreground.png` (78.8 KB) confirmed on disk
- [x] `./src/assets/android-icon-background.png` (17.5 KB) confirmed on disk
- [x] `./src/assets/android-icon-monochrome.png` (4.1 KB) confirmed on disk
- [x] `./src/assets/splash-screen.png` (1.3 MB) confirmed on disk

### Verification 2: EAS / Prebuild Plugin Validation
- [x] `expo-secure-store` registered in `plugins`
- [x] `expo-image-picker` registered with `"photosPermission": "Allow $(PRODUCT_NAME) to access your photos."`
- [x] `@react-native-picker/picker` registered in `plugins`
- [x] `@react-native-community/datetimepicker`, `expo-router`, `expo-sharing`, `expo-font` intact

### Verification 3: TypeScript & Dependency Optimization
- [x] TypeScript downgraded to `~5.8.3`
- [x] `react-native-web` isolated in `devDependencies`
- [x] Linting rules established (`.eslintrc.json`, `.prettierrc`)
