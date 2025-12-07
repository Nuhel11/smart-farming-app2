import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Products = () => {
    const navigate = useNavigate();
    const [skus, setSkus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [imageIndices, setImageIndices] = useState({}); // Track current image index for each product
    const [pausedProducts, setPausedProducts] = useState(new Set()); // Track which products have paused auto-scroll

    useEffect(() => {
        fetchSKUs();
    }, []);

    const fetchSKUs = async () => {
        try {
            setLoading(true);
            setError('');
            const url = new URL('http://localhost:5000/api/skus');
            if (selectedCategory) {
                url.searchParams.append('category', selectedCategory);
            }
            if (searchTerm) {
                url.searchParams.append('search', searchTerm);
            }
            url.searchParams.append('is_active', 'true'); // Only show active products

            const response = await fetch(url.toString());
            
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.statusText}`);
            }
            
            const data = await response.json();
            const products = data.data || [];
            setSkus(products);
            
            // Initialize image indices for each product
            const initialIndices = {};
            products.forEach(sku => {
                if (sku.images && sku.images.length > 0) {
                    initialIndices[sku.sku_id] = 0;
                }
            });
            setImageIndices(initialIndices);
        } catch (err) {
            setError(err.message || 'Failed to load products. Please try again.');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSKUs();
    }, [selectedCategory, searchTerm]);

    // Auto-scroll through images for each product
    useEffect(() => {
        const intervals = {};

        skus.forEach((sku) => {
            if (sku.images && sku.images.length > 1 && !pausedProducts.has(sku.sku_id)) {
                intervals[sku.sku_id] = setInterval(() => {
                    setImageIndices((prev) => {
                        const currentIndex = prev[sku.sku_id] || 0;
                        const nextIndex = (currentIndex + 1) % sku.images.length;
                        return {
                            ...prev,
                            [sku.sku_id]: nextIndex
                        };
                    });
                }, 3000); // Change image every 3 seconds
            }
        });

        return () => {
            Object.values(intervals).forEach(interval => clearInterval(interval));
        };
    }, [skus, pausedProducts]);

    const categories = ['pesticide', 'fertilizer', 'seeds', 'tools', 'equipment', 'other'];

    const handleProductClick = (skuId) => {
        navigate(`/products/${skuId}`);
    };

    return (
        <div style={{ margin: '0 auto', padding: '40px 20px', maxWidth: '1200px', minHeight: '500px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1a1a1a' }}>
                🌾 Our Products
            </h2>

            {/* Filters */}
            <div style={{ 
                display: 'flex', 
                gap: '15px', 
                marginBottom: '30px', 
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        minWidth: '250px',
                        flexGrow: 1,
                        maxWidth: '400px'
                    }}
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        backgroundColor: 'white'
                    }}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                    ))}
                </select>
                <button
                    onClick={fetchSKUs}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c33',
                    padding: '15px',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Loading products...</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    {skus.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            backgroundColor: '#fffbe6',
                            border: '1px solid #ffe0b2',
                            borderRadius: '8px'
                        }}>
                            <p>No products found.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '25px',
                            padding: '10px'
                        }}>
                            {skus.map((sku) => (
                                <div
                                    key={sku.sku_id}
                                    onClick={() => handleProductClick(sku.sku_id)}
                                    style={{
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                    }}
                                >
                                    {/* Product Image */}
                                    {sku.images && sku.images.length > 0 ? (
                                        <div 
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                overflow: 'hidden',
                                                backgroundColor: '#f5f5f5',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={() => {
                                                if (sku.images.length > 1) {
                                                    setPausedProducts(prev => new Set([...prev, sku.sku_id]));
                                                }
                                            }}
                                            onMouseLeave={() => {
                                                if (sku.images.length > 1) {
                                                    setPausedProducts(prev => {
                                                        const newSet = new Set(prev);
                                                        newSet.delete(sku.sku_id);
                                                        return newSet;
                                                    });
                                                }
                                            }}
                                        >
                                            <img
                                                key={`${sku.sku_id}-${imageIndices[sku.sku_id] || 0}`}
                                                src={sku.images[imageIndices[sku.sku_id] || 0]}
                                                alt={sku.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'opacity 0.5s ease-in-out'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                }}
                                            />
                                            {sku.images.length > 1 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '10px',
                                                    right: '10px',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75em',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {((imageIndices[sku.sku_id] || 0) + 1)} / {sku.images.length}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '200px',
                                            backgroundColor: '#f5f5f5',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#999'
                                        }}>
                                            No Image
                                        </div>
                                    )}

                                    {/* Product Info */}
                                    <div style={{ padding: '20px' }}>
                                        <div style={{
                                            display: 'inline-block',
                                            backgroundColor: '#e8f5e9',
                                            color: '#4CAF50',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.75em',
                                            fontWeight: 'bold',
                                            marginBottom: '10px'
                                        }}>
                                            {sku.category ? sku.category.toUpperCase() : 'PRODUCT'}
                                        </div>
                                        <h3 style={{
                                            margin: '0 0 10px 0',
                                            color: '#1a1a1a',
                                            fontSize: '1.2em',
                                            fontWeight: '600'
                                        }}>
                                            {sku.title}
                                        </h3>
                                        {sku.short_description && (
                                            <p style={{
                                                margin: '0 0 15px 0',
                                                color: '#666',
                                                fontSize: '0.9em',
                                                lineHeight: '1.5',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {sku.short_description}
                                            </p>
                                        )}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: '15px',
                                            paddingTop: '15px',
                                            borderTop: '1px solid #eee'
                                        }}>
                                            <div>
                                                <div style={{
                                                    fontSize: '1.5em',
                                                    fontWeight: 'bold',
                                                    color: '#4CAF50'
                                                }}>
                                                    ${parseFloat(sku.price_usd).toFixed(2)}
                                                </div>
                                                {sku.stock_quantity !== undefined && (
                                                    <div style={{
                                                        fontSize: '0.85em',
                                                        color: sku.stock_quantity > 0 ? '#4CAF50' : '#f39c12'
                                                    }}>
                                                        {sku.stock_quantity > 0 ? `In Stock (${sku.stock_quantity})` : 'Low Stock'}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                disabled
                                                style={{
                                                    padding: '10px 20px',
                                                    backgroundColor: '#ccc',
                                                    color: '#666',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'not-allowed',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9em',
                                                    opacity: 0.6
                                                }}
                                                title="Buy Now feature coming soon"
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Products;

