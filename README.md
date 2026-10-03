# DigitalCoach

Senior Design Project for Fall 2022-Spring 2027

DigitalCoach is an AI-powered interview prep web application that allows job seekers to practice interviewing and receive immediate feedback. Some key features of DigitalCoach include creating interview sets from our database of questions and then recording corresponding video responses. Our AI uses machine learning models to analyze audio and video through a sentiment analysis. At the end, users are left with an overall score and actionable feedback.

The ML API now supports live transcription through AssemblyAI, text-based scoring, and competency feedback, making it easier to provide real-time guidance to users.

## Features
- Create custom or predefined interview question sets.
- Audio transcription and analysis using AssemblyAI.
- Text scoring with a baseline AI model:
   - Measures answer structure.
   - Estimates Big Five personality traits.
   - Generates competency feedback (communication clarity, confidence, engagement).
- Provides an overall score and reasonable, actionable recommendations.

# Repository Structure
- digital-coach-app/ – Frontend (Next.js + Firebase + React).
- ml-api/ – Backend API (Flask) handling scoring, transcription, and feedback.

# General Use Flow
1. User records an interview response.
1. The response is stored in Firebase Firestore and Storage.
1. A Firebase Cloud Function triggers when an answer document is created.
1. The function sends the request to the ML API.
1. The ML API processes the response asynchronously using a Redis queue.
1. When processing finishes, the ML API sends results back to Firebase.
1. Firebase updates the answer document with feedback and scoring.
1. The frontend displays the results to the user.

# Setup Instructions

## Prerequisites
- Node.js (v20.19.2 recommended)
- Yarn
- Python 3.10
- Redis
- Pipenv
- NLTK (pip install nltk)
- AssemblyAI account & API key
- Firebase account & project

## Environment Setup
1. Firebase
- Create a Firebase project.
- Create a service account using Google Cloud Console.
- Populate .env files in:
   - digital-coach-app/
   - digital-coach-app/functions/ (Use service account credentials; remove the example from the filename.)
1. Python & ML API
- Navigate to ml-api/:
   - pipenv install
   - pipenv run serve
- Populate .env with your AssemblyAI API key.
- Install NLTK packages:
   - import nltk
   - nltk.download()  
1. AssemblyAI
- Sign up at https://www.assemblyai.com/.
- Retrieve your API key and add it to ml-api/.env.
1. Redis
- Start your Redis server.
1. Firebase CLI
- Login: firebase login
- List projects: firebase projects:list
- Set project: firebase use <projectId>



# Frontend Setup
1. Navigate to digital-coach-app/
- yarn install
- npm install -g firebase-tools
1. Navigate to functions/ inside digital-coach-app/
- yarn install
- yarn add typescript@latest
- yarn build --skipLibCheck
1. Run emulators:
- cd ../
- yarn run emulate  # Firebase emulator
- yarn run dev      # Next.js dev server
1. Seed the database:
- Visit localhost:3000/api/seed
1. Access:
- Frontend: localhost:3000
- Firebase console: localhost:4000

# Backend Setup
1. Start Redis.
1. Navigate to ml-api/:
- pipenv install
- pipenv run serve
1. API endpoints:
- Transcribe audio
- Score text
- Generate competency feedback

# ML API
This handles the following features:
1. Audio transcription
1. Text scoring
1. Feedback generation
1. Personality estimation

# Technlogies Used

## Frontend
- Next.js, React
- Firebase (Storage, Firestore, Functions)
- Sass
- Yarn
## Backend / ML API
- Flask, Redis, Pipenv
- RQ (task queue)
- AssemblyAI (transcription)
- FER (Facial Expression Recognition)
## Machine Learning / Data
- NumPy, SciPy, Matplotlib
- TensorFlow, Keras, OpenCV
- NLTK
- Jupyter Notebooks



