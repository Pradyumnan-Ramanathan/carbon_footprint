export default function About() {
    return (
        <div className="page-wrapper container">
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                {/* Title */}
                <h1 className="dash-title mb-2">About CarbonPredictor</h1>
                <p className="dash-subtitle" style={{ fontSize: "1.2rem", marginBottom: "40px" }}>
                    A smart carbon footprint assessment platform powered by machine learning.
                </p>

                {/* What We Do */}
                <section className="mb-4">
                    <h2 className="dash-title" style={{ fontSize: "1.5rem", marginBottom: "16px" }}>
                        What does CarbonPredictor do?
                    </h2>
                    <p className="text-muted" style={{ lineHeight: "1.8", fontSize: "1.05rem" }}>
                        CarbonPredictor helps individuals understand their potential carbon footprint impact using
                        advanced object detection. By analyzing data, images, and providing depth estimation,
                        the platform offers a quick and easy-to-understand environmental assessment.
                    </p>
                </section>

                {/* How It Works */}
                <section className="mb-4" style={{ marginTop: "40px" }}>
                    <h2 className="dash-title" style={{ fontSize: "1.5rem", marginBottom: "16px" }}>
                        How does it work?
                    </h2>
                    <ol className="text-muted" style={{ lineHeight: "1.8", fontSize: "1.05rem", paddingLeft: "20px", listStyleType: "decimal" }}>
                        <li className="mb-2">Users securely log in to their account using cookies.</li>
                        <li className="mb-2">They upload images of environments, products, or receipts.</li>
                        <li className="mb-2">Our backend processes YOLO objects, depth estimation, and OCR text.</li>
                        <li className="mb-2">Users receive instant feedback along with precise environmental insights.</li>
                    </ol>
                </section>

                {/* Why It Matters */}
                <section className="mb-4" style={{ marginTop: "40px" }}>
                    <h2 className="dash-title" style={{ fontSize: "1.5rem", marginBottom: "16px" }}>
                        Why this platform?
                    </h2>
                    <p className="text-muted" style={{ lineHeight: "1.8", fontSize: "1.05rem" }}>
                        Early environmental awareness and preventive action can significantly reduce emissions.
                        This app aims to support awareness and encourage users to make more sustainable choices.
                    </p>
                </section>

                {/* Disclaimer */}
                <section className="alert alert-error" style={{ marginTop: "40px", padding: "24px", display: "block" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", color: "#c92a2a" }}>Disclaimer</h3>
                    <p style={{ margin: 0 }}>
                        CarbonPredictor is not a certified regulatory tool.
                        The estimations provided are based on machine learning models and are intended for
                        informational and educational purposes only.
                    </p>
                </section>
            </div>
        </div>
    );
}
