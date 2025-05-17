import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const VendorDashboard = () => {
    const { user } = useAuth();
    const [coconuts, setCoconuts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedCoconut, setSelectedCoconut] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentOrderId, setPaymentOrderId] = useState("");
    const [loading, setLoading] = useState({
        orders: false,
        payment: false,
        order: false
    });
    const [paymentMethod, setPaymentMethod] = useState("razorpay");

    const token = user?.token;
    const socketRef = useRef(null);

    // Access Razorpay key from environment variables
    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    useEffect(() => {
        console.log("Razorpay Key ID:", razorpayKeyId);
    }, [razorpayKeyId]);

    // Socket connection
    useEffect(() => {
        if (!socketRef.current && user?._id && user?.role === "vendor") {
            socketRef.current = io("process.env.BASE_URL", {
                reconnectionAttempts: 3,
                reconnectionDelay: 1000,
            });

            socketRef.current.emit("joinRoom", {
                userId: user._id,
                role: "vendor"
            });

            socketRef.current.on("orderPlaced", (data) => {
                toast.info(`New order: ${data.coconut} x ${data.quantity}`);
                fetchOrders();
            });

            socketRef.current.on("connect_error", (err) => {
                console.error("Socket connection error:", err);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user?._id, user?.role]);

    useEffect(() => {
        if (user?._id) {
            fetchCoconuts();
            fetchOrders();
        }
    }, [user?._id]);

    const fetchCoconuts = async () => {
        try {
            const res = await axios.get("process.env.BASE_URL/vendor/coconuts", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCoconuts(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch coconuts: " + error.message);
        }
    };

    const fetchOrders = async () => {
        setLoading(prev => ({ ...prev, orders: true }));
        try {
            const res = await axios.get(`process.env.BASE_URL/vendor/orders/${user._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch orders: " + error.message);
        } finally {
            setLoading(prev => ({ ...prev, orders: false }));
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedCoconut) {
            toast.warning("Please select a coconut");
            return;
        }

        if (quantity <= 0) {
            toast.warning("Quantity must be at least 1");
            return;
        }

        setLoading(prev => ({ ...prev, order: true }));
        try {
            const response = await axios.post(
                "process.env.BASE_URL/vendor/order",
                {
                    coconutId: selectedCoconut,
                    quantity: Number(quantity),
                    paymentMethod: paymentMethod
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success("Order placed successfully!");
                setSelectedCoconut(null);
                setQuantity(1);
                fetchOrders();

                // Razorpay payment initiation if applicable
                if (paymentMethod === "razorpay" && response.data.order) {
                    console.log("Order data received:", response.data.order);
                    setPaymentOrderId(response.data.order._id);
                    setPaymentAmount(response.data.order.totalPrice);
                    await handleMakePayment(response.data.order._id, response.data.order.totalPrice);
                }
            } else {
                throw new Error(response.data.error || "Failed to place order");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Order failed");
        } finally {
            setLoading(prev => ({ ...prev, order: false }));
        }
    };

    const handleMakePayment = async (directOrderId = null, directAmount = null) => {
        try {
            // Use direct values if provided, otherwise fall back to state
            const orderId = directOrderId || paymentOrderId;
            const amount = directAmount || paymentAmount;

            if (!orderId || !amount) {
                console.error("Missing payment details:", { orderId, amount });
                toast.error("Payment details are missing. Please try again.");
                return;
            }

            console.log("Sending payment request with:", {
                orderId,
                amount: Number(amount)
            });

            const sessionResponse = await axios.post(
                "process.env.BASE_URL/vendor/create-checkout-session",
                {
                    orderId,
                    amount: Number(amount)
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!sessionResponse.data.success) {
                throw new Error(sessionResponse.data.error || "Failed to create checkout session");
            }

            const response = await axios.post(
                "process.env.BASE_URL/vendor/pay",
                {
                    orderId,
                    amount: Number(amount),
                    paymentMethod: paymentMethod,
                    sessionId: sessionResponse.data.sessionId
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.data.success) {
                throw new Error(response.data.error || "Payment failed");
            }

            if (paymentMethod === "razorpay" && response.data.razorpayOrder) {
                const { razorpayOrder } = response.data;
                const options = {
                    key: razorpayKeyId,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: "Coconut Tender",
                    description: `Payment for Order #${orderId.slice(-4)}`,
                    order_id: razorpayOrder.id,
                    notes: razorpayOrder.notes,
                    handler: async (response) => {
                        const verifyResponse = await axios.post(
                            "process.env.BASE_URL/vendor/verify-payment",
                            {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: orderId,
                                sessionId: sessionResponse.data.sessionId
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (verifyResponse.data.success) {
                            toast.success("Payment successful!");
                            fetchOrders();
                            setPaymentAmount("");
                            setPaymentOrderId("");
                        } else {
                            toast.error("Payment verification failed: " + verifyResponse.data.error);
                        }
                    },
                    prefill: {
                        name: user.name || "",
                        email: user.email || "",
                        contact: user.contact || "",
                    },
                    theme: {
                        color: "#10B981",
                    },
                    modal: {
                        animation: false,
                        backdropClose: false,
                        escape: false,
                        handleBack: true,
                        confirm_close: true,
                        ondismiss: function() {
                            toast.info("Payment cancelled");
                        }
                    },
                    config: {
                        display: {
                            blocks: {
                                utib: {
                                    name: "Pay using UPI",
                                    instruments: [
                                        {
                                            method: "upi"
                                        }
                                    ]
                                },
                                other: {
                                    name: "Other Payment Methods",
                                    instruments: [
                                        {
                                            method: "card"
                                        },
                                        {
                                            method: "netbanking"
                                        },
                                        {
                                            method: "wallet"
                                        }
                                    ]
                                }
                            },
                            sequence: ["block.utib", "block.other"],
                            preferences: {
                                show_default_blocks: false
                            }
                        }
                    },
                    method: {
                        upi: {
                            flow: "collect",
                            apps: ["google_pay", "phonepe", "paytm", "upi"]
                        },
                        netbanking: true,
                        card: true,
                        wallet: true
                    },
                    retry: {
                        enabled: false
                    }
                };

                const rzp = new window.Razorpay(options);
                
                rzp.on('payment.failed', function (response) {
                    if (response.error.code === "BAD_REQUEST_ERROR") {
                        // Handle validation errors gracefully
                        toast.info("Please try a different payment method");
                    } else {
                        toast.error("Payment failed: " + (response.error.description || "Unknown error"));
                    }
                });

                rzp.on('payment.error', function(error) {
                    // Log but don't show to user as it might be recoverable
                    console.warn("Payment error (non-fatal):", error);
                });

                try {
                    rzp.open();
                } catch (error) {
                    toast.error("Could not initialize payment. Please try again.");
                }
            } else if (response.data.success) {
                toast.success("Payment recorded successfully!");
                fetchOrders();
                setPaymentAmount("");
                setPaymentOrderId("");
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Payment failed");
        } finally {
            setLoading(prev => ({ ...prev, payment: false }));
        }
    };

    const getSelectedCoconut = () => coconuts.find((coco) => coco._id === selectedCoconut);

    const totalDue = orders.reduce((sum, order) => sum + (order.amountDue || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Vendor Dashboard</h1>
                    <div className="bg-white px-6 py-3 rounded-lg shadow-sm flex items-center">
                        <span className="text-gray-600 mr-2">Total Balance Due:</span>
                        <span className={`text-xl font-semibold ${totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₹{totalDue.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                        <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                        <p className="text-2xl font-bold mt-2">{orders.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                        <h3 className="text-gray-500 text-sm font-medium">Pending Payments</h3>
                        <p className="text-2xl font-bold mt-2">
                            {orders.filter(o => o.paymentStatus !== "completed").length}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                        <h3 className="text-gray-500 text-sm font-medium">Active Deliveries</h3>
                        <p className="text-2xl font-bold mt-2">
                            {orders.filter(o => ["assigned", "out-for-delivery"].includes(o.status)).length}
                        </p>
                    </div>
                </div>

                {/* Order and Payment Forms */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Order Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">New Order</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Coconut Variety</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    value={selectedCoconut || ""}
                                    onChange={(e) => setSelectedCoconut(e.target.value)}
                                >
                                    <option value="">Select Coconut</option>
                                    {coconuts.map((coco) => (
                                        <option key={coco._id} value={coco._id}>
                                            {coco.variety} ({coco.size}) - ₹{coco.rate}/unit
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedCoconut && getSelectedCoconut()?.imageUrl && (
                                <div className="flex justify-center">
                                    <img
                                        src={getSelectedCoconut().imageUrl}
                                        alt="Selected Coconut"
                                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="razorpay">UPI/Razorpay</option>
                                    <option value="cash">Cash (Pay at Delivery)</option>
                                </select>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading.order}
                                className={`w-full py-2 px-4 rounded-lg transition duration-200 flex justify-center items-center ${
                                    loading.order 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            >
                                {loading.order ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : 'Place Order'}
                            </button>
                        </div>
                    </div>

                    {/* Payment Form - Only show for Razorpay orders */}
                    {(paymentMethod === "razorpay" || orders.some(order => order.paymentMethod === "razorpay" && order.amountDue > 0)) && (
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Make Payment</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Order</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={paymentOrderId}
                                        onChange={(e) => setPaymentOrderId(e.target.value)}
                                        disabled={loading.payment}
                                    >
                                        <option value="">Select Order</option>
                                        {orders
                                            ?.filter((order) => order.amountDue > 0 && order.paymentMethod === "razorpay")
                                            ?.map((order) => {
                                                const coconut = coconuts.find(c => c._id === order.coconutId);
                                                const paidAmount = order.totalPrice - order.amountDue;
                                                return (
                                                    <option key={order._id} value={order._id}>
                                                        Order #{order._id} - {coconut?.variety} (Paid: ₹{paidAmount}/₹{order.totalPrice})
                                                    </option>
                                                );
                                            })}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        disabled={loading.payment}
                                    />
                                </div>

                                <button
                                    onClick={() => handleMakePayment(paymentOrderId, paymentAmount)}
                                    disabled={loading.payment || !paymentOrderId || !paymentAmount}
                                    className={`w-full py-2 px-4 rounded-lg transition duration-200 flex justify-center items-center ${
                                        loading.payment 
                                            ? 'bg-gray-400 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    } ${(!paymentOrderId || !paymentAmount) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading.payment ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : 'Make Payment'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Orders Table */}
                <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">Order History</h2>
                        <button 
                            onClick={fetchOrders}
                            disabled={loading.orders}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {loading.orders ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                    {loading.orders ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => {
                                            const coconut = coconuts.find(c => c._id === order.coconutId);
                                            const paidAmount = order.totalPrice - (order.amountDue || 0);
                                            
                                            return (
                                                <tr key={order._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        #{order._id.slice(-4)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {coconut?.imageUrl && (
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    <img className="h-10 w-10 rounded-full" src={coconut.imageUrl} alt="" />
                                                                </div>
                                                            )}
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{coconut?.variety || "N/A"}</div>
                                                                <div className="text-sm text-gray-500">{coconut?.size || "N/A"}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">Qty: {order.quantity}</div>
                                                        <div className="text-sm text-gray-500">Rate: ₹{coconut?.rate || 0}</div>
                                                        <div className="text-sm font-medium text-gray-900">Total: ₹{order.totalPrice}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            order.status === "delivered" ? "bg-green-100 text-green-800" :
                                                            order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                            "bg-blue-100 text-blue-800"
                                                        }`}>
                                                            {order.status.replace(/-/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mb-1 ${
                                                                order.paymentStatus === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                            }`}>
                                                                {order.paymentStatus === "completed" ? "Paid" : "Pending"}
                                                            </span>
                                                            {paidAmount > 0 && (
                                                                <span className="text-xs text-gray-500">
                                                                    Paid: ₹{paidAmount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {order.amountDue > 0 ? (
                                                            <span className="text-red-600">₹{order.amountDue}</span>
                                                        ) : (
                                                            <span className="text-green-600">₹0</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
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

export default VendorDashboard;

