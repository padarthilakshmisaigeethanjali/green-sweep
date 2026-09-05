import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateReport() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setImage(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      setImage(null);
      setImagePreview("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      setImage(null);
      setImagePreview("");
      return;
    }

    setError("");
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);

      data.append(
        "location",
        JSON.stringify({
          address: formData.address,
          latitude: formData.latitude ? Number(formData.latitude) : undefined,
          longitude: formData.longitude
            ? Number(formData.longitude)
            : undefined,
        }),
      );

      if (image) {
        data.append("image", image);
      }

      await api.post("/reports", data);

      navigate("/reports");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F3]">
      <nav className="border-b border-[#E3E8E4] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <Link
            to="/reports"
            className="text-sm font-medium text-[#66736C] hover:text-[#173F35]"
          >
            ← Back to reports
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#2F7D5B]">Community report</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#173F35]">
            Report an Issue
          </h1>

          <p className="mt-2 text-[#66736C]">
            Help identify an environmental issue in your community.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm md:p-8"
        >
          <div className="space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1F2933]">
                Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Example: Garbage pile near public park"
                className="w-full rounded-lg border border-[#D4DDD7] px-4 py-3 text-[#1F2933] outline-none transition placeholder:text-gray-400 focus:border-[#2F7D5B] focus:ring-2 focus:ring-[#DCE9DF]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1F2933]">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe the issue and its condition..."
                className="w-full resize-none rounded-lg border border-[#D4DDD7] px-4 py-3 text-[#1F2933] outline-none transition placeholder:text-gray-400 focus:border-[#2F7D5B] focus:ring-2 focus:ring-[#DCE9DF]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1F2933]">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[#D4DDD7] bg-white px-4 py-3 text-[#1F2933] outline-none transition focus:border-[#2F7D5B] focus:ring-2 focus:ring-[#DCE9DF]"
              >
                <option value="">Select a category</option>
                <option value="garbage">Garbage</option>
                <option value="illegal_dumping">Illegal Dumping</option>
                <option value="damaged_public_property">
                  Damaged Public Property
                </option>
                <option value="overflowing_bin">Overflowing Bin</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1F2933]">
                Location / Address
              </label>

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Example: Central Park, Mumbai"
                className="w-full rounded-lg border border-[#D4DDD7] px-4 py-3 text-[#1F2933] outline-none transition placeholder:text-gray-400 focus:border-[#2F7D5B] focus:ring-2 focus:ring-[#DCE9DF]"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1F2933]">
                  Latitude
                </label>

                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="any"
                  placeholder="19.0760"
                  className="w-full rounded-lg border border-[#D4DDD7] px-4 py-3 text-[#1F2933] outline-none transition placeholder:text-gray-400 focus:border-[#2F7D5B] focus:ring-2 focus:ring-[#DCE9DF]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1F2933]">
                  Longitude
                </label>

                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="any"
                  placeholder="72.8777"
                  className="w-full rounded-lg border border-[#D4DDD7] px-4 py-3 text-[#1F2933] outline-none transition placeholder:text-gray-400 focus:border-[#2F7D5B] focus:ring-2 focus:ring-[#DCE9DF]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1F2933]">
                Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full rounded-lg border border-[#D4DDD7] bg-white p-3 text-sm text-[#66736C] file:mr-4 file:rounded-md file:border-0 file:bg-[#DCE9DF] file:px-4 file:py-2 file:font-medium file:text-[#2F7D5B] hover:file:bg-[#CFE0D3]"
              />

              <p className="mt-2 text-xs text-[#66736C]">
                JPG, PNG, WEBP or other image files. Maximum 5 MB.
              </p>

              {imagePreview && (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#E3E8E4]">
                  <img
                    src={imagePreview}
                    alt="Selected report"
                    className="max-h-80 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-[#E3E8E4] pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#173F35] px-5 py-3.5 font-semibold text-white transition hover:bg-[#245448] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting report..." : "Submit Report"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default CreateReport;
