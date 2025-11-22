import React, { useMemo } from 'react';
// Import necessary components from react-leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// IMPORTANT: Import the Leaflet CSS file
import 'leaflet/dist/leaflet.css'; 

// Custom icon fix needed for react-leaflet in some environments
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: shadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;


/**
 * FieldMap Component: Displays farmer's fields on an interactive map.
 * @param {Array} fields - Array of field objects (must contain latitude and longitude).
 */
const FieldMap = ({ fields }) => {

    // 1. Calculate the initial center point of the map
    const mapCenter = useMemo(() => {
        if (!fields || fields.length === 0) {
            // Default center if no fields are registered (e.g., center of the USA)
            return [39.8283, -98.5795]; 
        }

        // Calculate average latitude and longitude to center the map
        const totalLat = fields.reduce((sum, f) => sum + parseFloat(f.latitude), 0);
        const totalLon = fields.reduce((sum, f) => sum + parseFloat(f.longitude), 0);
        
        return [
            totalLat / fields.length,
            totalLon / fields.length
        ];
    }, [fields]);

    if (!fields || fields.length === 0) {
        return (
            <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                <p>No field data available to display on the map yet.</p>
            </div>
        );
    }
    
    // Zoom level 10 is usually a good starting point for local area
    const initialZoom = fields.length === 1 ? 13 : 10; 

    return (
        <div style={{ marginBottom: '30px', borderRadius: '8px', overflow: 'hidden' }}>
            <h3 style={{ marginBottom: '10px' }}>Field Map View</h3>
            <MapContainer 
                center={mapCenter} 
                zoom={initialZoom} 
                style={{ height: '400px', width: '100%' }}
                scrollWheelZoom={false}
            >
                {/* Tile Layer (The actual map images) */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Markers for each field */}
                {fields.map(field => (
                    <Marker 
                        key={field.field_id} 
                        position={[parseFloat(field.latitude), parseFloat(field.longitude)]}
                    >
                        <Popup>
                            <strong>{field.field_name}</strong>
                            <br />
                            Soil pH: {field.ph_level}
                            <br />
                            Last Test: {new Date(field.test_date).toLocaleDateString()}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default FieldMap;