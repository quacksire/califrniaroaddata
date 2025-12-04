# California Road Data Explorer

A modern web application for exploring California's road network data, built with Astro and React.

## Features

- **Interactive Explorer**: Navigate through Caltrans districts, counties, and routes.
- **Real-time Cameras**: View live traffic camera feeds using HLS streaming.
- **Global Search**: Quickly find specific locations or routes.
- **Responsive Design**: Built with Tailwind CSS for a seamless experience on all devices.

## Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Video Player**: [hls.js](https://github.com/video-dev/hls.js)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/quacksire/califrniaroaddata.git
   cd califrniaroaddata
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:4321`.

## Project Structure

- `src/components`: React components for the UI (Explorer, DistrictSelector, HLSVideoPlayer, etc.)
- `src/pages`: Astro pages and routing logic.
- `src/utils`: Utility functions, including Caltrans data fetching.
- `src/styles`: Global styles and Tailwind configuration.
