import React, { useState } from 'react';
import { createLearningPlan } from '../../services/learningPlanService';

function LearningPlanCreate({ userId }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetCompletionDate, setTargetCompletionDate] = useState('');
    const [topics, setTopics] = useState(['']);

    const handleAddTopic = () => {
        setTopics([...topics, '']);
    };

    const handleTopicChange = (index, value) => {
        const newTopics = [...topics];
        newTopics[index] = value;
        setTopics(newTopics);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const planData = {
            title,
            description,
            targetCompletionDate,
            topics: topics.map((t) => ({ topicName: t }))
        };

        try {
            await createLearningPlan(userId, planData);
            alert('🎉 Learning Plan Created Successfully!');
            setTitle('');
            setDescription('');
            setTargetCompletionDate('');
            setTopics(['']);
        } catch (err) {
            console.error(err);
            alert('❌ Error creating plan');
        }
    };

    return (
        <div
        className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
        style={{
            backgroundImage: "url('/diary-planning.jpg')",
            backgroundSize: "cover",
            
            backgroundRepeat: "no-repeat",
            height: "100vh",             // Full viewport height
            width: "92vw",              // Full viewport width
            display: "flex",
            
           
        }}
    >
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    <div className="card shadow  bg-light bg-opacity-75 rounded-4 border-0">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4">🎨 Create Your Learning Plan</h2>

                            <form onSubmit={handleSubmit}>
                                <div className="form-floating mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="title"
                                        placeholder="Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="title">Plan Title</label>
                                </div>

                                <div className="form-floating mb-3">
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        placeholder="Description"
                                        style={{ height: '100px' }}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="description">Plan Description</label>
                                </div>

                                <div className="form-floating mb-4">
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="completionDate"
                                        placeholder="Target Date"
                                        value={targetCompletionDate}
                                        onChange={(e) => setTargetCompletionDate(e.target.value)}
                                        required
                                    />
                                    <label htmlFor="completionDate">Target Completion Date</label>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Plan Topics</label>
                                    {topics.map((topic, index) => (
                                        <div className="input-group mb-2" key={index}>
                                            <span className="input-group-text">📌</span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder={`Topic ${index + 1}`}
                                                value={topic}
                                                onChange={(e) => handleTopicChange(index, e.target.value)}
                                                required
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="btn btn-outline-success btn-sm mt-2"
                                        onClick={handleAddTopic}
                                    >
                                        ➕ Add Topic
                                    </button>
                                </div>

                                <div className="d-grid mt-4">
                                    <button type="submit" className="btn btn-primary btn-lg">
                                        ✅ Save Learning Plan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="mt-4 text-center text-muted small">
                        “A goal without a plan is just a wish.” – Antoine de Saint-Exupéry
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default LearningPlanCreate;
