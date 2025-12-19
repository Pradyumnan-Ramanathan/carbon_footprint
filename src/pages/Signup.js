import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    // Temporary mock signup + auto login
    login({
      email: "newuser@gmail.com",
      name: "New User",
    });

    navigate("/predict");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        {/* Google Signup */}
        <button className="w-full py-2 mb-4 border rounded-lg flex items-center justify-center hover:bg-gray-50">
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-5 mr-2"
          />
          Sign up with Google
        </button>

        <div className="text-center text-gray-500 my-4">or</div>

        {/* Signup Form */}
        <form className="space-y-4" onSubmit={handleSignup}>
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Confirm password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
