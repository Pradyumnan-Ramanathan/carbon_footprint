export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          About CardioPredict
        </h1>
        <p className="text-gray-600 text-lg mb-10">
          A smart cardiac risk assessment platform powered by machine learning.
        </p>

        {/* What We Do */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            What does CardioPredict do?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            CardioPredict helps individuals understand their potential risk of
            cardiovascular disease using clinically relevant health parameters.
            By analyzing data such as age, blood pressure, cholesterol levels,
            and lifestyle indicators, the platform provides a quick and
            easy-to-understand risk prediction.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            How does it work?
          </h2>
          <ol className="space-y-3 text-gray-700 list-decimal list-inside">
            <li>Users securely log in to their account.</li>
            <li>They enter basic health information.</li>
            <li>
              A machine learning model analyzes the data and predicts cardiac
              risk.
            </li>
            <li>
              Users receive instant feedback along with insights to understand
              the result.
            </li>
          </ol>
        </section>

        {/* Why It Matters */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Why this platform?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Cardiovascular diseases remain one of the leading causes of death
            worldwide. Early awareness and preventive action can significantly
            reduce risks. CardioPredict aims to support awareness and encourage
            users to seek professional medical advice when necessary.
          </p>
        </section>

        {/* Disclaimer */}
        <section className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Medical Disclaimer
          </h3>
          <p className="text-yellow-800 text-sm leading-relaxed">
            CardioPredict is not a medical diagnostic tool. The predictions
            provided are based on machine learning models and are intended for
            informational purposes only. Always consult a qualified healthcare
            professional for medical advice, diagnosis, or treatment.
          </p>
        </section>
      </div>
    </div>
  );
}
