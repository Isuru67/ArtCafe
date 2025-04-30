import React, { useEffect, useState, useCallback } from 'react';
import { getLearningPlans, deleteLearningPlan, completeTopic } from '../../services/learningPlanService';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function LearningPlanDashboard() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userid } = useParams();

    const calculateProgress = (topics) => {
        if (!topics || topics.length === 0) return 0;
        const completed = topics.filter(topic => topic.completed).length;
        return Math.round((completed / topics.length) * 100);
    };

    const fetchPlans = useCallback(async () => {
        try {
            const response = await getLearningPlans(userid);
            console.log('Fetched plans:', response.data); // Debug log
            setPlans(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching plans:', err);
            setLoading(false);
        }
    }, [userid]);

    const handleDelete = async (planId) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await deleteLearningPlan(planId);
                await fetchPlans();
            } catch (err) {
                console.error('Error deleting plan:', err);
            }
        }
    };

    const handleMarkComplete = async (topicId) => {
        try {
            await completeTopic(topicId);
            await fetchPlans();
        } catch (err) {
            console.error('Error marking topic complete:', err);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const renderProgressChart = (plan) => {
        const progress = calculateProgress(plan.topics);
        const data = {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [progress, 100 - progress],
                backgroundColor: ['#4CAF50', '#f0f0f0'],
                borderWidth: 0
            }]
        };

        const options = {
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                }
            }
        };

        return (
            
            <div className="position-relative" style={{ width: '100px', height: '100px' }}>
                <Doughnut data={data} options={options} />
                <div 
                    className="position-absolute top-50 start-50 translate-middle"
                    style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                >
                    {progress}%
                </div>
            </div>
            
        );
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        // <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
        //     style={{
        //         backgroundImage: "url('/df68b0_15eb4fc4e75946eea872f6f531e712fd~mv2.avif')",
        //         backgroundSize: "cover",
        //         backgroundRepeat: "no-repeat",
        //         height: "150vh",             // Full viewport height
        //         width: "90vw",              // Full viewport width
        //         display: "flex",
        //     }}
        // >
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>📚 My Learning Plans</h2>
                <div className="d-flex gap-2">
                    <Link to={`/${userid}/create-plan`} className="btn btn-primary">
                        ➕ Create New Plan
                    </Link>
                    {/* <Link to={`/${userid}/view-planlist`} className="btn btn-info">
                        👀 View All Plans
                    </Link> */}
                </div>
            </div>

            {plans.length === 0 ? (
                <div className="text-center py-5">
                    <h3>No plans available</h3>
                    <p className="text-muted">Use the "Create New Plan" button to get started.</p>
                </div>
            ) : (
                <div className="row">
                    {plans.map((plan) => (
                        <div className="col-md-6 col-lg-4 mb-4" key={plan.id}>
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h4 className="card-title">{plan.title}</h4>
                                            <p className="card-text text-muted">{plan.description}</p>
                                        </div>
                                        {renderProgressChart(plan)}
                                    </div>
                                    
                                    <div className="mb-3">
                                        <small className="text-muted">
                                            Target Date: {format(new Date(plan.targetCompletionDate), 'MMM dd, yyyy')}
                                        </small>
                                    </div>

                                    <div className="list-group mb-3">
                                        {plan.topics.map((topic) => (
                                            <div key={topic.id} 
                                                className="list-group-item d-flex justify-content-between align-items-center">
                                                <span>
                                                    {topic.completed ? '✅' : '⬜️'} {topic.topicName}
                                                </span>
                                                {!topic.completed && (
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        onClick={() => handleMarkComplete(topic.id)}
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="d-flex gap-2 mt-3">
                                        <Link 
                                            to={`/${userid}/edit-plan/${plan.id}`} 
                                            className="btn btn-warning btn-sm flex-grow-1"
                                        >
                                            ✏️ Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(plan.id)} 
                                            className="btn btn-danger btn-sm flex-grow-1"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
       // </div>
    );
}

export default LearningPlanDashboard;
