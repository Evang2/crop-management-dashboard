import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.regularizers import l2
import numpy as np

# Load the trained weights
old_model = tf.keras.models.load_model("crop_recommendation_model.h5", compile=False)
weights = old_model.get_weights()  # Extract weights

# Rebuild the model architecture (same as in cropNN.py)
new_model = Sequential([
    Dense(128, activation='relu', kernel_regularizer=l2(0.01), input_shape=(3,)),  # 3 inputs (temp, humidity, soil moisture)
    BatchNormalization(),
    Dropout(0.5),
    Dense(64, activation='relu', kernel_regularizer=l2(0.01)),
    BatchNormalization(),
    Dropout(0.5),
    Dense(len(weights[-1]), activation='softmax')  # Output layer with same number of classes
])

# Set the extracted weights
new_model.set_weights(weights)

# Save the new model in a clean format
new_model.save("crop_recommendation_model_fixed.h5")

print("✅ Model successfully rebuilt and saved as crop_recommendation_model_fixed.h5")
