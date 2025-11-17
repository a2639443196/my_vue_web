import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Activities } from "./pages/Activities";
import { Water } from "./pages/Water";
import { Chat } from "./pages/Chat";
import { Games } from "./pages/Games";
import { SchulteGrid } from "./pages/SchulteGrid";
import { ReactionTest } from "./pages/ReactionTest";
import { MemoryFlip } from "./pages/MemoryFlip";
import { Sudoku } from "./pages/Sudoku";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/water" element={<Water />} />
        <Route path="/chat" element={<Chat />} />

        {/* Games Routes */}
        <Route path="/games" element={<Games />} />
        <Route
          path="/games/schulte"
          element={<SchulteGrid />}
        />
        <Route
          path="/games/reaction"
          element={<ReactionTest />}
        />
        <Route path="/games/memory" element={<MemoryFlip />} />
        <Route path="/games/sudoku" element={<Sudoku />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route
          path="*"
          element={<Navigate to="/404" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}