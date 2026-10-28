import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).with_name('release-blogspot.py')


class ReleaseTests(unittest.TestCase):
    def build(self, root, version='v1.0.0'):
        return subprocess.run(['python3', str(SCRIPT), '--root', str(root), '--version', version], capture_output=True, text=True)

    def fixture(self, root):
        (root / 'blogspot/pages').mkdir(parents=True)
        source = '<div id="test">Thư Đạo \\ ` ${x}</div>\n<script>window.example=1;</script>\r\n'
        (root / 'blogspot/pages/test.html').write_bytes(source.encode())
        (root / 'blogspot/manifest.json').write_text(json.dumps([{'slug':'test', 'id':'1', 'title':'Thử', 'url':'https://www.thudao.com/p/test.html'}]))
        return source

    def test_release_preserves_source_and_parser_timing(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); source=self.fixture(root)
            result=self.build(root)
            self.assertEqual(result.returncode, 0, result.stderr)
            bundle=root/'blogspot/releases/v1.0.0/test.js'
            result=subprocess.run(['node','-e', 'const fs=require("fs"),vm=require("vm");let out="";vm.runInNewContext(fs.readFileSync(process.argv[1],"utf8"),{document:{readyState:"loading",write:s=>out+=s}});process.stdout.write(out);',str(bundle)],capture_output=True)
            self.assertEqual(result.returncode,0,result.stderr)
            self.assertEqual(result.stdout,source.encode())
            snippet=(root/'blogspot/embeds/v1.0.0/test.html').read_text()
            self.assertIn('@main/blogspot/releases/v1.0.0/test.js',snippet)
            self.assertNotIn(' async',snippet)
            self.assertNotIn(' defer',snippet)
            result=subprocess.run(['node','-e','const fs=require("fs"),vm=require("vm");let called=false;try{vm.runInNewContext(fs.readFileSync(process.argv[1],"utf8"),{document:{readyState:"complete",write:()=>called=true}})}catch(e){}if(called)process.exit(1);',str(bundle)])
            self.assertEqual(result.returncode,0)

    def test_existing_release_cannot_be_overwritten(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); self.fixture(root)
            self.assertEqual(self.build(root).returncode,0)
            before=(root/'blogspot/releases/v1.0.0/test.js').read_bytes()
            (root/'blogspot/pages/test.html').write_text('changed')
            self.assertNotEqual(self.build(root).returncode,0)
            self.assertEqual((root/'blogspot/releases/v1.0.0/test.js').read_bytes(),before)

    def test_invalid_version_does_not_create_files(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); self.fixture(root)
            self.assertNotEqual(self.build(root,'../escape').returncode,0)
            self.assertFalse((root/'blogspot/releases').exists())


if __name__=='__main__':
    unittest.main()
