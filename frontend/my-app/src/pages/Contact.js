export default function Contact() {
    return (
        <div className="page-wrapper container">
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                {/* Title */}
                <h1 className="dash-title mb-2">Contact Us</h1>
                <p className="dash-subtitle" style={{ fontSize: "1.2rem", marginBottom: "40px" }}>
                    Have questions or feedback? We’d love to hear from you.
                </p>

                {/* Contact Form */}
                <div className="auth-card" style={{ maxWidth: "100%", padding: "40px", marginBottom: "40px" }}>
                    <h2 className="dash-title" style={{ fontSize: "1.5rem", marginBottom: "24px" }}>
                        Send us a message
                    </h2>

                    <form>
                        <div className="form-group">
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "var(--text-main)" }}>
                                Name
                            </label>
                            <input type="text" placeholder="Your name" className="form-input" />
                        </div>

                        <div className="form-group">
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "var(--text-main)" }}>
                                Email
                            </label>
                            <input type="email" placeholder="you@example.com" className="form-input" />
                        </div>

                        <div className="form-group">
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "var(--text-main)" }}>
                                Message
                            </label>
                            <textarea rows="5" placeholder="Type your message here..." className="form-input" style={{ resize: "vertical" }} />
                        </div>

                        <button type="button" className="btn btn-primary" style={{ marginTop: "16px" }}>
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Contact Info */}
                <div className="result-card" style={{ marginBottom: "24px", padding: "24px" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "8px" }}>
                        Contact Information
                    </h2>
                    <p className="text-muted">
                        📧 Email: <span style={{ fontWeight: 600, color: "var(--secondary)" }}>support@carbonpredictor.com</span>
                    </p>
                </div>

                {/* Privacy Note */}
                <div className="alert" style={{ background: "rgba(69, 123, 157, 0.05)", border: "1px solid rgba(69, 123, 157, 0.2)", color: "var(--secondary)", display: "block" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>Privacy Note</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>
                        Please do not share sensitive personal information through this contact form.
                        This channel is intended only for general inquiries and feedback.
                    </p>
                </div>
            </div>
        </div>
    );
}
