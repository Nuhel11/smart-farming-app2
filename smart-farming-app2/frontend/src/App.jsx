import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import FieldDataForm from './components/FieldDataForm'; 
import Layout from './components/Layout'; 
import HomeContent from './components/HomeContent'; 
import Chatbot from './components/Chatbot';
import FieldMap from './components/FieldMap'; 
import Products from './components/Products';
import ProductDetail from './components/ProductDetail'; 

// --- Field Item Component (Handles all field-specific actions) ---
const FieldItem = ({ field, authToken }) => {
    // Crop Recommendation States
    const [cropRecommendation, setCropRecommendation] = useState(null);
    const [isCropRecLoading, setIsCropRecLoading] = useState(false);
    const [cropRecMessage, setCropRecMessage] = useState('');

    // Nutrition Recommendation States
    const [nutritionRecommendation, setNutritionRecommendation] = useState(null);
    const [isNutrRecLoading, setIsNutrRecLoading] = useState(false);
    const [nutrRecMessage, setNutrRecMessage] = useState('');


    // --- 1. Handle Crop Recommendation (ML/Weather/Soil) ---
    const handleGetCropRecommendation = async () => {
        setIsCropRecLoading(true);
        setCropRecMessage('');
        setCropRecommendation(null);
        setNutritionRecommendation(null); 

        try {
            const response = await fetch(`http://localhost:5000/api/recommendation/crop/${field.field_id}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            const data = await response.json();

            if (response.ok) {
                setCropRecommendation(data);
                setCropRecMessage(`Crop recommendation successful.`);
            } else {
                setCropRecMessage(data.message || 'Failed to get crop recommendation.');
            }
        } catch (error) {
            console.error('Crop Rec Network Error:', error);
            setCropRecMessage('Network error or server unreachable.');
        } finally {
            setIsCropRecLoading(false);
        }
    };
    
    // --- 2. Handle Nutrition Recommendation (Rule-Based/Soil/Crop) ---
    const handleGetNutritionRecommendation = async (cropName) => {
        setIsNutrRecLoading(true);
        setNutrRecMessage('');
        setNutritionRecommendation(null);

        if (!cropName) {
            setNutrRecMessage('Please select a crop or run the crop recommendation first.');
            setIsNutrRecLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/recommendation/nutrition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    fieldId: field.field_id,
                    cropName: cropName
                })
            });

            const data = await response.json();

            if (response.ok) {
                setNutritionRecommendation(data);
                setNutrRecMessage('Nutrient recommendation generated.');
            } else {
                setNutrRecMessage(data.message || 'Failed to get nutrient recommendation.');
            }
        } catch (error) {
            console.error('Nutrition Rec Network Error:', error);
            setNutrRecMessage('Network error or server unreachable.');
        } finally {
            setIsNutrRecLoading(false);
        }
    };


    return (
        <div style={{ 
            padding: '15px', 
            border: '1px solid #e0e0e0', 
            borderRadius: '5px', 
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'left'
        }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>{field.field_name}</h4>
            <p style={{ margin: '5px 0', fontSize: '0.85em', color: '#555' }}>
                <span style={{ fontWeight: 'bold' }}>Soil:</span> N:{field.nitrogen_ppm} / P:{field.phosphorus_ppm || '--'} / K:{field.potassium_ppm || '--'} (pH: {field.ph_level})
            </p>
            <p style={{ margin: '5px 0 15px 0', fontSize: '0.85em', color: '#555' }}>
                Location: {field.latitude}, {field.longitude} | Last Test: {new Date(field.test_date).toLocaleDateString()}
            </p>

            {/* --- Buttons --- */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button 
                    onClick={handleGetCropRecommendation}
                    disabled={isCropRecLoading}
                    style={{ 
                        flexGrow: 1,
                        background: isCropRecLoading ? '#ccc' : '#27ae60', 
                        color: 'white', 
                        padding: '8px', 
                        border: 'none', 
                        borderRadius: '3px', 
                        cursor: 'pointer' 
                    }}
                >
                    {isCropRecLoading ? 'Predicting Crop...' : '1. Get Crop Rec'}
                </button>

                <button 
                    onClick={() => handleGetNutritionRecommendation(cropRecommendation?.recommended_crop || 'Wheat')} 
                    disabled={isNutrRecLoading || !cropRecommendation}
                    style={{ 
                        flexGrow: 1,
                        background: isNutrRecLoading ? '#ccc' : '#f39c12', 
                        color: 'white', 
                        padding: '8px', 
                        border: 'none', 
                        borderRadius: '3px', 
                        cursor: 'pointer' 
                    }}
                >
                    {isNutrRecLoading ? 'Analyzing Nutrients...' : '2. Get Nutrition Rec'}
                </button>
            </div>
            {cropRecMessage && <p style={{ fontSize: '0.9em', color: cropRecommendation ? 'green' : 'red', margin: '0 0 10px 0' }}>{cropRecMessage}</p>}


            {/* --- Recommendation Display --- */}
            {cropRecommendation && (
                <div style={{ borderTop: '1px dashed #ccc', paddingTop: '10px' }}>
                    <p style={{ fontWeight: 'bold', color: '#27ae60', margin: '0 0 5px 0' }}>
                        Crop Rec: {cropRecommendation.recommended_crop}
                    </p>
                    <p style={{ fontSize: '0.8em', margin: 0, color: '#555' }}>
                        Input Temp: {cropRecommendation.input_data.Temp}°C | Confidence: {(cropRecommendation.confidence * 100).toFixed(0)}%
                    </p>
                </div>
            )}

            {nutritionRecommendation && (
                <div style={{ borderTop: '1px dashed #ccc', paddingTop: '10px', marginTop: '10px' }}>
                    <p style={{ fontWeight: 'bold', color: '#f39c12', margin: '0 0 5px 0' }}>
                        Nutrient Rec:
                    </p>
                    <p style={{ fontSize: '0.8em', margin: 0, whiteSpace: 'pre-wrap', color: '#555' }}>
                         {nutritionRecommendation.message}
                    </p>
                </div>
            )}
        </div>
    );
};


// --- Dashboard Component (The Protected Main Area) ---
const Dashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { skuId } = useParams();
    const isProductDetail = !!skuId || location.pathname.includes('/products/');
    const isProductsPage = location.pathname.includes('/products');
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    const [showChatbot, setShowChatbot] = useState(false); 
    const [activeTab, setActiveTab] = useState(isProductsPage || isProductDetail ? 'products' : 'dashboard');
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    // Update activeTab when location changes
    useEffect(() => {
        if (isProductsPage || isProductDetail) {
            setActiveTab('products');
        } else {
            setActiveTab('dashboard');
        }
    }, [location.pathname, isProductsPage, isProductDetail]); 

    // Fetches the user's field list from the protected API endpoint
    const fetchFields = async () => {
        setIsLoading(true);
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/farm/fields', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                setFields(data.fields || []);
            } else if (response.status === 401) {
                onLogout(); 
            }
        } catch (error) {
            console.error("Failed to load fields:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFields();
        fetchFeaturedProducts();
    }, [user, refreshTrigger]);

    // Fetch featured products for advertisement
    const fetchFeaturedProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/skus?is_active=true');
            if (response.ok) {
                const data = await response.json();
                // Limit to first 5 products for the carousel
                const products = data.data || [];
                setFeaturedProducts(products.slice(0, 5));
            }
        } catch (error) {
            console.error("Failed to load featured products:", error);
        }
    };

    // Auto-scroll through advertisement products
    useEffect(() => {
        if (featuredProducts.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentAdIndex((prevIndex) => (prevIndex + 1) % featuredProducts.length);
        }, 5000); // Change ad every 5 seconds

        return () => clearInterval(interval);
    }, [featuredProducts]);

    // Handler to refresh the field list after a successful new data submission
    const handleDataSubmit = () => {
        setRefreshTrigger(prev => prev + 1); 
    };

    return (
        <div style={{ margin: '0 auto', padding: '40px 20px', maxWidth: '1400px', minHeight: '500px', textAlign: 'center' }}>
            <h2>Welcome, {user.username}! 🌿</h2>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '30px',
                borderBottom: '2px solid #eee',
                paddingBottom: '10px'
            }}>
                <button
                    onClick={() => {
                        setActiveTab('dashboard');
                        navigate('/dashboard');
                    }}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: activeTab === 'dashboard' ? '#4CAF50' : 'transparent',
                        color: activeTab === 'dashboard' ? 'white' : '#4CAF50',
                        border: '2px solid #4CAF50',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1em',
                        transition: 'all 0.3s'
                    }}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => {
                        setActiveTab('products');
                        navigate('/products');
                    }}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: activeTab === 'products' ? '#4CAF50' : 'transparent',
                        color: activeTab === 'products' ? 'white' : '#4CAF50',
                        border: '2px solid #4CAF50',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1em',
                        transition: 'all 0.3s'
                    }}
                >
                    Products
                </button>
            </div>

            {/* Tab Content */}
            <Routes>
                <Route path="products/:skuId" element={<ProductDetail />} />
                <Route path="products" element={<Products />} />
                <Route path="*" element={
                <>
                    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                        {/* Main Content Area */}
                        <div style={{ flex: '1', minWidth: 0 }}>
            <p>Ready to manage your fields and get crop and nutrient recommendations.</p>

            {/* --- Chatbot Toggle --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px 0', borderBottom: '1px solid #ddd' }}>
                 <p style={{margin: 0, fontSize: '1.1em', fontWeight: 'bold'}}>Field Management</p>
                <button 
                    onClick={() => setShowChatbot(!showChatbot)} 
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: showChatbot ? '#e67e22' : '#3498db', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {showChatbot ? 'Close AgroBot' : 'Open AgroBot Chat'}
                </button>
            </div>

            {/* --- Chatbot Render Area --- */}
            {showChatbot && <Chatbot />}

            {/* --- Map Integration --- */}
            {!isLoading && <FieldMap fields={fields} />} 
            
            <FieldDataForm onDataSubmit={handleDataSubmit} />

            <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px', textAlign: 'left' }}>
                <h3>Your Registered Fields ({fields.length})</h3>
                {isLoading ? (
                    <p>Loading your field data...</p>
                ) : fields.length === 0 ? (
                    <p style={{padding: '20px', backgroundColor: '#fffbe6', border: '1px solid #ffe0b2', borderRadius: '5px'}}>
                        You have no fields registered yet. Please use the form above to add your first plot.
                    </p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '10px' }}>
                        {fields.map(field => (
                            <FieldItem key={field.field_id} field={field} authToken={localStorage.getItem('authToken')} />
                        ))}
                    </div>
                )}
            </div>
                        </div>

                        {/* Product Advertisement Sidebar */}
                        {featuredProducts.length > 0 && (
                            <div style={{
                                width: '320px',
                                flexShrink: 0,
                                position: 'sticky',
                                top: '20px'
                            }}>
                                <div style={{
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    backgroundColor: 'white',
                                    position: 'relative'
                                }}>
                                    {/* Sidebar Header */}
                                    <div style={{
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        padding: '15px 20px',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        fontSize: '1.1em'
                                    }}>
                                        Featured Products
                                    </div>

                                    {/* Product Carousel */}
                                    <div style={{
                                        overflow: 'hidden',
                                        position: 'relative',
                                        height: '500px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: `${featuredProducts.length * 100}%`,
                                            transform: `translateY(-${currentAdIndex * (100 / featuredProducts.length)}%)`,
                                            transition: 'transform 0.6s ease-in-out'
                                        }}>
                                            {featuredProducts.map((product, index) => (
                                                <div
                                                    key={product.sku_id}
                                                    onClick={() => navigate(`/products/${product.sku_id}`)}
                                                    style={{
                                                        height: `${100 / featuredProducts.length}%`,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        padding: '20px',
                                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                                                        cursor: 'pointer',
                                                        borderBottom: index < featuredProducts.length - 1 ? '1px solid #eee' : 'none',
                                                        transition: 'background-color 0.3s'
                                                    }}
                                                    onMouseEnter={() => setCurrentAdIndex(index)}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
                                                    }}
                                                >
                                                    {/* Product Image */}
                                                    <div style={{
                                                        width: '100%',
                                                        height: '180px',
                                                        borderRadius: '8px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                                                        backgroundColor: '#f5f5f5',
                                                        marginBottom: '15px'
                                                    }}>
                                                        {product.images && product.images.length > 0 ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.title}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.src = 'https://via.placeholder.com/280x180?text=No+Image';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#999'
                                                            }}>
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Category Badge */}
                                                    <div style={{
                                                        display: 'inline-block',
                                                        backgroundColor: '#4CAF50',
                                                        color: 'white',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75em',
                                                        fontWeight: 'bold',
                                                        marginBottom: '10px',
                                                        alignSelf: 'flex-start'
                                                    }}>
                                                        {product.category ? product.category.toUpperCase() : 'FEATURED'}
                                                    </div>

                                                    {/* Product Title */}
                                                    <h4 style={{
                                                        margin: '0 0 8px 0',
                                                        fontSize: '1.1em',
                                                        fontWeight: 'bold',
                                                        color: '#1a1a1a',
                                                        lineHeight: '1.3',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {product.title}
                                                    </h4>

                                                    {/* Short Description */}
                                                    {product.short_description && (
                                                        <p style={{
                                                            margin: '0 0 12px 0',
                                                            fontSize: '0.85em',
                                                            color: '#666',
                                                            lineHeight: '1.5',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {product.short_description}
                                                        </p>
                                                    )}

                                                    {/* Price */}
                                                    <div style={{
                                                        fontSize: '1.5em',
                                                        fontWeight: 'bold',
                                                        color: '#4CAF50',
                                                        marginBottom: '8px'
                                                    }}>
                                                        ${parseFloat(product.price_usd).toFixed(2)}
                                                    </div>

                                                    {/* Stock Status */}
                                                    <div style={{
                                                        fontSize: '0.8em',
                                                        color: product.stock_quantity > 0 ? '#4CAF50' : '#f39c12',
                                                        marginBottom: '12px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {product.stock_quantity > 0 ? '✓ In Stock' : '⚠ Check Availability'}
                                                    </div>

                                                    {/* View Details Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/products/${product.sku_id}`);
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px',
                                                            backgroundColor: '#4CAF50',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            fontSize: '0.9em',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#45a049';
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#4CAF50';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        View Details →
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sidebar Indicators */}
                                    {featuredProducts.length > 1 && (
                                        <div style={{
                                            padding: '12px',
                                            backgroundColor: '#f9f9f9',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            borderTop: '1px solid #eee'
                                        }}>
                                            {featuredProducts.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentAdIndex(index)}
                                                    style={{
                                                        width: index === currentAdIndex ? '24px' : '8px',
                                                        height: '8px',
                                                        borderRadius: '4px',
                                                        border: 'none',
                                                        backgroundColor: index === currentAdIndex ? '#4CAF50' : '#ddd',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s',
                                                        padding: 0
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
                } />
            </Routes>

            {/* Logout Button */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button 
                onClick={onLogout}
                    style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Logout
            </button>
            </div>
        </div>
    );
};

// --- App Component (Root of the application) ---
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState({});
    const [isRegistering, setIsRegistering] = useState(false); 
    
    // NEW: Ref to target the form container
    const formContainerRef = useRef(null); 

    // NEW: Function to scroll the forms into view
    const handleScrollToForms = () => {
        if (formContainerRef.current) {
            formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // 1. Check for token on initial load (session persistence)
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
        }
    }, []);

    // 2. Login Handler: Updates state when LoginForm succeeds
    const handleLoginSuccess = (token, username, role) => {
        setIsAuthenticated(true);
        setUser({ username, role });
    };

    // 3. Logout Handler: Clears local storage and state
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser({});
        setIsRegistering(false); 
    };
    
    // Main render logic switches between the Layout (unauthenticated) and the Dashboard (authenticated)
    return (
        <Router>
        <div className="App" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f7f7f7' }}>
            {isAuthenticated ? (
                <Layout isAuth={true}>
                        <Routes>
                            <Route path="*" element={
                    <Dashboard 
                        user={user} 
                        onLogout={handleLogout} 
                    />
                            } />
                        </Routes>
                </Layout>
            ) : (
                // Pass the scroll handler to the Layout component
                <Layout isAuth={false} onNavClick={handleScrollToForms}> 
                    <HomeContent /> 
                    {/* Attach the ref to the form container */}
                    <div ref={formContainerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#f0f0f0' }}>
                        <div style={{ width: '100%', maxWidth: '450px', marginBottom: '20px' }}>
                            {isRegistering ? (
                                <RegistrationForm />
                            ) : (
                                <LoginForm onLoginSuccess={handleLoginSuccess} />
                            )}
                        </div>
                        <p style={{ marginTop: '10px' }}>
                            {isRegistering ? "Already have an account? " : "Don't have an account? "}
                            <button 
                                onClick={() => setIsRegistering(!isRegistering)}
                                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
                            >
                                {isRegistering ? "Login here" : "Register here"}
                            </button>
                        </p>
                    </div>
                </Layout>
            )}
        </div>
        </Router>
    );
}

export default App;