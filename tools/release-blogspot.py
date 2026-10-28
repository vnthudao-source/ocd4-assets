#!/usr/bin/env python3
"""Build immutable, parser-synchronous Blogger page releases from editable HTML."""
import argparse
import hashlib
import json
from pathlib import Path
import re


def build(root: Path, version: str):
    if not re.fullmatch(r'v[0-9]+\.[0-9]+\.[0-9]+', version):
        raise ValueError('Version must use vMAJOR.MINOR.PATCH')
    base = root / 'blogspot'
    release = base / 'releases' / version
    embeds = base / 'embeds' / version
    if release.exists() or embeds.exists():
        raise ValueError('Release already exists; use a new version. Never overwrite a published release.')
    pages = json.loads((base / 'manifest.json').read_text(encoding='utf-8'))
    prepared = []
    seen = set()
    for page in pages:
        slug = page['slug']
        if not re.fullmatch(r'[a-z0-9-]+', slug) or slug in seen:
            raise ValueError('Invalid or duplicate page slug: ' + slug)
        seen.add(slug)
        source = (base / 'pages' / (slug + '.html')).read_bytes()
        html = source.decode('utf-8')
        # A synchronous external script is expanded while Blogger's HTML parser
        # is active. This preserves inline scripts, globals, script order and
        # DOMContentLoaded handlers exactly as in the original Blogger body.
        # Refuse a late invocation so document.write can never replace the page.
        bundle = ('/* Thudao Blogspot ' + version + ' / ' + slug + ' */\n'
                  '(function(){"use strict";if(document.readyState!=="loading")'
                  '{throw new Error("Blogger embed must load synchronously during HTML parsing");}'
                  'document.write(' + json.dumps(html, ensure_ascii=True) + ');})();\n')
        url = 'https://cdn.jsdelivr.net/gh/vnthudao-source/ocd4-assets@main/blogspot/releases/' + version + '/' + slug + '.js'
        snippet = ('<!-- Thư Đạo · ' + slug + ' · ' + version + ' | Đổi số phiên bản trong URL khi nâng cấp. -->\n'
                   '<script src="' + url + '"></script>\n')
        prepared.append((page, bundle, snippet, hashlib.sha256(source).hexdigest()))
    release.mkdir(parents=True)
    embeds.mkdir(parents=True)
    metadata = []
    for page, bundle, snippet, digest in prepared:
        slug = page['slug']
        (release / (slug + '.js')).write_text(bundle, encoding='utf-8')
        (embeds / (slug + '.html')).write_text(snippet, encoding='utf-8')
        metadata.append(dict(page, version=version, source_sha256=digest))
    (release / 'manifest.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return len(prepared)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--version', required=True)
    args = parser.parse_args()
    try:
        count = build(args.root, args.version)
    except (ValueError, OSError) as error:
        parser.exit(1, str(error) + '\n')
    print(str(count) + ' pages built: ' + args.version)
