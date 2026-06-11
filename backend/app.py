from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from routes.routes import construct_routes
import os

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "https://fot-timetable-version-v1.vercel.app"
])

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "timetable_db"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

# 🔥 ADD THIS ROUTE
@app.route("/")
def home():
    return {
        "status": "running",
        "message": "Timetable Backend API",
        "available_routes": [
            "/api/batches",
            "/api/faculties",
            "/api/rooms",
            "/api/slots"
        ]
    }

# Register API routes
app.register_blueprint(construct_routes(db), url_prefix='/api')

if __name__ == '__main__':
    print("Server starting on http://localhost:5000")
    debug_mode = os.getenv("FLASK_ENV") == "development"
    app.run(debug=debug_mode, port=int(os.getenv("PORT", 5000)))
