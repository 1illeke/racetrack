<a name="top"></a>
[![RaceTrack Manager](src/client/img/racetrack_banner.jpg)](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
[![Node.js](https://img.shields.io/badge/Node.js-v14.0+-green)](https://nodejs.org/)
[![socket.io](https://img.shields.io/badge/socket.io-4.x-blue)](https://socket.io/)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![OS](https://img.shields.io/badge/OS-linux%2C%20windows%2C%20macOS-blue)]()

# RaceTrack Manager

RaceTrack Manager is a real-time race management system built with Node.js and Socket.io. It enables robust handling of race events—including start/stop controls, lap timing, flag management, and dynamic leaderboards—providing an engaging, interactive experience for both administrators and participants.

## Table of Contents
- [About](#about)
- [Features](#features)
- [Getting Started](#getting-started)


## About

RaceTrack Manager is designed to streamline the organization and execution of racing events. Built with modern web technologies, it offers an intuitive and responsive interface, allowing race organizers to monitor, control, and update race data in real time. Whether for local races or large-scale events, RaceTrack Manager is engineered to deliver reliability and flexibility.

**Key Benefits:**

- **Real-Time Race Control:** Easily start, pause, and end races using interactive controls.
- **Dynamic Leaderboards:** Automatically updates driver standings and lap times.
- **Flag Management:** Manage safety flags and other race signals seamlessly.
- **Responsive Design:** Built using HTML, CSS, and JavaScript, ensuring a smooth experience on all devices.
- **Scalable Architecture:** Utilizes Socket.io for efficient, real-time bidirectional communication.

## Features

- **Race Control Panel:** Manage race states including start, pause, and end functionalities.
- **Lap Timing & Tracking:** Capture and display individual lap times for drivers.
- **Driver Leaderboard:** Display current driver standings with live updates.
- **Flag Control Interface:** Enable flag-based messages and signals during races.
- **User Authentication:** Secure login for race officials and administrators.
- **Real-Time Data Updates:** Instantaneous updates via WebSocket communication.

## Testing interface reachability from other networks

Make an account on ```https://ngrok.com/``` and follow the setup guide.

## Getting Started

To set up and run RaceTrack Manager locally, follow these steps:

Windows:
```
git clone https://gitea.kood.tech/eriktobiasloo/racetrack
cd racetrack
set observer_key=YOUR_OBSERVER_PASSWORD
set receptionist_key=YOUR_RECEPTIONIST_PASSWORD
set safety_key=YOUR_SAFETY_PASSWORD
npm install
npm start
```

Linux:
```
git clone https://gitea.kood.tech/eriktobiasloo/racetrack
cd racetrack
export observer_key=YOUR_OBSERVER_PASSWORD
export receptionist_key=YOUR_RECEPTIONIST_PASSWORD
export safety_key=YOUR_SAFETY_PASSWORD
npm install
npm start
```

Ensure you have Node.js (v14 or higher) installed. The server leverages Socket.io for real-time interactions.

### Open the browser and navigate to
```
http://localhost:XXXX
```
Replace XXXX with the port number you have set in the main.js file. Default is 8000.

### Login with your credentials:
And look around what you can do.

## Public Screens
To view the public screens, navigate to the following URLs:
- **Countdown:** http://localhost:8000/race-countdown

- **Leaderboard:** http://localhost:8000/leader-board
Best and current lap times of the latest race.

- **Flag-Display:** http://localhost:8000/race-flags

- **Next-Race:** http://localhost:8000/next-race
Shows upcoming races, along with a notification for drivers of the next race when the current race ends.

## Private Screens
Accessed from the login screen by entering the set key.
- **Safety Official** http://localhost:8000/race-control
The main control screen. Shows the current (running/finished) and upcoming race. Buttons to start/end/change race mode appear when appropriate.

- **Receptionist** http://localhost:8000/front-desk
Interface for adding/editing drivers/race sessions.

- **Observer** http://localhost:8000/lap-line-tracker
Interface for recording car lap times. Controls are only visible during the race.

You can make all of them full screen by pressing F11.


## Have fun!

[Back to top](#top)
