export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Contact Us
        </h1>
        <p className="text-gray-600 text-lg mb-10">
          Have questions or feedback? We’d love to hear from you.
        </p>

        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            Send us a message
          </h2>

          <form className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Message
              </label>
              <textarea
                rows="4"
                placeholder="Type your message here..."
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Contact Information
          </h2>
          <p className="text-gray-700">
            📧 Email:{" "}
            <span className="font-medium">
              support@cardiopredict.com
            </span>
          </p>
        </div>

        {/* Privacy Note */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-1">
            Privacy Note
          </h3>
          <p className="text-blue-800 text-sm">
            Please do not share sensitive medical information through this
            contact form. This channel is intended only for general inquiries
            and feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
