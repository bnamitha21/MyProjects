# NutriScore AI

NutriScore AI is a simple web application that provides personalized food recommendations and analyzes packaged food labels. It tracks your daily food intake and health score.

## Tech Stack

- Frontend: HTML, CSS, JavaScript, Bootstrap
- Backend: Python Flask
- Database: SQLite
- AI Integration: Google Gemini API

## Prerequisites
- Python 3 installed
- `pip install flask python-dotenv google-generativeai`

## How to Run
1. Navigate to the project directory: `cd nutriscore-ai`
2. Create a `.env` file in the root directory and add your Gemini API Key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Start the server: `python app.py`
4. Open your browser and go to `http://localhost:5000`

## Features

- User Authentication (Login / Signup)
- Health Profiling (12-question health assessment)
- Dashboard tracking health score and previous food logs
- AI-Powered Food Label Analysis using Gemini
- Food Recommendations (fruits, salads, healthy snacks)
