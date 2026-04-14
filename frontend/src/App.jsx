import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCreators from "./pages/admin/AdminCreators";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateOrder from "./pages/customer/CreateOrder";
import MyOrders from "./pages/customer/MyOrders";
import AllOrders from "./pages/creator/AllOrders";
import AssignedOrders from "./pages/creator/AssignedOrders";
import Notifications from "./pages/Notifications";
import AppliedOrders from "./pages/creator/AppliedOrders";
import CreatorOrderHistory from "./pages/creator/CreatorOrderHistory";
import CustomerOrderHistory from "./pages/customer/CustomerOrderHistory";
import CreatorReviews from "./pages/creator/CreatorReviews";
import CreatorEarnings from "./pages/creator/CreatorEarnings";
import CreatorPortfolio from "./pages/creator/CreatorPortfolio";
import Chat from "./pages/common/Chat";
import OrderDetails from "./pages/common/OrderDetails";
import AdminEarnings from "./pages/admin/AdminEarnings";


function App() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= CUSTOMER ================= */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute role="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/create-order"
        element={
          <ProtectedRoute role="customer">
            <CreateOrder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/my-orders"
        element={
          <ProtectedRoute role="customer">
            <MyOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/history"
        element={
          <ProtectedRoute role="customer">
            <CustomerOrderHistory />
          </ProtectedRoute>
        }
      />

      {/* ================= CREATOR ================= */}
      <Route
        path="/creator/dashboard"
        element={
          <ProtectedRoute role="creator">
            <CreatorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/creator/orders"
        element={
          <ProtectedRoute role="creator">
            <AllOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/creator/assigned-orders"
        element={
          <ProtectedRoute role="creator">
            <AssignedOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/creator/applied"
        element={
          <ProtectedRoute role="creator">
            <AppliedOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/creator/history"
        element={
          <ProtectedRoute role="creator">
            <CreatorOrderHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/creator/reviews"
        element={
          <ProtectedRoute role="creator">
            <CreatorReviews />
          </ProtectedRoute>
        }
      />

      <Route
        path="/creator/earnings"
        element={
          <ProtectedRoute role="creator">
            <CreatorEarnings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/creator/portfolio"
        element={
          <ProtectedRoute role="creator">
            <CreatorPortfolio />
          </ProtectedRoute>
        }
      />

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute role="admin">
            <AdminOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/creators"
        element={
          <ProtectedRoute role="admin">
            <AdminCreators />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/earnings"
        element={
          <ProtectedRoute role="admin">
            <AdminEarnings />
          </ProtectedRoute>
        }
      />

      {/* ================= COMMON ================= */}

      {/* 🔔 Notifications for ALL users */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route path="/order/:id" element={<OrderDetails />} />

      {/* 💬 Chat */}
      <Route
        path="/chat/:orderId"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;