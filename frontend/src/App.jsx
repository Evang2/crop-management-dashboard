import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  // State for sensor data
  const [sensorData] = useState({
    N: 50,
    P: 30,
    K: 20,
    temperature: 25,
    humidity: 50,
    soilMoisture: 35  // Used separately for watering
  });

  const [recommendedCrop, setRecommendedCrop] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [adjustments, setAdjustments] = useState("");
  const [cropIdealConditions, setCropIdealConditions] = useState({});

  // ✅ Fetch Ideal Crop Conditions from Flask API
  useEffect(() => {
    axios.get("http://127.0.0.1:5001/ideal_conditions")
      .then(response => setCropIdealConditions(response.data))
      .catch(error => console.error("Error fetching ideal conditions:", error));
  }, []);

  // ✅ Fetch Recommended Crop from Flask
  const fetchPrediction = async () => {
    try {
      const requestData = { ...sensorData };
      delete requestData.soilMoisture; // Remove soilMoisture before sending to Flask

      console.log("Sending request to API...", requestData);
      const response = await axios.post("http://127.0.0.1:5001/predict", requestData);
      
      console.log("API Response:", response.data);

      if (response.data.recommendedCrop) {
        setRecommendedCrop(response.data.recommendedCrop);
      } else {
        console.error("API response is missing 'recommendedCrop'");
        setRecommendedCrop("Error: No crop received");
      }
    } catch (error) {
      console.error("Error fetching prediction:", error.response ? error.response.data : error);
      setRecommendedCrop("Error fetching prediction");
    }
  };

  // Fetch crop prediction when component mounts
  useEffect(() => {
    fetchPrediction();
  }, []);

  // ✅ Function to Calculate Adjustments
  const calculateAdjustments = () => {
    if (!selectedCrop || !cropIdealConditions[selectedCrop]) {
      setAdjustments("No specific adjustments available.");
      return;
    }

    const ideal = cropIdealConditions[selectedCrop];
    const suggestions = [];

    // Convert ideal values into a more accessible format
    const idealValues = {
      N: [ideal.N.min, ideal.N.max],
      P: [ideal.P.min, ideal.P.max],
      K: [ideal.K.min, ideal.K.max],
      temperature: [ideal.temperature.min, ideal.temperature.max],
      humidity: [ideal.humidity.min, ideal.humidity.max]
    };

    // Compare sensor values to ideal conditions and give suggestions
    if (sensorData.N < idealValues.N[0]) suggestions.push("Increase Nitrogen.");
    if (sensorData.N > idealValues.N[1]) suggestions.push("Decrease Nitrogen.");
    
    if (sensorData.P < idealValues.P[0]) suggestions.push("Increase Phosphorus.");
    if (sensorData.P > idealValues.P[1]) suggestions.push("Decrease Phosphorus.");
    
    if (sensorData.K < idealValues.K[0]) suggestions.push("Increase Potassium.");
    if (sensorData.K > idealValues.K[1]) suggestions.push("Decrease Potassium.");
    
    if (sensorData.temperature < idealValues.temperature[0]) suggestions.push("Increase temperature (warm environment).");
    if (sensorData.temperature > idealValues.temperature[1]) suggestions.push("Decrease temperature (cooling needed).");
    
    if (sensorData.humidity < idealValues.humidity[0]) suggestions.push("Increase humidity.");
    if (sensorData.humidity > idealValues.humidity[1]) suggestions.push("Decrease humidity.");

    if (sensorData.soilMoisture < 30) suggestions.push("Increase soil moisture (more watering).");
    if (sensorData.soilMoisture > 70) suggestions.push("Reduce soil moisture (less watering).");

    setAdjustments(suggestions.length > 0 ? suggestions.join(" ") : "Conditions are optimal.");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>🌱 Crop Management Dashboard</h1>

      {/* Sensor Data Table */}
      <h2>📡 Sensor Data</h2>
      <table style={{ width: "50%", margin: "auto", borderCollapse: "collapse", textAlign: "left" }}>
        <tbody>
          {Object.entries(sensorData).map(([key, value]) => (
            <tr key={key}>
              <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>{key.toUpperCase()}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Crop Recommendation */}
      <h2>🌾 Recommended Crop</h2>
      {recommendedCrop ? <p><strong>{recommendedCrop}</strong></p> : <p>Loading prediction...</p>}
      
      {/* Refresh Prediction Button */}
      <button onClick={fetchPrediction} style={{ marginTop: "10px", padding: "10px", fontSize: "16px" }}>
        🔄 Get New Prediction
      </button>

      {/* Watering Advice */}
      <h2>🚰 Watering Advice</h2>
      {sensorData.soilMoisture < 41 ? (
        <p style={{ color: "red", fontWeight: "bold" }}>⚠️ Soil moisture is too low! You need to water the crop.</p>
      ) : (
        <p style={{ color: "green", fontWeight: "bold" }}>✅ Soil moisture is at a healthy level.</p>
      )}

      {/* Select Crop for Adjustments */}
      <h2>🌿 Choose a Crop</h2>
      <select onChange={(e) => setSelectedCrop(e.target.value)} value={selectedCrop}>
        <option value="">-- Select a Crop --</option>
        {Object.keys(cropIdealConditions).map((crop) => (
          <option key={crop} value={crop}>{crop}</option>
        ))}
      </select>
      <button onClick={calculateAdjustments} style={{ marginLeft: "10px", padding: "5px" }}>
        Get Adjustments
      </button>

      {/* Display Crop Adjustments */}
      {adjustments && <p style={{ fontWeight: "bold", marginTop: "10px" }}>🔧 Adjustments: {adjustments}</p>}

    </div>
  );
}

export default App;
