# DigitalCoach

Senior Design Project for Fall 2022–Spring 2026

DigitalCoach is an AI-powered interview preparation platform that allows job seekers to practice interviews and receive immediate feedback. Users can create interview sessions, answer questions through video and audio recordings, and receive AI-generated coaching insights.

The platform supports live transcription through AssemblyAI, AI-powered feedback generation, avatar-based interview experiences through HeyGen, and Firebase-backed data storage and authentication.

## Features

* Create custom or predefined interview question sets.
* Real-time interview simulations.
* Audio transcription using AssemblyAI.
* AI-powered interview feedback and coaching.
* HeyGen Live Avatar interview experiences.
* Firebase Authentication, Firestore, and Storage integration.
* Background processing using Redis workers.
* Local development using Firebase emulators and Docker.

# Repository Structure

* `digital-coach-app/` – Frontend application (Next.js + React + Firebase).
* `mlapi/` – Backend API (FastAPI) responsible for AI processing, AssemblyAI integration, HeyGen integration, and worker jobs.
* `docker-compose.yml` – Local development environment configuration.
* `firebase.json` – Firebase emulator configuration.

# General Use Flow

1. User signs into DigitalCoach.
2. User starts an interview session.
3. Audio and video data are collected through the frontend.
4. AssemblyAI provides transcription services.
5. The backend processes interview responses.
6. Redis workers handle background AI tasks.
7. Results are stored in Firebase.
8. Feedback is displayed to the user in the frontend.

# Setup Instructions

## Prerequisites

* Docker Desktop
* Git
* GitHub account
* AssemblyAI account and API key
* HeyGen account and API key

## Clone Repository

```bash
git clone https://github.com/Mikkail04/DigitalCoach.git
cd DigitalCoach
git checkout temp_working_branch
```

## Environment Setup

### Frontend Environment

Create:

```text
digital-coach-app/.env
```

Populate with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

ASSEMBLY_API_KEY=your_assemblyai_key
HEYGEN_LIVEAVATAR_API=your_heygen_key
OPEN_AI_API_KEY=your_openai_key
```

### Backend Environment

Create:

```text
mlapi/.env
```

Populate with:

```env
ASSEMBLY_API_KEY=your_assemblyai_key
HEYGEN_LIVEAVATAR_API=your_heygen_key
OPEN_AI_API_KEY=your_openai_key
```

## Docker Setup

From the repository root:

```bash
docker compose up -d
```

Verify containers:

```bash
docker compose ps
```

Expected services:

* frontend
* api
* redis
* firebase
* high-worker
* default-worker

## Access Local Services

| Service              | URL                   |
| -------------------- | --------------------- |
| Frontend             | http://localhost:3000 |
| Backend API          | http://localhost:8000 |
| Firebase Emulator UI | http://localhost:4000 |
| Firestore Emulator   | http://localhost:8080 |
| Auth Emulator        | http://localhost:9099 |
| Storage Emulator     | http://localhost:9199 |

# Backend Services

## API

FastAPI service responsible for:

* AssemblyAI integration
* HeyGen integration
* Interview processing
* AI feedback generation
* User profile operations

Runs on:

```text
http://localhost:8000
```

## Redis

Used for background job processing.

Runs on:

```text
localhost:6379
```

## Workers

Two worker services process queued jobs:

* high-worker
* default-worker

# Firebase

Local development uses Firebase emulators for:

* Authentication
* Firestore
* Storage
* Cloud Functions

The frontend automatically connects to the emulators when:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

# ML / AI Services

DigitalCoach integrates with:

## AssemblyAI

Provides:

* Speech-to-text transcription
* Real-time audio processing

## HeyGen

Provides:

* AI avatar interviewers
* Live avatar sessions

## OpenAI

Provides:

* Interview feedback
* Coaching recommendations
* AI-assisted evaluation

# Reproducing the Working Development Environment

To reproduce the working setup used by the team:

1. Clone the repository.
2. Checkout `temp_working_branch`.
3. Create both `.env` files.
4. Add valid AssemblyAI and HeyGen API keys.
5. Start Docker Desktop.
6. Run:

```bash
docker compose up -d
```

7. Open:

```text
http://localhost:3000
```

If configured correctly:

* Firebase emulators connect successfully.
* Avatar sessions initialize.
* AssemblyAI token requests succeed.
* Interview sessions can start normally.

# Technologies Used

## Frontend

* Next.js
* React
* TypeScript
* Firebase
* Sass

## Backend

* FastAPI
* Python
* Redis
* Uvicorn

## Infrastructure

* Docker
* Docker Compose
* Firebase Emulator Suite

## AI Services

* AssemblyAI
* HeyGen
* OpenAI

## Data & Processing

* Redis
* Firebase Firestore
* Firebase Storage




