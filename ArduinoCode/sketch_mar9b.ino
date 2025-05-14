#include <WiFi.h>
#include <DHT.h>
#include <SoftwareSerial.h>
#include <Wire.h>
#include "secrets.h"  // WiFi Credentials (SSID, PASSWORD)

// Pin Definitions
#define SOIL_MOISTURE_ANALOG_PIN A0
#define DHT_PIN 4
#define DHT_TYPE DHT11
#define RS485_RX_PIN 2  // Changed to match second code sample
#define RS485_TX_PIN 3  // Changed to match second code sample
#define RE 8  // Receiver Enable pin
#define DE 7  // Driver Enable pin

// WiFi Credentials
const char* ssid = SECRET_SSID;
const char* password = SECRET_PASS;

// Server Configuration
const char server[] = "192.168.1.70";  // Flask Server IP
const int port = 5001;

// Modbus RTU requests for reading NPK values
const byte nitro[] = {0x01, 0x03, 0x00, 0x1e, 0x00, 0x01, 0xe4, 0x0c};
const byte phos[] = {0x01, 0x03, 0x00, 0x1f, 0x00, 0x01, 0xb5, 0xcc};
const byte pota[] = {0x01, 0x03, 0x00, 0x20, 0x00, 0x01, 0x85, 0xc0};

// A variable used to store NPK values
byte values[11];

// Initialize Sensors
DHT dht(DHT_PIN, DHT_TYPE);
SoftwareSerial rs485Serial(RS485_RX_PIN, RS485_TX_PIN); // For RS485 communication with NPK sensor
WiFiClient client;

// Sensor Data
float temperature = 0.0;
float humidity = 0.0;
int soilMoisture = 0;
int nitrogen = -1;  // Default to -1 (error state)
int phosphorus = -1;
int potassium = -1;

// Timing for Measurements
unsigned long lastMeasurementTime = 0;
const unsigned long MEASUREMENT_INTERVAL = 120000; // 2 minutes delay

void setup() {
  Serial.begin(9600);
  Serial.println("Starting agricultural sensor system...");
  
  dht.begin();
  rs485Serial.begin(9600); // Ensure the correct baud rate for your sensor
  
  // Define pin modes for RE and DE
  pinMode(RE, OUTPUT);
  pinMode(DE, OUTPUT);
  
  // Initial state: receiver mode
  digitalWrite(RE, LOW);
  digitalWrite(DE, LOW);
  
  connectToWiFi();
  
  delay(500);
}

void loop() {
  unsigned long currentMillis = millis();

  // Take measurements every 2 minutes
  if (currentMillis - lastMeasurementTime >= MEASUREMENT_INTERVAL) {
    lastMeasurementTime = currentMillis;

    readSensorData();
    readNPKValues();

    if (WiFi.status() == WL_CONNECTED) {
      sendDataToServer();
    } else {
      Serial.println("WiFi connection lost. Reconnecting...");
      connectToWiFi();
    }
  }
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi network: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  int timeout = 0;
  
  while (WiFi.status() != WL_CONNECTED && timeout < 20) {
    delay(500);
    Serial.print(".");
    timeout++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi. Check credentials or network.");
  }
}

void readSensorData() {
  Serial.println("Reading temperature and humidity...");

  temperature = dht.readTemperature();
  humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    temperature = 0.0;
    humidity = 0.0;
  } else {
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.print("°C, Humidity: ");
    Serial.print(humidity);
    Serial.println("%");
  }

  // Read soil moisture
  soilMoisture = map(analogRead(SOIL_MOISTURE_ANALOG_PIN), 0, 1023, 100, 0);
  Serial.print("Soil Moisture: ");
  Serial.print(soilMoisture);
  Serial.println("%");
}

void readNPKValues() {
  Serial.println("Reading NPK values...");

  // Read individual NPK values using the specialized functions
  byte n = getNitrogen();
  delay(250);
  byte p = getPhosphorous();
  delay(250);
  byte k = getPotassium();
  delay(250);

  // Update the global variables with the new values
  nitrogen = n;
  phosphorus = p;
  potassium = k;

  Serial.print("N: "); Serial.print(nitrogen);
  Serial.print(" mg/kg, P: "); Serial.print(phosphorus);
  Serial.print(" mg/kg, K: "); Serial.println(potassium);
  Serial.println(" mg/kg");
}

byte getNitrogen() {
  digitalWrite(DE, HIGH);
  digitalWrite(RE, HIGH);
  delay(10);
  
  if(rs485Serial.write(nitro, sizeof(nitro)) == 8) {
    digitalWrite(DE, LOW);
    digitalWrite(RE, LOW);
    
    // Clear any old data
    while(rs485Serial.available()) {
      rs485Serial.read();
    }
    
    delay(100); // Give time for the response to arrive
    
    // Read response
    int i = 0;
    while(rs485Serial.available() && i < 7) {
      values[i] = rs485Serial.read();
      Serial.print(values[i], HEX);
      Serial.print(" ");
      i++;
    }
    Serial.println();
  }
  
  return values[4]; // Return the value byte
}

byte getPhosphorous() {
  digitalWrite(DE, HIGH);
  digitalWrite(RE, HIGH);
  delay(10);
  
  if(rs485Serial.write(phos, sizeof(phos)) == 8) {
    digitalWrite(DE, LOW);
    digitalWrite(RE, LOW);
    
    // Clear any old data
    while(rs485Serial.available()) {
      rs485Serial.read();
    }
    
    delay(100); // Give time for the response to arrive
    
    // Read response
    int i = 0;
    while(rs485Serial.available() && i < 7) {
      values[i] = rs485Serial.read();
      Serial.print(values[i], HEX);
      Serial.print(" ");
      i++;
    }
    Serial.println();
  }
  
  return values[4]; // Return the value byte
}

byte getPotassium() {
  digitalWrite(DE, HIGH);
  digitalWrite(RE, HIGH);
  delay(10);
  
  if(rs485Serial.write(pota, sizeof(pota)) == 8) {
    digitalWrite(DE, LOW);
    digitalWrite(RE, LOW);
    
    // Clear any old data
    while(rs485Serial.available()) {
      rs485Serial.read();
    }
    
    delay(100); // Give time for the response to arrive
    
    // Read response
    int i = 0;
    while(rs485Serial.available() && i < 7) {
      values[i] = rs485Serial.read();
      Serial.print(values[i], HEX);
      Serial.print(" ");
      i++;
    }
    Serial.println();
  }
  
  return values[4]; // Return the value byte
}

void sendDataToServer() {
  Serial.print("Connecting to server: ");
  Serial.print(server);
  Serial.print(":");
  Serial.println(port);

  if (client.connect(server, port)) {
    Serial.println("Connected to server!");

    // Create JSON data
    String jsonData = "{\"N\": " + String(nitrogen) +
                      ", \"P\": " + String(phosphorus) +
                      ", \"K\": " + String(potassium) +
                      ", \"temperature\": " + String(temperature) +
                      ", \"humidity\": " + String(humidity) +
                      ", \"soilMoisture\": " + String(soilMoisture) + "}";

    // Send HTTP POST request
    client.println("POST /update_sensor_data HTTP/1.1");
    client.println("Host: " + String(server));
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(jsonData.length());
    client.println();
    client.println(jsonData);

    Serial.println("Data sent: " + jsonData);

    client.stop();
  } else {
    Serial.println("Connection failed. Check Flask server.");
  }
}