export const normalizeRole = (role = '') => (
  role === 'worker' ? 'employee' : role
);

export const EMPLOYEE_ROLE_FILTER = ['employee', 'worker'];

export const isEmployeeRole = (role = '') => normalizeRole(role) === 'employee';

