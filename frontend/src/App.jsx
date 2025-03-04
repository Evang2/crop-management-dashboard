import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { Droplet, Thermometer, CloudRain } from "lucide-react";

function App() {
  const [sensorData] = useState({
    N: 50,
    P: 30,
    K: 20,
    temperature: 25,
    humidity: 50,
    soilMoisture: 35,
  });

  const [recommendedCrop, setRecommendedCrop] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [adjustments, setAdjustments] = useState("");
  const [cropIdealConditions, setCropIdealConditions] = useState({});

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5001/ideal_conditions")
      .then((response) => setCropIdealConditions(response.data))
      .catch((err) => console.error("Error fetching ideal conditions:", err));
  }, []);

  const fetchPrediction = useCallback(async () => {
    try {
      const requestData = { ...sensorData };
      delete requestData.soilMoisture;
      const response = await axios.post(
        "http://127.0.0.1:5001/predict",
        requestData
      );
      if (response.data.recommendedCrop) {
        setRecommendedCrop(response.data.recommendedCrop);
      } else {
        setRecommendedCrop("Error: No crop received");
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setRecommendedCrop("Error fetching prediction");
    }
  }, [sensorData]);

  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  const calculateAdjustments = () => {
    if (!selectedCrop || !cropIdealConditions[selectedCrop]) {
      setAdjustments("No specific adjustments available.");
      return;
    }

    const ideal = cropIdealConditions[selectedCrop];
    if (
      !ideal.N ||
      !ideal.P ||
      !ideal.K ||
      !ideal.temperature ||
      !ideal.humidity
    ) {
      setAdjustments("Incomplete crop data. Unable to calculate adjustments.");
      return;
    }

    const suggestions = [];
    const idealValues = {
      N: ideal.N,
      P: ideal.P,
      K: ideal.K,
      temperature: ideal.temperature,
      humidity: ideal.humidity,
    };
    // Nitrogen (N)
    if (sensorData.N < idealValues.N.min) {
      suggestions.push(
        `Increase Nitrogen: Current level is ${sensorData.N.toFixed(
          2
        )}%. Ideal range: ${idealValues.N.min.toFixed(
          2
        )}% - ${idealValues.N.max.toFixed(
          2
        )}%. Consider adding a nitrogen-rich fertilizer.`
      );
    }
    if (sensorData.N > idealValues.N.max) {
      suggestions.push(
        `Decrease Nitrogen: Current level is ${sensorData.N.toFixed(
          2
        )}%. Ideal range: ${idealValues.N.min.toFixed(
          2
        )}% - ${idealValues.N.max.toFixed(
          2
        )}%. Consider using a nitrogen-fixing cover crop.`
      );
    }

    // Phosphorus (P)
    if (sensorData.P < idealValues.P.min) {
      suggestions.push(
        `Increase Phosphorus: Current level is ${sensorData.P.toFixed(
          2
        )}%. Ideal range: ${idealValues.P.min.toFixed(
          2
        )}% - ${idealValues.P.max.toFixed(
          2
        )}%. Consider applying a phosphorus-rich fertilizer.`
      );
    }
    if (sensorData.P > idealValues.P.max) {
      suggestions.push(
        `Decrease Phosphorus: Current level is ${sensorData.P.toFixed(
          2
        )}%. Ideal range: ${idealValues.P.min.toFixed(
          2
        )}% - ${idealValues.P.max.toFixed(
          2
        )}%. Avoid excessive use of phosphorus fertilizers.`
      );
    }

    // Potassium (K)
    if (sensorData.K < idealValues.K.min) {
      suggestions.push(
        `Increase Potassium: Current level is ${sensorData.K.toFixed(
          2
        )}%. Ideal range: ${idealValues.K.min.toFixed(
          2
        )}% - ${idealValues.K.max.toFixed(
          2
        )}%. Apply potassium-rich fertilizers such as potassium sulfate.`
      );
    }
    if (sensorData.K > idealValues.K.max) {
      suggestions.push(
        `Decrease Potassium: Current level is ${sensorData.K.toFixed(
          2
        )}%. Ideal range: ${idealValues.K.min.toFixed(
          2
        )}% - ${idealValues.K.max.toFixed(
          2
        )}%. Consider adjusting your fertilizer regimen to reduce potassium levels.`
      );
    }

    // Temperature
    if (sensorData.temperature < idealValues.temperature.min) {
      suggestions.push(
        `Increase temperature: Current temperature is ${Math.round(
          sensorData.temperature
        )}°C. Ideal range: ${Math.round(
          idealValues.temperature.min
        )}°C - ${Math.round(
          idealValues.temperature.max
        )}°C. Consider using row covers to retain heat.`
      );
    }
    if (sensorData.temperature > idealValues.temperature.max) {
      suggestions.push(
        `Decrease temperature: Current temperature is ${Math.round(
          sensorData.temperature
        )}°C. Ideal range: ${Math.round(
          idealValues.temperature.min
        )}°C - ${Math.round(
          idealValues.temperature.max
        )}°C. Shade the plants to avoid overheating.`
      );
    }

    // Humidity
    if (sensorData.humidity < idealValues.humidity.min) {
      suggestions.push(
        `Increase humidity: Current humidity is ${Math.round(
          sensorData.humidity
        )}%. Ideal range: ${Math.round(
          idealValues.humidity.min
        )}% - ${Math.round(
          idealValues.humidity.max
        )}%. Consider using a humidifier or misting the plants.`
      );
    }
    if (sensorData.humidity > idealValues.humidity.max) {
      suggestions.push(
        `Decrease humidity: Current humidity is ${Math.round(
          sensorData.humidity
        )}%. Ideal range: ${Math.round(
          idealValues.humidity.min
        )}% - ${Math.round(
          idealValues.humidity.max
        )}%. Ensure proper air circulation to reduce humidity.`
      );
    }

    // Soil Moisture (Handled separately, not from the CSV)
    if (sensorData.soilMoisture < 30) {
      suggestions.push("Increase soil moisture (more watering).");
    }
    if (sensorData.soilMoisture > 70) {
      suggestions.push("Reduce soil moisture (less watering).");
    }

    setAdjustments(
      suggestions.length > 0 ? suggestions.join(" ") : "Conditions are optimal."
    );
  };

  return (
    <div className="container">
      <h1 className="header">🌱 Crop Management Dashboard</h1>

      {/* Sensor Cards Section */}
      <div className="card-container">
        <Card className="card">
          <Thermometer className="card-icon" />
          <p className="card-text">Temperature: {sensorData.temperature}°C</p>
        </Card>
        <Card className="card">
          <CloudRain className="card-icon" />
          <p className="card-text">Humidity: {sensorData.humidity}%</p>
        </Card>
        <Card className="card">
          <Droplet className="card-icon" />
          <p className="card-text">Soil Moisture: {sensorData.soilMoisture}%</p>
        </Card>
      </div>

      {/* Nutrient Levels Chart */}
      <div className="chart-container">
        <h2 className="chart-heading">Nutrient Levels (N, P, K)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: "N", value: sensorData.N },
              { name: "P", value: sensorData.P },
              { name: "K", value: sensorData.K },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4CAF50" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recommended Crop Section */}
      <div className="text-center">
        <h2 className="sub-heading">🌾 Recommended Crop</h2>
        {recommendedCrop ? (
          <p className="text-lg">{recommendedCrop}</p>
        ) : (
          <p>Loading prediction...</p>
        )}
      </div>

      {/* Watering Advice Section */}
      <div className="text-center">
        <h2 className="sub-heading">🚰 Watering Advice</h2>
        {sensorData.soilMoisture < 41 ? (
          <p className="warning-text">
            ⚠️ Soil moisture is too low! You need to water the crop.
          </p>
        ) : (
          <p className="healthy-text">
            ✅ Soil moisture is at a healthy level.
          </p>
        )}
      </div>

      {/* Crop Selection Section */}
      <div className="text-center">
        <h2 className="sub-heading">🌿 Choose a Crop</h2>
        <select
          onChange={(e) => setSelectedCrop(e.target.value)}
          value={selectedCrop}
          className="select-box"
        >
          <option value="">-- Select a Crop --</option>
          {Object.keys(cropIdealConditions).map((crop) => (
            <option key={crop} value={crop}>
              {crop}
            </option>
          ))}
        </select>

        <Button onClick={calculateAdjustments} className="button">
          Get Adjustments
        </Button>
      </div>

      {/* Display Adjustments */}
      {adjustments && (
        <p className="adjustments">🔧 Adjustments: {adjustments}</p>
      )}
    </div>
  );
}

export default App;
