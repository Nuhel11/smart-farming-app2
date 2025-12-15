import joblib
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from io import StringIO
import random

# 1. Create Mock Training Data (Simulating N, P, K, pH, Temp, Humidity, Rainfall -> Crop)
DATA = """
N,P,K,pH,Temp,Humidity,Rainfall,Crop
80,45,45,6.5,22.0,65,400,Wheat
100,50,55,6.0,30.5,85,950,Rice
110,60,60,5.8,28.0,60,650,Maize
20,25,10,7.2,18.0,55,200,Lentil
150,70,65,7.0,32.0,70,1600,Sugarcane
90,40,40,6.7,24.0,70,500,Wheat
105,55,50,6.2,29.0,80,1000,Rice
25,30,12,7.5,19.0,50,250,Lentil
"""
df = pd.read_csv(StringIO(DATA))

# 2. Define Features (X) and Target (y)
features = ['N', 'P', 'K', 'pH', 'Temp', 'Humidity', 'Rainfall']
X = df[features]
y = df['Crop']

# 3. Train a Simple Classifier
model = DecisionTreeClassifier(random_state=42)
model.fit(X, y)

# 4. Save the Model using Joblib (creates the .pkl file)
joblib.dump(model, 'crop_prediction_model.pkl')

print("Successfully trained and saved model as crop_prediction_model.pkl")

