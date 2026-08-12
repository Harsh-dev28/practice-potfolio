/**
 * Cloudinary Delivery URL Optimization Utilities (Backend / CommonJS)
 * 
 * Automatically applies quality compression (q_auto/q_70), modern formats (f_auto),
 * and dimensions to Cloudinary delivery URLs without altering original stored files.
 */

/**
 * Optimizes a Cloudinary image delivery URL.
 * 
 * @param {string} url - Original Cloudinary image URL
 * @param {Object} [options] - Optimization parameters
 * @param {string|number} [options.quality='auto'] - Quality level ('auto', 70, '70', 'auto:good', 'auto:eco')
 * @param {string} [options.format='auto'] - Delivery format ('auto', 'webp', 'avif')
 * @param {number|string} [options.width] - Maximum width constraint
 * @param {number|string} [options.height] - Maximum height constraint
 * @param {string} [options.crop] - Crop mode ('limit', 'fill', 'scale')
 * @param {string|number} [options.dpr] - Device pixel ratio
 * @returns {string} - Transformed delivery URL
 */
const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url;

  const cleanUrl = url.trim();
  if (!cleanUrl.includes('res.cloudinary.com')) {
    return cleanUrl;
  }

  const secureUrl = cleanUrl.replace(/^http:\/\//i, 'https://');

  const {
    quality = 'auto',
    format = 'auto',
    width,
    height,
    crop = (width || height) ? 'limit' : undefined,
    dpr
  } = options;

  const transforms = [];

  if (quality !== undefined && quality !== null && quality !== '') {
    const qStr = String(quality).trim();
    const qVal = qStr.startsWith('q_') ? qStr : `q_${qStr}`;
    transforms.push(qVal);
  }

  if (format !== undefined && format !== null && format !== '') {
    const fStr = String(format).trim();
    const fVal = fStr.startsWith('f_') ? fStr : `f_${fStr}`;
    transforms.push(fVal);
  }

  if (width) {
    const wVal = String(width).replace(/^w_/, '');
    transforms.push(`w_${wVal}`);
  }

  if (height) {
    const hVal = String(height).replace(/^h_/, '');
    transforms.push(`h_${hVal}`);
  }

  if (crop) {
    const cVal = String(crop).replace(/^c_/, '');
    transforms.push(`c_${cVal}`);
  }

  if (dpr) {
    const dVal = String(dpr).replace(/^dpr_/, '');
    transforms.push(`dpr_${dVal}`);
  }

  const transformString = transforms.join(',');
  if (!transformString) {
    return secureUrl;
  }

  const uploadIndex = secureUrl.indexOf('/upload/');
  if (uploadIndex === -1) {
    return secureUrl;
  }

  const beforeUpload = secureUrl.substring(0, uploadIndex + 8);
  const afterUpload = secureUrl.substring(uploadIndex + 8);

  const slashIndex = afterUpload.indexOf('/');
  if (slashIndex !== -1) {
    const firstSegment = afterUpload.substring(0, slashIndex);

    if (/^v\d+$/.test(firstSegment)) {
      return `${beforeUpload}${transformString}/${afterUpload}`;
    }

    if (/^(?=.*[qfwhcd]_|[a-z]_[a-z0-9]|,)/i.test(firstSegment)) {
      const existingParts = firstSegment.split(',').filter(part => {
        if (quality && part.startsWith('q_')) return false;
        if (format && part.startsWith('f_')) return false;
        if (width && part.startsWith('w_')) return false;
        if (height && part.startsWith('h_')) return false;
        if (crop && part.startsWith('c_')) return false;
        if (dpr && part.startsWith('dpr_')) return false;
        return true;
      });

      const merged = [transformString, ...existingParts].filter(Boolean).join(',');
      const remainingPath = afterUpload.substring(slashIndex + 1);
      return `${beforeUpload}${merged}/${remainingPath}`;
    }
  }

  return `${beforeUpload}${transformString}/${afterUpload}`;
};

const getOptimizedImageUrl = (url, options = {}) => optimizeCloudinaryUrl(url, options);

module.exports = {
  optimizeCloudinaryUrl,
  getOptimizedImageUrl
};
