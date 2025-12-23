import User from '../models/User.js';
import Hazard from '../models/Hazard.js';
import Checklist from '../models/Checklist.js';
import { EMPLOYEE_ROLE_FILTER } from '../utils/roleUtils.js';

// @desc    Get admin dashboard statistics
// @route   GET /api/dashboard/admin
// @access  Private/Admin
export const getAdminDashboardStats = async (req, res) => {
    try {
        // 1. Total Workforce Enrolled (Employees + Supervisors)
        const totalUsers = await User.countDocuments({
            role: { $in: [...EMPLOYEE_ROLE_FILTER, 'supervisor'] }
        });

        // 2. Active Hazards (Open or In Progress)
        const activeHazards = await Hazard.countDocuments({
            status: { $in: ['open', 'in_progress'] }
        });

        // 3. Checklist Completion Rate (Today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const totalChecklistsToday = await Checklist.countDocuments({
            date: { $gte: today, $lt: tomorrow }
        });

        // Assuming we want the percentage of users who have completed their checklist today
        // This is a simplification. A more accurate metric might be "completed items / total items" across all checklists
        // or "users with completed checklists / total active users".
        // Let's stick to "Checklist completion" as a percentage of users who have *started* or *submitted* a checklist vs total users.
        // Or simpler: just the count of checklists submitted today vs total users.

        // Let's calculate a simple "Completion Rate" based on total users.
        // If totalUsers is 0, avoid division by zero.
        const checklistCompletionRate = totalUsers > 0
            ? Math.round((totalChecklistsToday / totalUsers) * 100)
            : 0;

        // 4. Languages Live (Placeholder for now as we don't track this in DB yet, or we can just send a static list)
        // The original code had hardcoded languages. We can keep it static or fetch if we had a way.
        // Let's keep it static for now but send it from backend to be consistent.
        const languages = ['English', 'Hindi', 'Odia', 'Marathi'];

        res.json({
            success: true,
            data: {
                totalUsers,
                activeHazards,
                checklistCompletion: checklistCompletionRate,
                languages
            }
        });

    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard stats'
        });
    }
};
