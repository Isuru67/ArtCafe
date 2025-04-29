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
            topics: topics.map(t => ({ topicName: t }))
        };

        try {
            await createLearningPlan(userId, planData);
            alert("Learning Plan Created Successfully!");
        } catch (err) {
            console.error(err);
            alert("Error creating plan");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Create Learning Plan</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required/>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required/>
                </div>

                <div className="form-group">
                    <label>Target Completion Date</label>
                    <input type="date" className="form-control" value={targetCompletionDate} onChange={(e) => setTargetCompletionDate(e.target.value)} required/>
                </div>

                <h5>Topics</h5>
                {topics.map((topic, index) => (
                    <input key={index} type="text" className="form-control mb-2" value={topic} onChange={(e) => handleTopicChange(index, e.target.value)} required/>
                ))}
                <button type="button" className="btn btn-secondary mt-2" onClick={handleAddTopic}>Add Topic</button>

                <button type="submit" className="btn btn-primary mt-4">Create Plan</button>
            </form>
        </div>
    );
}

export default LearningPlanCreate;
