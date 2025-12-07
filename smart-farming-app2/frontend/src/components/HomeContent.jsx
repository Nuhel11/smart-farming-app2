import React from 'react';

const FeatureCard = ({ title, description, icon }) => (
    <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        borderLeft: '5px solid #4CAF50'
    }}>
        <div style={{ fontSize: '2.5em', color: '#4CAF50', marginBottom: '10px' }}>{icon}</div>
        <h4 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>{title}</h4>
        <p style={{ fontSize: '0.9em', color: '#666' }}>{description}</p>
    </div>
);

const HomeContent = () => {
    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Hero Section */}
            <header style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#e8f5e9', // Light green background
                borderRadius: '12px',
                marginBottom: '40px',
                border: '1px solid #4CAF50'
            }}>
                <h1 style={{ fontSize: '3em', color: '#1a1a1a', margin: '0 0 10px 0' }}>
                    Data-Driven Decisions for a Better Harvest
                </h1>
                <p style={{ fontSize: '1.2em', color: '#4CAF50' }}>
                    Get precise crop, weather, and nutrient recommendations tailored to your field.
                </p>
            </header>

            {/* Features Section */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                    How SmartFarm AI Empowers You
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px'
                }}>
                    <FeatureCard
                        icon="☀️"
                        title="Live Weather Forecasting"
                        description="Harness real-time local weather data (temperature, humidity, rainfall) for planting and irrigation scheduling."
                    />
                    <FeatureCard
                        icon="🚜"
                        title="ML Crop Recommendation"
                        description="Our machine learning models analyze your soil NPK, pH, and climate conditions to recommend the most profitable crop."
                    />
                    <FeatureCard
                        icon="🧪"
                        title="Precision Nutrient Advice"
                        description="Calculate exact NPK deficiencies for your chosen crop, minimizing fertilizer waste and maximizing yield health."
                    />
                </div>
            </section>
        </div>
    );
};

export default HomeContent;