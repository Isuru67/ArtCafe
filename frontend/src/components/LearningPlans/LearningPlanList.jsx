import React, { useEffect, useState } from 'react';
import { getLearningPlans, deleteLearningPlan } from '../../services/learningPlanService';

function LearningPlanList({ userId }) {
    const [plans, setPlans] = useState([]);

    const fetchPlans = async () => {
        try {
            const res = await getLearningPlans(userId);
            setPlans(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (planId) => {
        if (window.confirm("Are you sure you want to delete this plan?")) {
            await deleteLearningPlan(planId);
            fetchPlans();
        }
    };

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await getLearningPlans(userId);
                setPlans(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchPlans();
    }, [userId]);

    return (
        <div className="container mt-4">
            <h2>My Learning Plans</h2>
            {plans.map(plan => (
                <div key={plan.id} className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title">{plan.title}</h5>
                        <p className="card-text">{plan.description}</p>
                        <p><b>Target:</b> {plan.targetCompletionDate}</p>

                        <ul>
                            {plan.topics.map(topic => (
                                <li key={topic.id}>
                                    {topic.topicName} - {topic.completed ? "✅ Completed" : "❌ Not Completed"}
                                </li>
                            ))}
                        </ul>

                        <button className="btn btn-danger" onClick={() => handleDelete(plan.id)}>Delete Plan</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default LearningPlanList;
