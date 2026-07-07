import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ClientForm } from "./pages/ClientForm";
import { AdminDashboard } from "./pages/AdminDashboard";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <Link to="/" className="nav-link">Анкета</Link>
        <Link to="/admin" className="nav-link">Админ-панель</Link>
      </nav>
      <Routes>
        <Route path="/" element={<ClientForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;