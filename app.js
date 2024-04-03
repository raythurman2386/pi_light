const express = require("express");
const app = express();
const pigpio = require("pigpio").Gpio;

// Define GPIO pin for the light
const lightPin = 17; // Use any GPIO pin you want

// Set the pin as output
let light;
try {
  light = new pigpio(lightPin, { mode: pigpio.OUTPUT });
} catch (error) {
  console.error("Error setting up GPIO pin:", error);
  process.exit();
}

app.get("/", (req, res) => {
  res.send("API is running");
});

// Create an endpoint to turn the light on
app.get("/light/on", (req, res) => {
  try {
    light.digitalWrite(1);
    res.send("Light is ON");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error turning light on");
  }
});

// Create an endpoint to turn the light off
app.get("/light/off", (req, res) => {
  try {
    light.digitalWrite(0);
    res.send("Light is OFF");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error turning light off");
  }
});

// Create an endpoint to turn the light on or off based on the current time
app.get("/light/schedule", (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const scheduleOn = [8, 9, 10, 11, 12, 13, 14, 15, 16]; // 8am to 4pm
    const scheduleOff = [0, 1, 2, 3, 4, 5, 6, 7, 17, 18, 19, 20, 21, 22, 23];

    if (scheduleOn.includes(currentHour)) {
      light.digitalWrite(1);
      res.send(`Light is ON (Current time: ${currentHour}:${currentMinute})`);
    } else if (scheduleOff.includes(currentHour)) {
      light.digitalWrite(0);
      res.send(`Light is OFF (Current time: ${currentHour}:${currentMinute})`);
    } else {
      res.send(`Invalid time (Current time: ${currentHour}:${currentMinute})`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating light status");
  }
});

// Create an endpoint to get the current status of the light and the remaining time in the workday
app.get("/light/status", (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const scheduleOn = [8, 9, 10, 11, 12, 13, 14, 15, 16]; // 8am to 4pm
    const scheduleOff = [0, 1, 2, 3, 4, 5, 6, 7, 17, 18, 19, 20, 21, 22, 23];

    let status;
    let remainingTime;

    if (scheduleOn.includes(currentHour)) {
      status = "ON";
      remainingTime = (16 - currentHour) * 60 - currentMinute; // Calculate remaining time in the workday
    } else if (scheduleOff.includes(currentHour)) {
      status = "OFF";
      remainingTime = 0;
    } else {
      status = "Invalid time";
      remainingTime = 0;
    }

    res.send({
      status: status,
      remainingTime: remainingTime,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting light status");
  }
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
