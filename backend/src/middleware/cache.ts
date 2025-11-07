import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware to add Cache-Control and ETag headers to responses
 * @param maxAge - Cache max age in seconds (default: 300 = 5 minutes)
 * @param isPublic - Whether cache is public or private (default: true)
 */
export const setCacheHeaders = (maxAge: number = 300, isPublic: boolean = true) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only set cache headers for GET requests
    if (req.method === 'GET') {
      const cacheControl = isPublic
        ? `public, max-age=${maxAge}, must-revalidate`
        : `private, max-age=${maxAge}, must-revalidate`;
      
      res.setHeader('Cache-Control', cacheControl);
      res.setHeader('Vary', 'Accept-Encoding');
      
      // Store original json method
      const originalJson = res.json.bind(res);
      
      // Override json method to add ETag
      res.json = function (body: any) {
        const bodyString = JSON.stringify(body);
        const etag = crypto.createHash('md5').update(bodyString).digest('hex');
        
        // Check if client has matching ETag (304 Not Modified)
        const clientEtag = req.headers['if-none-match'];
        if (clientEtag === `"${etag}"`) {
          res.status(304);
          return res.end();
        }
        
        // Set ETag header
        res.setHeader('ETag', `"${etag}"`);
        
        // Call original json method
        return originalJson(body);
      };
    }
    
    next();
  };
};

/**
 * Middleware for static data that changes infrequently (e.g., filter options)
 */
export const staticCache = setCacheHeaders(3600, true); // 1 hour

/**
 * Middleware for dynamic data that changes frequently (e.g., car listings)
 */
export const dynamicCache = setCacheHeaders(60, true); // 1 minute

/**
 * Middleware for user-specific data (private cache)
 */
export const privateCache = setCacheHeaders(60, false); // 1 minute, private

