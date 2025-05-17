import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const PaymentManagement = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [amountToPay, setAmountToPay] = useState({});

  const fetchPayments = async () => {
    try {
      const res = await axios.get("process.env.BASE_URL/admin/payments", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPayments(res.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleUpdateStatus = async (paymentId) => {
    const paymentAmount = parseFloat(amountToPay[paymentId]);
    const currentPayment = payments.find(p => p._id === paymentId);

    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (paymentAmount > currentPayment.amountDue) {
      toast.error(`Payment amount cannot exceed due amount (₹${currentPayment.amountDue.toFixed(2)})`);
      return;
    }

    setUpdatingId(paymentId);
    try {
      const newPaidAmount = parseFloat(currentPayment.amountPaid || 0) + paymentAmount;
      const newDueAmount = parseFloat(currentPayment.amountDue || 0) - paymentAmount;
      const newStatus = newDueAmount <= 0.01 ? "completed" : "pending"; 

      const res = await axios.put(
        `process.env.BASE_URL/admin/payments/${paymentId}`,
        { 
          status: newStatus,
          amountPaid: newPaidAmount,
          amountDue: newDueAmount
        },
        { headers: { Authorization: `Bearer ${user.token}` }}
      );
      
      if (res.data.success) {
        toast.success(`Payment of ₹${paymentAmount.toFixed(2)} recorded successfully!`);
        setPayments(payments.map(payment => 
          payment._id === paymentId ? { 
            ...payment, 
            status: newStatus,
            amountPaid: newPaidAmount,
            amountDue: newDueAmount
          } : payment
        ));
        
        setAmountToPay(prev => ({ ...prev, [paymentId]: "" }));
      } else {
        throw new Error(res.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error(error.response?.data?.message || "Failed to update payment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAmountChange = (paymentId, value) => {
    // Ensure the value is a valid number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setAmountToPay(prev => ({
        ...prev,
        [paymentId]: numValue
      }));
    } else if (value === "") {
      setAmountToPay(prev => ({
        ...prev,
        [paymentId]: ""
      }));
    }
  };

  const statusBadge = (status) => {
    const base = "px-2 py-1 text-xs font-semibold rounded-full";
    if (status === "completed") return <span className={`${base} bg-green-100 text-green-700`}>Completed</span>;
    return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
  };

  const methodBadge = (method) => {
    const base = "px-2 py-1 text-xs font-medium rounded-full";
    if (method === "cash") return <span className={`${base} bg-blue-100 text-blue-700`}>Cash</span>;
    return <span className={`${base} bg-purple-100 text-purple-700`}>UPI</span>;
  };

  const PaymentActions = ({ payment }) => (
    payment.paymentMethod === "cash" && payment.status !== "completed" && (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              placeholder="Amount"
              value={amountToPay[payment._id] ?? ""}
              onChange={(e) => handleAmountChange(payment._id, e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm"
              min="0"
              max={payment.amountDue}
              step="0.01"
            />
          </div>
          <button
            onClick={() => handleUpdateStatus(payment._id)}
            disabled={updatingId === payment._id || !amountToPay[payment._id]}
            className={`px-4 py-2 text-sm rounded-md ${
              updatingId === payment._id
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : amountToPay[payment._id]
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {updatingId === payment._id ? "Processing..." : "Record Payment"}
          </button>
        </div>
        {amountToPay[payment._id] > 0 && (
          <p className="text-xs text-gray-500">
            Remaining after payment: ₹{(payment.amountDue - (amountToPay[payment._id] || 0)).toFixed(2)}
          </p>
        )}
      </div>
    )
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        icon={false}
        closeButton={false}
        hideProgressBar={true}
      />
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">💳 Payment Management</h2>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-10 w-10 border-t-4 border-blue-600 border-solid rounded-full"></div>
        </div>
      ) : (
        <>
       
          <div className="hidden md:block overflow-x-auto rounded-lg shadow-lg bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Vendor</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Method</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Total</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Paid</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Due</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Order Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="font-medium">{payment.vendorId?.name || "N/A"}</div>
                      <div className="text-sm text-gray-500">{payment.vendorId?.email || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">{methodBadge(payment.paymentMethod)}</td>
                    <td className="px-6 py-4 text-right font-medium">
                      ₹{(parseFloat(payment.amountPaid || 0) + parseFloat(payment.amountDue || 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-green-700 font-medium">
                      ₹{payment.amountPaid?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 text-right text-red-600 font-medium">
                      ₹{payment.amountDue?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4">{statusBadge(payment.status)}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(payment.orderId?.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <PaymentActions payment={payment} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <div className="md:hidden space-y-4">
            {payments.map((payment) => (
              <div key={payment._id} className="bg-white rounded-lg shadow-md p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{payment.vendorId?.name || "N/A"}</h3>
                      <p className="text-sm text-gray-600">{payment.vendorId?.email || "N/A"}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {methodBadge(payment.paymentMethod)}
                      {statusBadge(payment.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-medium">₹{(parseFloat(payment.amountPaid || 0) + parseFloat(payment.amountDue || 0)).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Paid</p>
                      <p className="font-medium text-green-700">₹{payment.amountPaid?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Due</p>
                      <p className="font-medium text-red-600">₹{payment.amountDue?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Order Date: {new Date(payment.orderId?.createdAt).toLocaleDateString()}
                  </div>

                  {payment.paymentMethod === "cash" && payment.status !== "completed" && (
                    <div className="pt-3 border-t border-gray-100">
                      <PaymentActions payment={payment} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!payments.length && (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No payment records found.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentManagement;