import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Middleware function to verify JWT
const protect = (req, res, next) => {
    let token;

    // 1. Check if token exists in the Authorization header (Format: "Bearer TOKEN")
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (removes "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Attach decoded user info to the request object
            req.user = decoded; 
            
            // Proceed to the next middleware or route handler
            next();

        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

export default protect;