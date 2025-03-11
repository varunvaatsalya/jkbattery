// import logo from "./logo.svg";
import "./App.css";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./main/Login";
import AdminDashboard from "./main/AdminDashboard";
import UserDashboard from "./main/UserDashboard";
import { useAuth } from "./context/AuthContext";
import Users from "./pages/Users";
import Products from "./pages/Products";
import AddEditProducts from "./pages/AddEditProducts";
import Company from "./pages/Company";
import Employees from "./pages/Employees";
import Complaints from "./pages/Complaints";
import Customers from "./pages/Customers";
import Dealers from "./pages/Dealers";
import LoginsHistory from "./pages/LoginsHistory";
import MessageBox from "./components/MessageBox";
import NotFound from "./NotFound";
import Transfer from "./components/Transfer";

const ProtectedRoute = ({ element, isAllowed }) => {
  return isAllowed ? element : <Navigate to="/" replace />;
};

function App() {
  const { user } = useAuth();
  return (
    <HashRouter>
      <div className="max-h-screen min-h-screen bg-gray-100">
        <MessageBox />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/adminDashboard"
            element={
              <ProtectedRoute
                element={<AdminDashboard />}
                isAllowed={user && user.role === "admin"}
              />
            }
          />
          <Route
            path="/adminDashboard/users"
            element={
              <ProtectedRoute
                element={<Users />}
                isAllowed={user && user.role === "admin"}
              />
            }
          />
          <Route
            path="/adminDashboard/employees"
            element={
              <ProtectedRoute
                element={<Employees />}
                isAllowed={user && user.role === "admin"}
              />
            }
          />
          <Route
            path="/adminDashboard/dealers"
            element={
              <ProtectedRoute
                element={<Dealers />}
                isAllowed={user && user.role === "admin"}
              />
            }
          />
          <Route
            path="/adminDashboard/logins"
            element={
              <ProtectedRoute
                element={<LoginsHistory />}
                isAllowed={user && user.role === "admin"}
              />
            }
          />
          <Route
            path="/userDashboard"
            element={
              <ProtectedRoute
                element={<UserDashboard />}
                isAllowed={user && user.role === "user"}
              />
            }
          />

          <Route path="/customers" element={<Customers />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/products" element={<Products />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/transfer/export" element={<Transfer />} />
          <Route path="/transfer/import" element={<Transfer />} />
          <Route
            path="/products/addEditProducts"
            element={<AddEditProducts />}
          />
          <Route path="/products/company" element={<Company />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
