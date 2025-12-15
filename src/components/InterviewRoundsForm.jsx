import React from 'react';
import '../styles/interview-rounds.css';

const InterviewRoundsForm = ({ interviewDetails, setInterviewDetails }) => {

    const toggleRound = (roundType, enabled) => {
        setInterviewDetails(prev => ({
            ...prev,
            [roundType]: {
                ...prev[roundType],
                enabled
            }
        }));
    };

    const updateRoundField = (roundType, field, value) => {
        setInterviewDetails(prev => ({
            ...prev,
            [roundType]: {
                ...prev[roundType],
                [field]: value
            }
        }));
    };

    return (
        <div className="interview-rounds-section">
            <h3><i className="fas fa-calendar-check"></i> Interview Rounds (All Optional)</h3>
            <p className="rounds-description">Configure interview rounds for this job. All fields are optional.</p>

            {/* Coding Round */}
            <div className="round-card">
                <div className="round-header">
                    <label className="round-toggle">
                        <input
                            type="checkbox"
                            checked={interviewDetails.codingRound.enabled}
                            onChange={(e) => toggleRound('codingRound', e.target.checked)}
                        />
                        <span className="toggle-label">
                            <i className="fas fa-code"></i> Coding Round
                        </span>
                    </label>
                </div>

                {interviewDetails.codingRound.enabled && (
                    <div className="round-details">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={interviewDetails.codingRound.date}
                                    onChange={(e) => updateRoundField('codingRound', 'date', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={interviewDetails.codingRound.time}
                                    onChange={(e) => updateRoundField('codingRound', 'time', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Venue</label>
                            <input
                                type="text"
                                placeholder="e.g., Lab 101 or Virtual - Zoom"
                                value={interviewDetails.codingRound.venue}
                                onChange={(e) => updateRoundField('codingRound', 'venue', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Instructions</label>
                            <textarea
                                placeholder="e.g., Solve 3 DSA problems, bring laptop"
                                value={interviewDetails.codingRound.instructions}
                                onChange={(e) => updateRoundField('codingRound', 'instructions', e.target.value)}
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                )}
            </div>

            {/* Technical Interview */}
            <div className="round-card">
                <div className="round-header">
                    <label className="round-toggle">
                        <input
                            type="checkbox"
                            checked={interviewDetails.technicalInterview.enabled}
                            onChange={(e) => toggleRound('technicalInterview', e.target.checked)}
                        />
                        <span className="toggle-label">
                            <i className="fas fa-laptop-code"></i> Technical Interview
                        </span>
                    </label>
                </div>

                {interviewDetails.technicalInterview.enabled && (
                    <div className="round-details">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={interviewDetails.technicalInterview.date}
                                    onChange={(e) => updateRoundField('technicalInterview', 'date', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={interviewDetails.technicalInterview.time}
                                    onChange={(e) => updateRoundField('technicalInterview', 'time', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Venue</label>
                            <input
                                type="text"
                                placeholder="e.g., Conference Room or Virtual - Teams"
                                value={interviewDetails.technicalInterview.venue}
                                onChange={(e) => updateRoundField('technicalInterview', 'venue', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Topics to Cover</label>
                            <textarea
                                placeholder="e.g., React, Node.js, Databases, System Design"
                                value={interviewDetails.technicalInterview.topics}
                                onChange={(e) => updateRoundField('technicalInterview', 'topics', e.target.value)}
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                )}
            </div>

            {/* HR Round */}
            <div className="round-card">
                <div className="round-header">
                    <label className="round-toggle">
                        <input
                            type="checkbox"
                            checked={interviewDetails.hrRound.enabled}
                            onChange={(e) => toggleRound('hrRound', e.target.checked)}
                        />
                        <span className="toggle-label">
                            <i className="fas fa-users"></i> HR Round
                        </span>
                    </label>
                </div>

                {interviewDetails.hrRound.enabled && (
                    <div className="round-details">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={interviewDetails.hrRound.date}
                                    onChange={(e) => updateRoundField('hrRound', 'date', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input
                                    type="time"
                                    value={interviewDetails.hrRound.time}
                                    onChange={(e) => updateRoundField('hrRound', 'time', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Venue</label>
                            <input
                                type="text"
                                placeholder="e.g., HR Office or Virtual - Google Meet"
                                value={interviewDetails.hrRound.venue}
                                onChange={(e) => updateRoundField('hrRound', 'venue', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Common Questions/Topics</label>
                            <textarea
                                placeholder="e.g., Tell me about yourself, Why our company?, Salary expectations"
                                value={interviewDetails.hrRound.questions}
                                onChange={(e) => updateRoundField('hrRound', 'questions', e.target.value)}
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                )}
            </div>

            {/* Optional Project Task */}
            <div className="round-card">
                <div className="round-header">
                    <label className="round-toggle">
                        <input
                            type="checkbox"
                            checked={interviewDetails.projectTask.enabled}
                            onChange={(e) => toggleRound('projectTask', e.target.checked)}
                        />
                        <span className="toggle-label">
                            <i className="fas fa-project-diagram"></i> Optional Project Task (24 hours)
                        </span>
                    </label>
                </div>

                {interviewDetails.projectTask.enabled && (
                    <div className="round-details">
                        <div className="form-group">
                            <label>Project Description</label>
                            <textarea
                                placeholder="e.g., Build a Todo App with React and REST API"
                                value={interviewDetails.projectTask.description}
                                onChange={(e) => updateRoundField('projectTask', 'description', e.target.value)}
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label>Deadline (hours)</label>
                            <input
                                type="number"
                                placeholder="24"
                                value={interviewDetails.projectTask.deadline}
                                onChange={(e) => updateRoundField('projectTask', 'deadline', e.target.value)}
                                min="1"
                                max="72"
                            />
                        </div>
                        <div className="form-group">
                            <label>Requirements</label>
                            <textarea
                                placeholder="e.g., Use React Hooks, API integration, Responsive design"
                                value={interviewDetails.projectTask.requirements}
                                onChange={(e) => updateRoundField('projectTask', 'requirements', e.target.value)}
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewRoundsForm;
