import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import CreateReport from "./pages/CreateReport";
import ReportDetails from "./pages/ReportDetails";
import MunicipalDashboard from "./pages/MunicipalDashboard";

import AdminDashboard from "./pages/AdminDashboard";

function Home() {
  return (
    <div className="min-h-screen bg-[#F7F8F3]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-7">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-[#173F35]"
        >
          Green-Sweep
        </Link>

        <Link
          to="/login"
          className="text-sm font-medium text-[#173F35] transition hover:text-[#2F7D5B]"
        >
          Sign in
        </Link>
      </nav>

      <main className="flex min-h-[calc(100vh-90px)] items-center justify-center px-6 pb-16">
        <div className="w-full max-w-4xl text-center">
          <div className="mb-7 inline-flex rounded-full bg-[#DCE9DF] px-5 py-2 text-sm font-medium text-[#2F7D5B]">
            Community-powered environmental action
          </div>

          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-[#173F35] md:text-7xl">
            Cleaner spaces.
            <br />
            Stronger communities.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#66736C]">
            Report public-space issues, organize cleanups, and turn community
            action into measurable impact.
          </p>

          <div className="mt-9 flex justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-[#173F35] px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#245448]"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="rounded-xl border border-[#D4DDD7] bg-white px-7 py-3.5 font-semibold text-[#173F35] transition hover:bg-[#F0F3EE]"
            >
              Sign In
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 border-t border-[#E3E8E4] pt-8">
            <div>
              <p className="text-2xl font-bold text-[#173F35]">Report</p>
              <p className="mt-1 text-sm text-[#66736C]">Spot an issue</p>
            </div>

            <div className="border-x border-[#E3E8E4]">
              <p className="text-2xl font-bold text-[#173F35]">Act</p>
              <p className="mt-1 text-sm text-[#66736C]">Join a cleanup</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-[#173F35]">Earn</p>
              <p className="mt-1 text-sm text-[#66736C]">Make an impact</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8F3] text-[#66736C]">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/reports"
        element={
          isAuthenticated ? <Reports /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/reports/new"
        element={
          isAuthenticated ? <CreateReport /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/reports/:id"
        element={
          isAuthenticated ? <ReportDetails /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/municipal"
        element={
          isAuthenticated &&
          (user?.role === "municipal" || user?.role === "admin") ? (
            <MunicipalDashboard />
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/admin"
        element={
          isAuthenticated && user?.role === "admin" ? (
            <AdminDashboard />
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
