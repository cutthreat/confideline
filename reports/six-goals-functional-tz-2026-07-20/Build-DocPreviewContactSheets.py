from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


def page_number(path: Path) -> int:
    return int(path.stem.rsplit("-", 1)[-1])


def build_sheet(source: Path, destination: Path) -> tuple[int, tuple[int, int]]:
    pages = sorted(source.glob("page-*.png"), key=page_number)
    if not pages:
        raise RuntimeError(f"No rendered pages found in {source}")

    columns = 3
    thumb_width = 230
    label_height = 28
    gap = 18
    margin = 24

    with Image.open(pages[0]) as first:
        ratio = first.height / first.width
    thumb_height = round(thumb_width * ratio)
    rows = (len(pages) + columns - 1) // columns
    width = margin * 2 + columns * thumb_width + (columns - 1) * gap
    height = margin * 2 + rows * (thumb_height + label_height) + (rows - 1) * gap

    sheet = Image.new("RGB", (width, height), "#dbe4f0")
    draw = ImageDraw.Draw(sheet)
    for index, page_path in enumerate(pages):
        row, column = divmod(index, columns)
        x = margin + column * (thumb_width + gap)
        y = margin + row * (thumb_height + label_height + gap)
        with Image.open(page_path) as page:
            thumb = ImageOps.contain(page.convert("RGB"), (thumb_width, thumb_height))
        frame = Image.new("RGB", (thumb_width, thumb_height), "white")
        frame.paste(thumb, ((thumb_width - thumb.width) // 2, 0))
        sheet.paste(frame, (x, y))
        draw.text((x, y + thumb_height + 6), f"Страница {index + 1}", fill="#172033")

    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(destination, format="PNG", optimize=True)
    return len(pages), sheet.size


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: Build-DocPreviewContactSheets.py <preview-root> <out-dir>")
    root = Path(sys.argv[1]).resolve()
    out_dir = Path(sys.argv[2]).resolve()
    for source in sorted(path for path in root.iterdir() if path.is_dir()):
        destination = out_dir / f"{source.name}-contact-sheet.png"
        count, size = build_sheet(source, destination)
        print(f"{source.name}|pages={count}|sheet={size[0]}x{size[1]}")


if __name__ == "__main__":
    main()
