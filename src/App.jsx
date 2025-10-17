import React from "react";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import SurveyCreator from "./components/SurveyCreator";
import UserSurvey from "./components/UserSurvey";

function App() {
  const { currentUser, userRole, logout } = useAuth();
  const [adminPage, setAdminPage] = React.useState("dashboard");

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Survey App</h1>
              <p className="text-sm text-gray-600">
                Logged in as {userRole} - {currentUser.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
       {userRole === "admin" ? (
  <div>
    <div className="bg-white border-b">
      <div className="container mx-auto px-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setAdminPage("dashboard")}
            className={`px-4 py-2 text-sm font-medium ${
              adminPage === "dashboard"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setAdminPage("create")}
            className={`px-4 py-2 text-sm font-medium ${
              adminPage === "create"
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Create Survey
          </button>
        </div>
      </div>
    </div>

    {/* Render based on adminPage state */}
    {adminPage === "create" ? <SurveyCreator /> : <AdminDashboard />}
  </div>
) : (
  <UserSurvey />
)}

      </main>
    </div>
  );
}

export default App;
