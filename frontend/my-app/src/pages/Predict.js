import React, { useState, useRef } from "react";

const API = "http://localhost:5000";

export default function Predict() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const inputRef = useRef();

    function applyFile(file) {
        if (!file || !file.type.startsWith("image/")) {
            setError("Please upload a valid image file (JPG, PNG, etc.).");
            return;
        }
        setError(null);
        setResults(null);
        setImage(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
    }

    function handleFileChange(e) { applyFile(e.target.files[0]); }
    function handleDrop(e) {
        e.preventDefault(); setDragging(false);
        applyFile(e.dataTransfer.files[0]);
    }
    function handleDragOver(e) { e.preventDefault(); setDragging(true); }
    function handleDragLeave() { setDragging(false); }

    function clearImage() {
        setImage(null); setPreview(null); setResults(null); setError(null);
        if (inputRef.current) inputRef.current.value = "";
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!image) { setError("Please select an image first."); return; }

        setLoading(true); setError(null); setResults(null);

        function buildForm() {
            const fd = new FormData();
            fd.append("image", image);
            return fd;
        }

        try {
            const opts = { method: "POST", credentials: "include" };

            // Start both requests, but handle depth error/rejection gracefully
            const detectPromise = fetch(`${API}/detect`, { ...opts, body: buildForm() })
                .then(async (res) => {
                    if (!res.ok) {
                        // 401 = not logged in, anything else = server issue
                        if (res.status === 401) throw new Error("Please log in to use the analyzer.");
                        throw new Error("Object detection failed. Please ensure all backend services are running.");
                    }
                    const data = await res.json();
                    if (!data.success) {
                        throw new Error(data.error || "Object detection failed.");
                    }
                    return data;
                })
                .catch((err) => { throw err; });

            const depthPromise = fetch(`${API}/depth`, { ...opts, body: buildForm() })
                .then(async (res) => {
                    if (!res.ok) {
                        return { error: "Depth estimation unavailable." };
                    }
                    const data = await res.json();
                    return data;
                })
                .catch((err) => {
                    console.error("Soft error in depth fetching:", err);
                    return { error: "Depth estimation unavailable." };
                });

            // Wait for both to complete
            const [detectData, depthData] = await Promise.all([
                detectPromise,
                depthPromise
            ]);

            // Call summary
            let summaryData = null;
            try {
                const summaryRes = await fetch(`${API}/detect/summary`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        detections: detectData.detections || [],
                        depth: depthData
                    })
                });
                if (!summaryRes.ok) {
                    throw new Error("Summary server error.");
                }
                summaryData = await summaryRes.json();
            } catch (sumErr) {
                console.error("Failed to fetch summary:", sumErr);
                summaryData = { error: "Environmental Insight is temporarily unavailable." };
            }

            setResults({ detect: detectData, depth: depthData, summary: summaryData });
            setShowDetails(false);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page-wrapper container">
            <h1 className="dash-title text-center mb-2">
                Carbon Footprint Analyzer
            </h1>
            <p className="text-center text-muted mb-4">
                Upload an image — we'll run VLM object detection and depth estimation simultaneously.
            </p>

            <form onSubmit={handleSubmit} className="result-card">
                <div
                    onClick={() => inputRef.current.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`upload-zone ${dragging ? "dragging" : ""} ${preview ? "has-preview" : ""}`}
                >
                    {preview ? (
                        <>
                            <img src={preview} alt="Preview" className="preview-img" />
                            <p className="text-muted mb-2">{image?.name}</p>
                            <button type="button" onClick={(e) => { e.stopPropagation(); clearImage(); }} className="remove-btn">
                                Remove image
                            </button>
                        </>
                    ) : (
                        <>
                            <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-3 3m3-3l3 3" />
                            </svg>
                            <h3 className="mb-1">Drag & drop your image here</h3>
                            <p className="text-muted mb-2">or <span className="text-high" style={{ textDecoration: 'underline' }}>click to browse</span></p>
                            <p className="text-muted" style={{ fontSize: '0.8rem' }}>Supports: JPG, PNG, JPEG, WEBP</p>
                        </>
                    )}
                </div>

                <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

                {error && (
                    <div className="alert alert-error">
                        ⚠️ {error}
                    </div>
                )}

                <button type="submit" disabled={loading || !image} className="btn btn-primary btn-large" style={{ width: "100%" }}>
                    {loading ? "Analyzing…" : "Run Analysis"}
                </button>
            </form>

            {loading && (
                <div style={{ textAlign: "center", margin: "40px 0" }}>
                    <div className="spinner" style={{
                        display: "inline-block",
                        width: "50px",
                        height: "50px",
                        border: "3px solid rgba(5, 150, 105, 0.1)",
                        borderRadius: "50%",
                        borderTopColor: "var(--primary, #059669)",
                        animation: "spin 1s linear infinite"
                    }}></div>
                    <p style={{ marginTop: "16px", color: "var(--text-muted)", fontWeight: "500" }}>
                        Analyzing image and generating AI Environmental Insights...
                    </p>
                </div>
            )}

            {results && (
                <div className="results-section">
                    {/* Environmental Awareness Card */}
                    <div className="insight-card">
                        <div className="insight-header">
                            <span style={{ fontSize: '1.5rem' }}>🌍</span>
                            <span>AI Environmental Insight</span>
                        </div>

                        {results.summary?.error ? (
                            <div className="alert alert-error" style={{ margin: '8px 0 16px 0' }}>
                                ⚠️ {results.summary.error}
                            </div>
                        ) : (
                            <>
                                <div className="insight-impact-section">
                                    <div className="insight-impact-label">Your image has an estimated impact of</div>
                                    <div className="insight-impact-value">
                                        {results.summary?.carbon_estimate || "0.00 kg CO₂e"}
                                    </div>
                                </div>

                                <div className="insight-divider"></div>

                                <div className="insight-analogies">
                                    <div className="insight-analogy-item">
                                        <div className="insight-analogy-icon">🔥</div>
                                        <div className="insight-analogy-details">
                                            <div className="insight-analogy-label">Similar to burning</div>
                                            <div className="insight-analogy-value">
                                                {results.summary?.charcoal_analogy || "0.00 kg of charcoal"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="insight-analogy-item">
                                        <div className="insight-analogy-icon">🚗</div>
                                        <div className="insight-analogy-details">
                                            <div className="insight-analogy-label">or driving</div>
                                            <div className="insight-analogy-value">
                                                {results.summary?.petrol_car_analogy || "0.0 km in a petrol car"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="insight-analogy-item">
                                        <div className="insight-analogy-icon">⚡</div>
                                        <div className="insight-analogy-details">
                                            <div className="insight-analogy-label">or powering</div>
                                            <div className="insight-analogy-value">
                                                {results.summary?.electricity_analogy || "an LED bulb for 0 hours"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="insight-divider"></div>

                                <div className="insight-observation-section">
                                    <div className="insight-observation-header">
                                        <span>💡</span>
                                        <span>AI Observation</span>
                                    </div>
                                    <p className="insight-observation-text">
                                        {results.summary?.observation || "No observation available."}
                                    </p>
                                    <p className="insight-recommendation-text">
                                        {results.summary?.recommendation || "No recommendations available at this time."}
                                    </p>
                                </div>
                            </>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={() => setShowDetails(prev => !prev)}
                                className="btn btn-primary"
                                style={{ padding: '10px 24px', fontSize: '0.95rem', fontWeight: '600', minWidth: '150px' }}
                            >
                                {showDetails ? "Hide Technical Details" : "Know More"}
                            </button>
                        </div>
                    </div>

                    {showDetails && (
                        <>
                            {/* YOLO Detection */}
                            <div className="result-card">
                                <h2 className="result-header">🎯 VLM Object Detection</h2>
                                {results.detect?.detections?.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Class Name</th>
                                                    <th>Confidence</th>
                                                    <th>Bounding Box</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.detect.detections.map((d, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{d.label || d.class_name || d.class_id}</td>
                                                        <td>
                                                            <span className={`badge ${d.confidence > 0.7 ? "badge-green" : "badge-yellow"}`}>
                                                                {(d.confidence * 100).toFixed(1)}%
                                                            </span>
                                                        </td>
                                                        <td className="text-muted" style={{ fontFamily: 'monospace' }}>
                                                            [{d.bbox?.map(v => Math.round(v)).join(", ")}]
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted">{results.detect?.error || "No objects detected."}</p>
                                )}
                            </div>

                            {/* Depth Estimation */}
                            <div className="result-card">
                                <h2 className="result-header">📏 Depth Estimation</h2>
                                {results.depth?.error ? (
                                    <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", padding: "12px 16px", background: "#f9fafb", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                                        Depth estimation unavailable.
                                    </div>
                                ) : (
                                    <div className="depth-grid">
                                        {[
                                            { label: "Min Depth", value: results.depth?.min_depth, unit: "m" },
                                            { label: "Max Depth", value: results.depth?.max_depth, unit: "m" },
                                            { label: "Avg Depth", value: results.depth?.average_depth, unit: "m" },
                                        ].map((item, i) => (
                                            <div key={i} className="depth-box">
                                                <div className="depth-label">{item.label}</div>
                                                <div className="depth-value">
                                                    {item.value !== undefined && item.value !== null ? Number(item.value).toFixed(3) : "—"}
                                                    <span style={{ fontSize: '1rem', fontWeight: 400, marginLeft: '4px' }}>{item.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
