import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockLogs = [
      { id: 1, user: 'admin@example.com', action: 'User Login', details: 'Admin user logged in', timestamp: '2023-10-15 09:23:45', type: 'auth' },
      { id: 2, user: 'john@example.com', action: 'Profile Update', details: 'User updated profile information', timestamp: '2023-10-15 10:15:22', type: 'user' },
      { id: 3, user: 'system', action: 'Backup Created', details: 'Automatic system backup completed', timestamp: '2023-10-15 12:00:00', type: 'system' },
      { id: 4, user: 'jane@example.com', action: 'Hazard Report', details: 'New hazard reported in Section B', timestamp: '2023-10-14 15:30:12', type: 'safety' },
      { id: 5, user: 'mike@example.com', action: 'User Login', details: 'Failed login attempt (3rd attempt)', timestamp: '2023-10-14 16:45:33', type: 'auth' },
      { id: 6, user: 'admin@example.com', action: 'User Created', details: 'Created new user account for sarah@example.com', timestamp: '2023-10-14 17:12:05', type: 'user' },
      { id: 7, user: 'system', action: 'Alert Triggered', details: 'High methane levels detected in Section C', timestamp: '2023-10-13 08:23:45', type: 'safety' },
      { id: 8, user: 'robert@example.com', action: 'Document Access', details: 'Accessed confidential safety protocols', timestamp: '2023-10-13 11:42:18', type: 'security' },
      { id: 9, user: 'admin@example.com', action: 'Settings Changed', details: 'Updated system notification settings', timestamp: '2023-10-12 14:05:29', type: 'system' },
      { id: 10, user: 'john@example.com', action: 'User Logout', details: 'User logged out', timestamp: '2023-10-12 17:30:00', type: 'auth' },
    ];
    
    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 800);
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.type === filter;
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionBadgeClass = (type) => {
    switch (type) {
      case 'auth':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-purple-100 text-purple-800';
      case 'safety':
        return 'bg-red-100 text-red-800';
      case 'security':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-white rounded-lg shadow-md mt-12"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
        <div className="flex space-x-4">
          <div>
            <select
              value={filter}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="auth">Authentication</option>
              <option value="user">User Actions</option>
              <option value="system">System</option>
              <option value="safety">Safety</option>
              <option value="security">Security</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Timestamp</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">User</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Action</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Details</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-500">{log.timestamp}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">{log.user}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{log.action}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{log.details}</td>
                  <td className="py-4 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getActionBadgeClass(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No logs found matching your criteria
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-black">
            Export Logs
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-black">
            Clear Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AuditLogs;