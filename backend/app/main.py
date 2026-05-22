from fastapi import FastAPI
from app.config import settings
from app.middleware.cors import setup_cors
from app.routers import auth, students, companies, admin, contracts, documents, payments

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
)

setup_cors(app)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(companies.router)
app.include_router(admin.router)
app.include_router(contracts.router)
app.include_router(documents.router)
app.include_router(payments.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}
