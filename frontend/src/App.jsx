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
  LineChart,
  Line,
} from "recharts";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { 
  Droplet, 
  Thermometer, 
  CloudRain, 
  RefreshCw, 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Layers
} from "lucide-react";
import SensorDataHistory from "./SensorDataHistory";

function App() {
  const [sensorData, setSensorData] = useState({
    N: 0,
    P: 0,
    K: 0,
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
  });

  const [recommendedCrop, setRecommendedCrop] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [adjustments, setAdjustments] = useState("");
  const [cropIdealConditions, setCropIdealConditions] = useState({});
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch ideal conditions for crops
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5001/ideal_conditions")
      .then((response) => setCropIdealConditions(response.data))
      .catch((err) => console.error("Error fetching ideal conditions:", err));
  }, []);

  // Prediction function
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
    } catch (err) {
      setRecommendedCrop("Error fetching prediction");
      console.error("Prediction error:", err);
    }
  }, [sensorData]);

  // Initial prediction on component mount
  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  // Function to fetch latest sensor data
  const fetchLatestSensorData = useCallback(async () => {
    if (!isLive && !loading) return;
    
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:5001/latest_sensor_data");
      
      if (response.data && Object.keys(response.data).length > 0) {
        // Update state with new sensor data
        setSensorData(response.data);
        setLastUpdated(new Date());
        
        // Trigger prediction with new data
        await fetchPrediction();
      }
    } catch (err) {
      console.error("Error fetching latest sensor data:", err);
    } finally {
      setLoading(false);
    }
  }, [isLive, loading, fetchPrediction]);

  // Set up polling for live data
  useEffect(() => {
    // Initial fetch
    if (isLive) {
      fetchLatestSensorData();
    }
    
    // Set up interval for live data updates
    const intervalId = setInterval(() => {
      if (isLive) {
        fetchLatestSensorData();
      }
    }, 10000); // every 10 seconds
    
    // Clean up interval on component unmount or when isLive changes
    return () => clearInterval(intervalId);
  }, [isLive, fetchLatestSensorData]);

  // Function to calculate adjustments based on selected crop
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

    // Soil Moisture
    if (sensorData.soilMoisture < 30) {
      suggestions.push(`Increase soil moisture: Current level is ${Math.round(sensorData.soilMoisture)}%. Recommended: 30-70%. Increase watering frequency.`);
    }
    if (sensorData.soilMoisture > 70) {
      suggestions.push(`Reduce soil moisture: Current level is ${Math.round(sensorData.soilMoisture)}%. Recommended: 30-70%. Reduce watering frequency.`);
    }

    setAdjustments(
      suggestions.length > 0 ? suggestions.join(" ") : "All conditions are optimal for this crop."
    );
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    await fetchLatestSensorData();
  };

  // Custom tooltip for nutrient chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px"
        }}>
          <p><strong>{payload[0].name}</strong>: {payload[0].value.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  // Format Nutrient data for chart
  const nutrientData = [
    { name: "Nitrogen (N)", value: sensorData.N, fill: "#4c956c" },
    { name: "Phosphorus (P)", value: sensorData.P, fill: "#2c6e49" },
    { name: "Potassium (K)", value: sensorData.K, fill: "#224d36" },
  ];

  return (
    <div className="container">
      <h1 className="header">
        <Leaf size={32} />
        Crop Management Dashboard
      </h1>
      
      {/* Live Data Control */}
      <div className="live-data-control">
        <Button 
          onClick={() => setIsLive(!isLive)} 
          className={`button ${isLive ? 'active' : ''}`}
        >
          {isLive ? '● Live Data' : '○ Live Data'}
        </Button>
        
        <Button 
          onClick={handleManualRefresh} 
          className="button refresh-button"
          disabled={loading}
        >
          <RefreshCw className={loading ? 'spinning' : ''} size={16} />
          Refresh
        </Button>
        
        {lastUpdated && (
          <span className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Sensor Cards Section */}
      <div className="card-container">
        <Card className="card">
          <Thermometer className="card-icon" />
          <p className="card-text">Temperature</p>
          <p className="text-lg">{sensorData.temperature}°C</p>
        </Card>
        <Card className="card">
          <CloudRain className="card-icon" />
          <p className="card-text">Humidity</p>
          <p className="text-lg">{sensorData.humidity}%</p>
        </Card>
        <Card className="card">
          <Droplet className="card-icon" />
          <p className="card-text">Soil Moisture</p>
          <p className="text-lg">{sensorData.soilMoisture}%</p>
        </Card>
      </div>

      {/* Nutrient Levels Chart */}
      <div className="chart-container">
        <h2 className="chart-heading">
          <Layers size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Nutrient Levels
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={nutrientData}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#4c956c" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cards for Recommended Crop and Watering Advice */}
      <div className="card-container2">
        {/* Recommended Crop Section */}
        <div className="card2">
          <h2 className="sub-heading">
            <Leaf size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Recommended Crop
          </h2>
          {recommendedCrop ? (
            <p className="text-lg">{recommendedCrop}</p>
          ) : (
            <p className="loading-text">Analyzing soil conditions...</p>
          )}
        </div>

        {/* Watering Advice Section */}
        <div className="card2">
          <h2 className="sub-heading">
            <Droplet size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Watering Advice
          </h2>
          {sensorData.soilMoisture < 30 ? (
            <p className="warning-text">
              <AlertTriangle size={18} />
              Soil moisture is too low! Watering needed.
            </p>
          ) : sensorData.soilMoisture > 70 ? (
            <p className="warning-text">
              <AlertTriangle size={18} />
              Soil moisture is too high! Reduce watering.
            </p>
          ) : (
            <p className="healthy-text">
              <CheckCircle size={18} />
              Soil moisture is at a healthy level.
            </p>
          )}
        </div>
      </div>

      {/* Crop Selection Section */}
      <div className="card2">
        <h2 className="sub-heading">
          <Leaf size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Crop Adjustment Calculator
        </h2>
        <select
          onChange={(e) => setSelectedCrop(e.target.value)}
          value={selectedCrop}
          className="select-box"
        >
          <option value="">-- Select a Crop --</option>
          {Object.keys(cropIdealConditions).sort().map((crop) => (
            <option key={crop} value={crop}>
              {crop}
            </option>
          ))}
        </select>

        <Button onClick={calculateAdjustments} className="button">
          Calculate Adjustments
        </Button>

        {/* Display Adjustments */}
        {adjustments && (
          <div className="adjustments-container">
            <h3 className="adjustments-heading">
              {adjustments.includes("optimal") ? (
                <>
                  <CheckCircle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Conditions Assessment
                </>
              ) : (
                <>
                  <AlertTriangle size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Recommended Adjustments
                </>
              )}
            </h3>
            <div className="adjustments">
              {adjustments.split(". ").map((adjustment, index) => (
                adjustment && (
                  <p key={index} style={{ margin: '8px 0' }}>
                    {adjustment.includes("Increase") ? (
                      <TrendingUp size={16} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#4c956c' }} />
                    ) : adjustment.includes("Decrease") || adjustment.includes("Reduce") ? (
                      <TrendingDown size={16} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#d62828' }} />
                    ) : (
                      <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#5cb85c' }} />
                    )}
                    {adjustment + (adjustment.endsWith('.') ? '' : '.')}
                  </p>
                )
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Historical Data Section */}
      <SensorDataHistory />
    </div>
  );
}

export default App;