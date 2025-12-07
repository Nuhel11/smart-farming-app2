import React from 'react';

const FeatureCard = ({ title, description, icon }) => (
    <div style={{
<<<<<<< HEAD
        // Card styling adjusted for contrast against the new background
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)', // Stronger shadow for depth
        textAlign: 'center',
        borderBottom: '5px solid #2ecc71', // Green accent
        transition: 'transform 0.3s',
        cursor: 'default'
    }}
    // Simple hover effect for professionalism
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div style={{ fontSize: '3em', color: '#4CAF50', marginBottom: '10px' }}>{icon}</div>
        <h4 style={{ margin: '0 0 10px 0', color: '#1a1a1a', fontSize: '1.2em' }}>{title}</h4>
        <p style={{ fontSize: '0.9em', color: '#555' }}>{description}</p>
=======
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
>>>>>>> Manishv2
    </div>
);

const HomeContent = () => {
<<<<<<< HEAD
    
    // Background Image URL (Same as used in the login section for consistency)
    const formBgImageUrl = 'https://c.pxhere.com/photos/92/b9/countryside_crop_cropland_farm_farmland_field_grass_nature-1367050.jpg!d';
    
    // Gradient for the Hero section (Darker green overlay)
    const heroGradientOverlay = 'linear-gradient(rgba(0, 50, 0, 0.7), rgba(0, 50, 0, 0.5))';
    
    // Gradient for the Features section (Slightly lighter, grass-green tone for visibility)
    const featuresGradientOverlay = 'linear-gradient(rgba(100, 150, 100, 0.2), rgba(100, 150, 100, 0.4))';


=======
>>>>>>> Manishv2
    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 20px',
            fontFamily: 'Arial, sans-serif'
        }}>
<<<<<<< HEAD
            {/* Hero Section - Uses Dark Green Gradient */}
            <header style={{
                textAlign: 'center',
                padding: '80px 20px',
                borderRadius: '12px',
                marginBottom: '40px',
                
                // --- Background Image & Gradient Styles ---
                backgroundImage: `${heroGradientOverlay}, url(${formBgImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white', 
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
                // -----------------------------------------
            }}>
                <h1 style={{ fontSize: '3.5em', color: 'white', margin: '0 0 15px 0', fontWeight: 'bold' }}>
                    Data-Driven Decisions for a Better Harvest
                </h1>
                <p style={{ fontSize: '1.4em', color: '#e0ffe0', fontWeight: 'lighter' }}>
                    Get precise crop, weather, and nutrient recommendations tailored to your field.
                </p>
                <div style={{ margin: '20px auto', maxWidth: '600px', opacity: 0.8 }}>
                    
                </div>
            </header>

            {/* Features Section - UPDATED WITH BACKGROUND IMAGE AND GRADIENT */}
            <section style={{ 
                marginBottom: '40px',
                padding: '40px 20px',
                borderRadius: '12px',
                
                // --- Background Image & Gradient Styles ---
                backgroundImage: `${featuresGradientOverlay}, url(${formBgImageUrl})`,
                backgroundAttachment: 'fixed', // Makes the image stay put while scrolling for a nice effect
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                // -----------------------------------------
            }}>
                <h2 style={{ 
                    textAlign: 'center', 
                    marginBottom: '30px', 
                    color: 'white', // Ensure heading stands out
                    textShadow: '0 0 5px rgba(0, 0, 0, 0.5)'
                }}>
=======
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
>>>>>>> Manishv2
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