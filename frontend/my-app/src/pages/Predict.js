import React, { useState, useRef } from "react";

const API = "http://localhost:5000";

export default function Predict() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragging, setDragging] = useState(false);
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

            const [detectRes, depthRes] = await Promise.all([
                fetch(`${API}/detect`, { ...opts, body: buildForm() }),
                fetch(`${API}/depth`, { ...opts, body: buildForm() }),
            ]);

            const [detectData, depthData] = await Promise.all([
                detectRes.json(),
                depthRes.json(),
            ]);

            setResults({ detect: detectData, depth: depthData });
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

            {results && (
                <div className="results-section">
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
                            <p className="alert alert-error">{results.depth.error}</p>
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

                </div>
            )}
        </div>
    );
}
