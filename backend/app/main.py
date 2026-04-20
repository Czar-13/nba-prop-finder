from fastapi import FastAPI
from backend.app.routes import props

app = FastAPI()

app.include_router(props.router, prefix="/props", tags=["Props"])

@app.get("/")
def root():
    return {"message": "NBA Props API is running"}