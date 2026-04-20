from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "NBA Props API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/props")
def props():
    return [
        {
            "player": "Jalen Brunson",
            "market": "points",
            "line": 27.5,
            "odds": -110,
            "projection": 29.8,
            "model_probability": 0.58,
            "implied_probability": 0.5238,
            "edge": 0.0562,
            "ev": 10.73
        },
        {
            "player": "Jayson Tatum",
            "market": "points",
            "line": 28.5,
            "odds": -105,
            "projection": 30.1,
            "model_probability": 0.57,
            "implied_probability": 0.5122,
            "edge": 0.0578,
            "ev": 11.29
        }
    ]