#!/data/data/com.termux/files/usr/bin/bash
# Apply Daftary TWA/APK fix and push to GitHub from Termux.
set -euo pipefail
pkg install -y git tar 2>/dev/null || true
termux-setup-storage 2>/dev/null || true

REPO="${HOME}/daftary-apk"
PACK=""
for c in \
  "$1" \
  "${HOME}/storage/downloads/daftary-twa-fix.tar.gz" \
  "${HOME}/storage/shared/Download/daftary-twa-fix.tar.gz" \
  "${HOME}/downloads/daftary-twa-fix.tar.gz" \
  "./daftary-twa-fix.tar.gz"
do
  if [ -n "${c:-}" ] && [ -f "$c" ]; then PACK="$c"; break; fi
done
if [ -z "$PACK" ]; then
  echo "حط ملف daftary-twa-fix.tar.gz في مجلد التحميلات ثم أعد التشغيل"
  exit 1
fi

if [ ! -d "$REPO/.git" ]; then
  git clone https://github.com/hosnielshrkawy-del/daftary-apk.git "$REPO"
fi
cd "$REPO"
git checkout main
git pull --rebase origin main || git pull origin main || true
tar -xzf "$PACK" -C "$REPO"
git add -A
git status
git commit -m "Fix TWA APK build + unstick splash" || echo "لا تغييرات للالتزام"
git push origin main
echo "تم. من GitHub: Actions ← Build Android TWA ← نزّل Daftary.apk"
