# TTM — Team Task Manager

TTM is a premium, high-performance team management platform designed for modern collaboration. Built with a focus on speed, aesthetics, and user experience, it features a glassmorphism-inspired dark UI and a shared workspace model that allows teams to collaborate on projects and tasks effortlessly.

![Dashboard Preview](https://github.com/Souravmanjee/TTM/raw/main/client/src/assets/hero.png)

## 🚀 Key Features

- **Premium UI/UX**: A sleek, dark-themed interface built with Tailwind CSS and Framer Motion for smooth, high-fidelity animations.
- **Shared Workspace**: Universal access model that allows all authenticated users to collaborate on projects and tasks without restrictive "invite-only" barriers.
- **Kanban Task Board**: High-performance task management with drag-and-drop style transitions and real-time status tracking.
- **Dynamic Analytics**: Visualized task completion metrics and productivity insights on the main dashboard.
- **Production Ready**: Fully configured for one-click deployment on Railway with a unified monorepo build system.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JWT-based secure authentication.

## 💻 Local Development

### Prerequisites
- Node.js installed on your machine.
- A MongoDB instance (local or Atlas).

### Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Souravmanjee/TTM.git
   cd TTM
   ```

2. **Install Dependencies**:
   ```bash
   # In the root directory
   npm run install-all
   ```

3. **Configure Environment**:
   Create a `.env` file in the `server` directory and add the following:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_key
   NODE_ENV=development
   ```

4. **Run the App**:
   ```bash
   # From the root directory
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` and the backend on `http://localhost:5000`.

## 🚢 Deployment (Railway)

The project is configured as a monorepo. When deploying to Railway:

1. Connect your GitHub repository.
2. Add the following **Environment Variables**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
3. Railway will automatically detect the root `package.json` and use:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

---

Built with ❤️ for teams that value speed and design.
