import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

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

function Dashboard() {
  const { user, logout } = useAuth();

  const [cleanups, setCleanups] = useState([]);
  const [loadingCleanups, setLoadingCleanups] = useState(true);
  const [cleanupError, setCleanupError] = useState("");

  const [selectedCleanup, setSelectedCleanup] = useState(null);
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get("/auth/leaderboard");

      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error(
        "Failed to load leaderboard:",
        error.response?.data?.message || error.message,
      );
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const fetchCleanups = async () => {
    try {
      setCleanupError("");

      const response = await api.get("/cleanups");

      const myCleanups = response.data.cleanups.filter((cleanup) => {
        const volunteerId =
          typeof cleanup.volunteer === "object"
            ? cleanup.volunteer?._id
            : cleanup.volunteer;

        return volunteerId === user?.id;
      });

      setCleanups(myCleanups);
    } catch (error) {
      setCleanupError(
        error.response?.data?.message || "Failed to load your cleanups",
      );
    } finally {
      setLoadingCleanups(false);
    }
  };

  useEffect(() => {
    if (user?.role === "citizen") {
      fetchCleanups();
      fetchLeaderboard();
    } else {
      setLoadingCleanups(false);
      setLoadingLeaderboard(false);
    }
  }, [user]);

  const handleProofChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setProofImage(null);
      setProofPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setCleanupError("Please select an image file.");
      setProofImage(null);
      setProofPreview("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCleanupError("Image must be smaller than 5 MB.");
      setProofImage(null);
      setProofPreview("");
      return;
    }

    setCleanupError("");
    setProofImage(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();

    if (!selectedCleanup || !proofImage) {
      setCleanupError("Please select a proof image.");
      return;
    }

    try {
      setSubmitting(true);
      setCleanupError("");

      const data = new FormData();

      data.append("proofImage", proofImage);

      await api.put(`/cleanups/${selectedCleanup._id}/submit`, data);

      setSelectedCleanup(null);
      setProofImage(null);
      setProofPreview("");

      await fetchCleanups();
    } catch (error) {
      setCleanupError(
        error.response?.data?.message || "Failed to submit cleanup",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeProofForm = () => {
    setSelectedCleanup(null);
    setProofImage(null);
    setProofPreview("");
    setCleanupError("");
  };

  return (
    <div className="min-h-screen bg-[#F7F8F3]">
      <nav className="border-b border-[#E3E8E4] bg-white">
        <div className="flex items-center gap-4">
          {user?.role === "municipal" && (
            <Link
              to="/municipal"
              className="rounded-lg border border-[#D4DDD7] px-4 py-2 text-sm font-medium text-[#173F35] transition hover:bg-[#F0F3EE]"
            >
              Operations
            </Link>
          )}

          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="rounded-lg border border-[#D4DDD7] px-4 py-2 text-sm font-medium text-[#173F35] transition hover:bg-[#F0F3EE]"
            >
              Admin
            </Link>
          )}

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-[#173F35]">{user?.name}</p>

            <p className="text-xs capitalize text-[#66736C]">{user?.role}</p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-[#D4DDD7] px-4 py-2 text-sm font-medium text-[#173F35] transition hover:bg-[#F0F3EE]"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-medium text-[#2F7D5B]">Dashboard</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#173F35]">
            Welcome back, {user?.name}
          </h1>

          <p className="mt-2 text-[#66736C]">
            Make your next contribution to a cleaner community.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#66736C]">Your points</p>

            <p className="mt-2 text-4xl font-bold text-[#173F35]">
              {user?.points ?? 0}
            </p>

            <p className="mt-2 text-sm text-[#66736C]">
              Earn points by completing cleanups.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#66736C]">
              Report an issue
            </p>

            <p className="mt-2 text-lg font-semibold text-[#173F35]">
              Found an unclean space?
            </p>

            <Link
              to="/reports/new"
              className="mt-4 inline-block text-sm font-semibold text-[#2F7D5B] hover:text-[#173F35]"
            >
              Create a report →
            </Link>
          </div>

          <div className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-[#66736C]">
              Community action
            </p>

            <p className="mt-2 text-lg font-semibold text-[#173F35]">
              Help clean your area.
            </p>

            <Link
              to="/reports"
              className="mt-4 inline-block text-sm font-semibold text-[#2F7D5B] hover:text-[#173F35]"
            >
              View reports →
            </Link>
          </div>
        </div>

        {user?.role === "citizen" && (
          <section className="mt-8">
            <div className="mb-5">
              <p className="text-sm font-medium text-[#2F7D5B]">
                Your activity
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#173F35]">
                My Cleanups
              </h2>

              <p className="mt-1 text-sm text-[#66736C]">
                Track the cleanup issues you've volunteered for.
              </p>
            </div>

            {user?.role === "citizen" && (
              <section className="mt-10">
                <div className="mb-5">
                  <p className="text-sm font-medium text-[#2F7D5B]">
                    Community recognition
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-[#173F35]">
                    Leaderboard
                  </h2>

                  <p className="mt-1 text-sm text-[#66736C]">
                    Top community members by verified cleanup points.
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#E3E8E4] bg-white shadow-sm">
                  {loadingLeaderboard ? (
                    <div className="p-8 text-center text-sm text-[#66736C]">
                      Loading leaderboard...
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#66736C]">
                      No leaderboard data yet.
                    </div>
                  ) : (
                    <div>
                      {leaderboard.map((member, index) => (
                        <div
                          key={member._id}
                          className="flex items-center justify-between border-b border-[#E3E8E4] px-6 py-4 last:border-b-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DCE9DF] text-sm font-bold text-[#2F7D5B]">
                              {index + 1}
                            </div>

                            <div>
                              <p className="font-semibold text-[#173F35]">
                                {member.name}
                              </p>

                              {member._id === user?.id && (
                                <p className="text-xs font-medium text-[#2F7D5B]">
                                  You
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-[#173F35]">
                              {member.points}
                            </p>

                            <p className="text-xs text-[#66736C]">points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
            <br />
            <br />
            {cleanupError && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                {cleanupError}
              </div>
            )}

            {loadingCleanups ? (
              <div className="rounded-2xl border border-[#E3E8E4] bg-white p-8 text-center text-[#66736C] shadow-sm">
                Loading your cleanups...
              </div>
            ) : cleanups.length === 0 ? (
              <div className="rounded-2xl border border-[#E3E8E4] bg-white p-8 text-center shadow-sm">
                <h3 className="font-semibold text-[#173F35]">
                  No cleanups yet
                </h3>

                <p className="mt-2 text-sm text-[#66736C]">
                  Find a community report and volunteer to help.
                </p>

                <Link
                  to="/reports"
                  className="mt-5 inline-block rounded-lg bg-[#173F35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245448]"
                >
                  Browse Reports
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {cleanups.map((cleanup) => (
                  <div
                    key={cleanup._id}
                    className="rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-[#66736C]">
                          Cleanup
                        </p>

                        <h3 className="mt-1 text-lg font-semibold text-[#173F35]">
                          {cleanup.report?.title || "Community cleanup"}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          cleanupStatusStyles[cleanup.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatStatus(cleanup.status)}
                      </span>
                    </div>

                    {cleanup.report?.location?.address && (
                      <p className="mt-4 text-sm text-[#66736C]">
                        {cleanup.report.location.address}
                      </p>
                    )}

                    {cleanup.proofImage && (
                      <div className="mt-4 overflow-hidden rounded-xl border border-[#E3E8E4]">
                        <img
                          src={cleanup.proofImage}
                          alt="Cleanup proof"
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    )}

                    {cleanup.status === "claimed" && (
                      <button
                        onClick={() => setSelectedCleanup(cleanup)}
                        className="mt-5 rounded-lg bg-[#173F35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245448]"
                      >
                        Submit Cleanup Proof
                      </button>
                    )}

                    {cleanup.status === "in_progress" && (
                      <button
                        onClick={() => setSelectedCleanup(cleanup)}
                        className="mt-5 rounded-lg bg-[#173F35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245448]"
                      >
                        Submit Cleanup Proof
                      </button>
                    )}

                    {cleanup.status === "submitted" && (
                      <p className="mt-5 text-sm font-medium text-[#66736C]">
                        Proof submitted. Waiting for municipal verification.
                      </p>
                    )}

                    {cleanup.status === "verified" && (
                      <p className="mt-5 text-sm font-semibold text-[#2F7D5B]">
                        Cleanup verified. +50 points awarded.
                      </p>
                    )}

                    {cleanup.status === "rejected" && (
                      <p className="mt-5 text-sm text-red-600">
                        Your cleanup was rejected. You can review the report and
                        try again.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mt-8 rounded-2xl border border-[#E3E8E4] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#173F35]">
            How Green-Sweep works
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <span className="text-sm font-bold text-[#2F7D5B]">01</span>

              <h3 className="mt-2 font-semibold text-[#173F35]">Report</h3>

              <p className="mt-1 text-sm leading-6 text-[#66736C]">
                Report garbage, illegal dumping, or damaged public spaces.
              </p>
            </div>

            <div>
              <span className="text-sm font-bold text-[#2F7D5B]">02</span>

              <h3 className="mt-2 font-semibold text-[#173F35]">Act</h3>

              <p className="mt-1 text-sm leading-6 text-[#66736C]">
                Join a cleanup and help resolve an issue in your community.
              </p>
            </div>

            <div>
              <span className="text-sm font-bold text-[#2F7D5B]">03</span>

              <h3 className="mt-2 font-semibold text-[#173F35]">Earn</h3>

              <p className="mt-1 text-sm leading-6 text-[#66736C]">
                Get recognized with points for verified cleanup work.
              </p>
            </div>
          </div>
        </div>
      </main>

      {selectedCleanup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#173F35]">
                  Submit Cleanup Proof
                </h2>

                <p className="mt-1 text-sm text-[#66736C]">
                  Upload a photo showing the completed cleanup.
                </p>
              </div>

              <button
                type="button"
                onClick={closeProofForm}
                className="text-xl text-[#66736C] hover:text-[#173F35]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#1F2933]">
                Proof Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleProofChange}
                required
                className="block w-full rounded-lg border border-[#D4DDD7] bg-white p-3 text-sm text-[#66736C] file:mr-4 file:rounded-md file:border-0 file:bg-[#DCE9DF] file:px-4 file:py-2 file:font-medium file:text-[#2F7D5B]"
              />

              <p className="mt-2 text-xs text-[#66736C]">
                Maximum file size: 5 MB.
              </p>

              {proofPreview && (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#E3E8E4]">
                  <img
                    src={proofPreview}
                    alt="Cleanup proof preview"
                    className="max-h-72 w-full object-cover"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !proofImage}
                className="mt-6 w-full rounded-lg bg-[#173F35] px-5 py-3 font-semibold text-white transition hover:bg-[#245448] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Uploading proof..." : "Submit Proof"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
