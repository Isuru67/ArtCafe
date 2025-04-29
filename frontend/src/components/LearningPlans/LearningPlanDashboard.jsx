import React, { useEffect, useState } from 'react';
import { getLearningPlans, deleteLearningPlan, completeTopic } from '../../services/learningPlanService';
import { Link } from 'react-router-dom';

function LearningPlanDashboard({ userId }) {
    const [plans, setPlans] = useState([]);

    // eslint-disable-next-line no-undef, react-hooks/exhaustive-deps
    const fetchPlans = useCallback(async () => {
        try {
            const res = await getLearningPlans(userId);
            setPlans(res.data);
        } catch (err) {
            console.error(err);
            alert('Error fetching plans');
        }
    });

    const handleDelete = async (id) => {
        if (window.confirm('Delete this plan?')) {
            await deleteLearningPlan(id);
            fetchPlans();
        }
    };

    const handleMarkComplete = async (topicId) => {
        await completeTopic(topicId);
        fetchPlans(); // refresh to show updated status
    };

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans, userId]);

    return (
        <div className="container py-4">
            <h2 className="mb-4">📋 My Learning Plans</h2>
            <Link to="/create-plan" className="btn btn-success mb-4">➕ Create New Plan</Link>

            {plans.length === 0 && <p>No plans found. Start one!</p>}

            {plans.map((plan) => (
                <div className="card mb-4 shadow-sm" key={plan.id}>
                    <div className="card-body">
                        <h4>{plan.title}</h4>
                        <p className="text-muted">{plan.description}</p>
                        <p><b>Target Date:</b> {plan.targetCompletionDate}</p>

                        <ul className="list-group mb-3">
                            {plan.topics.map((topic) => (
                                <li key={topic.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <span>
                                        {topic.completed ? '✅' : '⬜️'} {topic.topicName}
                                    </span>
                                    {!topic.completed && (
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleMarkComplete(topic.id)}
                                        >
                                            Mark Complete
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>

                        <div className="d-flex gap-2">
                            <Link to={`/edit-plan/${plan.id}`} className="btn btn-warning btn-sm">✏️ Edit</Link>
                            <button onClick={() => handleDelete(plan.id)} className="btn btn-danger btn-sm">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default LearningPlanDashboard;
