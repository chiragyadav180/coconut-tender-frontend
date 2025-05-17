import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { TruckIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const AssignDelivery = () => {
  const { user } = useAuth();
  const token = user?.token;
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState({});
  const [loading, setLoading] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();
      fetchDrivers();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.filter((order) => order.status === "pending"));
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/drivers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(res.data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  };

  const handleAssign = async (orderId) => {
    if (!selectedDrivers[orderId]) {
      alert("Please select a driver to assign the delivery.");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, [orderId]: true }));
      await axios.post(
        "http://localhost:5000/admin/assign-delivery",
        { orderId, driverId: selectedDrivers[orderId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      console.error("Failed to assign delivery:", err.response?.data || err.message);
    } finally {
      setLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <UserCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-2 text-sm text-gray-500">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Assign Deliveries</h2>
        <p className="mt-1 text-sm sm:text-base text-gray-600">Manage pending orders and assign them to available drivers</p>
      </div>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Pending Orders</h3>
          <p className="mt-2 text-sm text-gray-500">There are currently no orders waiting to be assigned.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order ID</p>
                    <h3 className="text-lg font-semibold text-gray-900">#{order._id.slice(-6)}</h3>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Vendor Details</p>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {(order.vendorId?.name || "N/A").charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{order.vendorId?.name || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Quantity</p>
                      <p className="text-sm font-medium text-gray-900">{order.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Price</p>
                      <p className="text-sm font-medium text-gray-900">₹{order.totalPrice}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Driver
                    </label>
                    <select
                      onChange={(e) => setSelectedDrivers(prev => ({
                        ...prev,
                        [order._id]: e.target.value
                      }))}
                      value={selectedDrivers[order._id] || ""}
                      disabled={loading[order._id]}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                    >
                      <option value="">Choose a driver</option>
                      {drivers.map((driver) => (
                        <option key={driver._id} value={driver._id}>
                          {driver.name} ({driver.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleAssign(order._id)}
                    disabled={loading[order._id] || !selectedDrivers[order._id]}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center space-x-2 ${
                      loading[order._id] || !selectedDrivers[order._id]
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
                    }`}
                  >
                    <TruckIcon className="w-5 h-5" />
                    <span>{loading[order._id] ? "Assigning..." : "Assign Delivery"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignDelivery;