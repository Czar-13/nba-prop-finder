from fastapi import APIRouter

router = APIRouter(prefix="/props", tags=["Props"])

@router.get("/")
def get_props():
    return {"msg": "props working"}