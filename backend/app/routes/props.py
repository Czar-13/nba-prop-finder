from fastapi import APIRouter, Query
import pandas as pd
import os

router = APIRouter()

# --- Load CSV safely (works with backend.app.main) ---
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # points to backend/app
csv_path = os.path.join(BASE_DIR, "data", "player_stats.csv")

df = pd.read_csv(csv_path)


# --- Mock props (lines from sportsbook) ---
mock_props = [
    {"player": "Jayson Tatum", "stat": "points", "line": 27.5, "odds": -110},
    {"player": "Nikola Jokic", "stat": "rebounds", "line": 11.5, "odds": -105},
    {"player": "Stephen Curry", "stat": "threes", "line": 4.5, "odds": 120},
]


# --- Prediction function (weighted last 5) ---
def get_weighted_prediction(player, stat):
    player_data = df[df["player"] == player]

    if player_data.empty:
        return None

    last_5 = player_data.tail(5)

    values = last_5[stat].tolist()
    weights = [1, 2, 3, 4, 5]

    weighted_sum = sum(value * weight for value, weight in zip(values, weights))
    total_weights = sum(weights)

    return round(weighted_sum / total_weights, 2)


# --- Main route ---
@router.get("/")
def get_props(
    player: str = Query(None),
    stat: str = Query(None),
    min_edge: float = Query(None)
):
    results = []

    for prop in mock_props:
        predicted = get_weighted_prediction(prop["player"], prop["stat"])

        if predicted is None:
            continue

        prop_with_edge = prop.copy()
        prop_with_edge["predicted"] = predicted
        prop_with_edge["edge"] = round(predicted - prop["line"], 2)

        results.append(prop_with_edge)

    # --- Filters ---
    if player:
        results = [p for p in results if player.lower() in p["player"].lower()]

    if stat:
        results = [p for p in results if stat.lower() in p["stat"].lower()]

    if min_edge is not None:
        results = [p for p in results if p["edge"] >= min_edge]

    # --- Sort best → worst ---
    results = sorted(results, key=lambda p: p["edge"], reverse=True)

    return {"props": results}