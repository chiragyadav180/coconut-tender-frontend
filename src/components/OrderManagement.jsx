import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarIcon,
  TruckIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';


const getStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "delivered":
      return "bg-green-100 text-green-800 border border-green-200";
    case "out-for-delivery":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "out-for-delivery":
      return <TruckIcon className="w-4 h-4 mr-1" />;
    case "delivered":
      return <ShoppingBagIcon className="w-4 h-4 mr-1" />;
    default:
      return null;
  }
};

const OrderCard = ({ order }) => (
  <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
    <div className="flex justify-between items-start">
      <div>
        <span className="text-sm text-gray-500">Order ID</span>
        <p className="font-medium">#{order._id.slice(-6)}</p>
      </div>
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
        {getStatusIcon(order.status)}
        {order.status}
      </span>
    </div>

    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0 h-10 w-10">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xl font-medium text-gray-600">
            {(order.vendorId?.name || "N/A").charAt(0)}
          </span>
        </div>
      </div>
      <div>
        <p className="font-medium">{order.vendorId?.name || "N/A"}</p>
        <p className="text-sm text-gray-500">{order.coconutId?.variety || "N/A"} - {order.coconutId?.size || "N/A"}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-gray-500">Quantity</span>
        <p className="font-medium">{order.quantity} units</p>
      </div>
      <div>
        <span className="text-gray-500">Rate</span>
        <p className="font-medium">₹{order.rate}/unit</p>
      </div>
      <div className="col-span-2">
        <span className="text-gray-500">Total Price</span>
        <p className="text-lg font-semibold text-green-600 flex items-center">
          <CurrencyRupeeIcon className="w-5 h-5 mr-1" />
          {order.totalPrice}
        </p>
      </div>
    </div>

    <div className="text-sm text-gray-500 pt-2 border-t">
      <div className="flex justify-between items-center">
        <span>{new Date(order.createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}</span>
        <span>{new Date(order.createdAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })}</span>
      </div>
    </div>
  </div>
);

const OrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const ordersPerPage = 10;
  const socketRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("process.env.BASE_URL/admin/orders", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrders(res.data);
      applyFilters(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (orderData = orders) => {
    let filtered = [...orderData];
    
    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setFilteredOrders(orders);
    setShowFilters(false);
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();

      if (!socketRef.current && user?._id) {
        socketRef.current = io("process.env.BASE_URL");

        socketRef.current.emit("joinRoom", {
          userId: user._id,
          role: "admin",
        });

        socketRef.current.on("orderPlaced", () => {
          toast.info("A new order has been placed!");
          fetchOrders();
        });

        socketRef.current.on("connect_error", (err) => {
          console.error("Socket connection error:", err);
        });
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id, user?.role]);

  useEffect(() => {
    applyFilters();
  }, [startDate, endDate]);


  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        icon={false}
        closeButton={false}
        hideProgressBar={true}
      />
      

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Order Management</h2>
          <p className="text-gray-600 mt-1">Manage and track all orders</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="w-5 h-5 mr-2 text-gray-600" />
            <span>Filters</span>
          </button>
          
          <button
            onClick={fetchOrders}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

 
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="w-full sm:w-auto">
                <label className="text-sm text-gray-600 mb-1 block">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  dateFormat="MMM d, yyyy"
                  placeholderText="Select start date"
                />
              </div>
              <div className="w-full sm:w-auto">
                <label className="text-sm text-gray-600 mb-1 block">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  dateFormat="MMM d, yyyy"
                  placeholderText="Select end date"
                />
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors w-full sm:w-auto justify-center sm:justify-start"
            >
              <XMarkIcon className="w-5 h-5 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      )}


      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>

          <div className="hidden md:block bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xl font-medium text-gray-600">
                                {(order.vendorId?.name || "N/A").charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{order.vendorId?.name || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.coconutId?.variety || "N/A"}</div>
                        <div className="text-sm text-gray-500">Size: {order.coconutId?.size || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.quantity} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                          <span>{order.totalPrice}</span>
                        </div>
                        <div className="text-sm text-gray-500">Rate: ₹{order.rate}/unit</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                        <div className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <ShoppingBagIcon className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-gray-500 text-lg">No orders found</p>
                          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          
            {filteredOrders.length > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastOrder, filteredOrders.length)}
                      </span>{" "}
                      of <span className="font-medium">{filteredOrders.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => paginate(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index + 1
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

      
          <div className="md:hidden space-y-4">
            {currentOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>

    
          {currentOrders.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}

     
          {filteredOrders.length > 0 && (
            <div className="mt-4 bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-md">
              <div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastOrder, filteredOrders.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredOrders.length}</span> results
                </p>
              </div>
              
              <div className="flex justify-center w-full sm:w-auto space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 rounded border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 rounded border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderManagement;