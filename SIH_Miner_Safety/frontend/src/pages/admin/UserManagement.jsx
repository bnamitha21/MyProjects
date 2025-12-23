import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../utils/axiosConfig';
import { OPERATION_ROLES } from '../../constants/operationRoles';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString();
};

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    shiftLocation: '',
    shiftDate: '',
  });
  const [roleUpdateUserId, setRoleUpdateUserId] = useState(null);

  // Load real users (employees + supervisors) from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users');
        setUsers(res.data || []);
      } catch (error) {
        console.error('Failed to load users', error);
        toast.error('Failed to load users for shift assignment');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter by search (name or email)
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter((user) => {
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [users, searchTerm]);

  // Pagination
  const usersPerPage = 8;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(startIndex, startIndex + usersPerPage);
  }, [filteredUsers, currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openShiftModal = (user) => {
    setSelectedUser(user);
    setFormData({
      shiftLocation: user.shiftLocation || '',
      shiftDate: formatDateForInput(user.shiftDate),
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const payload = {
        shiftLocation: formData.shiftLocation,
        shiftDate: formData.shiftDate || null,
      };

      const res = await api.put(`/users/${selectedUser._id}/shift`, payload);
      const updatedUser = res.data?.user || selectedUser;

      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );

      toast.success('Shift assignment updated');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update shift assignment', error);
      const message = error.response?.data?.message || 'Failed to update shift assignment';
      toast.error(message);
    }
  };

  const handleOperationRoleChange = async (userId, operationRole) => {
    try {
      setRoleUpdateUserId(userId);
      const res = await api.put(`/users/${userId}/role`, { operationRole });
      const updatedUser = res.data?.user;
      if (updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
        );
      }
      toast.success('Operational role updated');
    } catch (error) {
      console.error('Failed to update operational role', error);
      const message = error.response?.data?.message || 'Failed to update operational role';
      toast.error(message);
    } finally {
      setRoleUpdateUserId(null);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg mt-10"
    >
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 mb-6 shadow-md"
        variants={itemVariants}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Shift Location Assignment</h1>
            <p className="text-blue-100">
              Assign daily working locations/positions for employees and supervisors.
              Only admins can change these details.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="mb-6 bg-white p-4 rounded-xl shadow-md"
        variants={itemVariants}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search employees or supervisors by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <motion.div
          className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md"
          variants={itemVariants}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading users...</p>
        </motion.div>
      ) : filteredUsers.length === 0 ? (
        <motion.div
          className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md"
          variants={itemVariants}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-600 font-medium">No users found</p>
          <p className="text-gray-500 text-sm mt-1">
            Make sure there are registered employees or supervisors.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="bg-white rounded-xl shadow-md overflow-hidden"
          variants={itemVariants}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operational Role
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location / Position
                  </th>
                  <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {paginatedUsers.map((user) => (
                    <motion.tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: -10 }}
                      layout
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 capitalize">
                        {user.role}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {user.role === 'employee' ? (
                          <select
                            value={user.operationRole || OPERATION_ROLES[0].value}
                            onChange={(event) =>
                              handleOperationRoleChange(user._id, event.target.value)
                            }
                            className="border border-gray-300 rounded-lg px-3 py-1 w-full"
                            disabled={roleUpdateUserId === user._id}
                          >
                            {OPERATION_ROLES.map((roleOption) => (
                              <option key={roleOption.value} value={roleOption.value}>
                                {roleOption.value}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {formatDateForDisplay(user.shiftDate)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {user.shiftLocation || '-'}
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-medium">
                        <motion.button
                          onClick={() => openShiftModal(user)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors inline-flex items-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          {user.shiftLocation || user.shiftDate
                            ? 'Update Shift'
                            : 'Assign Shift'}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing{' '}
                <span className="font-medium">
                  {(currentPage - 1) * usersPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * usersPerPage, filteredUsers.length)}
                </span>{' '}
                of <span className="font-medium">{filteredUsers.length}</span> users
              </div>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-300'
                  }`}
                  whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                  whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                >
                  Previous
                </motion.button>
                <motion.button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-300'
                  }`}
                  whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                  whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                >
                  Next
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Assign / Update Shift Modal */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedUser.shiftLocation || selectedUser.shiftDate
                    ? 'Update Shift Assignment'
                    : 'Assign Shift Location'}
                </h2>
                <motion.button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                {selectedUser.name} ({selectedUser.email}) — {selectedUser.role}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="shiftDate"
                  >
                    Shift Date
                  </label>
                  <input
                    type="date"
                    id="shiftDate"
                    name="shiftDate"
                    value={formData.shiftDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="shiftLocation"
                  >
                    Location / Working Position
                  </label>
                  <input
                    type="text"
                    id="shiftLocation"
                    name="shiftLocation"
                    value={formData.shiftLocation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g. Shaft A - Level 3, West Tunnel"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 mt-6">
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Save Shift
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserManagement;
