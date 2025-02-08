# Vite + React Frontend

This project is a frontend built with Vite and React, designed to interact with the FastAPI backend. It integrates Firebase authentication and communicates with the backend to stream AI-generated responses.

## Features
- Vite for a fast development environment
- React for building UI components
- Firebase for authentication
- API integration with FastAPI backend

## Prerequisites
Before running this project, ensure you have the following installed:
- Node.js (LTS version recommended)
- npm or yarn

## Installation & Setup

### 1. Clone the Repository
Clone the project from your repository:

```sh
git clone <your-repo-url>
cd <your-project-directory>
```

### 2. Install Dependencies
Install the required dependencies using:

```sh
npm install
```

or, if using yarn:

```sh
yarn install
```

### 3. Configure Firebase
Update the Firebase configuration file with your own Firebase project credentials. Replace the existing configuration inside `src/firebase-config.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export default firebaseConfig;
```

### 4. Start the Development Server
Run the Vite development server:

```sh
npm run dev
```

or, if using yarn:

```sh
yarn dev
```

The frontend will be available at: [http://localhost:5173](http://localhost:5173)

## API Integration
Ensure your FastAPI backend is running on `http://localhost:8000`, and update API endpoints in your React app if necessary.

## Build for Production
To build the project for production, run:

```sh
npm run build
```

or, if using yarn:

```sh
yarn build
```

This will generate an optimized `dist/` folder ready for deployment.

## License
This project is licensed under the MIT License.

---

Now your frontend is ready to connect with the backend and authenticate users with Firebase! 🚀

