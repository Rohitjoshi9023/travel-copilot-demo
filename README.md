# ✈️ Trip Planner Copilot Demo

**AI-powered trip planning copilot with natural language integrated with Google Maps**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

An open-source demo showcasing how to build AI-powered applications with the [YourGPT Copilot SDK](https://copilot-sdk.yourgpt.ai/docs). This project demonstrates natural language trip planning integrated with Google Maps.

---

## 🎬 Demo

<!-- Add your YouTube video link here -->
[![Demo Video](https://img.shields.io/badge/Watch-Demo_Video-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=3piC8oJkX4c)

### Screenshots

| | |
|:---:|:---:|
| ![Screenshot 1](https://i.ytimg.com/vi/3piC8oJkX4c/maxres1.jpg) | ![Screenshot 2](https://i.ytimg.com/vi/3piC8oJkX4c/maxres2.jpg) |
---

## ✨ Features

- 🗣️ **Natural Language Planning** - Just describe what you want: "Find me coffee shops near the Eiffel Tower"
- 🗺️ **Multiple Map Views** - Switch between 2D, 3D photorealistic, and Street View
- 🔍 **Smart Place Search** - AI-powered search with recommendations and detailed place info
- 📅 **Drag-and-Drop Itinerary** - Organize your trip with intuitive day-by-day planning
- 📄 **PDF Export** - Download your complete trip itinerary

---

## 🛠️ Built With

| Technology | Description |
|------------|-------------|
| [**YourGPT Copilot SDK**](https://copilot-sdk.yourgpt.ai/docs) | AI integration for natural language interactions |
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library |
| [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) | Maps, Places, and Street View |
| [Zustand](https://zustand-demo.pmnd.rs/) | State management |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [dnd-kit](https://dndkit.com/) | Drag and drop |

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Rohitjoshi9023/trip-planner-copilot-demo.git
cd trip-planner-copilot-demo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Google Maps API Key (client-side)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google Maps API Key (server-side for Places API)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

> **Note:** You'll need a Google Maps API key with the following APIs enabled:
> - Maps JavaScript API
> - Places API
> - Geocoding API

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤖 AI Tools Overview

Travel Copilot uses **19 AI-powered tools** that the copilot can invoke based on natural language requests:

### Navigation Tools
| Tool | Description |
|------|-------------|
| `flyToLocation` | Navigate the map to any location |
| `setMapView` | Switch between 2D, 3D, and Street View |
| `adjustZoom` | Zoom in or out on the map |

### Search Tools
| Tool | Description |
|------|-------------|
| `searchPlaces` | Search for places by name or type |
| `searchNearby` | Find places near a specific location |
| `getPlaceDetails` | Get detailed info about a place |
| `getDirections` | Get directions between locations |

### Marker Tools
| Tool | Description |
|------|-------------|
| `addMarker` | Add a marker to the map |
| `clearMarkers` | Remove all markers |

### Trip Management Tools
| Tool | Description |
|------|-------------|
| `createTrip` | Create a new trip |
| `listTrips` | Show all saved trips |
| `getTripDetails` | Get full trip itinerary |
| `deleteTrip` | Delete a trip |
| `addToItinerary` | Add a place to trip |
| `deleteTripItem` | Remove a place from trip |
| `moveTripItem` | Move place to different day |
| `removePlacesFromTrip` | Remove multiple places |
| `reschedulePlaces` | Move multiple places at once |
| `updateDayInfo` | Set day title and description |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (places, chat)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── chat/              # Copilot chat UI & tool renderers
│   ├── layout/            # App shell and layout
│   ├── map/               # Map components (2D, 3D, Street View)
│   └── trips/             # Trip management UI
├── hooks/                 # Custom React hooks
├── lib/                   # Configuration and utilities
├── services/              # API services (places, export)
├── stores/                # Zustand state stores
└── types/                 # TypeScript type definitions
```

---

## 🤝 Contributing

Contributions are welcome! This is an open-source demo project, and we'd love your help making it better.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Found a bug or have a suggestion? [Open an issue](https://github.com/Rohitjoshi9023/trip-planner-copilot-demo/issues)!

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.
```

---

<p align="center">
  Built with ❤️ using <a href="https://copilot-sdk.yourgpt.ai/docs">YourGPT Copilot SDK</a> and <a href="https://claude.ai/code">Claude Code</a>
</p>
