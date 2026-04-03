# Loan Application App

## Overview
This project is a mobile application for loan requests, featuring a multi-step flow that allows users to simulate loan amounts, select their employment profiles, upload necessary documents, and receive confirmation of their submissions. The application is built using React Native (Expo) for the frontend, Node.js with Express for the backend, and Prisma for database management.

## Features
- **User-Friendly Interface**: Modern and clean design with easy navigation.
- **Loan Simulation**: Users can input desired loan amounts and see calculated totals with interest.
- **Profile Selection**: Users can choose from various employment profiles.
- **Document Upload**: Users can upload required documents based on their selected profile.
- **Admin Dashboard**: An optional admin panel to manage loan requests and view submitted documents.

## Project Structure
```
loan-app
├── mobile                # Mobile application code
│   ├── src               # Source files for the mobile app
│   ├── assets            # Assets like fonts
│   ├── app.json          # Expo configuration
│   ├── package.json      # Mobile app dependencies
│   └── tsconfig.json     # TypeScript configuration
├── backend               # Backend application code
│   ├── src               # Source files for the backend
│   ├── prisma            # Prisma schema
│   ├── uploads           # Directory for uploaded files
│   ├── package.json      # Backend dependencies
│   └── tsconfig.json     # TypeScript configuration
├── admin                 # Admin panel code (optional)
│   ├── src               # Source files for the admin panel
│   ├── package.json      # Admin dependencies
│   └── tsconfig.json     # TypeScript configuration
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- PostgreSQL or SQLite (for the backend)

### Installation

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd loan-app
   ```

2. **Set up the mobile application**:
   ```
   cd mobile
   npm install
   ```

3. **Set up the backend**:
   ```
   cd backend
   npm install
   ```

4. **Set up the admin panel (if applicable)**:
   ```
   cd admin
   npm install
   ```

### Running the Application

- **Start the backend server**:
  ```
  cd backend
  npm run start
  ```

- **Start the mobile application**:
  ```
  cd mobile
  npm start
  ```

- **Start the admin panel (if applicable)**:
  ```
  cd admin
  npm start
  ```

## API Endpoints
- **POST /simulation**: Submit loan simulation data.
- **POST /lead**: Submit loan lead data.
- **GET /admin**: Admin functionalities to manage leads.

## Contributing
Contributions are welcome! Please create an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.