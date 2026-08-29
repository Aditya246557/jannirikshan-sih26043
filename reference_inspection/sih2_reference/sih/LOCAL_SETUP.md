# Local run guide

Run these three services in separate terminals. The FastAPI model must be running before an evidence image or resolution-verification request can receive an AI result.

## 1. Start the AI service

Open PowerShell in `D:\new-ai-model\ai-model` and run:

```powershell
.\.venv\Scripts\python.exe -m uvicorn ai_service.main:app --host 127.0.0.1 --port 8000
```

Confirm it is ready by opening `http://127.0.0.1:8000/health`. It should report the four civic classes.

The supplied model service currently requests GPU `0`. If this machine has no CUDA-capable GPU, change this line in `D:\new-ai-model\ai-model\ai_service\main.py`:

```python
device=0,
```

to:

```python
device="cpu",
```

CPU inference is slower but works for local demos.

## 2. Start PostgreSQL and configure the backend

Create a PostgreSQL database called `adhikar_ai`. Copy `backend/src/main/resources/application-example.properties` to `application.properties` only if a local configuration is missing, then set the database and Cloudinary values locally. Keep real credentials out of source control.

If evidence upload reports `value too long for type character varying(255)`, run [001_expand_complaint_text_columns.sql](backend/db/migrations/001_expand_complaint_text_columns.sql) once in pgAdmin's Query Tool while connected to `adhikar_ai`.

Start the backend from `D:\sih\backend`:

```powershell
.\gradlew.bat bootRun
```

It runs on `http://127.0.0.1:8080` and calls the AI service on port 8000.

Before a demo, open `http://127.0.0.1:8080/api/system/health`. Proceed only when `database`, `ai`, and `ready` are all `UP`/`true`.

## 3. Start the frontend

From `D:\sih\frontend`:

```powershell
cmd /c npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Resolution-verification flow

An officer must move a complaint through `PENDING -> UNDER_REVIEW -> VALIDATED -> IN_PROGRESS`. The officer dashboard then requests a new photo and calls the AI verifier. The complaint changes to `RESOLVED` only if the original issue class is not detected in that new photo.
