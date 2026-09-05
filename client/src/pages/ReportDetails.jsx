import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  reported: "bg-gray-100 text-gray-700",
  under_review: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  cleanup_in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

const formatStatus = (status) => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatCategory = (category) => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function ReportDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      const response = await api.get(`/reports/${id}`);

      setReport(response.data.report);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleClaim = async () => {
    try {
      setClaiming(true);
      setError("");

      await api.post("/cleanups/claim", {
        reportId: id,
      });

      await fetchReport();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to claim cleanup");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8F3] text-[#66736C]">
        Loading report...
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8F3]">
        <div className="text-center">
          <p className="text-red-600">{error}</p>

          <Link to="/reports" className="mt-4 inline-block text-[#2F7D5B]">
            ← Back to reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8F3]">
      <nav className="border-b border-[#E3E8E4] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="text-xl font-bold tracking-tight text-[#173F35]"
            >
              Green-Sweep
            </Link>

            <Link
              to="/reports"
              className="text-sm font-medium text-[#66736C] hover:text-[#173F35]"
            >
              ← Back to reports
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#E3E8E4] bg-white shadow-sm">
          {report.imageUrl && (
            <div className="border-b border-[#E3E8E4] bg-[#F0F3EE]">
              <img
                src={report.imageUrl}
                alt={report.title}
                className="max-h-[500px] w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-[#DCE9DF] px-3 py-1 text-sm font-medium text-[#2F7D5B]">
                {formatCategory(report.category)}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  statusStyles[report.status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {formatStatus(report.status)}
              </span>
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#173F35]">
              {report.title}
            </h1>

            <p className="mt-4 leading-7 text-[#66736C]">
              {report.description}
            </p>

            <div className="mt-8 grid gap-6 border-t border-[#E3E8E4] pt-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[#66736C]">Location</p>

                <p className="mt-1 font-medium text-[#1F2933]">
                  {report.location?.address}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#66736C]">Reported by</p>

                <p className="mt-1 font-medium text-[#1F2933]">
                  {report.reportedBy?.name || "Community member"}
                </p>
              </div>
            </div>

            {report.location?.latitude !== undefined &&
              report.location?.longitude !== undefined && (
                <div className="mt-6 rounded-xl bg-[#F0F4F0] p-4">
                  <p className="text-sm font-medium text-[#173F35]">
                    Coordinates
                  </p>

                  <p className="mt-1 text-sm text-[#66736C]">
                    {report.location.latitude}, {report.location.longitude}
                  </p>
                </div>
              )}

            {report.assignedTo && (
              <div className="mt-6 rounded-xl bg-[#F0F4F0] p-4">
                <p className="text-sm font-medium text-[#173F35]">
                  Assigned municipal officer
                </p>

                <p className="mt-1 text-sm text-[#66736C]">
                  {report.assignedTo.name}
                </p>
              </div>
            )}

            {user?.role === "citizen" && report.status !== "completed" && (
              <div className="mt-8 border-t border-[#E3E8E4] pt-6">
                <h2 className="font-semibold text-[#173F35]">Want to help?</h2>

                <p className="mt-1 text-sm text-[#66736C]">
                  Claim this issue and help complete the cleanup.
                </p>

                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="mt-4 rounded-lg bg-[#173F35] px-5 py-3 font-semibold text-white transition hover:bg-[#245448] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {claiming ? "Claiming..." : "Volunteer for Cleanup"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReportDetails;
