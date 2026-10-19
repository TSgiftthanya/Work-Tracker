#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Work Tracker build: assemble src/ into index.html.

Source of truth = src/ (template + js/*.js + css/*.css). index.html is generated.

Modes:
  python3 build.py              -> EXTERNAL (default): index.html references /assets/js|css/*
                                   (server.py serves them via the /assets/ route). Edit a module,
                                   run build once, reload the browser.
  python3 build.py --inline     -> single self-contained index.html (every module inlined).
  python3 build.py --check      -> verify current index.html == a fresh EXTERNAL build (sha256).
  python3 build.py --check --inline -> compare against a fresh INLINE build.

Load order = numeric prefix of src/js (00-core-main first); modules are classic scripts that share
one top-level scope, so order must be preserved. External <script src> (no defer/async) execute in
document order, exactly like the inline version.
"""
import io, os, re, sys, hashlib
APP = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(APP, "src")
TPL = os.path.join(SRC, "index.template.html")
OUT = os.path.join(APP, "index.html")

def build(external=True):
    tpl = io.open(TPL, encoding="utf-8").read()
    if external:
        # <script><!--INC:js/x.js--></script>  ->  <script src="/assets/js/x.js"></script>
        tpl = re.sub(r'<script><!--INC:(js/[^>]+?)--></script>',
                     lambda m: '<script src="/assets/%s"></script>' % m.group(1).strip(), tpl)
        # <style id="X"><!--INC:css/X.css--></style>  ->  <link rel="stylesheet" id="X" href="/assets/css/X.css">
        tpl = re.sub(r'<style id="([^"]+)"><!--INC:(css/[^>]+?)--></style>',
                     lambda m: '<link rel="stylesheet" id="%s" href="/assets/%s">' % (m.group(1), m.group(2).strip()), tpl)
        if "<!--INC:" in tpl:
            raise SystemExit("ERROR: unresolved INC markers (external) — check template form")
        return tpl
    # inline mode
    missing = []
    def repl(m):
        rel = m.group(1).strip(); p = os.path.join(SRC, rel)
        if not os.path.exists(p): missing.append(rel); return m.group(0)
        return io.open(p, encoding="utf-8").read()
    out = re.sub(r"<!--INC:([^>]+?)-->", repl, tpl)
    if missing: raise SystemExit("ERROR: missing module files: " + ", ".join(missing))
    if "<!--INC:" in out: raise SystemExit("ERROR: unresolved INC markers (inline)")
    return out

if __name__ == "__main__":
    inline = "--inline" in sys.argv
    out = build(external=not inline)
    if "--check" in sys.argv:
        cur = io.open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
        h1 = hashlib.sha256(out.encode()).hexdigest(); h2 = hashlib.sha256(cur.encode()).hexdigest()
        print("mode  :", "inline" if inline else "external")
        print("build :", h1); print("index :", h2)
        print("MATCH" if h1 == h2 else "DIFFERENT (run build.py to regenerate)")
        sys.exit(0 if h1 == h2 else 1)
    io.open(OUT, "w", encoding="utf-8").write(out)
    n = len(re.findall(r"<!--INC:", io.open(TPL, encoding="utf-8").read()))
    print("built index.html (%d bytes, %s) from %d modules" % (len(out), "inline" if inline else "external", n))
