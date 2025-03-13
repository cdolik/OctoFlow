# OctoFlow Client

This is the frontend client for OctoFlow, a GitHub Intelligence Platform that provides insights and recommendations for GitHub repositories.

## Features

- Repository health dashboard with comprehensive metrics
- Detailed repository analysis with actionable recommendations
- Security, reliability, maintainability, collaboration, and velocity insights
- Modern, responsive UI built with React and Material-UI

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory:
   ```
   cd client
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Running the Development Server

```
npm start
```
or
```
yarn start
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

### Building for Production

```
npm run build
```
or
```
yarn build
```

This will create an optimized production build in the `build` folder.

## Project Structure

```
client/
├── public/              # Static files
├── src/                 # Source code
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── assets/          # Images, fonts, etc.
│   └── styles/          # Global styles
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Technologies Used

- React
- TypeScript
- Material-UI
- React Router
- Chart.js (for data visualization)
- Axios (for API requests)

## Future Enhancements

- Authentication and user management
- Team collaboration features
- Historical data tracking
- AI-powered recommendations
- GitHub Actions integration for one-click fixes

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- GitHub API
- Material-UI Team
- React Team 