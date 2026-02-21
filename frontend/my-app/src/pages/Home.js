import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
    const { user } = useAuth();

    return (
        <div>
            {/* HERO SECTION */}
            <section className="hero">
                <h1 className="hero-title">
                    AI-Powered Carbon Footprint Analyzer
                </h1>
                <p className="hero-subtitle">
                    Upload images of your environment or items and get instant, secure, AI-driven carbon footprint analysis using our custom YOLO and OCR models.
                </p>

                {/* CONDITIONAL BUTTON */}
                <div>
                    {user ? (
                        <Link to="/predict" className="btn btn-primary btn-large">
                            Predict Now
                        </Link>
                    ) : (
                        <Link to="/login" className="btn btn-secondary btn-large">
                            Login to Predict
                        </Link>
                    )}
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="container" style={{ marginBottom: '60px' }}>
                <h2 className="dash-title text-center" style={{ marginBottom: '40px' }}>Why Choose CarbonPredictor?</h2>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3 className="feature-title">Instant Analysis</h3>
                        <p className="feature-desc">Get carbon footprint estimations within seconds using our optimized ML models, including depth scaling.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3 className="feature-title">Explainability</h3>
                        <p className="feature-desc">Understand which environmental factors contributed most to your prediction with clear breakdowns.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🔐</div>
                        <h3 className="feature-title">Secure & Private</h3>
                        <p className="feature-desc">Your data is transmitted securely and never shared. Authentication powered by robust HTTP-only cookies.</p>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="container" style={{ padding: '60px 24px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '60px' }}>
                <h2 className="dash-title text-center" style={{ marginBottom: '40px' }}>How It Works</h2>

                <div className="features-grid">
                    <div className="text-center">
                        <div className="feature-icon">1️⃣</div>
                        <h3 className="feature-title">Create an Account</h3>
                        <p className="feature-desc">Sign up securely with just your email and password.</p>
                    </div>

                    <div className="text-center">
                        <div className="feature-icon">2️⃣</div>
                        <h3 className="feature-title">Upload Image</h3>
                        <p className="feature-desc">Provide photos of environments, packaging, or items safely.</p>
                    </div>

                    <div className="text-center">
                        <div className="feature-icon">3️⃣</div>
                        <h3 className="feature-title">Get Analysis</h3>
                        <p className="feature-desc">View YOLO detection, Depth Estimation, and OCR all in one dashboard.</p>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="container text-center" style={{ paddingBottom: '60px' }}>
                <h2 className="dash-title mb-4">Ready to Analyze Your Footprint?</h2>
                <div style={{ marginTop: '32px' }}>
                    {user ? (
                        <Link to="/predict" className="btn btn-primary btn-large">
                            Start Prediction
                        </Link>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-large">
                            Login to Start
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}
