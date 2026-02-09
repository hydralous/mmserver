const https = require("https");

/**
 * Get geolocation information from IP address
 * @param {string} ip - IP address
 * @returns {Promise<object|null>} - Geolocation data or null on error
 */
function getLocationFromIP(ip) {
  return new Promise((resolve, reject) => {
    // Skip if IP is localhost, unknown, or invalid
    if (!ip || ip === 'unknown' || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      resolve(null);
      return;
    }

    const url = `https://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === 'success') {
            resolve({
              country: result.country,
              countryCode: result.countryCode,
              region: result.regionName,
              city: result.city,
              zip: result.zip,
              latitude: result.lat,
              longitude: result.lon,
              timezone: result.timezone,
              isp: result.isp,
              org: result.org
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Get remote IP address from request
 * @param {object} req - Express request object
 * @returns {string} - Clean IP address
 */
function getRemoteIP(req) {
  const remoteIp = req.ip || 
                   req.connection.remoteAddress || 
                   req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                   req.socket.remoteAddress ||
                   'unknown';
  
  // Clean IP address (remove IPv6 prefix if present)
  return remoteIp.replace(/^::ffff:/, '');
}

/**
 * Process health check data
 * @param {object} systemInfo - System information from client
 * @param {string} ipAddress - Remote IP address
 * @returns {Promise<object>} - Health check data
 */
async function processHealthCheck(systemInfo, ipAddress) {
  // Get geolocation from IP address
  let remotePosition = null;
  try {
    remotePosition = await getLocationFromIP(ipAddress);
  } catch (geoError) {
    console.error("Error fetching geolocation:", geoError.message);
  }
  
  return {
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    hostname: systemInfo.hostname || 'unknown',
    username: systemInfo.username || 'unknown',
    osType: systemInfo.osType || 'unknown',
    osRelease: systemInfo.osRelease || 'unknown',
    ipAddress: ipAddress,
    remotePosition: remotePosition
  };
}

module.exports = {
  getLocationFromIP,
  getRemoteIP,
  processHealthCheck,
};

