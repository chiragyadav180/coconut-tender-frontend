import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../../context/AuthContext";

import UserManagement from "../../components/UserManagement";
import OrderManagement from "../../components/OrderManagement";
import CoconutManagement from "../../components/CoconutManagement";
import AssignDelivery from "../../components/AssignDelivery";
import PaymentManagement from "../../components/PaymentManagement";
import { LayoutDashboard, Users, Package, CreditCard, Leaf, Truck, LogOut, Menu, X } from "lucide-react";

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("users");
  const [socket, setSocket] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?._id) return;

    const socketInstance = io("process.env.BASE_URL");

    socketInstance.emit("joinRoom", {
      userId: user._id,
      role: user.role || "admin"
    });

    socketInstance.on("orderPlaced", (data) => {
      toast.info(`🧾 New Order: ${data.coconut} x ${data.quantity} - ₹${data.totalPrice}`, {
        position: "top-right",
        autoClose: 4000,
      });
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, [user?._id]);

  const renderContent = () => {
    switch (selectedTab) {
      case "users":
        return <UserManagement />;
      case "dashboard":
        return <div className="p-6 text-lg">Dashboard overview here...</div>;
      case "orders":
        return <OrderManagement socket={socket} />;
      case "payments":
        return <PaymentManagement />;
      case "coconuts":
        return <CoconutManagement />;
      case "deliveries":
        return <AssignDelivery />;
      default:
        return null;
    }
  };

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
    { key: "users", label: "Users", icon: <Users className="w-5 h-5 mr-2" /> },
    { key: "orders", label: "Orders", icon: <Package className="w-5 h-5 mr-2" /> },
    { key: "payments", label: "Payments", icon: <CreditCard className="w-5 h-5 mr-2" /> },
    { key: "coconuts", label: "Coconuts", icon: <Leaf className="w-5 h-5 mr-2" /> },
    { key: "deliveries", label: "Deliveries", icon: <Truck className="w-5 h-5 mr-2" /> },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:hidden bg-white border-b shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-600">Admin Panel</h2>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>


      <aside className="hidden md:block fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-lg p-6 z-10">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">Admin Panel</h2>
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition ${
                selectedTab === tab.key
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => (window.location.href = "/login")}
            className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-red-100 text-red-600 mt-8"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </nav>
      </aside>


      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-50 z-40">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6 z-50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-600">Admin Panel</h2>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setSelectedTab(tab.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-2 rounded-lg transition ${
                    selectedTab === tab.key
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              <button
                onClick={() => (window.location.href = "/login")}
                className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-red-100 text-red-600 mt-8"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      <main className="md:ml-64 min-h-screen bg-gray-50">
        <div className="p-6">
          {renderContent()}
        </div>
        <ToastContainer 
          position="top-right" 
          autoClose={4000}
          icon={false}
          closeButton={false}
          hideProgressBar={true}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
