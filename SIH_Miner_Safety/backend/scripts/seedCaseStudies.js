import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CaseStudy from '../models/CaseStudy.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mine-safety-app';

const baseCases = [
  {
    title: 'Conveyor entanglement near loading bay',
    sourceType: 'INTERNAL',
    date: new Date('2024-01-12'),
    location: 'Surface conveyor, North loading bay',
    mineSection: 'Conveyor line – loading bay',
    severity: 'major',
    tags: ['conveyor', 'entanglement', 'lockout'],
    hazardTags: ['conveyor', 'unguarded'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Worker’s shawl caught in unguarded conveyor during cleaning. Always isolate power before cleaning.',
    supervisorSummary: 'Cleaning attempted while belt running and guards removed.',
    rootCauses: [
      { type: 'technical', description: 'Return roller guard removed for maintenance.' },
      { type: 'human', description: 'Lockout-tagout skipped before cleaning.' },
    ],
    preventiveChecklist: [
      { text: 'Confirm conveyor isolation before cleaning.', role: 'worker' },
      { text: 'Inspect guards and pull-cords each shift.', role: 'supervisor' },
    ],
    quiz: [
      {
        question: 'What must you do before cleaning a conveyor?',
        options: ['Speed up belt', 'Lockout and test zero energy', 'Ask coworker to hold belt', 'Only press e-stop'],
        correctOption: 1,
        explanation: 'Lockout-tagout and zero energy verification are mandatory.',
      },
    ],
    status: 'published',
  },
  {
    title: 'Roof fall in development heading',
    sourceType: 'DGMS',
    date: new Date('2023-11-05'),
    location: 'UG development panel, East section',
    mineSection: 'Development heading',
    severity: 'fatal',
    tags: ['roof-fall', 'support'],
    hazardTags: ['roof-fall', 'support-delay'],
    relevanceRoles: ['worker', 'supervisor', 'dgms_officer'],
    quickSummary: 'Loader operator hit by roof fall because supports lagged after blasting.',
    supervisorSummary: 'Support installation lagged beyond plan and sounding skipped.',
    rootCauses: [
      { type: 'technical', description: 'Unsupported span in weak shale.' },
      { type: 'organizational', description: 'Support plan allowed excessive bolting lag.' },
    ],
    preventiveChecklist: [
      { text: 'Record sounding readings before re-entry.', role: 'supervisor' },
      { text: 'Never work under unsupported roof.', role: 'worker' },
    ],
    quiz: [
      {
        question: 'When can crews enter after blasting?',
        options: ['When fumes clear', 'After supervisor says OK', 'Only after sounding and support per plan', 'Anytime if cautious'],
        correctOption: 2,
        explanation: 'Sounding plus support must be completed before re-entry.',
      },
    ],
    status: 'published',
  },
];

const caseTemplates = [
  {
    title: 'Continuous miner roof fall exposure',
    sourceType: 'DGMS',
    location: 'Panel 3, Seam XV',
    mineSection: 'Development heading',
    severity: 'major',
    tags: ['roof-fall', 'support'],
    hazardTags: ['roof-fall', 'support-lag'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Roof collapsed because bolting lagged two cuts behind.',
    supervisorSummary: 'Miner advanced without supplementary supports; sounding logs missing.',
  },
  {
    title: 'Conveyor drive fire near bunker',
    sourceType: 'INTERNAL',
    location: 'Surface conveyor line A',
    mineSection: 'Drive head',
    severity: 'major',
    tags: ['fire', 'conveyor'],
    hazardTags: ['fire', 'electrical'],
    relevanceRoles: ['worker', 'supervisor', 'admin'],
    quickSummary: 'Hot bearing ignited spillage when firefighting system was isolated.',
    supervisorSummary: 'Lubrication skipped and alarm acknowledged remotely without inspection.',
  },
  {
    title: 'Haul road berm failure',
    sourceType: 'INTERNAL',
    location: 'OB dump haul road, Sector C',
    mineSection: 'Dump edge',
    severity: 'major',
    tags: ['haulage', 'berm'],
    hazardTags: ['haulage', 'berm'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Truck toppled because berm height was below half tyre height.',
    supervisorSummary: 'Dozer removed berm to widen road and spotter absent.',
  },
  {
    title: 'Methane ignition in development face',
    sourceType: 'DGMS',
    location: 'Panel 7, gassy seam',
    mineSection: 'Development face',
    severity: 'fatal',
    tags: ['gas', 'ignition'],
    hazardTags: ['gas', 'ignition'],
    relevanceRoles: ['worker', 'supervisor', 'dgms_officer'],
    quickSummary: 'Methane accumulated when auxiliary fan stopped and ignited during bolting.',
    supervisorSummary: 'Fan stopped for cable change without permit; no gas test before restart.',
  },
  {
    title: 'Drill jumbo entanglement incident',
    sourceType: 'INTERNAL',
    location: 'Decline drive',
    mineSection: 'Face area',
    severity: 'minor',
    tags: ['drilling', 'entanglement'],
    hazardTags: ['equipment'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Helper\'s glove caught in rotating drill steel while clearing cuttings.',
    supervisorSummary: 'Interlock bypassed after jam; helper used hands instead of tools.',
  },
  {
    title: 'Hoist overspeed near skip loading',
    sourceType: 'INTERNAL',
    location: 'Main shaft',
    mineSection: 'Hoisting',
    severity: 'major',
    tags: ['hoist', 'overspeed'],
    hazardTags: ['hoist', 'control-system'],
    relevanceRoles: ['worker', 'supervisor', 'dgms_officer'],
    quickSummary: 'Hoist oversped past landing due to faulty encoder.',
    supervisorSummary: 'Encoder warning ignored and overspeed device overdue for overhaul.',
  },
  {
    title: 'Electrical panel arc flash during maintenance',
    sourceType: 'DGMS',
    location: 'Surface substation, Switchyard B',
    mineSection: 'Electrical distribution',
    severity: 'major',
    tags: ['electrical', 'arc-flash'],
    hazardTags: ['electrical', 'arc-flash'],
    relevanceRoles: ['worker', 'supervisor', 'admin'],
    quickSummary: 'Arc flash occurred when breaker was opened without proper PPE and isolation.',
    supervisorSummary: 'Work permit not issued; voltage testing skipped before maintenance.',
  },
  {
    title: 'Slip and fall on wet decline ramp',
    sourceType: 'INTERNAL',
    location: 'Decline access ramp, Level 2',
    mineSection: 'Access way',
    severity: 'minor',
    tags: ['slip-fall', 'housekeeping'],
    hazardTags: ['slip-fall', 'housekeeping'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Worker slipped on accumulated water and mud, resulting in leg injury.',
    supervisorSummary: 'Drainage blocked; no warning signs posted in wet area.',
  },
  {
    title: 'Blasting misfire in development heading',
    sourceType: 'DGMS',
    location: 'Panel 5, Development face',
    mineSection: 'Blasting zone',
    severity: 'fatal',
    tags: ['blasting', 'misfire'],
    hazardTags: ['blasting', 'misfire'],
    relevanceRoles: ['worker', 'supervisor', 'dgms_officer'],
    quickSummary: 'Misfired charge detonated during re-entry, causing fatal injuries.',
    supervisorSummary: 'Re-entry protocol violated; misfire not properly marked and reported.',
  },
  {
    title: 'Dump truck collision at loading point',
    sourceType: 'INTERNAL',
    location: 'Loading bay, Pit 2',
    mineSection: 'Surface operations',
    severity: 'major',
    tags: ['vehicle', 'collision'],
    hazardTags: ['vehicle', 'collision'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Dump truck reversed into loader due to blind spot and lack of spotter.',
    supervisorSummary: 'Backup alarm not working; spotter not assigned to loading area.',
  },
  {
    title: 'Confined space asphyxiation in sump',
    sourceType: 'DGMS',
    location: 'Underground sump, Level 3',
    mineSection: 'Water management',
    severity: 'fatal',
    tags: ['confined-space', 'asphyxiation'],
    hazardTags: ['confined-space', 'gas'],
    relevanceRoles: ['worker', 'supervisor', 'dgms_officer'],
    quickSummary: 'Worker entered sump without gas testing and ventilation, lost consciousness.',
    supervisorSummary: 'Confined space permit not obtained; atmospheric testing skipped.',
  },
  {
    title: 'Chemical exposure during reagent mixing',
    sourceType: 'INTERNAL',
    location: 'Processing plant, Reagent area',
    mineSection: 'Processing',
    severity: 'major',
    tags: ['chemical', 'exposure'],
    hazardTags: ['chemical', 'exposure'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Worker exposed to toxic fumes when mixing reagents without proper ventilation.',
    supervisorSummary: 'Ventilation system not operational; PPE not worn during mixing.',
  },
  {
    title: 'Noise-induced hearing loss from drill operation',
    sourceType: 'INTERNAL',
    location: 'Development face, Panel 4',
    mineSection: 'Drilling operations',
    severity: 'minor',
    tags: ['noise', 'hearing'],
    hazardTags: ['noise', 'hearing'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Worker developed hearing loss after prolonged exposure to high noise levels.',
    supervisorSummary: 'Hearing protection not enforced; noise monitoring not conducted regularly.',
  },
  {
    title: 'Heat stress collapse in deep level',
    sourceType: 'INTERNAL',
    location: 'Deep level, Panel 8',
    mineSection: 'Deep mining',
    severity: 'major',
    tags: ['heat-stress', 'environmental'],
    hazardTags: ['heat-stress', 'environmental'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Worker collapsed due to heat exhaustion in poorly ventilated deep level.',
    supervisorSummary: 'Cooling system inadequate; rest breaks not scheduled properly.',
  },
  {
    title: 'Water inrush in development heading',
    sourceType: 'DGMS',
    location: 'Development heading, Seam XII',
    mineSection: 'Development',
    severity: 'fatal',
    tags: ['water-inrush', 'flooding'],
    hazardTags: ['water-inrush', 'flooding'],
    relevanceRoles: ['worker', 'supervisor', 'dgms_officer'],
    quickSummary: 'Water inrush flooded heading, trapping workers due to inadequate escape routes.',
    supervisorSummary: 'Probe drilling not performed; water warning signs ignored.',
  },
  {
    title: 'Communication failure during emergency evacuation',
    sourceType: 'INTERNAL',
    location: 'Underground, Multiple levels',
    mineSection: 'Emergency systems',
    severity: 'near_miss',
    tags: ['communication', 'evacuation'],
    hazardTags: ['communication', 'evacuation'],
    relevanceRoles: ['worker', 'supervisor', 'admin'],
    quickSummary: 'Emergency evacuation delayed due to radio communication failure.',
    supervisorSummary: 'Backup communication system not tested; evacuation drill overdue.',
  },
  {
    title: 'Crusher jam injury during clearing',
    sourceType: 'INTERNAL',
    location: 'Primary crusher, Processing plant',
    mineSection: 'Crushing operations',
    severity: 'major',
    tags: ['crushing', 'entanglement'],
    hazardTags: ['equipment', 'entanglement'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Worker injured while manually clearing jam without lockout-tagout.',
    supervisorSummary: 'Lockout procedure not followed; crusher not isolated before clearing.',
  },
  {
    title: 'Dust explosion in coal handling plant',
    sourceType: 'DGMS',
    location: 'Coal handling plant, Transfer point',
    mineSection: 'Coal processing',
    severity: 'fatal',
    tags: ['dust-explosion', 'fire'],
    hazardTags: ['dust-explosion', 'fire'],
    relevanceRoles: ['worker', 'supervisor', 'dgms_officer'],
    quickSummary: 'Coal dust explosion occurred due to ignition source and inadequate dust control.',
    supervisorSummary: 'Dust suppression system not maintained; hot work permit not obtained.',
  },
  {
    title: 'Scaffold collapse during shaft maintenance',
    sourceType: 'INTERNAL',
    location: 'Main shaft, Surface level',
    mineSection: 'Shaft maintenance',
    severity: 'major',
    tags: ['scaffold', 'fall'],
    hazardTags: ['scaffold', 'fall'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Scaffold collapsed during shaft inspection, causing multiple injuries.',
    supervisorSummary: 'Scaffold not inspected before use; load capacity exceeded.',
  },
  {
    title: 'Battery charging fire in workshop',
    sourceType: 'INTERNAL',
    location: 'Workshop, Battery charging bay',
    mineSection: 'Maintenance',
    severity: 'major',
    tags: ['fire', 'battery'],
    hazardTags: ['fire', 'electrical'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Battery charging fire started due to overcharging and inadequate ventilation.',
    supervisorSummary: 'Charging equipment not maintained; fire suppression system not functional.',
  },
  {
    title: 'Rock burst in high stress zone',
    sourceType: 'DGMS',
    location: 'Deep level, High stress panel',
    mineSection: 'Deep mining',
    severity: 'fatal',
    tags: ['rock-burst', 'ground-control'],
    hazardTags: ['rock-burst', 'ground-control'],
    relevanceRoles: ['worker', 'supervisor', 'dgms_officer'],
    quickSummary: 'Rock burst occurred in high stress zone, causing fatal injuries.',
    supervisorSummary: 'Stress monitoring not conducted; support design inadequate for stress level.',
  },
  {
    title: 'Cable reel entanglement during transport',
    sourceType: 'INTERNAL',
    location: 'Underground transport, Level 1',
    mineSection: 'Material handling',
    severity: 'minor',
    tags: ['entanglement', 'material-handling'],
    hazardTags: ['entanglement', 'material-handling'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Worker\'s clothing caught in unsecured cable reel during transport.',
    supervisorSummary: 'Cable reel not properly secured; transport procedure not followed.',
  },
  {
    title: 'Ventilation fan failure in gassy seam',
    sourceType: 'DGMS',
    location: 'Gassy seam, Panel 6',
    mineSection: 'Ventilation',
    severity: 'fatal',
    tags: ['ventilation', 'gas'],
    hazardTags: ['ventilation', 'gas'],
    relevanceRoles: ['worker', 'supervisor', 'dgms_officer'],
    quickSummary: 'Ventilation fan failure led to methane accumulation and ignition.',
    supervisorSummary: 'Fan monitoring system not operational; backup fan not tested.',
  },
  {
    title: 'Ladder fall from elevated platform',
    sourceType: 'INTERNAL',
    location: 'Processing plant, Elevated platform',
    mineSection: 'Maintenance',
    severity: 'major',
    tags: ['fall', 'ladder'],
    hazardTags: ['fall', 'ladder'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Worker fell from ladder while accessing elevated platform without fall protection.',
    supervisorSummary: 'Ladder not secured; fall protection not provided or used.',
  },
  {
    title: 'Overhead crane load drop',
    sourceType: 'INTERNAL',
    location: 'Workshop, Crane bay',
    mineSection: 'Material handling',
    severity: 'major',
    tags: ['crane', 'load-drop'],
    hazardTags: ['crane', 'load-drop'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Overhead crane dropped load due to sling failure and overload.',
    supervisorSummary: 'Sling inspection not conducted; load exceeded crane capacity.',
  },
  {
    title: 'Underground fire in equipment bay',
    sourceType: 'DGMS',
    location: 'Equipment bay, Level 2',
    mineSection: 'Equipment storage',
    severity: 'fatal',
    tags: ['fire', 'underground'],
    hazardTags: ['fire', 'underground'],
    relevanceRoles: ['worker', 'supervisor', 'dgms_officer'],
    quickSummary: 'Fire started in equipment bay, spreading due to inadequate fire suppression.',
    supervisorSummary: 'Fire suppression system not maintained; flammable materials stored improperly.',
  },
  {
    title: 'Ground support failure in crosscut',
    sourceType: 'INTERNAL',
    location: 'Crosscut, Panel 2',
    mineSection: 'Development',
    severity: 'major',
    tags: ['ground-support', 'roof-fall'],
    hazardTags: ['ground-support', 'roof-fall'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Ground support failed in crosscut, causing partial roof collapse.',
    supervisorSummary: 'Support installation not verified; ground conditions not assessed properly.',
  },
  {
    title: 'Chemical spill during transport',
    sourceType: 'INTERNAL',
    location: 'Surface transport, Reagent delivery',
    mineSection: 'Material transport',
    severity: 'minor',
    tags: ['chemical-spill', 'transport'],
    hazardTags: ['chemical', 'spill'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Chemical reagent spilled during transport, causing environmental contamination.',
    supervisorSummary: 'Container not properly secured; spill response kit not available.',
  },
  {
    title: 'Equipment rollover on steep grade',
    sourceType: 'INTERNAL',
    location: 'Haul road, Steep grade section',
    mineSection: 'Haulage',
    severity: 'major',
    tags: ['rollover', 'haulage'],
    hazardTags: ['rollover', 'haulage'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Haul truck rolled over on steep grade due to excessive speed and load shift.',
    supervisorSummary: 'Speed limit not enforced; load not properly secured before transport.',
  },
  {
    title: 'Electrical shock from damaged cable',
    sourceType: 'INTERNAL',
    location: 'Development face, Electrical distribution',
    mineSection: 'Electrical',
    severity: 'major',
    tags: ['electrical', 'shock'],
    hazardTags: ['electrical', 'shock'],
    relevanceRoles: ['worker', 'supervisor'],
    quickSummary: 'Worker received electrical shock from damaged cable during equipment operation.',
    supervisorSummary: 'Cable inspection not conducted; damaged cable not reported or replaced.',
  },
  {
    title: 'Blasting flyrock incident',
    sourceType: 'DGMS',
    location: 'Open pit, Blasting zone',
    mineSection: 'Blasting',
    severity: 'fatal',
    tags: ['blasting', 'flyrock'],
    hazardTags: ['blasting', 'flyrock'],
    relevanceRoles: ['worker', 'supervisor', 'dgms_officer'],
    quickSummary: 'Flyrock from blasting struck worker outside exclusion zone.',
    supervisorSummary: 'Exclusion zone not properly marked; workers not cleared from area.',
  },
];

const buildGeneratedCases = () => Array.from({ length: 60 }, (_, idx) => {
  const template = caseTemplates[idx % caseTemplates.length];
  const caseNumber = idx + 1;
  
  // Generate more specific root causes based on template type
  const getRootCauses = (template) => {
    if (template.tags.includes('roof-fall') || template.tags.includes('ground-support')) {
      return [
        { type: 'technical', description: 'Ground conditions not properly assessed before work.' },
        { type: 'organizational', description: 'Support installation lagged behind mining advance.' },
        { type: 'human', description: 'Sounding and inspection procedures not followed.' },
      ];
    }
    if (template.tags.includes('gas') || template.tags.includes('ventilation')) {
      return [
        { type: 'technical', description: 'Ventilation system failure or inadequacy.' },
        { type: 'human', description: 'Gas testing not performed before entry or work.' },
        { type: 'organizational', description: 'Emergency response procedures not established.' },
      ];
    }
    if (template.tags.includes('fire') || template.tags.includes('explosion')) {
      return [
        { type: 'technical', description: 'Fire suppression system not operational or adequate.' },
        { type: 'human', description: 'Ignition sources not controlled or eliminated.' },
        { type: 'environmental', description: 'Flammable materials not properly stored or handled.' },
      ];
    }
    if (template.tags.includes('electrical')) {
      return [
        { type: 'technical', description: 'Electrical equipment not properly maintained or isolated.' },
        { type: 'human', description: 'Lockout-tagout procedures not followed.' },
        { type: 'organizational', description: 'Electrical safety training inadequate.' },
      ];
    }
    if (template.tags.includes('blasting')) {
      return [
        { type: 'human', description: 'Blasting procedures and safety protocols not followed.' },
        { type: 'organizational', description: 'Exclusion zones not properly established or enforced.' },
        { type: 'technical', description: 'Blasting equipment or materials not properly maintained.' },
      ];
    }
    if (template.tags.includes('haulage') || template.tags.includes('vehicle')) {
      return [
        { type: 'human', description: 'Vehicle operation procedures not followed.' },
        { type: 'technical', description: 'Vehicle maintenance or inspection inadequate.' },
        { type: 'organizational', description: 'Traffic management and communication systems inadequate.' },
      ];
    }
    // Default root causes
    return [
      { type: 'human', description: 'Safety procedures not followed precisely.' },
      { type: 'technical', description: 'Equipment or system failure or inadequacy.' },
      { type: 'organizational', description: 'Safety controls and oversight inadequate.' },
    ];
  };

  // Generate specific preventive checklist based on template
  const getPreventiveChecklist = (template) => {
    const baseChecklist = [
      { text: 'Review hazard briefing and safety procedures before shift.', role: 'worker' },
      { text: 'Verify all safety controls are in place before starting work.', role: 'supervisor' },
    ];
    
    if (template.tags.includes('roof-fall') || template.tags.includes('ground-support')) {
      return [
        { text: 'Perform roof sounding before entering work area.', role: 'worker' },
        { text: 'Verify ground support is installed per plan before advance.', role: 'supervisor' },
        { text: 'Never work under unsupported roof or ground.', role: 'worker' },
      ];
    }
    if (template.tags.includes('gas') || template.tags.includes('ventilation')) {
      return [
        { text: 'Test for gas before entering or starting work in area.', role: 'worker' },
        { text: 'Verify ventilation system is operational before shift.', role: 'supervisor' },
        { text: 'Report any ventilation issues immediately.', role: 'worker' },
      ];
    }
    if (template.tags.includes('fire')) {
      return [
        { text: 'Verify fire suppression systems are operational.', role: 'supervisor' },
        { text: 'Control all ignition sources in fire-prone areas.', role: 'worker' },
        { text: 'Report any fire hazards immediately.', role: 'worker' },
      ];
    }
    if (template.tags.includes('electrical')) {
      return [
        { text: 'Always perform lockout-tagout before electrical work.', role: 'worker' },
        { text: 'Verify electrical isolation before maintenance begins.', role: 'supervisor' },
        { text: 'Use proper PPE for electrical work.', role: 'worker' },
      ];
    }
    if (template.tags.includes('blasting')) {
      return [
        { text: 'Clear exclusion zone before blasting operations.', role: 'supervisor' },
        { text: 'Follow all blasting procedures and protocols.', role: 'worker' },
        { text: 'Verify all personnel are clear before detonation.', role: 'supervisor' },
      ];
    }
    return baseChecklist;
  };

  // Generate specific quiz questions based on template
  const getQuiz = (template) => {
    if (template.tags.includes('roof-fall')) {
      return [
        {
          question: 'What must be done before entering a work area after blasting?',
          options: ['Enter immediately', 'Wait for supervisor', 'Perform sounding and verify support', 'Check time only'],
          correctOption: 2,
          explanation: 'Roof sounding and support verification are mandatory before re-entry after blasting.',
        },
      ];
    }
    if (template.tags.includes('gas')) {
      return [
        {
          question: 'What is required before entering a gassy area?',
          options: ['Just wear mask', 'Gas testing and ventilation check', 'Ask coworker', 'Enter quickly'],
          correctOption: 1,
          explanation: 'Gas testing and ventilation verification are mandatory before entering gassy areas.',
        },
      ];
    }
    if (template.tags.includes('fire')) {
      return [
        {
          question: 'What should you do if you discover a fire hazard?',
          options: ['Ignore it', 'Report immediately and evacuate if needed', 'Wait and see', 'Try to fix yourself'],
          correctOption: 1,
          explanation: 'Fire hazards must be reported immediately and evacuation procedures followed if necessary.',
        },
      ];
    }
    if (template.tags.includes('electrical')) {
      return [
        {
          question: 'What is mandatory before electrical maintenance?',
          options: ['Just turn off switch', 'Lockout-tagout and test zero energy', 'Ask permission', 'Work quickly'],
          correctOption: 1,
          explanation: 'Lockout-tagout and zero energy verification are mandatory before electrical work.',
        },
      ];
    }
    // Default quiz
    return [
      {
        question: `What is the key safety control for ${template.title.toLowerCase()}?`,
        options: ['Ignore procedures', 'Follow all safety procedures precisely', 'Skip inspections', 'Work faster'],
        correctOption: 1,
        explanation: 'Following all documented safety procedures and controls is essential to prevent incidents.',
      },
    ];
  };

  return {
    ...template,
    title: `${template.title} - Incident ${caseNumber}`,
    date: new Date(2023 + Math.floor(caseNumber / 12), (caseNumber * 2) % 12, ((caseNumber * 3) % 28) + 1),
    rootCauses: getRootCauses(template),
    preventiveChecklist: getPreventiveChecklist(template),
    quiz: getQuiz(template),
    status: 'published',
  };
});

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const samples = [...baseCases, ...buildGeneratedCases()];
    const existing = new Set((await CaseStudy.find({}, 'title')).map((doc) => doc.title));
    const newCases = samples.filter((sample) => !existing.has(sample.title));

    if (!newCases.length) {
      console.log('No new case studies to insert.');
    } else {
      await CaseStudy.insertMany(newCases);
      console.log(`Inserted ${newCases.length} case studies.`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();


