from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

from faster_whisper import WhisperModel


def fmt_time(value: float) -> str:
    value = max(0.0, float(value))
    hours = int(value // 3600)
    minutes = int((value % 3600) // 60)
    seconds = int(value % 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"


def save_outputs(outdir: Path, basename: str, info_payload: dict, segments: list[dict]) -> None:
    outdir.mkdir(parents=True, exist_ok=True)
    (outdir / f"{basename}.json").write_text(
        json.dumps({"info": info_payload, "segments": segments}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    lines = [
        "# Транскрипт видео CRM",
        "",
        f"- Файл: `{info_payload.get('source')}`",
        f"- Модель: `{info_payload.get('model')}`",
        f"- Язык: `{info_payload.get('language')}`",
        "",
    ]
    for item in segments:
        lines.append(f"[{item['start_time']} - {item['end_time']}] {item['text']}")
        lines.append("")
    (outdir / f"{basename}.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("video")
    parser.add_argument("--out-dir", default=r"C:\GPT-local\crm-transcript")
    parser.add_argument("--model", default="base")
    parser.add_argument("--language", default="ru")
    parser.add_argument("--basename", default="crm-video-transcript")
    parser.add_argument("--cache-dir", default=r"C:\GPT-local\crm-transcript\models")
    args = parser.parse_args()

    outdir = Path(args.out_dir)
    cache_dir = Path(args.cache_dir)
    started = time.time()
    model = WhisperModel(
        args.model,
        device="cpu",
        compute_type="int8",
        download_root=str(cache_dir),
        cpu_threads=4,
        num_workers=1,
    )
    segments_iter, info = model.transcribe(
        args.video,
        language=args.language,
        task="transcribe",
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 700},
        beam_size=1,
        best_of=1,
        condition_on_previous_text=False,
    )
    info_payload = {
        "source": args.video,
        "model": f"faster-whisper/{args.model}",
        "language": args.language,
        "detected_language": getattr(info, "language", None),
        "language_probability": getattr(info, "language_probability", None),
        "duration": getattr(info, "duration", None),
    }
    segments: list[dict] = []
    for index, seg in enumerate(segments_iter, start=1):
        item = {
            "id": index,
            "start": float(seg.start),
            "end": float(seg.end),
            "start_time": fmt_time(seg.start),
            "end_time": fmt_time(seg.end),
            "text": seg.text.strip(),
        }
        segments.append(item)
        if index == 1 or index % 10 == 0:
            save_outputs(outdir, args.basename, info_payload, segments)
            print(f"segments={index} at {item['end_time']}", flush=True)
    info_payload["elapsed_seconds"] = round(time.time() - started, 1)
    save_outputs(outdir, args.basename, info_payload, segments)
    print(f"done segments={len(segments)} elapsed={info_payload['elapsed_seconds']}s", flush=True)


if __name__ == "__main__":
    main()
