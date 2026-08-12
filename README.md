# Pain Tracker

This is a web application designed for tracking and visualizing pain data, built with React and Vite. It leverages modern web technologies, including Three.js for 3D rendering capabilities.

## Description

The Pain Tracker application provides a unique interface for users to log and visualize their pain over time. The use of 3D graphics suggests an interactive and intuitive way to represent pain information, possibly on a 3D model.

## Features

*   **Pain Logging**: A system for users to input and track pain episodes.
*   **3D Visualization**: Interactive 3D visualizations of pain data, powered by Three.js.
*   **Performance Monitoring**: In-app performance metrics for WebGL/WebGPU rendering.
*   **Modern Tech Stack**: Built with React, Vite for a fast development experience.

## Tech Stack

*   **Frontend**: [React](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **3D Graphics**: [Three.js](https://threejs.org/)
*   **Animation**: [@tweenjs/tween.js](https://github.com/tweenjs/tween.js)
*   **Performance**: [stats-gl](https://github.com/RenaudRohlinger/stats-gl)
*   **HDR Imaging**: [@monogrid/gainmap-js](https://github.com/MONOGRID/gainmap-js)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  Clone the repository:
    ```sh
    git clone <your-repository-url>
    ```
2.  Navigate to the project directory:
    ```sh
    cd pain-tracker
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```

### Running the Application

To start the development server, run:
```sh
npm run dev
```
Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

### Building for Production

To create a production build, run:
```sh
npm run build
```
The build artifacts will be stored in the `dist/` directory.
