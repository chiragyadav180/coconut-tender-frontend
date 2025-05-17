import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import 'react-toastify/dist/ReactToastify.css';

const socket = io("process.env.BASE_URL");

const DriverDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [newOrderId, setNewOrderId] = useState(null);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completed: 0,
    inProgress: 0
  });

  const fetchOrders = async (tab = activeTab) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `process.env.BASE_URL/driver/assigned-orders?history=${tab === "history"}`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      setOrders(res.data.data || []);
      

      if (tab === "history") {
        setStats({
          totalDeliveries: res.data.data.length,
          completed: res.data.data.length,
          inProgress: 0
        });
      } else {
        const completed = res.data.data.filter(o => o.status === "delivered").length;
        setStats({
          totalDeliveries: res.data.data.length,
          completed,
          inProgress: res.data.data.length - completed
        });
      }
    } catch (err) {
      toast.error("Failed to fetch orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "driver") {
      socket.emit("joinRoom", { userId: user._id, role: "driver" });

      socket.on("deliveryAssigned", (data) => {
        toast.info(data.message || "New delivery assigned!");
        setNewOrderId(data.orderId);
        fetchOrders("active");
      });

      return () => {
        socket.off("deliveryAssigned");
      };
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "driver") fetchOrders();
  }, [user, activeTab]);

  const updateStatus = async (orderId, status) => {
    try {
      setLoading(true);
      await axios.put(
        `process.env.BASE_URL/driver/update-status/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      toast.success(`Status updated to ${status.replace(/-/g, ' ')}`);
      fetchOrders(activeTab);
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "driver") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
          <p>This dashboard is for drivers only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Driver Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name || 'Driver'}!</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="text-gray-600">Driver ID: </span>
            <span className="font-mono text-blue-600">{user._id.slice(-6)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-medium">Total Deliveries</h3>
            <p className="text-2xl font-bold mt-2">{stats.totalDeliveries}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
            <p className="text-2xl font-bold mt-2">{stats.completed}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
            <p className="text-2xl font-bold mt-2">{stats.inProgress}</p>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 font-medium text-sm ${activeTab === "active" ? 
              'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Active Deliveries
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium text-sm ${activeTab === "history" ? 
              'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Delivery History
          </button>
        </div>


        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No deliveries found</h3>
            <p className="mt-1 text-gray-500">
              {activeTab === "active" ? 
                "You currently have no active deliveries." : 
                "Your delivery history will appear here."}
            </p>
          </div>
        )}

       
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${
                  order._id === newOrderId ? 'border-green-500 animate-pulse' : 
                  order.status === "delivered" ? 'border-green-300' : 
                  'border-blue-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded mr-2">
                        #{order._id.slice(-6)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === "delivered" ? 'bg-green-100 text-green-800' :
                        order.status === "out-for-delivery" ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.replace(/-/g, ' ')}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-medium">
                      {order.coconutId?.variety || 'Coconut Delivery'}
                    </h3>
                    <p className="text-gray-600">{order.vendorId?.name || 'Vendor'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Quantity</p>
                      <p className="font-medium">{order.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-medium">₹{order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {activeTab === "active" && order.status !== "delivered" && (
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => updateStatus(order._id, "out-for-delivery")}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg flex-1 ${
                        order.status === "assigned" ? 
                        'bg-blue-600 hover:bg-blue-700 text-white' : 
                        'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Mark as Out for Delivery
                    </button>
                    <button
                      onClick={() => updateStatus(order._id, "delivered")}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg flex-1 ${
                        order.status === "out-for-delivery" ? 
                        'bg-green-600 hover:bg-green-700 text-white' : 
                        'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Mark as Delivered
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        icon={false}
        closeButton={false}
        hideProgressBar={true}
      />
    </div>
  );
};

export default DriverDashboard;