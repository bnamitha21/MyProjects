import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import api from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const ReportIncident = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        severity: 'medium',
        type: 'near_miss',
        image: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [step, setStep] = useState(1);
    const [formErrors, setFormErrors] = useState({});

    const severityOptions = [
        { value: 'low', label: 'Low', color: 'bg-blue-500' },
        { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
        { value: 'high', label: 'High', color: 'bg-orange-500' },
        { value: 'critical', label: 'Critical', color: 'bg-red-600' }
    ];

    const typeOptions = [
        { value: 'injury', label: 'Injury', icon: '🤕' },
        { value: 'near_miss', label: 'Near Miss', icon: '⚠️' },
        { value: 'property_damage', label: 'Property Damage', icon: '🏚️' },
        { value: 'environmental', label: 'Environmental', icon: '🌳' },
        { value: 'other', label: 'Other', icon: '❓' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        if (!formData.location.trim()) errors.location = 'Location is required';
        if (!formData.type) errors.type = 'Type is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create payload
            // Note: The backend currently expects JSON for incidents, not FormData with file upload support in the controller I saw.
            // However, to be safe and consistent with Hazard, I'll check if I need to handle image upload separately or if the backend supports it.
            // Looking at incidentController.js, it takes req.body directly. It doesn't seem to have image upload logic like hazardController.
            // So I will omit the image for now or send it if I add support later. 
            // For now, I'll send JSON.

            const payload = {
                title: formData.title,
                description: formData.description,
                location: formData.location,
                severity: formData.severity,
                type: formData.type,
                // imageUrl: ... // Backend doesn't seem to support image upload for incidents yet based on my read.
            };

            const response = await api.post('/incidents', payload);

            if (response.data.success) {
                toast.success('Incident reported successfully!');
                navigate('/incident-library');
            }

        } catch (error) {
            console.error('Error submitting incident report:', error);
            toast.error(error.response?.data?.message || 'Failed to submit incident report.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="container mx-auto px-4 py-6 md:py-8 mt-10">
            <div className="relative overflow-hidden rounded-xl mb-6 md:mb-8 bg-gradient-to-r from-red-700 to-red-500 p-4 md:p-8 text-white">
                <div className="relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">Report an Incident</h1>
                    <p className="text-sm md:text-base text-white text-opacity-90">Document safety incidents to prevent future occurrences</p>
                </div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="glass-card p-8 rounded-xl shadow-lg border border-white border-opacity-20 bg-gradient-to-br from-white to-gray-50"
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="Brief title of the incident"
                            />
                            {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="Detailed description of what happened"
                            />
                            {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    placeholder="Where did it happen?"
                                />
                                {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                                <select
                                    name="severity"
                                    value={formData.severity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                >
                                    {severityOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {typeOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => setFormData({ ...formData, type: option.value })}
                                        className={`cursor-pointer rounded-lg p-3 border transition-all duration-200 ${formData.type === option.value
                                                ? 'border-red-500 bg-red-50 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <span className="text-2xl mb-1">{option.icon}</span>
                                            <p className="font-medium text-sm">{option.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {formErrors.type && <p className="text-red-500 text-xs mt-1">{formErrors.type}</p>}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md disabled:opacity-70"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Incident Report'}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ReportIncident;
