import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const API = "http://localhost:5000";

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;

            try {
                const res = await fetch(`${API}/api/predict/history`, {
                    credentials: "include"
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(data.error || "Failed to fetch history");
                }

                setHistory(data.history || []);
            } catch (err) {
                console.error(err);
                setError("Failed to load prediction history or no endpoint exists yet.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    if (loading) {
        return (
            <div className="page-wrapper container">
                <p className="text-center text-muted" style={{ marginTop: "60px" }}>Loading dashboard...</p>
            </div>
        );
    }

    const latest = history[0];
    const totalPredictions = history.length;

    // Instead of Risk, show the primary detected item from the latest scan if available
    const latestItem = latest && latest.prediction?.length > 0
        ? latest.prediction[0].label || latest.prediction[0].class_name || "Detected"
        : "None";

    const stats = [
        { title: "Latest Detection", value: latestItem, color: latestItem !== "None" ? "var(--primary)" : "var(--text-muted)" },
        { title: "Total Scans", value: totalPredictions },
        { title: "Last Checked", value: latest ? new Date(latest.createdAt).toLocaleDateString() : "-" },
        { title: "Status", value: "Active" },
    ];

    return (
        <div className="page-wrapper container">
            <div className="dash-header">
                <h1 className="dash-title">Welcome 👋</h1>
                <p className="dash-subtitle">Here’s your carbon footprint and detection overview</p>
            </div>

            {/* Stats cards */}
            <div className="stats-grid">
                {stats.map((item, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-label">{item.title}</div>
                        <div className="stat-value" style={{ color: item.color || "var(--text-main)" }}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* History table */}
            <div className="history-card">
                <h2 className="dash-title" style={{ fontSize: "1.5rem", marginBottom: "24px" }}>Scan History</h2>

                {error ? (
                    <div className="alert alert-error">⚠️ {error}</div>
                ) : history.length === 0 ? (
                    <p className="text-muted">No scans found yet. Go to Predict to run your first analysis.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Detected Item(s)</th>
                                    <th>Max Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((row, idx) => {
                                    // Extract all labels from the YOLO detection array
                                    const labels = row.prediction?.map(p => p.label || p.class_name).filter(Boolean) || [];
                                    const displayText = labels.length > 0 ? labels.join(", ") : "Empty Scan";

                                    return (
                                        <tr key={idx}>
                                            <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                                            <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                                                {displayText}
                                            </td>
                                            <td>{(row.result.probability * 100).toFixed(1)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
