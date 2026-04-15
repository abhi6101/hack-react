// Email Service for SendGrid Integration
// This is a frontend utility that calls backend email endpoints

import API_BASE_URL from '../config';

/**
 * Send acceptance email to student when application is shortlisted
 * @param {Object} applicationData - Application and interview details
 * @returns {Promise} - API response
 */
export const sendAcceptanceEmail = async (applicationData) => {
    const { studentEmail, studentName, jobTitle, companyName, interviewDetails } = applicationData;

    const emailPayload = {
        to: studentEmail,
        subject: `Congratulations! You've been shortlisted for ${jobTitle}`,
        templateType: 'ACCEPTANCE',
        data: {
            studentName,
            jobTitle,
            companyName,
            interviewDetails
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}/emails/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(emailPayload)
        });

        if (!response.ok) {
            throw new Error('Failed to send acceptance email');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending acceptance email:', error);
        throw error;
    }
};

/**
 * Send rejection email to student when application is rejected
 * @param {Object} applicationData - Application details
 * @returns {Promise} - API response
 */
export const sendRejectionEmail = async (applicationData) => {
    const { studentEmail, studentName, jobTitle, companyName } = applicationData;

    const emailPayload = {
        to: studentEmail,
        subject: `Application Status - ${jobTitle}`,
        templateType: 'REJECTION',
        data: {
            studentName,
            jobTitle,
            companyName
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}/emails/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(emailPayload)
        });

        if (!response.ok) {
            throw new Error('Failed to send rejection email');
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending rejection email:', error);
        throw error;
    }
};

/**
 * Format interview details for email template
 * @param {Object} interviewDetails - Interview rounds details
 * @returns {String} - Formatted HTML string
 */
export const formatInterviewDetailsForEmail = (interviewDetails) => {
    if (!interviewDetails) return '';

    const details = typeof interviewDetails === 'string'
        ? JSON.parse(interviewDetails)
        : interviewDetails;

    let html = '<div style="margin: 20px 0;">';
    html += '<h3 style="color: #4361ee;">Interview Schedule:</h3>';

    // Coding Round
    if (details.codingRound?.enabled) {
        html += `
            <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #4361ee;">
                <h4 style="margin: 0 0 10px 0; color: #333;">📝 Coding Round</h4>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${details.codingRound.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${details.codingRound.time}</p>
                <p style="margin: 5px 0;"><strong>Venue:</strong> ${details.codingRound.venue}</p>
                ${details.codingRound.instructions ? `<p style="margin: 5px 0;"><strong>Instructions:</strong> ${details.codingRound.instructions}</p>` : ''}
            </div>
        `;
    }

    // Technical Interview
    if (details.technicalInterview?.enabled) {
        html += `
            <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #06ffa5;">
                <h4 style="margin: 0 0 10px 0; color: #333;">💼 Technical Interview</h4>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${details.technicalInterview.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${details.technicalInterview.time}</p>
                <p style="margin: 5px 0;"><strong>Venue:</strong> ${details.technicalInterview.venue}</p>
                ${details.technicalInterview.topics ? `<p style="margin: 5px 0;"><strong>Topics:</strong> ${details.technicalInterview.topics}</p>` : ''}
            </div>
        `;
    }

    // HR Round
    if (details.hrRound?.enabled) {
        html += `
            <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #f72585;">
                <h4 style="margin: 0 0 10px 0; color: #333;">👥 HR Round</h4>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${details.hrRound.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${details.hrRound.time}</p>
                <p style="margin: 5px 0;"><strong>Venue:</strong> ${details.hrRound.venue}</p>
            </div>
        `;
    }

    // Project Task
    if (details.projectTask?.enabled) {
        html += `
            <div style="margin: 15px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;">
                <h4 style="margin: 0 0 10px 0; color: #333;">🎯 Optional Project Task</h4>
                <p style="margin: 5px 0;"><strong>Description:</strong> ${details.projectTask.description}</p>
                <p style="margin: 5px 0;"><strong>Deadline:</strong> ${details.projectTask.deadline} hours from acceptance</p>
                ${details.projectTask.requirements ? `<p style="margin: 5px 0;"><strong>Requirements:</strong> ${details.projectTask.requirements}</p>` : ''}
            </div>
        `;
    }

    html += '</div>';
    return html;
};

export default {
    sendAcceptanceEmail,
    sendRejectionEmail,
    formatInterviewDetailsForEmail
};
