/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import { getLearningPlans, deleteLearningPlan, completeTopic } from '../../services/learningPlanService';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaSearch, FaFilter, FaPalette, FaCode, FaMusic, FaBook, FaSortAmountDown, FaCalendarAlt, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

let motion = null;
let Confetti = null;
try {
    const framerMotion = require('framer-motion');
    motion = framerMotion.motion;
    Confetti = require('react-confetti').default;
} catch (err) {
    console.warn('Animation packages not available, falling back to static components');
}

ChartJS.register(ArcElement, Tooltip, Legend);

function LearningPlanDashboard() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userid } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [showConfetti, setShowConfetti] = useState(false);
    const [sortBy, setSortBy] = useState('date'); // new state
    const [viewMode, setViewMode] = useState('grid'); // new state
    // eslint-disable-next-line no-unused-vars
    const [selectedDate, setSelectedDate] = useState(null); // new state
    const [sortOrder, setSortOrder] = useState('desc');

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

    const handleMarkComplete = async (topicId, planId) => {  // Add planId parameter
        try {
            const response = await completeTopic(topicId, userid);  // Add userid to the API call
            if (response.status === 200) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
                await fetchPlans();  // Refresh the plans after successful completion
            } else {
                console.error('Error marking topic complete:', response);
                alert('Failed to mark topic as complete. Please try again.');
            }
        } catch (err) {
            console.error('Error marking topic complete:', err);
            if (err.response && err.response.status === 401) {
                // Handle unauthorized error
                alert('Please log in again to continue.');
            } else {
                alert('Failed to mark topic as complete. Please try again.');
            }
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const categoryIcons = {
        'art': <FaPalette />,
        'programming': <FaCode />,
        'music': <FaMusic />,
        'other': <FaBook />
    };

    const getCategoryColor = (category) => {
        const colors = {
            'art': '#FF6B6B',
            'programming': '#4ECDC4',
            'music': '#45B7D1',
            'other': '#96CEB4'
        };
        return colors[category] || colors.other;
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const getSortedPlans = (plans) => {
        return [...plans].sort((a, b) => {
            let comparison = 0;
            
            switch(sortBy) {
                case 'progress':
                    comparison = calculateProgress(b.topics) - calculateProgress(a.topics);
                    break;
                case 'name':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'date':
                    comparison = new Date(b.targetCompletionDate) - new Date(a.targetCompletionDate);
                    break;
                case 'category':
                    comparison = (a.category || '').localeCompare(b.category || '');
                    break;
                default:
                    return 0;
            }
            
            return sortOrder === 'asc' ? comparison * -1 : comparison;
        });
    };

    const filteredAndSortedPlans = getSortedPlans(
        plans.filter(plan => {
            const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' || plan.category === filter;
            return matchesSearch && matchesFilter;
        })
    );

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

        const ChartContent = (
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

        return motion ? (
            <motion.div 
                className="position-relative" 
                style={{ width: '100px', height: '100px' }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
            >
                {ChartContent}
            </motion.div>
        ) : ChartContent;
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (error) {
            console.error('Invalid date:', error);
            return 'Invalid Date';
        }
    };

    const renderSortControls = () => (
        <div className="sort-controls d-flex align-items-center">
            <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
            >
                <option value="date">Sort by Date</option>
                <option value="progress">Sort by Progress</option>
                <option value="name">Sort by Name</option>
                <option value="category">Sort by Category</option>
            </select>
            <button 
                className="btn btn-link sort-order-btn" 
                onClick={toggleSortOrder}
                title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
                {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
            </button>
        </div>
    );

    return (
        <div className="learning-dashboard">
            {showConfetti && Confetti && <Confetti />}
            
            <div className="container py-4">
                <div className="text-center mb-4">
                   <p> <h2 className="mb-4">📚 My Learning Plans</h2>
                    <i>Track your progress and achieve your goals</i></p>
                    
                    <div className="search-section mx-auto">
                        <div className="d-flex justify-content-center gap-5 flex-wrap">
                            <div className="search-box-wrapper" mt-3>
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search plans..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
{/*                             
                            <select 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Categories</option>
                                <option value="art">Art</option>
                                <option value="programming">Programming</option>
                                <option value="music">Music</option>
                                <option value="other">Other</option>
                            </select> */}

                            {renderSortControls()}
                        </div>
                    </div>

                    <div className="mt-3">
                        <Link 
                            to={`/${userid}/create-plan`} 
                            className="btn btn-primary create-plan-btn"
                        >
                            <span className="btn-icon">➕</span>
                            <span className="btn-text">Create New Plan</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="stats-section row mb-4">
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="stat-card">
                            <h3>{plans.length}</h3>
                            <p>Total Plans</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="stat-card">
                            <h3>
                                {plans.reduce((acc, plan) => 
                                    acc + plan.topics.filter(t => t.completed).length, 0
                                )}
                            </h3>
                            <p>Completed Topics</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="stat-card">
                            <h3>
                                {Math.round(
                                    plans.reduce((acc, plan) => 
                                        acc + calculateProgress(plan.topics), 0
                                    ) / (plans.length || 1)
                                )}%
                            </h3>
                            <p>Average Progress</p>
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-3">
                        <div className="stat-card">
                            <h3>{plans.filter(p => calculateProgress(p.topics) === 100).length}</h3>
                            <p>Completed Plans</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : filteredAndSortedPlans.length === 0 ? (
                    <div className="text-center py-5">
                        <h3>No plans found</h3>
                        <p className="text-muted">
                            {searchTerm || filter !== 'all' 
                                ? 'Try adjusting your search or filters'
                                : 'Use the "Create New Plan" button to get started.'}
                        </p>
                    </div>
                ) : (
                    <div className="row">
                        {filteredAndSortedPlans.map((plan) => (
                            <div className="col-md-6 col-lg-4 mb-4" key={plan.id}>
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <h4 className="card-title">
                                                    {plan.title}
                                                    {plan.category && (
                                                        <span 
                                                            className="badge ms-2"
                                                            style={{ 
                                                                backgroundColor: getCategoryColor(plan.category),
                                                                fontSize: '0.7rem'
                                                            }}
                                                        >
                                                            {categoryIcons[plan.category]} {plan.category}
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="card-text text-muted">{plan.description}</p>
                                            </div>
                                            {renderProgressChart(plan)}
                                        </div>
                                        
                                        <div className="mb-3">
                                            <small className="text-muted">
                                                Target Date: {formatDate(plan.targetCompletionDate)}
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
                                                            onClick={() => handleMarkComplete(topic.id, plan.id)}
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
        </div>
    );
}

export default LearningPlanDashboard;
