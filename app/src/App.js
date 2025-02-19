// import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./main/Login";
import AdminDashboard from "./main/AdminDashboard";
import UserDashboard from "./main/UserDashboard";
import { useAuth } from "./context/AuthContext";
import Users from "./pages/Users";
import Products from "./pages/Products";

const ProtectedRoute = ({ element, isAllowed }) => {
  return isAllowed ? element : <Navigate to="/" replace />;
};

function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <div className="max-h-screen min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/adminDashboard"
            element={
              <ProtectedRoute
                element={<AdminDashboard />}
                isAllowed={user && user.username === "admin"}
              />
            }
          />
          <Route
            path="/adminDashboard/users"
            element={
              <ProtectedRoute
                element={<Users />}
                isAllowed={user && user.username === "admin"}
              />
            }
          />
          <Route
            path="/adminDashboard/products"
            element={
              <ProtectedRoute
                element={<Products />}
                isAllowed={user && user.username === "admin"}
              />
            }
          />

          <Route
            path="/userDashboard"
            element={
              <ProtectedRoute
                element={<UserDashboard />}
                isAllowed={user && user.username === "user"}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
