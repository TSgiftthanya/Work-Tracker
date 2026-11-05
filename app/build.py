#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Work Tracker build: assemble src/ into index.html.

Source of truth = src/ (template + js/*.js + css/*.css). index.html is generated.

Modes:
  python3 build.py              -> EXTERNAL (default): ONE bundled, versioned script.
                                   All top-level scripts (js modules + the template's inline
                                   scripts) are concatenated IN DOCUMENT ORDER into
                                   src/js/app.bundle.js and loaded once at the end of <body>
                                   (after all modal DOM is parsed). CSS stays per-file but
                                   versioned. server.py serves /assets/* with a long cache;
                                   the ?v=<hash> query busts it on any change.
  python3 build.py --inline     -> single self-contained index.html (every module inlined).
  python3 build.py --check      -> verify index.html AND src/js/app.bundle.js match a fresh
                                   EXTERNAL build (sha256).
  python3 build.py --check --inline -> compare index.html against a fresh INLINE build.

Why bundle at end-of-body: the template interleaves feature scripts with their modal DOM, so
some modules read their modal at load time. Concatenating in document order and running after
the whole body is parsed preserves execution order AND guarantees every element exists.
"""
import io, os, re, sys, hashlib
APP = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(APP, "src")
TPL = os.path.join(SRC, "index.template.html")
OUT = os.path.join(APP, "index.html")
BUNDLE_REL = "js/app.bundle.js"                 # served at /assets/js/app.bundle.js
BUNDLE_OUT = os.path.join(SRC, BUNDLE_REL)

CSS_INC_RE = re.compile(r'<style id="([^"]+)"><!--INC:(css/[^>]+?)--></style>')
SCRIPT_RE  = re.compile(r'<script\b[^>]*>.*?</script>', re.S)
JS_INC_TAG = re.compile(r'^<script><!--INC:(js/[^>]+?)--></script>$')


def _read(rel):
    return io.open(os.path.join(SRC, rel), encoding="utf-8").read()


def build_external():
    """Return (html, bundle_js). html references ONE versioned bundle + versioned CSS links."""
    tpl = io.open(TPL, encoding="utf-8").read()
    first = tpl.find('<script><!--INC:js/')
    if first < 0:
        raise SystemExit("ERROR: no js INC markers found in template")
    head, tail = tpl[:first], tpl[first:]   # head holds <!--WT_BOOT--> + CSS; tail holds scripts + modals

    # Pull every <script>...</script> out of the tail, in order, into the bundle; keep modal DOM.
    parts = []
    def take(m):
        tag = m.group(0)
        inc = JS_INC_TAG.match(tag)
        if inc:
            rel = inc.group(1).strip()
            p = os.path.join(SRC, rel)
            if not os.path.exists(p):
                raise SystemExit("ERROR: missing module file: " + rel)
            parts.append("/* %s */\n%s" % (rel, _read(rel)))
        else:
            inner = re.match(r'<script\b[^>]*>(.*)</script>$', tag, re.S).group(1)
            parts.append("/* inline */\n%s" % inner)
        return ""  # remove the tag from the HTML
    tail_wo = SCRIPT_RE.sub(take, tail)
    bundle_js = "\n;\n".join(parts) + "\n"

    # Version hash from everything that affects the served assets (bundle + all CSS).
    css_blob = "".join(sorted(_read("css/" + f) for f in os.listdir(os.path.join(SRC, "css")) if f.endswith(".css")))
    ver = hashlib.sha256((bundle_js + css_blob).encode()).hexdigest()[:10]

    out = head + tail_wo
    # CSS: <style id><!--INC:css/X--></style> -> versioned <link>
    out = CSS_INC_RE.sub(
        lambda m: '<link rel="stylesheet" id="%s" href="/assets/%s?v=%s">' % (m.group(1), m.group(2).strip(), ver),
        out)
    # One versioned bundle, loaded at end of body (after all modals; after WT_BOOT which stays inline).
    bundle_tag = '<script src="/assets/%s?v=%s"></script>' % (BUNDLE_REL, ver)
    if "</body>" not in out:
        raise SystemExit("ERROR: template has no </body>")
    out = out.replace("</body>", bundle_tag + "</body>", 1)

    if "<!--INC:" in out:
        raise SystemExit("ERROR: unresolved INC markers after external build")
    return out, bundle_js


def build_inline():
    tpl = io.open(TPL, encoding="utf-8").read()
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
    check  = "--check" in sys.argv

    if inline:
        out = build_inline(); bundle_js = None
    else:
        out, bundle_js = build_external()

    if check:
        cur = io.open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
        h1 = hashlib.sha256(out.encode()).hexdigest(); h2 = hashlib.sha256(cur.encode()).hexdigest()
        ok = (h1 == h2)
        print("mode  :", "inline" if inline else "external")
        print("build :", h1); print("index :", h2)
        if not inline:
            curb = io.open(BUNDLE_OUT, encoding="utf-8").read() if os.path.exists(BUNDLE_OUT) else ""
            b1 = hashlib.sha256(bundle_js.encode()).hexdigest(); b2 = hashlib.sha256(curb.encode()).hexdigest()
            print("bundle(build):", b1); print("bundle(file ):", b2)
            ok = ok and (b1 == b2)
        print("MATCH" if ok else "DIFFERENT (run build.py to regenerate)")
        sys.exit(0 if ok else 1)

    io.open(OUT, "w", encoding="utf-8").write(out)
    if not inline:
        io.open(BUNDLE_OUT, "w", encoding="utf-8").write(bundle_js)
        print("built index.html (%d bytes) + %s (%d bytes, external bundle)" % (len(out), BUNDLE_REL, len(bundle_js)))
    else:
        print("built index.html (%d bytes, inline)" % len(out))
