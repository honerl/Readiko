## READiKO


Readiko is an AI-powered web application designed to enhance reading comprehension skills for students. The platform provides a dynamic learning environment with distinct interfaces for both students and teachers, leveraging generative AI to offer personalized feedback and adaptive learning paths.

## Key Features

-   **Dual User Roles:** Separate, tailored dashboards and functionalities for students and teachers.
-   **Classroom Management:** Teachers can create classes, which generate unique codes for students to join.
-   **AI-Powered "Explore" Mode:** A self-paced learning experience where the application generates reading passages and questions on a given topic, providing real-time, conversational feedback.
-   **Multiple Learning Activities:**
    -   **Exam Mode:** Timed, structured assessments based on reading passages.
    -   **Lesson Mode:** Interactive lessons that combine reading with a conversational, AI-driven Q&A.
-   **Adaptive Learning Engine:** The backend analyzes student performance to adjust question difficulty, fostering gradual skill improvement.
-   **Seamless Authentication:** Integrated with Supabase for secure user registration, login, and session management.

## Architecture

Readiko is a monorepo application consisting of a React frontend and a FastAPI backend.

-   **Frontend (`apps/web`):** A modern React application built with Vite that handles all user-facing interfaces. It communicates with Supabase for authentication and makes authenticated requests to the FastAPI backend.
-   **Backend (`apps/api`):** A robust API built with Python and FastAPI. It serves business logic, manages database interactions via Supabase, and integrates with generative AI models (Google Gemini or OpenAI) to power its intelligent features.

Authentication is handled by Supabase Auth, which issues JWTs to the client. These tokens are automatically included in requests to the backend, which validates them to secure its endpoints.

## Tech Stack

-   **Frontend:** React, Vite, React Router, Supabase.js
-   **Backend:** Python, FastAPI, Pydantic
-   **Database & Auth:** Supabase (PostgreSQL)
-   **AI:** Google Gemini, OpenAI

## Getting Started

Follow these instructions to get the Readiko application running on your local machine.

### Prerequisites

-   Node.js (v18 or newer)
-   Python (v3.9 or newer) and `pip`
-   A Supabase account
-   API keys for an AI provider (e.g., Google Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/honerl/Readiko.git
cd Readiko
```

### 2. Backend Setup (`apps/api`)

1.  **Navigate to the API directory and create a virtual environment:**

    ```bash
    cd apps/api
    python -m venv .venv
    source .venv/bin/activate  # On Windows, use: .\.venv\Scripts\Activate.ps1
    ```

2.  **Install Python dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure environment variables:**

    Create a `.env` file by copying the example and filling in your credentials.

    ```bash
    cp .env.example .env
    ```

    You will need to add your Supabase URL, anon key, JWT secret, and your GenAI API key. You can find your Supabase credentials in your project's "API Settings".

    ```ini
    # apps/api/.env
    SUPABASE_URL=https://<your-project-ref>.supabase.co
    SUPABASE_ANON_KEY=<your-anon-public-key>
    SUPABASE_JWT_SECRET=<your-jwt-secret-key>
    GEMINI_API_KEY=<your-gemini-api-key>
    ```

4.  **Run the backend server:**

    ```bash
    uvicorn app.main:app --reload
    ```

    The API will be available at `http://localhost:8000`. You can view the interactive documentation at `http://localhost:8000/docs`.

### 3. Frontend Setup (`apps/web`)

1.  **In a new terminal, navigate to the web directory:**

    ```bash
    cd apps/web
    ```

2.  **Install Node.js dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**

    Create a `.env.local` file from the example and add your Supabase project details.

    ```bash
    cp .env.example .env.local
    ```

    ```ini
    # apps/web/.env.local
    VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
    VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
    ```

4.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```

    The application will be running at `http://localhost:5173`.

## Project Structure

The repository is organized into two main applications within the `apps/` directory.

```
└── honerl-readiko/
    ├── apps/
    │   ├── api/        # FastAPI backend application
    │   └── web/        # React frontend application
    └── docs/           # Additional documentation files
```

-   `apps/api/app/api/routes`: Contains the API endpoint definitions for different features like classrooms, activities, and auth.
-   `apps/api/app/core`: Holds core logic, including the `adaptive_engine.py`, `chat_service.py`, and security configurations.
-   `apps/web/src`: Contains the React components, services for API communication (`api.js`), and the Supabase client setup.
-   `setup_guide.md`: A detailed guide on the Supabase authentication integration.
