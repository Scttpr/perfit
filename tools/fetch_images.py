#!/usr/bin/env python3
"""Télécharge les ressources épinglées par SHA-256 dans assets/img/manifest.tsv
et vérifie leur empreinte avant usage.

- Photos : redimensionnées à la largeur maximale indiquée, puis écrites en JPEG
  (aperçus de partage) et en WebP (version servie par les pages).
- Lignes dont la 4e colonne vaut « raw » (police de caractères) : copiées telles quelles ;
  leur destination est relative à assets/.

Nécessite Pillow (build uniquement)."""
import hashlib, io, os, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "..", "assets")
IMG = os.path.join(ASSETS, "img")
MANIFEST = os.path.join(IMG, "manifest.tsv")
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) perfit-static-build/1.0"}


def main() -> int:
    try:
        from PIL import Image
    except ImportError:
        print("Pillow manquant : pip install pillow (build uniquement)", file=sys.stderr)
        return 1
    n = 0
    with open(MANIFEST, encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line or line.startswith("#"):
                continue
            dest, url, digest, width = line.split("\t")
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
            if hashlib.sha256(data).hexdigest() != digest:
                print(f"ECHEC sha256 pour {dest} ({url})", file=sys.stderr)
                return 1
            if width == "raw":
                out = os.path.join(ASSETS, dest)
                os.makedirs(os.path.dirname(out), exist_ok=True)
                with open(out, "wb") as o:
                    o.write(data)
            else:
                out = os.path.join(IMG, dest)
                width = int(width)
                im = Image.open(io.BytesIO(data))
                if im.width > width:
                    im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS)
                if im.mode in ("RGBA", "P"):
                    im.convert("RGBA").save(out, optimize=True)
                else:
                    im = im.convert("RGB")
                    im.save(out, quality=80, optimize=True, progressive=True)
                    im.save(os.path.splitext(out)[0] + ".webp", quality=78, method=6)
            n += 1
            print(f"ok {dest} ({len(data)} o)")
    print(f"{n} ressources téléchargées et vérifiées.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
