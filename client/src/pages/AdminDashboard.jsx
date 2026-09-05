import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const statuses = [
  "reported",
  "under_review",
  "assigned",
  "cleanup_in_progress",
  "completed",
];

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

function AdminDashboard() {
  const { user, logout } = useAuth();

  const [reports, setReports] = useState([]);
  const [municipalUsers, setMunicipalUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(null);

  const fetchData = async () => {
    try {
      setError("");

      const [reportsResponse, usersResponse] = await Promise.all([
        api.get("/reports"),
        api.get("/auth/municipal-users"),
      ]);

      setReports(reportsResponse.data.reports);
      setMunicipalUsers(usersResponse.data.users);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load admin dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (reportId, status) => {
    try {
      setSaving(reportId);
      setError("");

      await api.put(`/reports/${reportId}/status`, {
        status,
      });

      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update report");
    } finally {
      setSaving(null);
    }
  };

  const assignReport = async (reportId, municipalUserId) => {
    if (!municipalUserId) {
      return;
    }

    try {
      setSaving(reportId);
      setError("");

      await api.put(`/reports/${reportId}/assign`, {
        municipalUserId,
      });

      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to assign report");
    } finally {
      setSaving(null);
    }
  };

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

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="rounded-lg border border-[#D4DDD7] px-4 py-2 text-sm font-medium text-[#173F35] hover:bg-[#F0F3EE]"
            >
              Dashboard
            </Link>

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
          <p className="text-sm font-medium text-[#2F7D5B]">Administration</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#173F35]">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-[#66736C]">
            Manage reports, assignments, and community cleanup operations.
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
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm">
                <p className="text-sm text-[#66736C]">Total reports</p>

                <p className="mt-2 text-3xl font-bold text-[#173F35]">
                  {reports.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm">
                <p className="text-sm text-[#66736C]">Municipal officers</p>

                <p className="mt-2 text-3xl font-bold text-[#173F35]">
                  {municipalUsers.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm">
                <p className="text-sm text-[#66736C]">Completed reports</p>

                <p className="mt-2 text-3xl font-bold text-[#173F35]">
                  {
                    reports.filter((report) => report.status === "completed")
                      .length
                  }
                </p>
              </div>
            </div>

            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-[#173F35]">
                  Report Management
                </h2>

                <p className="mt-1 text-sm text-[#66736C]">
                  Update issue status and assign municipal officers.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#E3E8E4] bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="px-6 py-4 text-sm font-medium uppercase tracking-wide text-gray-600">
                          Issue
                        </th>

                        <th className="px-6 py-4 text-sm font-medium uppercase tracking-wide text-gray-600">
                          Status
                        </th>

                        <th className="px-6 py-4 text-sm font-medium uppercase tracking-wide text-gray-600">
                          Assigned To
                        </th>

                        <th className="px-6 py-4 text-sm font-medium uppercase tracking-wide text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports.map((report) => (
                        <tr
                          key={report._id}
                          className="border-b border-gray-100 last:border-b-0"
                        >
                          {/* ISSUE */}
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-semibold text-[#173F35]">
                                {report.title}
                              </p>

                              <p className="mt-1 text-sm capitalize text-gray-500">
                                {formatCategory(report.category)}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {report.location?.address}
                              </p>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-5">
                            <select
                              value={report.status}
                              onChange={(e) =>
                                updateStatus(report._id, e.target.value)
                              }
                              disabled={saving === report._id}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#2F7D5B] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {formatStatus(status)}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* ASSIGNED TO */}
                          <td className="px-6 py-5">
                            <select
                              value={report.assignedTo?._id || ""}
                              onChange={(e) =>
                                assignReport(report._id, e.target.value)
                              }
                              disabled={saving === report._id}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#2F7D5B] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Unassigned</option>

                              {municipalUsers.map((municipalUser) => (
                                <option
                                  key={municipalUser._id}
                                  value={municipalUser._id}
                                >
                                  {municipalUser.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-6 py-5">
                            <Link
                              to={`/reports/${report._id}`}
                              className="font-medium text-[#2F7D5B] hover:underline"
                            >
                              View Report
                            </Link>
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

export default AdminDashboard;
