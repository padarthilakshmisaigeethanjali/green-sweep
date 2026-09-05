import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);

      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F3] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E3E8E4] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#173F35]">
            Green-Sweep
          </h1>

          <p className="mt-2 text-[#66736C]">Create your account</p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1F2933]">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
              className="w-full rounded-lg border border-[#D4DDD7] px-4 py-3 text-[#1F2933] outline-none transition placeholder:text-gray-400 focus:border-[#2F7D5B] focus:ring-2 focus:ring-[#DCE9DF]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1F2933]">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[#D4DDD7] px-4 py-3 text-[#1F2933] outline-none transition placeholder:text-gray-400 focus:border-[#2F7D5B] focus:ring-2 focus:ring-[#DCE9DF]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1F2933]">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-[#D4DDD7] px-4 py-3 text-[#1F2933] outline-none transition placeholder:text-gray-400 focus:border-[#2F7D5B] focus:ring-2 focus:ring-[#DCE9DF]"
            />

            <p className="mt-1.5 text-xs text-[#66736C]">
              Password must be at least 6 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#173F35] px-4 py-3 font-semibold text-white transition hover:bg-[#245448] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#66736C]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-[#2F7D5B] transition hover:text-[#173F35]"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
