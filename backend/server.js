const express = require("express");
const cors = require("cors");
const tf = require("@tensorflow/tfjs-node");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let model;

// Load the AI model
async function loadModel() {
  console.log("Loading AI model...");
  model = await tf.loadLayersModel("file://./crop_recommendation_model/model.json");
  console.log("Model loaded successfully!");
}
loadModel();

// Simulated sensor data
app.get("/api/sensor-data", (req, res) => {
  const fakeData = {
    temperature: (20 + Math.random() * 10).toFixed(2),
    humidity: (40 + Math.random() * 20).toFixed(2),
    soilMoisture: (30 + Math.random() * 40).toFixed(2),
  };
  res.json(fakeData);
});

// Predict the best crop
app.post("/api/predict", async (req, res) => {
  try {
    if (!model) return res.status(500).json({ error: "Model not loaded yet" });

    const { temperature, humidity, soilMoisture } = req.body;

    // Convert input to tensor
    const inputTensor = tf.tensor2d([[temperature, humidity, soilMoisture]]);
    
    // Make prediction
    const prediction = model.predict(inputTensor);
    const predictedClass = prediction.argMax(1).dataSync()[0];

    res.json({ recommendedCrop: predictedClass });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ error: "Error making prediction" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
