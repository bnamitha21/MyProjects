import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Checklist from '../models/Checklist.js';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mine-safety-app';

// Role-based safety checklist templates (same as in controller)
const checklistTemplates = {
  worker: [
    { task: 'Put on hard hat, safety boots, and high-visibility vest', category: 'PPE' },
    { task: 'Wear safety glasses and gloves appropriate for task', category: 'PPE' },
    { task: 'Check personal gas detector is functioning', category: 'Equipment' },
    { task: 'Inspect tools and equipment for damage or defects', category: 'Equipment' },
    { task: 'Verify communication device (radio/phone) is working', category: 'Communication' },
    { task: 'Confirm ventilation system is operating in work area', category: 'Environment' },
    { task: 'Inspect immediate work area for hazards', category: 'Environment' },
    { task: 'Verify emergency exit routes are clear', category: 'Safety' },
    { task: 'Review assigned tasks and safety procedures', category: 'Procedures' },
    { task: 'Report any unsafe conditions to supervisor', category: 'Reporting' }
  ],
  supervisor: [
    { task: 'Conduct pre-shift safety briefing with team', category: 'Team Management' },
    { task: 'Verify all workers are wearing proper PPE', category: 'PPE Compliance' },
    { task: 'Review hazard reports from previous shift', category: 'Documentation' },
    { task: 'Inspect critical safety equipment (alarms, lights, signs)', category: 'Equipment' },
    { task: 'Check emergency evacuation routes and assembly points', category: 'Emergency Preparedness' },
    { task: 'Verify ventilation and gas monitoring systems', category: 'Environment' },
    { task: 'Inspect first aid kits and emergency supplies', category: 'Emergency Equipment' },
    { task: 'Review work permits for high-risk activities', category: 'Permits' },
    { task: 'Conduct spot checks on worker safety practices', category: 'Safety Audits' },
    { task: 'Document any safety concerns or near-misses', category: 'Reporting' },
    { task: 'Ensure adequate communication between all team members', category: 'Communication' },
    { task: 'Verify emergency response team availability', category: 'Emergency Preparedness' }
  ],
  admin: [
    { task: 'Review daily safety compliance reports', category: 'Compliance' },
    { task: 'Check emergency response system status and alerts', category: 'Systems' },
    { task: 'Verify safety training records are up to date', category: 'Training' },
    { task: 'Review incident and near-miss reports', category: 'Incidents' },
    { task: 'Update safety documentation and procedures as needed', category: 'Documentation' },
    { task: 'Monitor equipment maintenance schedules', category: 'Maintenance' },
    { task: 'Check safety equipment inventory levels', category: 'Inventory' },
    { task: 'Review and approve safety improvement suggestions', category: 'Improvements' },
    { task: 'Ensure communication systems are operational', category: 'Systems' },
    { task: 'Coordinate with DGMS officers on regulatory matters', category: 'Coordination' }
  ],
  dgms_officer: [
    { task: 'Review overall regulatory compliance status', category: 'Compliance' },
    { task: 'Check incident investigation reports and corrective actions', category: 'Investigations' },
    { task: 'Verify safety audit schedule and completion status', category: 'Audits' },
    { task: 'Review ventilation survey and gas monitoring data', category: 'Environment' },
    { task: 'Check ground control and roof support management', category: 'Geotechnical' },
    { task: 'Inspect mine plans and working drawings', category: 'Documentation' },
    { task: 'Review electrical safety inspections and certifications', category: 'Electrical' },
    { task: 'Verify explosive storage and handling compliance', category: 'Explosives' },
    { task: 'Check statutory registers and records', category: 'Records' },
    { task: 'Review emergency preparedness and rescue arrangements', category: 'Emergency' },
    { task: 'Assess safety training programs effectiveness', category: 'Training' },
    { task: 'Prepare regulatory reports and submissions', category: 'Reporting' }
  ]
};

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`Found ${users.length} users. Creating checklists...`);

    let createdCount = 0;
    let skippedCount = 0;

    // Create checklists only for workers and supervisors
    const eligibleUsers = users.filter(u => ['worker', 'supervisor'].includes(u.role));
    
    if (eligibleUsers.length === 0) {
      console.log('No workers or supervisors found. Skipping checklist creation.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`Found ${eligibleUsers.length} eligible users (workers/supervisors). Creating checklists...`);

    // Create checklists for each eligible user for today and the last 7 days
    for (const user of eligibleUsers) {
      const userRole = user.role || 'worker';
      const template = checklistTemplates[userRole] || checklistTemplates.worker;

      // Create checklist for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingToday = await Checklist.findOne({
        user: user._id,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (!existingToday) {
        await Checklist.create({
          user: user._id,
          role: userRole,
          items: template.map(item => ({
            task: item.task,
            completed: false,
            category: item.category
          })),
          date: today
        });
        createdCount++;
      } else {
        skippedCount++;
      }

      // Create checklists for the last 7 days (for historical data)
      for (let i = 1; i <= 7; i++) {
        const pastDate = new Date(today);
        pastDate.setDate(pastDate.getDate() - i);
        pastDate.setHours(0, 0, 0, 0);

        const existing = await Checklist.findOne({
          user: user._id,
          date: {
            $gte: pastDate,
            $lt: new Date(pastDate.getTime() + 24 * 60 * 60 * 1000)
          }
        });

        if (!existing) {
          // Randomly complete some items for historical data
          const items = template.map(item => ({
            task: item.task,
            completed: Math.random() > 0.3, // 70% completion rate
            completedAt: Math.random() > 0.3 ? new Date(pastDate.getTime() + Math.random() * 8 * 60 * 60 * 1000) : null,
            category: item.category
          }));

          await Checklist.create({
            user: user._id,
            role: userRole,
            items: items,
            date: pastDate
          });
          createdCount++;
        }
      }
    }

    console.log(`\nChecklist seeding completed:`);
    console.log(`- Created: ${createdCount} checklists`);
    console.log(`- Skipped (already exist): ${skippedCount} checklists`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();

