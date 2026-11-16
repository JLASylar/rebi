#!/usr/bin/env python3
"""画扩展的图标（「冒号」方案）：深色圆角方块上两个圆点，上粉下白。

    python3 tools/make-icons.py                 → src/extension/icons/icon-<16|32|48|128|512>.png
    python3 tools/make-icons.py --mac <文件.png>  另外画一张 1024 的 Mac App 图标（四周留边）

只用 Python 标准库：每个像素取 4×4 个采样点算覆盖率（抗锯齿），自己写 PNG。
128 的那张按 Chrome 商店的要求四周留 16 像素透明边；其余的铺满。
"""
import struct
import sys
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / 'src' / 'extension' / 'icons'
INK = (16, 16, 22)        # 底
PINK = (251, 114, 153)    # 上面的点
WHITE = (244, 244, 246)   # 下面的点
SAMPLES = 4


def shape_at(x: float, y: float):
    """单位正方形里某一点的颜色；在图形之外返回 None。"""
    radius = 0.225
    dx = max(radius - x, 0, x - (1 - radius))
    dy = max(radius - y, 0, y - (1 - radius))
    if dx * dx + dy * dy > radius * radius:
        return None
    for center_y, color in ((0.325, PINK), (0.675, WHITE)):
        if (x - 0.5) ** 2 + (y - center_y) ** 2 <= 0.125 ** 2:
            return color
    return INK


def render(size: int, margin: int = 0) -> bytes:
    inner = size - 2 * margin
    rows = []
    for py in range(size):
        row = bytearray([0])
        for px in range(size):
            total = [0, 0, 0]
            covered = 0
            for sy in range(SAMPLES):
                for sx in range(SAMPLES):
                    color = shape_at((px - margin + (sx + 0.5) / SAMPLES) / inner, (py - margin + (sy + 0.5) / SAMPLES) / inner)
                    if color:
                        covered += 1
                        for channel in range(3):
                            total[channel] += color[channel]
            alpha = round(255 * covered / SAMPLES ** 2)
            row += bytes([round(value / covered) if covered else 0 for value in total] + [alpha])
        rows.append(bytes(row))

    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))

    header = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header) + chunk(b'IDAT', zlib.compress(b''.join(rows), 9)) + chunk(b'IEND', b'')


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    for size in (16, 32, 48, 128, 512):
        (OUT / f'icon-{size}.png').write_bytes(render(size, 16 if size == 128 else 0))
        print(f'icon-{size}.png')
    if '--mac' in sys.argv:
        # Mac App 的图标：1024 的画布，图形四周留约 10% 的边（macOS 图标的惯例），其余尺寸由 build-safari.sh 用 sips 缩
        target = Path(sys.argv[sys.argv.index('--mac') + 1])
        target.write_bytes(render(1024, 100))
        print(target)
