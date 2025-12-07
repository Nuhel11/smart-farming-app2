import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductDetail = () => {
    const { skuId } = useParams();
    const navigate = useNavigate();
    const [sku, setSku] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        fetchSKUDetail();
    }, [skuId]);

    // Auto-scroll through images
    useEffect(() => {
        if (!sku || !sku.images || sku.images.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setSelectedImageIndex((prevIndex) => {
                const images = sku.images || [];
                return (prevIndex + 1) % images.length;
            });
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, [sku, isPaused]);

    const fetchSKUDetail = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`http://localhost:5000/api/skus/${skuId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch product: ${response.statusText}`);
            }
            
            const data = await response.json();
            setSku(data.data);
            setSelectedImageIndex(0); // Reset to first image when SKU changes
            setIsPaused(false); // Reset pause state
        } catch (err) {
            setError(err.message || 'Failed to load product. Please try again.');
            console.error('Error fetching product detail:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p>Loading product details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{
                    backgroundColor: '#fee',
                    color: '#c33',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'inline-block'
                }}>
                    {error}
                </div>
                <button
                    onClick={() => navigate('/products')}
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
                    Back to Products
                </button>
            </div>
        );
    }

    if (!sku) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p>Product not found.</p>
                <button
                    onClick={() => navigate('/products')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginTop: '20px'
                    }}
                >
                    Back to Products
                </button>
            </div>
        );
    }

    const images = sku.images || [];

    return (
        <div style={{ margin: '0 auto', padding: '40px 20px', maxWidth: '1200px' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate('/products')}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '30px',
                    fontSize: '0.9em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                ← Back to Products
            </button>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '40px',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '40px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}>
                {/* Left Column - Images */}
                <div>
                    {images.length > 0 ? (
                        <>
                            {/* Main Image */}
                            <div 
                                style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    marginBottom: '20px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    backgroundColor: '#f5f5f5',
                                    border: '1px solid #eee',
                                    position: 'relative'
                                }}
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                            >
                                <img
                                    key={selectedImageIndex}
                                    src={images[selectedImageIndex]}
                                    alt={sku.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'opacity 0.5s ease-in-out',
                                        animation: 'fadeIn 0.5s'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
                                    }}
                                />
                                {images.length > 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        color: 'white',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.85em',
                                        fontWeight: 'bold'
                                    }}>
                                        {selectedImageIndex + 1} / {images.length}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {images.length > 1 && (
                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    flexWrap: 'wrap'
                                }}>
                                    {images.map((image, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                setSelectedImageIndex(index);
                                                setIsPaused(true);
                                                setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
                                            }}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '6px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: selectedImageIndex === index ? '3px solid #4CAF50' : '2px solid #ddd',
                                                opacity: selectedImageIndex === index ? 1 : 0.7,
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedImageIndex !== index) {
                                                    e.currentTarget.style.opacity = '1';
                                                    e.currentTarget.style.borderColor = '#4CAF50';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedImageIndex !== index) {
                                                    e.currentTarget.style.opacity = '0.7';
                                                    e.currentTarget.style.borderColor = '#ddd';
                                                }
                                            }}
                                        >
                                            <img
                                                src={image}
                                                alt={`${sku.title} ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{
                            width: '100%',
                            aspectRatio: '1',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            border: '1px solid #eee'
                        }}>
                            No Image Available
                        </div>
                    )}
                </div>

                {/* Right Column - Product Info */}
                <div>
                    {/* Category Badge */}
                    {sku.category && (
                        <div style={{
                            display: 'inline-block',
                            backgroundColor: '#e8f5e9',
                            color: '#4CAF50',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.85em',
                            fontWeight: 'bold',
                            marginBottom: '15px'
                        }}>
                            {sku.category.toUpperCase()}
                        </div>
                    )}

                    {/* Title */}
                    <h1 style={{
                        margin: '0 0 15px 0',
                        color: '#1a1a1a',
                        fontSize: '2em',
                        fontWeight: '600'
                    }}>
                        {sku.title}
                    </h1>

                    {/* SKU Code */}
                    {sku.sku_code && (
                        <p style={{
                            margin: '0 0 20px 0',
                            color: '#666',
                            fontSize: '0.9em'
                        }}>
                            SKU: {sku.sku_code}
                        </p>
                    )}

                    {/* Price */}
                    <div style={{
                        marginBottom: '30px',
                        paddingBottom: '20px',
                        borderBottom: '2px solid #eee'
                    }}>
                        <div style={{
                            fontSize: '2.5em',
                            fontWeight: 'bold',
                            color: '#4CAF50',
                            marginBottom: '10px'
                        }}>
                            ${parseFloat(sku.price_usd).toFixed(2)}
                        </div>
                        {sku.stock_quantity !== undefined && (
                            <div style={{
                                fontSize: '1em',
                                color: sku.stock_quantity > 0 ? '#4CAF50' : '#f39c12',
                                fontWeight: '500'
                            }}>
                                {sku.stock_quantity > 0 
                                    ? `✓ In Stock (${sku.stock_quantity} available)`
                                    : '⚠ Low Stock'
                                }
                            </div>
                        )}
                    </div>

                    {/* Short Description */}
                    {sku.short_description && (
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{
                                margin: '0 0 10px 0',
                                color: '#333',
                                fontSize: '1.2em',
                                fontWeight: '600'
                            }}>
                                Overview
                            </h3>
                            <p style={{
                                margin: 0,
                                color: '#666',
                                lineHeight: '1.6',
                                fontSize: '1em'
                            }}>
                                {sku.short_description}
                            </p>
                        </div>
                    )}

                    {/* Long Description */}
                    {sku.long_description && (
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{
                                margin: '0 0 10px 0',
                                color: '#333',
                                fontSize: '1.2em',
                                fontWeight: '600'
                            }}>
                                Description
                            </h3>
                            <p style={{
                                margin: 0,
                                color: '#666',
                                lineHeight: '1.8',
                                fontSize: '1em',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {sku.long_description}
                            </p>
                        </div>
                    )}

                    {/* Buy Now Button */}
                    <button
                        disabled
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            backgroundColor: '#ccc',
                            color: '#666',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'not-allowed',
                            fontWeight: 'bold',
                            fontSize: '1.1em',
                            opacity: 0.6,
                            marginTop: '20px'
                        }}
                        title="Buy Now feature coming soon"
                    >
                        Buy Now
                    </button>

                    {/* Product Info Footer */}
                    <div style={{
                        marginTop: '30px',
                        paddingTop: '20px',
                        borderTop: '1px solid #eee',
                        fontSize: '0.85em',
                        color: '#999'
                    }}>
                        <p style={{ margin: '5px 0' }}>
                            Product ID: {sku.sku_id}
                        </p>
                        {sku.created_at && (
                            <p style={{ margin: '5px 0' }}>
                                Added: {new Date(sku.created_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;

