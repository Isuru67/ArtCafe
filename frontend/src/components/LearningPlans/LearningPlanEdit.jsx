import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLearningPlanById, updateLearningPlan } from '../../services/learningPlanService';

function LearningPlanEdit() {
    const { planId, userid } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetCompletionDate: '',
        topics: []
    });

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const response = await getLearningPlanById(planId);
                setPlan(response.data);
                setFormData({
                    title: response.data.title,
                    description: response.data.description,
                    targetCompletionDate: response.data.targetCompletionDate.split('T')[0],
                    topics: response.data.topics.map(t => ({ ...t }))
                });
                setLoading(false);
            } catch (err) {
                console.error('Error loading plan:', err);
                alert('Could not load plan details');
                setLoading(false);
            }
        };
        fetchPlan();
    }, [planId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTopicChange = (index, value) => {
        const updatedTopics = [...formData.topics];
        updatedTopics[index] = {
            ...updatedTopics[index],
            topicName: value
        };
        setFormData(prev => ({
            ...prev,
            topics: updatedTopics
        }));
    };

    const handleAddTopic = () => {
        setFormData(prev => ({
            ...prev,
            topics: [...prev.topics, { id: Date.now().toString(), topicName: '', completed: false }]
        }));
    };

    const handleRemoveTopic = (index) => {
        setFormData(prev => ({
            ...prev,
            topics: prev.topics.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateLearningPlan(planId, {
                ...formData,
                createdBy: plan.createdBy
            });
            alert('Plan updated successfully!');
            navigate(`/${userid}/lerning-dashboard`);
        } catch (err) {
            console.error('Error updating plan:', err);
            alert('Failed to update plan');
        }
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Edit Learning Plan</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Target Completion Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="targetCompletionDate"
                                        value={formData.targetCompletionDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Topics</label>
                                    {formData.topics.map((topic, index) => (
                                        <div key={topic.id} className="input-group mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={topic.topicName}
                                                onChange={(e) => handleTopicChange(index, e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => handleRemoveTopic(index)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="btn btn-secondary mt-2"
                                        onClick={handleAddTopic}
                                    >
                                        Add Topic
                                    </button>
                                </div>

                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary">
                                        Update Plan
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate(`/${userid}/lerning-dashboard`)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LearningPlanEdit;
