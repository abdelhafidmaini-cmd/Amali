// Runs in CI after "cap add android". Tweaks the generated Android theme so the app
// sits below the status bar (Android 15+ otherwise draws web content underneath it)
// and the system bars match the app's dark colors. Safe to run more than once.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const file = 'android/app/src/main/res/values/styles.xml';

if (!existsSync(file)) {
  console.warn(`[patch-android] ${file} not found - skipping`);
  process.exit(0);
}

let xml = readFileSync(file, 'utf8');

if (xml.includes('windowOptOutEdgeToEdgeEnforcement')) {
  console.log('[patch-android] already patched');
  process.exit(0);
}

const styleOpen = /(<style\s+name="AppTheme\.NoActionBar"[^>]*>)/;
if (!styleOpen.test(xml)) {
  console.warn('[patch-android] AppTheme.NoActionBar not found - skipping');
  process.exit(0);
}

const items = [
  '        <item name="android:windowOptOutEdgeToEdgeEnforcement">true</item>',
  '        <item name="android:statusBarColor">#0F172A</item>',
  '        <item name="android:navigationBarColor">#0F172A</item>',
  '        <item name="android:windowLightStatusBar">false</item>',
].join('\n');

xml = xml.replace(styleOpen, `$1\n${items}`);
writeFileSync(file, xml);
console.log('[patch-android] theme patched');
