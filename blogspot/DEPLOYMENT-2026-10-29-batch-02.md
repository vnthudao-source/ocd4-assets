# Blogger migration — batch 02

Published on 2026-10-29 (Asia/Ho_Chi_Minh).

## Scope

- ĐĂNG KÝ LÀM ẤN: https://www.thudao.com/p/an-trien.html
- OCD Exhibition: https://www.thudao.com/p/trien-lam.html
- Release: v1.0.1. Both Blogger bodies contain only the version comment and synchronous jsDelivr script.
- Existing v1.0.0 pages luyen-cong and giang-duong remain unchanged. The root manifest now lists all four migrated pages.

## Verification

- Captured current Blogger HTML matched the original archive before migration.
- Three simulation rounds verified exact source output while parsing and blocked late document.write calls.
- Both published CDN bundles returned HTTP 200, application/javascript, with bytes matching generated bundles.
- GitHub source for trien-lam has one additional final newline introduced by the web editor; no content differs. Its published bundle preserves the captured source exactly.
- Reopened both Blogger editors after saving and confirmed the saved bodies exactly match their respective versioned embeds.
- Normal and ?m=1 live pages load one application root and the correct v1.0.1 bundle; no website console errors were observed.
- Seal page: quantity increase/decrease and add/remove seal recalculate totals correctly; restored default total 1,200,000 VND. No registration order was submitted.
- Exhibition: 40 works, 27 students, four teams and two courses loaded. Search for Nguyễn Viết Đức returned three matching works; course-2 filter returned eight works. Reset filters and artwork lightbox open/close passed, with the artwork image fully loaded.

## Future updates

Edit blogspot/pages source on GitHub, generate a new unused release version, verify its public CDN files, then replace the version in the Blogger script URL. Do not overwrite published release bundles.
