import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../context/AuthContext";

const CoconutManagement = () => {
  const { user } = useAuth();
  const token = user?.token;

  const [coconuts, setCoconuts] = useState([]);
  const [form, setForm] = useState({
    variety: "",
    size: "",
    rate: "",
    available: true,
  });
  const [editId, setEditId] = useState(null);

  const fetchCoconuts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/coconuts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoconuts(res.data.coconuts);
    } catch (err) {
      toast.error("Failed to fetch coconuts");
    }
  };

  useEffect(() => {
    fetchCoconuts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId
      ? `${import.meta.env.VITE_BASE_URL}/admin/coconuts/${editId}`
      : `${import.meta.env.VITE_BASE_URL}/admin/coconuts`;

    try {
      if (editId) {
        await axios.put(url, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Coconut updated successfully");
      } else {
        await axios.post(url, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Coconut added successfully");
      }
      setForm({ variety: "", size: "", rate: "", availability: true });
      setEditId(null);
      fetchCoconuts();
    } catch (error) {
      toast.error(error.response?.data?.error || "Action failed");
    }
  };

  const handleEdit = (coconut) => {
    setForm({
      variety: coconut.variety ?? "",
      size: coconut.size ?? "",
      rate: coconut.rate?.toString() ?? "",
      available: coconut.available ?? true,
    });
    setEditId(coconut._id);
  };
  

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coconut?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/admin/coconuts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Coconut deleted");
      fetchCoconuts();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const CoconutCard = ({ coconut }) => (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-lg">{coconut.variety}</h3>
          <p className="text-gray-600">Size: {coconut.size}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          coconut.available 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {coconut.available ? 'Available' : 'Not Available'}
        </span>
      </div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold text-green-700">₹{coconut.rate}</span>
      </div>
      <div className="flex space-x-2">
        <button
          className="flex-1 bg-yellow-400 text-white py-2 rounded hover:bg-yellow-500 transition-colors"
          onClick={() => handleEdit(coconut)}
        >
          Edit
        </button>
        <button
          className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
          onClick={() => handleDelete(coconut._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        icon={false}
        closeButton={false}
        hideProgressBar={true}
      />
      <h2 className="text-2xl font-bold mb-6 text-green-700">🥥 Coconut Management</h2>

    
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Variety</label>
            <input
              type="text"
              name="variety"
              placeholder="Enter variety"
              value={form.variety}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Size</label>
            <input
              type="text"
              name="size"
              placeholder="Enter size"
              value={form.size}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Rate (₹)</label>
            <input
              type="number"
              name="rate"
              placeholder="Enter rate"
              value={form.rate}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="text-sm font-medium text-gray-700">Available</label>
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {editId ? "Update Coconut" : "Add Coconut"}
        </button>
      </form>


      <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full table-auto">
          <thead className="bg-green-50 text-left">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-green-800">Variety</th>
              <th className="px-4 py-3 text-sm font-medium text-green-800">Size</th>
              <th className="px-4 py-3 text-sm font-medium text-green-800">Rate (₹)</th>
              <th className="px-4 py-3 text-sm font-medium text-green-800">Available</th>
              <th className="px-4 py-3 text-sm font-medium text-green-800">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {coconuts.map((coconut) => (
              <tr key={coconut._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{coconut.variety}</td>
                <td className="px-4 py-3">{coconut.size}</td>
                <td className="px-4 py-3">{coconut.rate}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    coconut.available 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {coconut.available ? 'Available' : 'Not Available'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition-colors"
                      onClick={() => handleEdit(coconut)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                      onClick={() => handleDelete(coconut._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

   
      <div className="md:hidden grid grid-cols-1 gap-4">
        {coconuts.map((coconut) => (
          <CoconutCard key={coconut._id} coconut={coconut} />
        ))}
      </div>

      {coconuts.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No coconuts found.</p>
        </div>
      )}
    </div>
  );
};

export default CoconutManagement;
