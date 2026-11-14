#!/usr/bin/env python3
"""Télécharge les photos du site d'origine (URLs épinglées par SHA-256 dans
assets/img/manifest.tsv), vérifie leur empreinte, puis les redimensionne
pour alléger le site déployé. Nécessite Pillow (build uniquement)."""
import hashlib, os, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "..", "assets", "img")
MANIFEST = os.path.join(IMG, "manifest.tsv")
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) perfit-static-build/1.0"}

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def main() -> int:
    try:
        from PIL import Image
    except ImportError:
        print("Pillow manquant : pip install pillow (build uniquement)", file=sys.stderr)
        return 1
    import io
    n = 0
    with open(MANIFEST, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line or line.startswith("#"):
                continue
            dest, url, digest, width = line.split("\t")
            out = os.path.join(IMG, dest)
            width = int(width)
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
            if sha256(data) != digest:
                print(f"ECHEC sha256 pour {dest} ({url})", file=sys.stderr)
                return 1
            im = Image.open(io.BytesIO(data))
            if im.width > width:
                im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS)
            if im.mode in ("RGBA", "P"):
                im = im.convert("RGBA")
                im.save(out, optimize=True)
            else:
                im = im.convert("RGB")
                im.save(out, quality=80, optimize=True, progressive=True)
            n += 1
            print(f"ok {dest} ({len(data)} o -> {os.path.getsize(out)} o)")
    print(f"{n} images téléchargées et vérifiées.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
