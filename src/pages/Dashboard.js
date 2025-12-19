export default function Dashboard() {
  // dummy data (later comes from backend)
  const stats = [
    { title: "Latest Risk", value: "Low", color: "text-green-600" },
    { title: "Total Predictions", value: "5" },
    { title: "Last Checked", value: "12 Sep 2025" },
    { title: "Risk Trend", value: "Stable" },
  ];

  const history = [
    {
      date: "12 Sep 2025",
      risk: "Low",
      confidence: "92%",
    },
    {
      date: "05 Sep 2025",
      risk: "Moderate",
      confidence: "78%",
    },
    {
      date: "29 Aug 2025",
      risk: "Low",
      confidence: "88%",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here’s your cardiac health overview
        </p>
      </div>

      {/* Stats Cards */}
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

      {/* History Table */}
      <div className="bg-white rounded-xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Prediction History
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-gray-600">Date</th>
                <th className="py-2 text-gray-600">Risk Level</th>
                <th className="py-2 text-gray-600">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-none"
                >
                  <td className="py-3">{row.date}</td>
                  <td
                    className={`py-3 font-medium ${
                      row.risk === "Low"
                        ? "text-green-600"
                        : row.risk === "Moderate"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {row.risk}
                  </td>
                  <td className="py-3">{row.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Health Trend Placeholder */}
      <div className="bg-white rounded-xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold mb-3">
          Health Trend
        </h2>
        <div className="h-40 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
          Chart will appear here
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="/predict"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-700 transition"
        >
          New Prediction
        </a>

        <button
          disabled
          className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg cursor-not-allowed"
        >
          Download Health Report (Coming Soon)
        </button>
      </div>
    </div>
  );
}
