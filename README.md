# عملي (Amali)

Work / home rotation tracker, packaged as an Android app with [Capacitor](https://capacitorjs.com).

## Build the APK on GitHub

1. Push this folder to a GitHub repository (branch `main`).
2. Open the **Actions** tab → **Build Android APK** (it also runs on every push; use **Run workflow** to start it by hand).
3. When the run is green, open it and download the **amali-apk** artifact (a zip containing `amali.apk`).
4. Unzip, copy `amali.apk` to your phone and install it (allow "install unknown apps" if asked).

To publish the APK as a GitHub Release, push a tag such as `v1.0.0`.

The APK is a **debug-signed** build: installable on any phone, but not for Google Play.

## Project layout

| Path | What it is |
| --- | --- |
| `src/index.html` | The app (single page) |
| `src/input.css` | Tailwind entry + the app's custom CSS |
| `scripts/build-web.mjs` | Builds `www/` (HTML + compiled Tailwind + bundled fonts) |
| `scripts/patch-android.mjs` | Small theme tweak applied to the generated Android project |
| `capacitor.config.json` | App id (`com.amali.app`) and name |
| `.github/workflows/build-apk.yml` | The GitHub Actions build |

The `android/` project is generated fresh on every build, so there is nothing Android-specific to commit.

## Local build (optional)

```bash
npm install
npm run build        # creates www/
npx cap add android  # first time only
npm run android:sync
```
