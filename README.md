# QuickDraw-AI

QuickDraw-AI is a web-based application that allows users to draw digits on a canvas and predicts the digit using a machine learning model. The project is built with a React frontend and a FastAPI backend, leveraging TensorFlow for digit recognition.

---

## Features

- **Interactive Drawing Canvas**: Users can draw digits on a canvas with adjustable stroke width and color.
- **Digit Prediction**: The drawn digit is sent to the backend, which processes the image and predicts the digit.
- **Real-time Feedback**: The predicted digit and its probabilities are displayed to the user.
- **Responsive Design**: Optimized for both desktop and mobile devices.

---

## Project Structure



---

## Technologies Used

### Frontend
- React
- Tailwind CSS

### Backend
- FastAPI
- TensorFlow
- Pillow

---

## Getting Started

### Prerequisites
- Node.js and npm
- Python 3.8 or higher
- Virtual environment (optional)

---

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/QuickDraw-AI.git
   cd QuickDraw-AI
   ```
2. Install backend dependencies:
   ```bash
   cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

---

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Start the frontend development server:
   ```bash
   cd ../frontend
   npm start
   ```

3. Open your browser and navigate to http://localhost:3000.

---

## Deployment

### Backend Deployment

The backend is deployed on Render. All requirements are listed in requirements.txt

### Frontend Deployment

The frontend is planning to be deployed on Vercel