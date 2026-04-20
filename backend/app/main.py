from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "NBA Props API is running"}