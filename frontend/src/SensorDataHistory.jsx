import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { RefreshCw } from "lucide-react";

const SensorDataHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("1h"); // "1h", "24h", "7d"

  useEffect(() => {
    fetchHistoryData();
  }, [timeRange]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://127.0.0.1:5001/sensor_data_history"
      );

      if (response.data && response.data.length > 0) {
        // Filter data based on selected time range
        const filteredData = filterDataByTimeRange(response.data, timeRange);

        // Format timestamps and prepare for chart
        const formattedData = filteredData.map((entry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp).toLocaleTimeString(),
        }));

        setHistoryData(formattedData);
      }
    } catch (err) {
      console.error("Error fetching history data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterDataByTimeRange = (data, range) => {
    const now = new Date();
    let cutoff = new Date();

    switch (range) {
      case "1h":
        cutoff.setHours(now.getHours() - 1);
        break;
      case "24h":
        cutoff.setDate(now.getDate() - 1);
        break;
      case "7d":
        cutoff.setDate(now.getDate() - 7);
        break;
      default:
        cutoff.setHours(now.getHours() - 1);
    }

    return data.filter((entry) => new Date(entry.timestamp) >= cutoff);
  };

  return (
    <div className="history-container">
      <h2 className="chart-heading">Sensor Data History</h2>

      <div className="time-range-selector">
        <Button
          onClick={() => setTimeRange("1h")}
          className={`button ${timeRange === "1h" ? "active" : ""}`}
        >
          Last Hour
        </Button>
        <Button
          onClick={() => setTimeRange("24h")}
          className={`button ${timeRange === "24h" ? "active" : ""}`}
        >
          Last 24 Hours
        </Button>
        <Button
          onClick={() => setTimeRange("7d")}
          className={`button ${timeRange === "7d" ? "active" : ""}`}
        >
          Last 7 Days
        </Button>
        <Button onClick={fetchHistoryData} className="button refresh-button">
          <RefreshCw size={16} className={loading ? "spinning" : ""} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="loading-text">Loading history data...</p>
      ) : historyData.length === 0 ? (
        <p className="no-data-text">
          No historical data available for the selected time range.
        </p>
      ) : (
        <div className="charts-grid">
          <Card className="history-chart">
            <h3>Temperature & Humidity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ff7300"
                  name="Temperature (°C)"
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#387908"
                  name="Humidity (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="history-chart">
            <h3>Soil Moisture</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="soilMoisture"
                  stroke="#3366cc"
                  name="Soil Moisture (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="history-chart">
            <h3>NPK Values</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="N"
                  stroke="#4CAF50"
                  name="Nitrogen"
                />
                <Line
                  type="monotone"
                  dataKey="P"
                  stroke="#9C27B0"
                  name="Phosphorus"
                />
                <Line
                  type="monotone"
                  dataKey="K"
                  stroke="#FF5722"
                  name="Potassium"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SensorDataHistory;
