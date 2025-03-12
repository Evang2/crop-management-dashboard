import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np 
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app)

# Load the trained model
model = tf.keras.models.load_model("crop_recommendation_model.h5")

# Load the dataset
df = pd.read_csv("Cropdata.csv")

# Encode labels (crop names)
le = LabelEncoder()
df['label'] = le.fit_transform(df['label'])
crop_labels = le.classes_  # Store the original crop names

# Calculate min/max values for each crop
ideal_conditions = df.groupby("label").agg({
    "N": ["min", "max"],
    "P": ["min", "max"],
    "K": ["min", "max"],
    "temperature": ["min", "max"],
    "humidity": ["min", "max"]
})

# Flatten the ideal_conditions DataFrame to make it JSON-compatible
flattened_conditions = {}

# Map numeric labels to crop names
for crop, conditions in ideal_conditions.iterrows():
    flattened_conditions[crop_labels[crop]] = {  # Using crop_labels to map the index to the name
        "N": {"min": conditions["N"]["min"], "max": conditions["N"]["max"]},
        "P": {"min": conditions["P"]["min"], "max": conditions["P"]["max"]},
        "K": {"min": conditions["K"]["min"], "max": conditions["K"]["max"]},
        "temperature": {"min": conditions["temperature"]["min"], "max": conditions["temperature"]["max"]},
        "humidity": {"min": conditions["humidity"]["min"], "max": conditions["humidity"]["max"]}
    }

# Now, flattened_conditions is a dictionary with the correct structure and crop names
ideal_conditions = flattened_conditions

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Extract only the required inputs (without soil moisture)
        N = float(data['N'])
        P = float(data['P'])
        K = float(data['K'])
        temperature = float(data['temperature'])
        humidity = float(data['humidity'])

        # Convert input into a NumPy array
        input_data = np.array([[N, P, K, temperature, humidity]], dtype=np.float32)

        # Make prediction
        prediction = model.predict(input_data)
        predicted_class = np.argmax(prediction, axis=1)[0]
        recommended_crop = crop_labels[predicted_class]

        return jsonify({"recommendedCrop": recommended_crop})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ New Route: Send Ideal Conditions to React
@app.route('/ideal_conditions', methods=['GET'])
def get_ideal_conditions():
    return jsonify(ideal_conditions)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
