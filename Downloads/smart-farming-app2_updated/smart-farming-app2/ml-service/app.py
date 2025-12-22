from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib 
import numpy as np 
import pandas as pd # NEW IMPORT
import random

# --- REAL ML MODEL LOGIC ---

# Global variable for the loaded model
MODEL = None
MODEL_PATH = 'crop_prediction_model.pkl'

def load_model():
    """Loads the trained model into memory when the application starts."""
    global MODEL
    try:
        MODEL = joblib.load(MODEL_PATH)
        print(f"✅ ML Model loaded successfully from {MODEL_PATH}")
    except FileNotFoundError:
        print(f"❌ Error: Model file not found at {MODEL_PATH}. Prediction will fail.")
        MODEL = None
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        MODEL = None

# --- FLASK APP SETUP ---

app = Flask(__name__)
CORS(app) 
load_model() # Load the model immediately when the script executes

# Define the expected feature names globally
FEATURE_NAMES = ['N', 'P', 'K', 'pH', 'Temp', 'Humidity', 'Rainfall']

@app.route('/predict', methods=['POST'])
def predict():
    """
    API endpoint that receives combined data (Soil + Weather) and returns a prediction.
    """
    if MODEL is None:
        return jsonify({'error': 'ML model failed to load or is unavailable'}), 500
        
    try:
        data = request.get_json(force=True)
        
        # Ensure all 7 features are present
        if not all(k in data for k in FEATURE_NAMES):
            return jsonify({'error': 'Missing required features for prediction'}), 400

        # 1. Create feature array in the exact order
        features_list = [
            data['N'], data['P'], data['K'], data['pH'], 
            data['Temp'], data['Humidity'], data['Rainfall']
        ]
        
        # 2. CRITICAL FIX: Convert the input array into a DataFrame with feature names
        input_data = pd.DataFrame([features_list], columns=FEATURE_NAMES)
        
        # 3. Perform prediction and get probability/confidence
        # The model now receives data with the correct feature names
        prediction = MODEL.predict(input_data)[0]
        
        # For classifiers, get the highest probability score as confidence
        probabilities = MODEL.predict_proba(input_data)[0]
        confidence = np.max(probabilities)
        
        # 4. Return the structured JSON response
        return jsonify({
            'recommended_crop': prediction,
            'confidence': round(confidence, 4)
        })

    except Exception as e:
        # 127.0 is usually part of the IP address log, not the error, but is included in the full message
        print(f"Prediction Error: {e}")
        return jsonify({'error': f'An internal server error occurred during prediction: {e}'}), 500

if __name__ == '__main__':
    app.run(port=8080, debug=True)