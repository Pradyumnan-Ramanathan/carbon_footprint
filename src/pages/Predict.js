import React, { useState } from "react";
import PredictionResult from "../components/PredictionResult";

export default function Predict() {
  const [form, setForm] = useState({
    age: "",
    gender: "",
    ap_hi: "",
    ap_lo: "",
    cholesterol: "",
    gluc: "",
    height: "",
    weight: "",
    smoke: "",
    alco: "",
    active: "",
  });

  const [result, setResult] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // 🔥 For now, show dummy output
    setResult({
      prediction: "Low Risk",
      confidence: "82%",
      message:
        "Based on your inputs, your cardiovascular risk appears to be low. Maintain a healthy lifestyle!",
    });
  }

  return (
    <div className="max-w-5xl mx-auto mt-24 px-4 pb-10">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">
        Enter Your Health Details
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md space-y-6"
      >
        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Age */}
          <div>
            <label className="font-medium">Age (years)</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="font-medium">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            >
              <option value="">Select</option>
              <option value="1">Male</option>
              <option value="2">Female</option>
            </select>
          </div>

          {/* Systolic BP */}
          <div>
            <label className="font-medium">Systolic BP (ap_hi)</label>
            <input
              type="number"
              name="ap_hi"
              value={form.ap_hi}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            />
          </div>

          {/* Diastolic BP */}
          <div>
            <label className="font-medium">Diastolic BP (ap_lo)</label>
            <input
              type="number"
              name="ap_lo"
              value={form.ap_lo}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            />
          </div>

          {/* Cholesterol */}
          <div>
            <label className="font-medium">Cholesterol (1–3)</label>
            <select
              name="cholesterol"
              value={form.cholesterol}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            >
              <option value="">Select</option>
              <option value="1">Normal</option>
              <option value="2">Above Normal</option>
              <option value="3">Well Above Normal</option>
            </select>
          </div>

          {/* Glucose */}
          <div>
            <label className="font-medium">Glucose (1–3)</label>
            <select
              name="gluc"
              value={form.gluc}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            >
              <option value="">Select</option>
              <option value="1">Normal</option>
              <option value="2">Above Normal</option>
              <option value="3">Well Above Normal</option>
            </select>
          </div>

          {/* Height */}
          <div>
            <label className="font-medium">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={form.height}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            />
          </div>

          {/* Weight */}
          <div>
            <label className="font-medium">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            />
          </div>

          {/* Smoke */}
          <div>
            <label className="font-medium">Do you smoke?</label>
            <select
              name="smoke"
              value={form.smoke}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            >
              <option value="">Select</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          {/* Alcohol */}
          <div>
            <label className="font-medium">Alcohol Consumption?</label>
            <select
              name="alco"
              value={form.alco}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            >
              <option value="">Select</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>

          {/* Physical Activity */}
          <div>
            <label className="font-medium">Physically Active?</label>
            <select
              name="active"
              value={form.active}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              required
            >
              <option value="">Select</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Get Prediction
        </button>
      </form>

      {/* RESULT CARD */}
      {result && <PredictionResult data={result} />}
    </div>
  );
}
