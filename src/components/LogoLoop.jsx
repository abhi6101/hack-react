import React from 'react';
import './LogoLoop.css';

const LogoLoop = () => {
    // Real company logos from CDN/external sources
    const companies = [
        {
            name: 'Google',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg',
            color: '#4285F4'
        },
        {
            name: 'Microsoft',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoft.svg',
            color: '#00A4EF'
        },
        {
            name: 'Amazon',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazon.svg',
            color: '#FF9900'
        },
        {
            name: 'IBM',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/ibm.svg',
            color: '#054ADA'
        },
        {
            name: 'Meta',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/meta.svg',
            color: '#0668E1'
        },
        {
            name: 'Apple',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apple.svg',
            color: '#000000'
        },
        {
            name: 'Netflix',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/netflix.svg',
            color: '#E50914'
        },
        {
            name: 'Adobe',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/adobe.svg',
            color: '#FF0000'
        },
        {
            name: 'Oracle',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/oracle.svg',
            color: '#F80000'
        },
        {
            name: 'Intel',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/intel.svg',
            color: '#0071C5'
        },
        {
            name: 'Samsung',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/samsung.svg',
            color: '#1428A0'
        },
        {
            name: 'Accenture',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/accenture.svg',
            color: '#A100FF'
        },
        {
            name: 'Deloitte',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/deloitte.svg',
            color: '#0076A8'
        },
        {
            name: 'Infosys',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/infosys.svg',
            color: '#007CC3'
        },
        {
            name: 'TCS',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tcs.svg',
            color: '#0F62FE'
        },
        {
            name: 'Wipro',
            logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/wipro.svg',
            color: '#6750A4'
        }
    ];

    // Duplicate the array for seamless loop
    const duplicatedCompanies = [...companies, ...companies];

    return (
        <div className="logo-loop-container">
            <div className="logo-loop-track">
                {duplicatedCompanies.map((company, index) => (
                    <div key={index} className="logo-loop-item">
                        <div className="logo-wrapper">
                            <img
                                src={company.logo}
                                alt={company.name}
                                style={{ filter: `drop-shadow(0 0 10px ${company.color})` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LogoLoop;
