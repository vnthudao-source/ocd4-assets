#!/bin/sh
# Tạo bản rút gọn *.min.js cho các file JS chính (chạy lại sau mỗi lần sửa code).
# Cần esbuild: npx esbuild hoặc đường dẫn có sẵn trong biến ESBUILD.
ESBUILD=${ESBUILD:-npx esbuild}
for f in student-reward-core.js profile-market.js profile-pentagon.js profile-ranking.js student-work.js student-work-latest.js ocd-knowledge-core.js Npc/Npc.js minh-hong/minh-hong-footer.js dang-ky-lam-an/dang-ky-lam-an.js dang-ky-hoc/dang-ky-hoc.js dang-ky-hoc/lo-trinh-52.js dang-ky-hoc/tu-to.js nop-bai/nop-bai.js nop-bai/student-work-page.js; do
  [ -f "$f" ] || continue
  out="${f%.js}.min.js"
  CS=""; case "$f" in */lo-trinh-*|*/tu-to*) CS="--charset=utf8";; esac
  $ESBUILD "$f" --minify $CS --log-level=error --outfile="$out" && node --check "$out" && echo "$f -> $out"
done
