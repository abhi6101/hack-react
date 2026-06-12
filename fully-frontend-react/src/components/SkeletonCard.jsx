import React from 'react';

const SkeletonCard = ({ type }) => {
    if (type === 'job' || type === 'interview') {
        return (
            <div className="skeleton-base skeleton-pulse" style={{ minHeight: '320px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="skeleton-pulse-bg" style={{ width: '80px', height: '24px', borderRadius: '16px', marginBottom: '0.5rem' }}></div>
                <div className="skeleton-pulse-bg" style={{ width: '80%', height: '32px', marginBottom: '0.5rem' }}></div>
                <div className="skeleton-pulse-bg" style={{ width: '60%', height: '20px', marginBottom: '1.5rem' }}></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flexGrow: 1 }}>
                    <div className="skeleton-pulse-bg" style={{ width: '100%', height: '16px' }}></div>
                    <div className="skeleton-pulse-bg" style={{ width: '100%', height: '16px' }}></div>
                    <div className="skeleton-pulse-bg" style={{ width: '90%', height: '16px' }}></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="skeleton-pulse-bg" style={{ width: '40%', height: '36px', borderRadius: '8px' }}></div>
                    <div className="skeleton-pulse-bg" style={{ width: '20%', height: '36px', borderRadius: '8px' }}></div>
                </div>
            </div>
        );
    }

    if (type === 'paper') {
        return (
            <div className="skeleton-base skeleton-pulse" style={{ minHeight: '200px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="skeleton-pulse-bg" style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }}></div>
                    <div style={{ flexGrow: 1 }}>
                        <div className="skeleton-pulse-bg" style={{ width: '70%', height: '24px', marginBottom: '0.5rem' }}></div>
                        <div className="skeleton-pulse-bg" style={{ width: '40%', height: '16px' }}></div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flexGrow: 1 }}>
                    <div className="skeleton-pulse-bg" style={{ width: '100%', height: '16px' }}></div>
                    <div className="skeleton-pulse-bg" style={{ width: '80%', height: '16px' }}></div>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <div className="skeleton-pulse-bg" style={{ width: '100%', height: '40px', borderRadius: '8px' }}></div>
                </div>
            </div>
        );
    }

    if (type === 'note') {
        return (
            <div className="skeleton-base skeleton-pulse" style={{ minHeight: '200px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div className="skeleton-pulse-bg" style={{ width: '64px', height: '64px', borderRadius: '16px', marginBottom: '1.5rem' }}></div>
                <div className="skeleton-pulse-bg" style={{ width: '80%', height: '24px', marginBottom: '0.8rem' }}></div>
                <div className="skeleton-pulse-bg" style={{ width: '60%', height: '16px', marginBottom: '0.8rem' }}></div>
                <div className="skeleton-pulse-bg" style={{ width: '90%', height: '16px', marginBottom: 'auto' }}></div>
                <div className="skeleton-pulse-bg" style={{ width: '100%', height: '40px', borderRadius: '8px', marginTop: '1.5rem' }}></div>
            </div>
        );
    }

    // Default generic skeleton
    return (
        <div className="skeleton-base skeleton-pulse" style={{ minHeight: '200px', padding: '1.5rem' }}>
            <div className="skeleton-pulse-bg" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default SkeletonCard;
