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
    const suggestions = [];
    const idealValues = {
      N: [ideal.N.min, ideal.N.max],
      P: [ideal.P.min, ideal.P.max],
      K: [ideal.K.min, ideal.K.max],
      temperature: [ideal.temperature.min, ideal.temperature.max],
      humidity: [ideal.humidity.min, ideal.humidity.max],
    };

    if (sensorData.N < idealValues.N[0]) suggestions.push("Increase Nitrogen.");
    if (sensorData.N > idealValues.N[1]) suggestions.push("Decrease Nitrogen.");

    if (sensorData.P < idealValues.P[0])
      suggestions.push("Increase Phosphorus.");
    if (sensorData.P > idealValues.P[1])
      suggestions.push("Decrease Phosphorus.");

    if (sensorData.K < idealValues.K[0])
      suggestions.push("Increase Potassium.");
    if (sensorData.K > idealValues.K[1])
      suggestions.push("Decrease Potassium.");

    if (sensorData.temperature < idealValues.temperature[0])
      suggestions.push("Increase temperature (warm environment).");
    if (sensorData.temperature > idealValues.temperature[1])
      suggestions.push("Decrease temperature (cooling needed).");

    if (sensorData.humidity < idealValues.humidity[0])
      suggestions.push("Increase humidity.");
    if (sensorData.humidity > idealValues.humidity[1])
      suggestions.push("Decrease humidity.");

    if (sensorData.soilMoisture < 30)
      suggestions.push("Increase soil moisture (more watering).");
    if (sensorData.soilMoisture > 70)
      suggestions.push("Reduce soil moisture (less watering).");

    setAdjustments(
      suggestions.length > 0 ? suggestions.join(" ") : "Conditions are optimal."
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
      <div className="w-full max-w-7xl p-6">
        {/* Header */}
        <h1 className="text-5xl font-bold text-center text-white mb-8">
        🌱 Crop Management Dashboard
        </h1>

        {/* Sensor Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 py-8">
          {/* Temperature Card */}
          <Card className="flex-col items-center w-full">
            <Thermometer className="w-16 h-16 text-blue-600" />
            <p className="mt-4 text-xl font-semibold">
              Temperature: {sensorData.temperature}°C
            </p>
          </Card>
          {/* Humidity Card */}
          <Card className="flex-col items-center w-full">
            <CloudRain className="w-16 h-16 text-green-600" />
            <p className="mt-4 text-xl font-semibold">
              Humidity: {sensorData.humidity}%
            </p>
          </Card>
          {/* Soil Moisture Card */}
          <Card className="flex-col items-center w-full">
            <Droplet className="w-16 h-16 text-teal-600" />
            <p className="mt-4 text-xl font-semibold">
              Soil Moisture: {sensorData.soilMoisture}%
            </p>
          </Card>
        </div>

        {/* Nutrient Levels Chart Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8 w-full">
          <h2 className="text-2xl font-bold mb-6">Nutrient Levels (N, P, K)</h2>
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
        <div className="mb-8 w-full text-center">
          <h2 className="text-2xl font-semibold">🌾 Recommended Crop</h2>
          {recommendedCrop ? (
            <p className="text-2xl font-bold">{recommendedCrop}</p>
          ) : (
            <p>Loading prediction...</p>
          )}
        </div>

        {/* Watering Advice Section */}
        <div className="mb-8 w-full text-center">
          <h2 className="text-2xl font-semibold">🚰 Watering Advice</h2>
          {sensorData.soilMoisture < 41 ? (
            <p className="text-red-500 font-bold">
              ⚠️ Soil moisture is too low! You need to water the crop.
            </p>
          ) : (
            <p className="text-green-500 font-bold">
              ✅ Soil moisture is at a healthy level.
            </p>
          )}
        </div>

        {/* Crop Selection Section */}
        <div className="mb-8 w-full text-center">
          <h2 className="text-2xl font-semibold">🌿 Choose a Crop</h2>
          <select
            onChange={(e) => setSelectedCrop(e.target.value)}
            value={selectedCrop}
            className="p-3 bg-white text-black border-2 rounded-lg mb-4"
          >
            <option value="">-- Select a Crop --</option>
            {Object.keys(cropIdealConditions).map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>

          <Button
            onClick={calculateAdjustments}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out"
          >
            Get Adjustments
          </Button>
        </div>

        {/* Display Adjustments */}
        {adjustments && (
          <p className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 mt-4">
            🔧 Adjustments: {adjustments}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
