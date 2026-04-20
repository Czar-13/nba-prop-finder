from fastapi import APIRouter, Query

router = APIRouter()

mock_props = [
    {"player": "Jayson Tatum", "stat": "Points", "line": 27.5, "odds": -110, "predicted": 30.0},
    {"player": "Nikola Jokic", "stat": "Rebounds", "line": 11.5, "odds": -105, "predicted": 13.0},
    {"player": "Stephen Curry", "stat": "3PT", "line": 4.5, "odds": 120, "predicted": 4.0},
]

@router.get("/")
def get_props(
    player: str = Query(None),
    stat: str = Query(None),
    min_edge: float = Query(None)
):
    results = []

    for prop in mock_props:
        prop_with_edge = prop.copy()
        prop_with_edge["edge"] = round(prop_with_edge["predicted"] - prop_with_edge["line"], 2)
        results.append(prop_with_edge)

    if player:
        results = [p for p in results if player.lower() in p["player"].lower()]

    if stat:
        results = [p for p in results if stat.lower() in p["stat"].lower()]

    if min_edge is not None:
        results = [p for p in results if p["edge"] >= min_edge]

    results = sorted(results, key=lambda p: p["edge"], reverse=True)

    return {"props": results}