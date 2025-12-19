import React from "react";

export default function PredictionResult({ data }) {
  return (
    <div className="mt-10 bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-green-600">
        Prediction Result
      </h2>

      <p className="text-lg">
        <span className="font-semibold">Risk Level:</span> {data.prediction}
      </p>

      <p className="text-lg">
        <span className="font-semibold">Confidence:</span> {data.confidence}
      </p>

      <p className="mt-4 text-gray-700">{data.message}</p>
    </div>
  );
}
