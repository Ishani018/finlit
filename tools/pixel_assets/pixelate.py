"""Turn smooth painted sprites into pixel art that matches the room art.

Pillow + numpy only (no extra installs). Steps: area-average down to a small grid,
reduce to a shared-size palette, snap alpha to on/off, add a 1px outline, scale back
up with nearest-neighbour so every pixel stays crisp.

Usage:  python3 pixelate.py in.png out.png --height 256 --colors 48 --scale 4
"""
import argparse
import numpy as np
from PIL import Image


def pixelate(im, height=256, colors=48, scale=4, outline=True, alpha_cut=110):
    im = im.convert('RGBA')
    w, h = im.size
    small_w = max(1, round(w * height / h))
    small = im.resize((small_w, height), Image.BOX)            # area average
    a = np.array(small.getchannel('A')) >= alpha_cut           # crisp alpha
    rgb = small.convert('RGB')
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    arr = np.array(q)
    out = np.zeros((height, small_w, 4), np.uint8)
    out[..., :3] = arr
    out[..., 3] = a * 255
    if outline:
        pad = np.pad(a, 1)
        edge = (~a) & (pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:])
        dark = np.array([34, 22, 20], np.uint8)
        out[edge, :3] = dark
        out[edge, 3] = 255
    res = Image.fromarray(out, 'RGBA')
    return res.resize((small_w * scale, height * scale), Image.NEAREST)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('dst')
    ap.add_argument('--height', type=int, default=256)
    ap.add_argument('--colors', type=int, default=48)
    ap.add_argument('--scale', type=int, default=4)
    ap.add_argument('--no-outline', action='store_true')
    a = ap.parse_args()
    pixelate(Image.open(a.src), a.height, a.colors, a.scale, not a.no_outline).save(a.dst, optimize=True)
