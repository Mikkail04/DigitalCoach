# DigitalCoach

DigitalCoach is an AI-powered interview practice application. Users can complete mock interviews, receive interview feedback and scores, and review competency-based results.

## Prerequisites

* [Git](https://git-scm.com/downloads)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose enabled
* API credentials for the services you want to use, including Firebase, AssemblyAI, and HeyGen LiveAvatar

The Docker setup runs the frontend, backend API, Firebase emulators, Redis, and background workers.

## Quick Start (Docker)

### 1. Clone the repository

```powershell
git clone <repository-url>
cd DigitalCoach
```

Replace `<repository-url>` with the repository's clone URL.

### 2. Configure environment variables

Create a local environment file from the example:

```powershell
Copy-Item .\digital-coach-app\.env.example .\digital-coach-app\.env
```

Open `digital-coach-app/.env` and fill in the required values.

At minimum, the tested local interview workflow requires:

* `NEXT_PUBLIC_FIREBASE_API_KEY`
* `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
* `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
* `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
* `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
* `NEXT_PUBLIC_FIREBASE_APP_ID`
* `ASSEMBLY_API_KEY`
* `HEYGEN_LIVEAVATAR_API`

Copy the Firebase web app configuration from your Firebase project. Keep `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` for the local emulator setup, and keep the Firebase project ID consistent with the Docker Compose configuration (`digitalcoach-31674`), unless you have intentionally changed that configuration.

Other integrations may require additional variables, depending on the features you enable. Refer to `.env.example` and the Docker Compose configuration.

**Keep credentials private.** Do not commit `.env` or API keys to Git. The local `.env` file should remain untracked.

### 3. Start the application

Make sure Docker Desktop is running, then run from the repository root:

```powershell
docker compose up -d --build
```

Check the service status:

```powershell
docker compose ps
```

The first startup may take a little while as containers initialize. If a service is still starting, check its logs:

```powershell
docker compose logs -f
```

Press `Ctrl+C` to stop following the logs; this does not shut down the containers.

### 4. Open the application

* **Frontend:** http://localhost:3000
* **Backend API documentation:** http://localhost:8000/docs
* **Firebase Emulator UI:** http://localhost:4000

Create an account or sign in through the frontend, then follow the interview workflow.

### 5. Stop the application

From the repository root:

```powershell
docker compose down
```

This stops and removes the containers while preserving named volumes. To also delete persistent Docker volumes and their data, use `docker compose down -v` only when you intentionally want to reset that data.

## Troubleshooting

### Frontend reports `auth/invalid-api-key`

Check that the `NEXT_PUBLIC_FIREBASE_*` values in `digital-coach-app/.env` are populated correctly. After changing frontend public environment values, rebuild the frontend:

```powershell
docker compose up -d --build frontend
```

### AssemblyAI or HeyGen reports a missing API key

Confirm that `ASSEMBLY_API_KEY` and `HEYGEN_LIVEAVATAR_API` are set in `digital-coach-app/.env`, then recreate the API container:

```powershell
docker compose up -d --force-recreate api
```

### A service fails during startup

Some services depend on other containers becoming ready. Check the service status and logs:

```powershell
docker compose ps
docker compose logs --tail=100
```

Wait for the services to initialize, then try again.

### A port is already in use

Another process or Docker project may already be using one of the configured ports. Stop the conflicting process or container before starting DigitalCoach.

## Project Structure

* `digital-coach-app/` - Next.js frontend
* `mlapi/` - FastAPI backend and interview-related API routes
* `docker-compose.yml` - local multi-service development environment

## Technology

* **Frontend:** Next.js, React, TypeScript
* **Backend:** FastAPI, Python
* **Local infrastructure:** Docker Compose, Firebase emulators, Redis, background workers
* **Interview integrations:** AssemblyAI and HeyGen LiveAvatar

## Development Notes

* Use the Docker Compose workflow above for the recommended local setup.
* Keep `.env` files and service credentials out of source control.
* If you change environment variables, rebuild or recreate the affected container so the changes take effect.
