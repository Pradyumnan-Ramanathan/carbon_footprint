import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  return (
    <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-red-600">
          CardioPredictor
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <Link to="/predict" className="hover:text-red-600">Predict</Link>
          <Link to="/dashboard" className="hover:text-red-600">Dashboard</Link>
          <Link to="/about" className="hover:text-red-600">About</Link>
          <Link to="/contact" className="hover:text-red-600">Contact</Link>
        </div>

        {/* Login Button */}
        {user ? (
  <button
      onClick={logout}
      className="hidden md:block bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
    >
      Logout
    </button>
  ) : (
    <Link
      to="/login"
      className="hidden md:block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
    >
      Login
    </Link>
    )}
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white shadow-lg px-6 py-4 space-y-4 text-gray-700 font-medium">
          <Link to="/" className="block">Home</Link>
          <Link to="/predict" className="block">Predict</Link>
          <Link to="/dashboard" className="block">Dashboard</Link>
          <Link to="/about" className="block">About</Link>
          <Link to="/contact" className="block">Contact</Link>
          <Link
            to="/login"
            className="block bg-red-600 text-white px-4 py-2 rounded-lg text-center"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
