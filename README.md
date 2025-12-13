# Fully Frontend React

This project has been migrated from vanilla HTML/CSS/JS to a React + Vite application.

## Prerequisites
- Node.js (Latest stable version recommended)

## Installation

1. Navigate to the project directory:
   ```sh
   cd fully-frontend-react
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

## Running the Application

Start the development server:
```sh
npm run dev
```

Open your browser at the URL shown in the terminal (usually `http://localhost:5173`).

## Project Structure

- `src/components`: Reusable UI components (Navbar, Footer).
- `src/pages`: Page views (Home, Login, Register, Jobs).
- `src/assets`: Source assets (converted to public/images for path compatibility).
- `src/styles`: CSS files migrated from legacy project.
- `public/images`: Static images.

## Migration Status

- **Completed**: Home, Login, Register, Jobs.
- **Pending**: Additional pages (Resume, Interview, Papers, Quiz, etc.) are currently placeholders.

## Notes

- API endpoints are pointing to `https://placement-portal-backend-nwaj.onrender.com`.
- Authentication logic is simulated or prepared for JWT integration.
