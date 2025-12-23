import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const SiteSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Mine Safety Companion',
    siteDescription: 'Safety management system for mining operations',
    contactEmail: 'admin@minesafety.com',
    supportPhone: '+1 (555) 123-4567',
    maintenanceMode: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    alertThreshold: 'medium'
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordExpiry: 90,
    mfaRequired: true,
    sessionTimeout: 30,
    loginAttempts: 5
  });

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? checked : parseInt(value)
    });
  };

  const handleSubmit = (e, settingType) => {
    e.preventDefault();
    // In a real app, this would be an API call to save settings
    toast.success(`${settingType} settings saved successfully`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-white rounded-lg shadow-md mt-12"
    >
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Site Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">General Settings</h2>
          <form onSubmit={(e) => handleSubmit(e, 'General')}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteName">
                Site Name
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={generalSettings.siteName}
                onChange={handleGeneralChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteDescription">
                Site Description
              </label>
              <textarea
                id="siteDescription"
                name="siteDescription"
                value={generalSettings.siteDescription}
                onChange={handleGeneralChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactEmail">
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={generalSettings.contactEmail}
                onChange={handleGeneralChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supportPhone">
                Support Phone
              </label>
              <input
                type="text"
                id="supportPhone"
                name="supportPhone"
                value={generalSettings.supportPhone}
                onChange={handleGeneralChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={generalSettings.maintenanceMode}
                onChange={handleGeneralChange}
                className="mr-2"
              />
              <label className="text-white-700 text-sm font-bold" htmlFor="maintenanceMode">
                Maintenance Mode
              </label>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Save General Settings
            </button>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Notification Settings</h2>
          <form onSubmit={(e) => handleSubmit(e, 'Notification')}>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={handleNotificationChange}
                className="mr-2"
              />
              <label className="text-gray-700 text-sm font-bold" htmlFor="emailNotifications">
                Email Notifications
              </label>
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="pushNotifications"
                name="pushNotifications"
                checked={notificationSettings.pushNotifications}
                onChange={handleNotificationChange}
                className="mr-2"
              />
              <label className="text-gray-700 text-sm font-bold" htmlFor="pushNotifications">
                Push Notifications
              </label>
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="smsNotifications"
                name="smsNotifications"
                checked={notificationSettings.smsNotifications}
                onChange={handleNotificationChange}
                className="mr-2"
              />
              <label className="text-gray-700 text-sm font-bold" htmlFor="smsNotifications">
                SMS Notifications
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="alertThreshold">
                Alert Threshold
              </label>
              <select
                id="alertThreshold"
                name="alertThreshold"
                value={notificationSettings.alertThreshold}
                onChange={handleNotificationChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Save Notification Settings
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-gray-50 p-5 rounded-lg shadow-sm md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Security Settings</h2>
          <form onSubmit={(e) => handleSubmit(e, 'Security')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="passwordExpiry">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  id="passwordExpiry"
                  name="passwordExpiry"
                  value={securitySettings.passwordExpiry}
                  onChange={handleSecurityChange}
                  min="0"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sessionTimeout">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  id="sessionTimeout"
                  name="sessionTimeout"
                  value={securitySettings.sessionTimeout}
                  onChange={handleSecurityChange}
                  min="1"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="loginAttempts">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  id="loginAttempts"
                  name="loginAttempts"
                  value={securitySettings.loginAttempts}
                  onChange={handleSecurityChange}
                  min="1"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="mfaRequired"
                  name="mfaRequired"
                  checked={securitySettings.mfaRequired}
                  onChange={handleSecurityChange}
                  className="mr-2"
                />
                <label className="text-gray-700 text-sm font-bold" htmlFor="mfaRequired">
                  Require Multi-Factor Authentication
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Save Security Settings
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default SiteSettings;