# Task Manager Backend

A Flask REST API for managing user tasks with authentication.

## Project Structure

```
task-manager-backend/
├── app.py                 # Application factory and main entry point
├── config.py              # Configuration settings for different environments
├── utils.py               # Utility functions for common operations
├── requirements.txt       # Python dependencies
├── .env.sample            # Environment variables template
├── models/                # Database models
│   ├── __init__.py
│   ├── user.py           # User model with authentication
│   └── task.py           # Task model
├── schemas/               # Pydantic validation schemas
│   ├── __init__.py
│   ├── user.py           # User request/response schemas
│   └── task.py           # Task request/response schemas
├── routes/                # Flask route blueprints
│   ├── __init__.py
│   ├── auth.py           # Authentication endpoints
│   └── tasks.py          # Task management endpoints
├── tests/                 # Comprehensive test suite
│   ├── __init__.py
│   ├── conftest.py       # Test fixtures and configuration
│   ├── test_user.py      # User-related tests
│   └── test_task.py      # Task-related tests
└── alembic/               # Database migrations
```

## Environment Variables

The application uses the following environment variables (defined in `.env` file):

- `DATABASE_URL`: Database connection string (default: `sqlite:///app.db`)
- `JWT_SECRET_KEY`: Secret key for JWT token generation (required for production)
- `FLASK_ENV`: Flask environment (development/production)

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Authenticate user and get access token

### Tasks
- `POST /tasks` - Create a new task
- `GET /tasks` - Get all tasks for authenticated user
- `GET /tasks/<id>` - Get specific task
- `PUT /tasks/<id>` - Update specific task
- `DELETE /tasks/<id>` - Delete specific task

## Development Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the sample environment file
   cp .env.sample .env
   
   # Edit the .env file with your specific values
   # Make sure to change the JWT_SECRET_KEY to a secure random string
   ```

4. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

5. **Run the application:**
   ```bash
   python app.py
   ```

## Testing

Run the comprehensive test suite:

```bash
pytest 
```