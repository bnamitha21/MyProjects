import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Incident from '../models/Incident.js';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mine-safety-app';

const sampleIncidents = [
    {
        title: 'Conveyor Belt Malfunction',
        description: 'The main conveyor belt in Section A stopped unexpectedly due to a motor failure. Maintenance team was notified immediately.',
        type: 'property_damage',
        severity: 'medium',
        location: 'Section A',
        status: 'closed',
        createdAt: new Date('2023-10-15')
    },
    {
        title: 'Minor Injury during Equipment Maintenance',
        description: 'A technician sustained a minor cut on their hand while servicing the drill rig. First aid was applied on site.',
        type: 'injury',
        severity: 'low',
        location: 'Workshop B',
        status: 'closed',
        createdAt: new Date('2023-10-20')
    },
    {
        title: 'Near Miss: Falling Debris',
        description: 'A large rock fell from the roof in the haulage way, narrowly missing a passing vehicle. Area cordoned off for inspection.',
        type: 'near_miss',
        severity: 'high',
        location: 'Haulage Way 3',
        status: 'investigating',
        createdAt: new Date('2023-11-05')
    },
    {
        title: 'Chemical Spill in Storage',
        description: 'A small amount of hydraulic fluid leaked from a drum in the storage area. Spill kit used to clean up.',
        type: 'environmental',
        severity: 'low',
        location: 'Chemical Storage',
        status: 'closed',
        createdAt: new Date('2023-11-12')
    },
    {
        title: 'Vehicle Collision',
        description: 'Two haul trucks had a minor collision at the intersection of Road A and B due to poor visibility. No injuries, minor damage.',
        type: 'property_damage',
        severity: 'medium',
        location: 'Intersection Road A/B',
        status: 'investigating',
        createdAt: new Date('2023-11-25')
    },
    {
        title: 'Electrical Short Circuit',
        description: 'Short circuit in the lighting panel caused a temporary blackout in the break room.',
        type: 'other',
        severity: 'low',
        location: 'Break Room',
        status: 'closed',
        createdAt: new Date('2023-12-01')
    },
    {
        title: 'High Gas Levels Detected',
        description: 'Methane sensors detected elevated levels in Zone 4. Evacuation protocol initiated.',
        type: 'environmental',
        severity: 'critical',
        location: 'Zone 4',
        status: 'open',
        createdAt: new Date('2023-12-05')
    },
    {
        title: 'Slip and Fall on Wet Floor',
        description: 'Worker slipped on wet floor near the wash bay. Sustained bruised knee.',
        type: 'injury',
        severity: 'low',
        location: 'Wash Bay',
        status: 'closed',
        createdAt: new Date('2023-12-10')
    }
];

const seed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find a user to assign as reporter
        let user = await User.findOne();
        if (!user) {
            console.log('No user found. Creating a default admin user...');
            // Create a dummy user if none exists (adjust fields based on User model)
            user = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123', // In a real app, this should be hashed
                role: 'admin'
            });
        }

        console.log(`Assigning incidents to user: ${user.email}`);

        // Add reportedBy field to samples
        const incidentsWithUser = sampleIncidents.map(incident => ({
            ...incident,
            reportedBy: user._id
        }));

        // Clear existing incidents (optional, but good for clean seed)
        // await Incident.deleteMany({}); 
        // console.log('Cleared existing incidents');

        const existing = new Set((await Incident.find({}, 'title')).map((doc) => doc.title));
        const newIncidents = incidentsWithUser.filter((sample) => !existing.has(sample.title));

        if (!newIncidents.length) {
            console.log('No new incidents to insert.');
        } else {
            await Incident.insertMany(newIncidents);
            console.log(`Inserted ${newIncidents.length} incidents.`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seed();
