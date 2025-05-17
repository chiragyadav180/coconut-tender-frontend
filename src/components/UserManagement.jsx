import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "vendor",
    location: "",
  });
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("process.env.BASE_URL/admin/users", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      toast.error("Error fetching users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    if (role === "all") setFilteredUsers(users);
    else setFilteredUsers(users.filter((u) => u.role === role));
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`process.env.BASE_URL/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const updated = users.filter((u) => u._id !== userId);
      setUsers(updated);
      setFilteredUsers(selectedRole === "all" ? updated : updated.filter((u) => u.role === selectedRole));
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error("Failed to delete user.");
      console.error(err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.location) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post("process.env.BASE_URL/admin/users", newUser, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const updated = [...users, res.data.user];
      setUsers(updated);
      setFilteredUsers(selectedRole === "all" ? updated : updated.filter((u) => u.role === selectedRole));
      setNewUser({ name: "", email: "", password: "", role: "vendor", location: "" });
      toast.success("User added successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add user.");
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async () => {
    if (!editingUser.name || !editingUser.email || !editingUser.role || !editingUser.location) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await axios.put(
        `process.env.BASE_URL/admin/users/${editingUser._id}`,
        editingUser,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const updated = users.map((u) =>
        u._id === editingUser._id ? res.data.user : u
      );
      setUsers(updated);
      setFilteredUsers(selectedRole === "all" ? updated : updated.filter((u) => u.role === selectedRole));
      setEditingUser(null);
      toast.success("User updated successfully");
    } catch (err) {
      toast.error("Failed to update user.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">User Management</h2>

  \
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8 overflow-hidden">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">Add New User</h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="vendor">Vendor</option>
              <option value="driver">Driver</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              value={newUser.location}
              onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Add User
          </button>
        </form>
      </div>

      
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <label className="text-sm font-medium text-gray-700">Filter by Role:</label>
        <select
          className="w-full sm:w-auto border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedRole}
          onChange={(e) => handleRoleFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="admin">Admin</option>
          <option value="vendor">Vendor</option>
          <option value="driver">Driver</option>
        </select>
      </div>

      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <>
         
          <div className="hidden md:block overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{u._id}</td>
                    <td className="px-4 py-3">
                      {editingUser?._id === u._id ? (
                        <input
                          className="w-full border px-2 py-1 rounded"
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        />
                      ) : (
                        u.name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser?._id === u._id ? (
                        <input
                          className="w-full border px-2 py-1 rounded"
                          value={editingUser.email}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser?._id === u._id ? (
                        <select
                          className="w-full border px-2 py-1 rounded"
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                        >
                          <option value="vendor">Vendor</option>
                          <option value="driver">Driver</option>
                        </select>
                      ) : (
                        u.role
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser?._id === u._id ? (
                        <input
                          className="w-full border px-2 py-1 rounded"
                          value={editingUser.location}
                          onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                        />
                      ) : (
                        u.location
                      )}
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      {editingUser?._id === u._id ? (
                        <>
                          <button
                            onClick={handleUpdateUser}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(u)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

       
          <div className="md:hidden space-y-4">
            {filteredUsers.map((u) => (
              <div key={u._id} className="bg-white rounded-lg shadow-md p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{u.name}</h3>
                      <p className="text-sm text-gray-600">{u.email}</p>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {u.location}
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!filteredUsers.length && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
              No users found.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserManagement;
