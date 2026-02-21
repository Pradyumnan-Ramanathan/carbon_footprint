import { Link } from "react-router-dom";

export default function Home() {
  // Later this will come from context/auth
  const isLoggedIn = false;

  return (
    <div className="w-full">

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-red-500 to-red-700 text-white py-28 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          AI-Powered Cardiac Risk Prediction
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          Enter your health details and get instant, secure, AI-driven cardiac risk analysis.
        </p>

        {/* CONDITIONAL BUTTON */}
        <div className="mt-8">
          {isLoggedIn ? (
            <Link
              to="/predict"
              className="bg-white text-red-600 px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-red-100 transition"
            >
              Predict Now
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-white text-red-600 px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-red-100 transition"
            >
              Login to Predict
            </Link>
          )}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose CardioPredictor?</h2>

        <div className="grid md:grid-cols-3 gap-10">

          <div className="p-6 shadow-lg rounded-xl border hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">⚡ Instant Prediction</h3>
            <p className="text-gray-600">Get cardiac risk results within seconds using our optimized ML model.</p>
          </div>

          <div className="p-6 shadow-lg rounded-xl border hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">📊 Explainability</h3>
            <p className="text-gray-600">Understand which health factors contributed most to your prediction.</p>
          </div>

          <div className="p-6 shadow-lg rounded-xl border hover:shadow-xl transition">
            <h3 className="text-xl font-semibold mb-2">🔐 Secure & Private</h3>
            <p className="text-gray-600">Your data is encrypted and processed with federated/gossip training logic.</p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

          <div className="text-center p-6">
            <div className="text-5xl mb-4">1️⃣</div>
            <h3 className="text-xl font-semibold">Create an Account</h3>
            <p className="text-gray-600 mt-2">Signup using email or Google.</p>
          </div>

          <div className="text-center p-6">
            <div className="text-5xl mb-4">2️⃣</div>
            <h3 className="text-xl font-semibold">Enter Your Details</h3>
            <p className="text-gray-600 mt-2">Provide basic health parameters.</p>
          </div>

          <div className="text-center p-6">
            <div className="text-5xl mb-4">3️⃣</div>
            <h3 className="text-xl font-semibold">Get Prediction & Report</h3>
            <p className="text-gray-600 mt-2">View risk score, explanations, and download your PDF.</p>
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Check Your Heart Health?</h2>

        {isLoggedIn ? (
          <Link
            to="/predict"
            className="bg-red-600 text-white px-10 py-4 rounded-xl text-lg shadow-lg hover:bg-red-700 transition"
          >
            Start Prediction
          </Link>
        ) : (
          <Link
            to="/login"
            className="bg-red-600 text-white px-10 py-4 rounded-xl text-lg shadow-lg hover:bg-red-700 transition"
          >
            Login to Start
          </Link>
        )}
      </section>
    </div>
  );
}
