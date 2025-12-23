import mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    type: {
        type: String,
        required: [true, 'Please select an incident type'],
        enum: ['injury', 'near_miss', 'property_damage', 'environmental', 'other']
    },
    severity: {
        type: String,
        required: [true, 'Please select severity'],
        enum: ['low', 'medium', 'high', 'critical']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    status: {
        type: String,
        enum: ['open', 'investigating', 'closed'],
        default: 'open'
    },
    reportedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Incident', IncidentSchema);
