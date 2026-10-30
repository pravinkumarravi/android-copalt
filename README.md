# Cobalt Android TV

Chromium-based Android TV application built to follow Google's Cobalt specifications ([overview documentation](https://developers.google.com/youtube/cobalt/docs/overview)).

## Architecture

- **Chromium / Cobalt Runtime (`CobaltChromiumConfigurator.kt`)**:
  - Implements Cobalt TV User-Agent header (`Cobalt/23.lts.4-devel`, `Chrome/88... SmartTV`).
  - Configures non-gesture media autoplay (`mediaPlaybackRequiresUserGesture = false`).
  - Hardware accelerated view rendering pipeline for living room displays.
  - Full DOM storage, IndexedDB, cookies, and mixed-content support.

- **TV Remote Navigation (`TvRemoteHandler.kt`)**:
  - Spatial navigation events for D-Pad (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Enter`).
  - Media key controls mapped directly to HTML5 video elements (`PLAY`, `PAUSE`, `FAST_FORWARD`, `REWIND`).
  - Virtual TV pointer cursor overlay toggleable via remote `Menu` / Red key.

- **Leanback Launcher (`AndroidManifest.xml`)**:
  - Android TV `LEANBACK_LAUNCHER` entrypoint.
  - HD 16:9 TV Banner (`tv_banner.xml`) and launcher icon.
  - Dedicated landscape orientation with immersive sticky fullscreen mode.

## Build and Install

```bash
# Build the APK
./gradlew assembleDebug

# Deploy to your Android TV device via ADB
adb connect <TV_IP_ADDRESS>:5555
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

