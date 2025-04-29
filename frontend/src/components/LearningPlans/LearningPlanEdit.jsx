import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLearningPlanById, updateLearningPlan } from '../../services/learningPlanService';

function LearningPlanEdit() {
    const { planId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetCompletionDate, setTargetCompletionDate] = useState('');
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await getLearningPlanById(planId);
                const plan = res.data;
                setTitle(plan.title);
                setDescription(plan.description);
                setTargetCompletionDate(plan.targetCompletionDate);
                setTopics(plan.topics.map(t => t.topicName));
            } catch (err) {
                console.error('Error loading plan:', err);
                alert('❌ Could not load plan');
            }
        };
        fetchPlan();
    }, [planId]);

    const handleTopicChange = (index, value) => {
        const updatedTopics = [...topics];
        updatedTopics[index] = value;
        setTopics(updatedTopics);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedPlan = {
            title,
            description,
            targetCompletionDate,
            topics: topics.map(t => ({ topicName: t }))
        };

        try {
            await updateLearningPlan(planId, updatedPlan);
            alert('✅ Plan updated successfully!');
            navigate('/');
        } catch (err) {
            console.error('Update failed:', err);
            alert('❌ Failed to update plan');
        }
    };

    return (
        <div
            className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
            style={{
                backgroundImage: "url('/diary-planning.jpg')",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                height: "100vh",
                width: "92vw",
                display: "flex",
            }}
        >
            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-md-10 col-lg-8">
                        <div className="card shadow bg-light bg-opacity-75 rounded-4 border-0">
                            <div className="card-body p-5">
                                <h2 className="text-center mb-4">✏️ Edit Your Learning Plan</h2>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                            placeholder="Title"
                                        />
                                        <label>Plan Title</label>
                                    </div>

                                    <div className="form-floating mb-3">
                                        <textarea
                                            className="form-control"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Description"
                                            style={{ height: '100px' }}
                                            required
                                        />
                                        <label>Plan Description</label>
                                    </div>

                                    <div className="form-floating mb-4">
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={targetCompletionDate}
                                            onChange={(e) => setTargetCompletionDate(e.target.value)}
                                            required
                                        />
                                        <label>Target Completion Date</label>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Plan Topics</label>
                                        {topics.map((topic, index) => (
                                            <div className="input-group mb-2" key={index}>
                                                <span className="input-group-text">📌</span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={topic}
                                                    onChange={(e) => handleTopicChange(index, e.target.value)}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="d-grid mt-4">
                                        <button type="submit" className="btn btn-primary btn-lg">
                                            💾 Update Plan
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-muted small">
                            “Edit your plan to stay on track!” – Art Cafe
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LearningPlanEdit;
