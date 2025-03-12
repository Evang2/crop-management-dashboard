import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from sklearn.preprocessing import LabelEncoder
from flask_sqlalchemy import SQLAlchemy
import pandas as pd

app = Flask(__name__)
CORS(app)

# Define the path to store the database using absolute paths
base_dir = os.path.abspath(os.path.dirname(__file__))
database_dir = os.path.join(base_dir, 'database')
db_path = os.path.join(database_dir, 'sensor_data.db')

# Create the database directory if it doesn't exist
try:
    if not os.path.exists(database_dir):
        os.makedirs(database_dir)
        print(f"Created database directory at: {database_dir}")
except Exception as e:
    print(f"Error creating database directory: {e}")

# Set up the SQLite database URI with absolute path
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
print(f"Database path: {db_path}")
db = SQLAlchemy(app)

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

# SensorData Model to store incoming data in the database
class SensorData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    N = db.Column(db.Float)
    P = db.Column(db.Float)
    K = db.Column(db.Float)
    temperature = db.Column(db.Float)
    humidity = db.Column(db.Float)
    soilMoisture = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())  # Timestamp when data is added

    def __repr__(self):
        return f'<SensorData {self.id}, {self.timestamp}>'

# Store the latest sensor data in memory (for simplicity)
latest_sensor_data = {}

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

@app.route('/ideal_conditions', methods=['GET'])
def get_ideal_conditions():
    return jsonify(ideal_conditions)

@app.route('/update_sensor_data', methods=['POST'])
def update_sensor_data():
    try:
        data = request.get_json()

        # Store the latest sensor data in memory
        latest_sensor_data.update(data)

        # Store the sensor data in the database
        sensor_data = SensorData(
            N=data['N'],
            P=data['P'],
            K=data['K'],
            temperature=data['temperature'],
            humidity=data['humidity'],
            soilMoisture=data['soilMoisture']
        )

        # Add the sensor data to the database and commit
        db.session.add(sensor_data)
        db.session.commit()

        return jsonify({"message": "Sensor data received and stored successfully", "data": data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/latest_sensor_data', methods=['GET'])
def get_latest_sensor_data():
    return jsonify(latest_sensor_data)

@app.route('/sensor_data_history', methods=['GET'])
def get_sensor_data_history():
    # Fetch all historical data from the database
    all_data = SensorData.query.all()
    data_list = []
    for data in all_data:
        data_dict = {
            "id": data.id,
            "N": data.N,
            "P": data.P,
            "K": data.K,
            "temperature": data.temperature,
            "humidity": data.humidity,
            "soilMoisture": data.soilMoisture,
            "timestamp": data.timestamp
        }
        data_list.append(data_dict)
    return jsonify(data_list)

if __name__ == '__main__':
    # Create the database tables if they don't exist
    with app.app_context():
        db.create_all()
        print("Database tables created successfully")
app.run(debug=True, host='0.0.0.0', port=5001)