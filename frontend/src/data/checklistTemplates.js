// Fallback checklist templates for frontend use when backend is unavailable
// These match the backend templates to ensure consistency

export const checklistTemplates = {
  employee: [
    { task: 'Put on hard hat, safety boots, and high-visibility vest', category: 'PPE', type: 'routine', pointsAwarded: 5, isChallenge: false },
    { task: 'Wear safety glasses and gloves appropriate for task', category: 'PPE', type: 'routine', pointsAwarded: 5, isChallenge: false },
    { task: 'Check personal gas detector is functioning', category: 'Equipment', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Inspect tools and equipment for damage or defects', category: 'Equipment', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Verify communication device (radio/phone) is working', category: 'Communication', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Confirm ventilation system is operating in work area', category: 'Environment', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Inspect immediate work area for hazards', category: 'Environment', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Verify emergency exit routes are clear', category: 'Safety', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Review assigned tasks and safety procedures', category: 'Procedures', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Report any unsafe conditions to supervisor', category: 'Reporting', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { 
      task: 'Safety Challenge: Identify 3 potential fall hazards in your current work zone.', 
      category: 'Safety Challenge', 
      type: 'challenge', 
      pointsAwarded: 50, 
      isChallenge: true, 
      associatedContent: { type: 'video', url: 'https://www.youtube.com/watch?v=your_fall_hazard_video_id' } 
    },
    { 
      task: 'Incident Review: Briefly summarize a recent incident from the library and identify one preventative measure.', 
      category: 'Incident Learning', 
      type: 'review', 
      pointsAwarded: 75, 
      isChallenge: true, 
      associatedContent: { type: 'caseStudy', id: 'your_case_study_id_here' } 
    },
    { task: 'Team Safety Huddle: Discuss a safety topic with a colleague and submit a brief note.', category: 'Communication', type: 'challenge', pointsAwarded: 40, isChallenge: true },
  ],
  supervisor: [
    { task: 'Conduct pre-shift safety briefing with team', category: 'Team Management', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Verify all employees are wearing proper PPE', category: 'PPE Compliance', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Review hazard reports from previous shift', category: 'Documentation', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Inspect critical safety equipment (alarms, lights, signs)', category: 'Equipment', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { task: 'Check emergency evacuation routes and assembly points', category: 'Emergency Preparedness', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Verify ventilation and gas monitoring systems', category: 'Environment', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Inspect first aid kits and emergency supplies', category: 'Emergency Equipment', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Review work permits for high-risk activities', category: 'Permits', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Conduct spot checks on employee safety practices', category: 'Safety Audits', type: 'routine', pointsAwarded: 30, isChallenge: false },
    { task: 'Document any safety concerns or near-misses', category: 'Reporting', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Ensure adequate communication between all team members', category: 'Communication', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Verify emergency response team availability', category: 'Emergency Preparedness', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { 
      task: 'Supervisor Challenge: Lead a discussion on a new safety procedure and collect team feedback.', 
      category: 'Team Leadership', 
      type: 'challenge', 
      pointsAwarded: 100, 
      isChallenge: true, 
      associatedContent: { type: 'document', url: 'https://www.example.com/new_safety_procedure.pdf' } 
    },
  ],
  admin: [
    { task: 'Review daily safety compliance reports', category: 'Compliance', type: 'routine', pointsAwarded: 30, isChallenge: false },
    { task: 'Check emergency response system status and alerts', category: 'Systems', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Verify safety training records are up to date', category: 'Training', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { task: 'Review incident and near-miss reports', category: 'Incidents', type: 'routine', pointsAwarded: 30, isChallenge: false },
    { task: 'Update safety documentation and procedures as needed', category: 'Documentation', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Monitor equipment maintenance schedules', category: 'Maintenance', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Check safety equipment inventory levels', category: 'Inventory', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Review and approve safety improvement suggestions', category: 'Improvements', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Ensure communication systems are operational', category: 'Systems', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Coordinate with DGMS officers on regulatory matters', category: 'Coordination', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { 
      task: 'Admin Challenge: Conduct a drill simulating a major incident and evaluate response protocols.', 
      category: 'Emergency Preparedness', 
      type: 'challenge', 
      pointsAwarded: 150, 
      isChallenge: true 
    },
  ],
  dgms_officer: [
    { task: 'Review overall regulatory compliance status', category: 'Compliance', type: 'routine', pointsAwarded: 40, isChallenge: false },
    { task: 'Check incident investigation reports and corrective actions', category: 'Investigations', type: 'routine', pointsAwarded: 35, isChallenge: false },
    { task: 'Verify safety audit schedule and completion status', category: 'Audits', type: 'routine', pointsAwarded: 30, isChallenge: false },
    { task: 'Review ventilation survey and gas monitoring data', category: 'Environment', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { task: 'Check ground control and roof support management', category: 'Geotechnical', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Inspect mine plans and working drawings', category: 'Documentation', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Review electrical safety inspections and certifications', category: 'Electrical', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Verify explosive storage and handling compliance', category: 'Explosives', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { task: 'Check statutory registers and records', category: 'Records', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Review emergency preparedness and rescue arrangements', category: 'Emergency', type: 'routine', pointsAwarded: 30, isChallenge: false },
    { task: 'Assess safety training programs effectiveness', category: 'Training', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Prepare regulatory reports and submissions', category: 'Reporting', type: 'routine', pointsAwarded: 35, isChallenge: false },
    { 
      task: 'DGMS Challenge: Propose a new regulatory amendment based on recent industry best practices.', 
      category: 'Policy', 
      type: 'challenge', 
      pointsAwarded: 200, 
      isChallenge: true 
    },
  ],
  Blaster: [
    { task: 'Inspect blast area for unauthorized personnel and equipment', category: 'Pre-Blast', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Verify all warning signals are functional and activated', category: 'Pre-Blast', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Check detonation cord and blasting caps for integrity', category: 'Equipment', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { task: 'Safety Challenge: Demonstrate proper handling and storage of explosives by listing 3 key rules.', category: 'Explosives Handling', type: 'challenge', pointsAwarded: 75, isChallenge: true, associatedContent: { type: 'document', url: 'https://www.example.com/explosive_safety_manual.pdf' } },
    { task: 'Confirm boreholes are clear and dry before charging', category: 'Charging', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Ensure correct amount and type of explosive is used per design', category: 'Charging', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Incident Review: Analyze a past blasting incident and identify what could have been done differently.', category: 'Incident Learning', type: 'review', pointsAwarded: 100, isChallenge: true, associatedContent: { type: 'caseStudy', id: 'your_blasting_case_study_id_here' } },
  ],
  Driller: [
    { task: 'Perform pre-operational check on drill rig (hoses, fluid levels, controls)', category: 'Equipment', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Verify drill bits and rods are in good condition', category: 'Equipment', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Inspect drilling area for ground stability and potential hazards', category: 'Site Inspection', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Safety Challenge: Identify 3 risks associated with operating heavy drilling machinery in confined spaces.', category: 'Safety Challenge', type: 'challenge', pointsAwarded: 60, isChallenge: true, associatedContent: { type: 'video', url: 'https://www.youtube.com/watch?v=drilling_safety_video_id' } },
    { task: 'Ensure proper ventilation is maintained during drilling operations', category: 'Environment', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Confirm emergency stop buttons are accessible and functional', category: 'Safety', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Record drilling parameters and observations accurately', category: 'Reporting', type: 'routine', pointsAwarded: 5, isChallenge: false },
  ],
  Electrician: [
    { task: 'Inspect all electrical panels and connections for damage', category: 'Equipment', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Verify lockout/tagout procedures are in place before maintenance', category: 'Procedures', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { task: 'Check grounding systems and RCDs for proper function', category: 'Equipment', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Safety Challenge: Explain the importance of arc flash protection and identify relevant PPE.', category: 'Electrical Safety', type: 'challenge', pointsAwarded: 80, isChallenge: true, associatedContent: { type: 'document', url: 'https://www.example.com/arc_flash_guide.pdf' } },
    { task: 'Confirm all portable electrical equipment is tested and tagged', category: 'Equipment', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Ensure emergency power systems are operational and tested', category: 'Systems', type: 'routine', pointsAwarded: 30, isChallenge: false },
    { task: 'Report any electrical faults or malfunctions immediately', category: 'Reporting', type: 'routine', pointsAwarded: 10, isChallenge: false },
  ],
};

/**
 * Get fallback checklist data for a user role
 * @param {string} role - User role (employee, supervisor, admin, dgms_officer)
 * @returns {Object} Checklist object with items
 */
export const getFallbackChecklist = (role = 'employee', operationRole = null) => {
  console.log('getFallbackChecklist - Using operationRole:', operationRole);
  const templateKey = operationRole && checklistTemplates[operationRole] ? operationRole : role;
  const template = checklistTemplates[templateKey] || checklistTemplates.employee;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completionBonus = 100; // Example bonus for completing a daily checklist

  return {
    _id: 'fallback-checklist',
    user: null,
    role: role,
    operationRole: operationRole, // Include operationRole in fallback
    date: today,
    type: 'daily',
    completionBonus: completionBonus,
    items: template.map((item, index) => ({
      _id: `fallback-item-${index}`,
      task: item.task,
      category: item.category,
      completed: false,
      completedAt: null,
      type: item.type || 'routine',
      pointsAwarded: item.pointsAwarded || 0,
      isChallenge: item.isChallenge || false,
      associatedContent: item.associatedContent || null
    })),
    createdAt: today,
    updatedAt: today
  };
};

