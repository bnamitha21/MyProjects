import json
import re
from pathlib import Path


PLAYLIST_PATH = Path(__file__).resolve().parents[1] / "frontend" / "src" / "data" / "playlist_raw.json"
OUTPUT_PATH = PLAYLIST_PATH.with_name("playlistVideos.json")

CATEGORY_RULES = [
    ("equipment", ["equipment", "operator", "haul", "truck", "dozer", "loader", "excavator", "crane", "man lift",
                   "plant", "maintenance", "respiratory", "arc", "lock out", "hoist", "rigging", "night"]),
    ("emergency", ["fire", "firefighting", "evacuation", "first aid", "water safety", "respiratory", "rescue"]),
    ("hazards", ["hazard", "highwall", "blind", "spotter", "confined", "accident", "work place", "workplace",
                 "arc", "lock out", "rules to live", "haz com"]),
    ("compliance", ["contractor", "independent", "training", "statutory", "mine act", "rules and procedures",
                    "inspection", "records", "forms", "rights", "msha"]),
]
CATEGORY_BIOS = {
    "equipment": "Operational best practices for mining vehicles and plant systems.",
    "emergency": "Emergency readiness covering evacuation, medical, and fire response.",
    "hazards": "Identifying and controlling site hazards before they escalate.",
    "compliance": "Regulatory duties, documentation, and MSHA expectations.",
}


def clean_title(title: str) -> str:
    cleaned = re.sub(r"^\d+\s+", "", title).strip()
    cleaned = re.sub(r"\s{2,}", " ", cleaned)

    def replace_suffix(match: re.Match) -> str:
        token = match.group(1)
        if token == "A":
            return " (Module A)"
        if token.upper() == "PROXY":
            return " (Proxy)"
        return ""

    cleaned = re.sub(r"\s+(A|PROXY)$", replace_suffix, cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


def categorize(title: str) -> str:
    lowered = title.lower()
    best_category = "hazards"
    best_score = 0

    for category, keywords in CATEGORY_RULES:
        score = sum(1 for keyword in keywords if keyword in lowered)
        if score > best_score:
            best_category = category
            best_score = score

    return best_category


def format_duration(seconds: int | None) -> str | None:
    if not seconds and seconds != 0:
        return None
    minutes, remainder = divmod(seconds, 60)
    return f"{minutes}:{remainder:02d}"


def hydrate_videos(raw_entries: list[dict]) -> list[dict]:
    hydrated = []

    for order, entry in enumerate(raw_entries, start=1):
        title = clean_title(entry.get("title", f"Video {order}"))
        category = categorize(title)
        thumbs = entry.get("thumbnails") or []
        thumb_url = thumbs[-1]["url"] if thumbs else ""

        video = {
            "id": entry.get("id"),
            "order": order,
            "title": title,
            "description": f"{title} — {CATEGORY_BIOS[category]}",
            "url": entry.get("url"),
            "thumbnail": thumb_url,
            "category": category,
            "durationSeconds": entry.get("duration"),
            "duration": format_duration(entry.get("duration")),
            "channel": entry.get("channel"),
        }
        hydrated.append(video)

    return hydrated


def main() -> None:
    if not PLAYLIST_PATH.exists():
        raise FileNotFoundError(f"Playlist file not found at {PLAYLIST_PATH}")

    data = json.loads(PLAYLIST_PATH.read_text(encoding="utf-8-sig"))
    entries = data.get("entries") or []
    videos = hydrate_videos(entries)
    OUTPUT_PATH.write_text(json.dumps(videos, indent=2), encoding="utf-8")
    print(f"Wrote {len(videos)} videos to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

