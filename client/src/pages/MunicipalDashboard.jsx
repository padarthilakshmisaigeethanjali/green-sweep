import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  reported: "bg-gray-100 text-gray-700",
  under_review: "bg-yellow-100 text-yellow-700",
  assigned: "bg-blue-100 text-blue-700",
  cleanup_in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

const cleanupStatusStyles = {
  claimed: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  submitted: "bg-yellow-100 text-yellow-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
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

function MunicipalDashboard() {
  const { user, logout } = useAuth();

  const [reports, setReports] = useState([]);
  const [cleanups, setCleanups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(null);

  const fetchData = async () => {
    try {
      setError("");

      const [reportsResponse, cleanupsResponse] = await Promise.all([
        api.get("/reports"),
        api.get("/cleanups"),
      ]);

      console.log("Municipal reports:", reportsResponse.data);
      console.log("Municipal cleanups:", cleanupsResponse.data);

      setReports(reportsResponse.data.reports);
      setCleanups(cleanupsResponse.data.cleanups);
    } catch (error) {
      console.error("Municipal dashboard error:", error);

      setError(
        error.response?.data?.message || "Failed to load municipal dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (cleanupId) => {
    try {
      setVerifying(cleanupId);
      setError("");

      await api.put(`/cleanups/${cleanupId}/verify`);

      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to verify cleanup");
    } finally {
      setVerifying(null);
    }
  };

  const submittedCleanups = cleanups.filter(
    (cleanup) => cleanup.status === "submitted",
  );

  const completedReports = reports.filter(
    (report) => report.status === "completed",
  );

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

          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#173F35]">
                {user?.name}
              </p>

              <p className="text-xs capitalize text-[#66736C]">{user?.role}</p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-[#D4DDD7] px-4 py-2 text-sm font-medium text-[#173F35] hover:bg-[#F0F3EE]"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-medium text-[#2F7D5B]">Municipal portal</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#173F35]">
            Operations Dashboard
          </h1>

          <p className="mt-2 text-[#66736C]">
            Review community reports and verify completed cleanups.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-[#66736C]">
            Loading dashboard...
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm">
                <p className="text-sm text-[#66736C]">Total reports</p>

                <p className="mt-2 text-3xl font-bold text-[#173F35]">
                  {reports.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm">
                <p className="text-sm text-[#66736C]">Active reports</p>

                <p className="mt-2 text-3xl font-bold text-[#173F35]">
                  {
                    reports.filter((report) => report.status !== "completed")
                      .length
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm">
                <p className="text-sm text-[#66736C]">Pending verification</p>

                <p className="mt-2 text-3xl font-bold text-[#173F35]">
                  {submittedCleanups.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm">
                <p className="text-sm text-[#66736C]">Completed reports</p>

                <p className="mt-2 text-3xl font-bold text-[#173F35]">
                  {completedReports.length}
                </p>
              </div>
            </div>

            <section className="mt-10">
              <div className="mb-5">
                <p className="text-sm font-medium text-[#2F7D5B]">
                  Requires action
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#173F35]">
                  Cleanup Verification
                </h2>
              </div>

              {submittedCleanups.length === 0 ? (
                <div className="rounded-2xl border border-[#E3E8E4] bg-white p-8 text-center shadow-sm">
                  <h3 className="font-semibold text-[#173F35]">
                    Nothing to verify
                  </h3>

                  <p className="mt-2 text-sm text-[#66736C]">
                    Submitted cleanup proofs will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {submittedCleanups.map((cleanup) => (
                    <div
                      key={cleanup._id}
                      className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[#66736C]">
                            Cleanup submission
                          </p>

                          <h3 className="mt-1 text-xl font-semibold text-[#173F35]">
                            {cleanup.report?.title || "Community cleanup"}
                          </h3>
                        </div>

                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          Pending
                        </span>
                      </div>

                      {cleanup.report?.location?.address && (
                        <p className="mt-3 text-sm text-[#66736C]">
                          {cleanup.report.location.address}
                        </p>
                      )}

                      <div className="mt-4 border-t border-[#E3E8E4] pt-4">
                        <p className="text-sm text-[#66736C]">Volunteer</p>

                        <p className="mt-1 font-medium text-[#1F2933]">
                          {cleanup.volunteer?.name || "Unknown volunteer"}
                        </p>
                      </div>

                      {cleanup.proofImage && (
                        <div className="mt-5 overflow-hidden rounded-xl border border-[#E3E8E4]">
                          <img
                            src={cleanup.proofImage}
                            alt="Cleanup proof"
                            className="max-h-80 w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="mt-5 flex items-center justify-between">
                        <p className="text-sm text-[#66736C]">
                          Verification awards{" "}
                          <span className="font-semibold text-[#173F35]">
                            50 points
                          </span>
                        </p>

                        <button
                          onClick={() => handleVerify(cleanup._id)}
                          disabled={verifying === cleanup._id}
                          className="rounded-lg bg-[#173F35] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#245448] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {verifying === cleanup._id
                            ? "Verifying..."
                            : "Verify Cleanup"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-10">
              <div className="mb-5">
                <p className="text-sm font-medium text-[#2F7D5B]">
                  Community activity
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#173F35]">
                  Reports
                </h2>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#E3E8E4] bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="border-b border-[#E3E8E4] bg-[#F7F8F3]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66736C]">
                          Issue
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66736C]">
                          Category
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66736C]">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66736C]">
                          Reported by
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#66736C]">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports.map((report) => (
                        <tr
                          key={report._id}
                          className="border-b border-[#E3E8E4] last:border-0"
                        >
                          <td className="px-6 py-4">
                            <Link
                              to={`/reports/${report._id}`}
                              className="font-medium text-[#173F35] hover:text-[#2F7D5B]"
                            >
                              {report.title}
                            </Link>

                            <p className="mt-1 max-w-xs truncate text-xs text-[#66736C]">
                              {report.location?.address}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm text-[#1F2933]">
                            {formatCategory(report.category)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                statusStyles[report.status] ||
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {formatStatus(report.status)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-[#66736C]">
                            {report.reportedBy?.name || "Community member"}
                          </td>

                          <td className="px-6 py-4 text-sm text-[#66736C]">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default MunicipalDashboard;
