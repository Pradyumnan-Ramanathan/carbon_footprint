import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            {/* Brand */}
            <Link to="/" className="nav-brand">
                CarbonPredictor
            </Link>

            {/* Nav links */}
            <div className="nav-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/contact" className="nav-link">Contact</Link>

                {user ? (
                    <>
                        <Link to="/predict" className="nav-link">Predict</Link>
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        <span className="nav-user">Hi, {user.name?.split(" ")[0] || 'User'}</span>
                        <button
                            onClick={handleLogout}
                            className="btn btn-outline"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="btn btn-primary"
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                            className="btn btn-outline"
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
