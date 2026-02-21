// src/pages/Dashboard.js
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();

        const res = await fetch("http://localhost:5000/api/predict/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch history");
        }

        setHistory(data.history || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load prediction history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  const latest = history[0];
  const totalPredictions = history.length;

  const latestRisk =
    latest && typeof latest.result?.prediction === "number"
      ? latest.result.prediction === 1
        ? "High"
        : "Low"
      : "-";

  const latestColor =
    latestRisk === "High" ? "text-red-600" : "text-green-600";

  const lastChecked = latest
    ? new Date(latest.createdAt).toLocaleDateString()
    : "-";

  const stats = [
    { title: "Latest Risk", value: latestRisk, color: latestColor },
    { title: "Total Predictions", value: totalPredictions },
    { title: "Last Checked", value: lastChecked },
    { title: "Risk Trend", value: "Stable" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome 👋</h1>
        <p className="text-gray-600 mt-1">
          Here’s your cardiac health overview
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow"
          >
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2
              className={`text-2xl font-semibold mt-2 ${
                item.color || "text-gray-800"
              }`}
            >
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* History table */}
      <div className="bg-white rounded-xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Prediction History
        </h2>

        {history.length === 0 ? (
          <p className="text-gray-500">No predictions yet.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Date</th>
                <th className="py-2">Risk Level</th>
                <th className="py-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => {
                const risk =
                  row.result.prediction === 1 ? "High" : "Low";

                return (
                  <tr key={idx} className="border-b">
                    <td className="py-2">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td
                      className={`py-2 ${
                        risk === "High"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {risk}
                    </td>
                    <td className="py-2">
                      {(row.result.probability * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Action */}
      <div className="flex gap-4">
        <a
          href="/predict"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          New Prediction
        </a>
      </div>
    </div>
  );
}
