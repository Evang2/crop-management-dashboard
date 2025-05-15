# Crop Management Dashboard


A Smart Agriculture System for Data-Driven Crop Management Using IoT and AI

The Crop Management Dashboard is a web-based platform designed to enhance agricultural productivity and sustainability through real-time environmental monitoring and AI-driven decision support. Developed as part of a BSc (Hons) Computer Science thesis at the University of East London, this project integrates Arduino-based sensors and machine learning to provide farmers with actionable insights for optimizing irrigation, fertilization, and crop selection.

This repository contains the source code for the dashboard, including hardware configurations, backend APIs, machine learning models, and the frontend interface. The system is detailed in the thesis titled "Smart Agriculture: A Data-Driven Decision Support System Using Arduino and AI for Optimized Crop Management" by Andreas Evangeliou.

----------
## Table of Contents
- Features
- Technologies
- Hardware
- Installation
- Usage
- Project Structure
- License
- Contact
----------
## Features

- <b> Real-Time Monitoring: </b> Collects data on soil moisture, NPK (Nitrogen, Phosphorus, Potassium) levels, temperature, and humidity using Arduino-based sensors.
- <b> AI-Driven Crop Recommendations: </b> Utilizes a deep learning neural network (TensorFlow) to recommend optimal crops based on soil and climate conditions, achieving ~94% accuracy.
- <b> Interactive Dashboard: </b> Visualizes sensor data, historical trends, and crop recommendations through dynamic charts and alerts using React.js.
- <b> Resource Optimization: </b> Provides data-driven suggestions to minimize water and fertilizer waste, promoting sustainable farming practices.
- <b> Scalable Architecture: </b> Modular design supports small- and large-scale farming with potential for additional sensors (e.g., pH, weather).
- <b> Ethical Design: </b> Ensures data privacy, low-energy hardware, and compliance with EU regulations (GDPR, WEEE Directive).
-----------
## Technologies
| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Frontend       |  React.js / Vite / CSS               |
| Backend        |  Flask (Python)                      |
| Database       |  SQLite                              |
|Hardware Programming|  C++ (Arduino IDE)               |
|Machine Learning| Python (Pandas, Scikit-learn, TensorFlow)|
|API Testing     | Postman                              |
|Version Control |Git, GitHub                           |
|Development Environment| VS Code / Arduino IDE / Windows 11|

## Hardware

The system uses the following hardware components:
- <b> Arduino Uno R4 WiFi: </b> Microcontroller for sensor data collection and transmission.
- <b> JXBS-3001-NPK-RS Soil NPK Sensor: </b> Measures Nitrogen, Phosphorus, and Potassium levels.
- <b> Capacitive Soil Moisture Sensor: </b> Monitors soil moisture for irrigation needs.
- <b> DHT11 Temperature & Humidity Sensor: </b> Tracks ambient conditions.
- <b> PM14058 TTL to RS485 Converter Module: </b> Facilitates serial communication for NPK sensor.

--------------

## Installation

Prerequisites:
- Software:
  - Node.js (v16 or higher)
  - Python (v3.8 or higher)
  - Arduino IDE
  - Git
  - Postman (optional, for API testing)
- Hardware:
  - Arduino Uno R4 WiFi
  - JXBS-3001-NPK-RS Soil NPK Sensor
  - Capacitive Soil Moisture Sensor
  - DHT11 Temperature & Humidity Sensor
  - PM14058 TTL to RS485 Converter Module
  - Jumper wires and breadboard

## Steps

### 1. Clone the Repository:
````
git clone https://github.com/Evang2/crop-management-dashboard.git
cd crop-management-dashboard
````

### 2. Set Up Hardware:
- Connect sensors to the Arduino Uno R4 as per the connection diagram in the thesis (Figure 2, Chapter 3.4.2).
- Upload the Arduino code to the microcontroller using Arduino IDE.

### 3. Install Backend Dependencies:
````
cd server
pip install -r requirements.txt
````

### 4. Install Frontend Dependencies:
````
cd frontend
npm install
````
### 5. Run the Application:
- Start the backend server:
````
cd backend
python .\flask_api.py
````
- Start the frontend development server:
````
cd frontend
npm run dev
````

### 6. Access the Dashboard:
- Open your browser and navigate to http://localhost:5173 (or the port specified by Vite).

![Screenshot 2025-03-21 135940](https://github.com/user-attachments/assets/ef87de6f-eeec-4be9-a4b3-35917fdd0c13)
![Screenshot 2025-03-21 135952](https://github.com/user-attachments/assets/2258a679-e748-48a8-a782-2acd15be9767)
![Screenshot 2025-03-21 140053](https://github.com/user-attachments/assets/787a92b9-8c9b-41a8-8fb6-4288169a5124)
![Screenshot 2025-03-21 140932](https://github.com/user-attachments/assets/7b25a60a-8020-438e-a91b-d16268f2087b)
![Screenshot 2025-03-21 140034](https://github.com/user-attachments/assets/6fb80790-0804-4f0f-8d5d-ceae6958a13f)
![Screenshot 2025-03-21 140357](https://github.com/user-attachments/assets/71b077e3-076e-43f1-8035-f39d5328ca98)
![Screenshot 2025-03-21 140830](https://github.com/user-attachments/assets/8567512f-ba39-4dad-b6ce-3514e1a21698)

-----------

## Usage
- <b> Deploy Sensors: </b> Place sensors in the soil and ensure proper connection to the Arduino.
- <b> Monitor Data: </b> Access the dashboard to view real-time sensor readings (NPK, moisture, temperature, humidity).
- <b> Receive Recommendations: </b> The AI model analyzes sensor data and suggests optimal crops (e.g., rice, coffee) based on current conditions.
- <b> Optimize Resources: </b> Follow dashboard alerts for irrigation and fertilization to reduce waste.
- <b> Analyze Trends: </b> Use historical data visualizations to track soil and climate trends.

## License
This project is licensed under the MIT License. See the LICENSE file for details.


## Thesis Context
This project is the practical component of a thesis submitted for the BSc (Hons) Computer Science degree at the University of East London (Metropolitan College), supervised by Dr. Vasileios Stefanidis. The thesis explores the integration of IoT and AI in smart agriculture, addressing challenges like resource efficiency and sustainability.
<b> Key findings include: </b>
- ~94% accuracy in crop recommendations using a deep learning neural network.
- Significant potential for reducing water and fertilizer waste.
- Scalability for diverse agricultural environments.

The full thesis document is available upon request or via the university’s repository (Greek only).
