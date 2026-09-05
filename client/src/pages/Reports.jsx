import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

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

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get("/reports");

        setReports(response.data.reports);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8F3]">
      <nav className="border-b border-[#E3E8E4] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            to="/dashboard"
            className="text-xl font-bold tracking-tight text-[#173F35]"
          >
            Green-Sweep
          </Link>

          <Link
            to="/reports/new"
            className="rounded-lg bg-[#173F35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245448]"
          >
            + Report Issue
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#2F7D5B]">
            Community reports
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#173F35]">
            Reported Issues
          </h1>

          <p className="mt-2 text-[#66736C]">
            See environmental issues reported by the community.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-[#66736C]">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-[#E3E8E4] bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-[#173F35]">
              No reports yet
            </h2>

            <p className="mt-2 text-[#66736C]">
              Be the first person to report an issue in your community.
            </p>

            <Link
              to="/reports/new"
              className="mt-6 inline-block rounded-lg bg-[#173F35] px-5 py-3 font-semibold text-white hover:bg-[#245448]"
            >
              Create First Report
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Link
                key={report._id}
                to={`/reports/${report._id}`}
                className="group rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-[#DCE9DF] px-3 py-1 text-xs font-medium text-[#2F7D5B]">
                    {formatCategory(report.category)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyles[report.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {formatStatus(report.status)}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-semibold text-[#173F35] group-hover:text-[#2F7D5B]">
                  {report.title}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#66736C]">
                  {report.description}
                </p>

                <div className="mt-5 border-t border-[#E3E8E4] pt-4">
                  <p className="text-sm text-[#66736C]">Location</p>

                  <p className="mt-1 text-sm font-medium text-[#1F2933]">
                    {report.location?.address}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-[#66736C]">
                  <span>
                    Reported by {report.reportedBy?.name || "Community member"}
                  </span>

                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Reports;
