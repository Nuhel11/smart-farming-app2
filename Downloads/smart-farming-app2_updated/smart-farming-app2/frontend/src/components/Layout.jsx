import React from 'react';

// NEW: Navbar accepts the click handler (onNavClick)
const Navbar = ({ isAuth, onNavClick }) => (
    <nav style={{
        backgroundColor: '#1a1a1a',
        padding: '15px 50px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderBottom: '4px solid #4CAF50'
    }}>
        <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
            🌱 SmartFarm AI
        </div>
        <div style={{ fontSize: '0.9em' }}>
            {isAuth ? (
                // When authenticated, show dashboard status
                <span style={{ color: '#bbb' }}>Dashboard Access</span>
            ) : (
                // When unauthenticated, show the clickable link to scroll to forms
                <button 
                    onClick={onNavClick} 
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'white', 
                        cursor: 'pointer',
                        fontSize: '1em',
                        fontWeight: 'bold',
                        // Add hover effect for better UX
                        transition: 'color 0.2s',
                        ':hover': { color: '#4CAF50' }
                    }}
                >
                    Login / Register
                </button>
            )}
        </div>
    </nav>
);

const Footer = () => (
    <footer style={{
        backgroundColor: '#333',
        color: '#ccc',
        textAlign: 'center',
        padding: '20px',
        fontSize: '0.8em',
        marginTop: 'auto' // Pushes footer to the bottom
    }}>
        &copy; {new Date().getFullYear()} SmartFarm AI. Precision Agriculture Solutions.
    </footer>
);

// NEW: Layout passes the click handler to Navbar
const Layout = ({ children, isAuth, onNavClick }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar isAuth={isAuth} onNavClick={onNavClick} />
            <main style={{ flexGrow: 1 }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;