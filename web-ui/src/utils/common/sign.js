const crypto = require('crypto');

class SignUtils {

    /**
     * 生成签名头信息
     * @param {string} secretKey - 密钥
     * @param {string} keyId - 密钥标识符
     * @param {string} method - HTTP方法（如 'GET', 'POST'）
     * @param {string} path - 请求路径（如 '/api/data'）
     * @param {any} body - 请求体对象
     * @returns {Object} 包含签名头的对象
     */
    static generateHeaders(secretKey, keyId, method, path, body) {
        // 1. 生成秒级时间戳
        const timestamp = Math.floor(Date.now() / 1000).toString();

        // 2. 计算请求体摘要
        const digest = this._computeDigest(body);

        // 3. 构建签名字符串
        const signingData = this._buildSigningData(method, path, timestamp, digest);

        // 4. 计算HMAC签名
        const signature = this._computeHmac(secretKey, signingData);

        // 5. 构造请求头
        return {
            'Content-type': 'application/json',
            'Timestamp': timestamp,
            'Digest': `sha-256=${digest}`,
            'Signature': `keyId="${keyId}", algorithm="hmac-sha256", signature="${signature}"`
        };
    }

    /**
     * 计算请求体的SHA-256摘要
     */
    static _computeDigest(body) {
        const jsonBody = JSON.stringify(body || null);
        return crypto.createHash('sha256')
            .update(jsonBody)
            .digest('base64');
    }

    /**
     * 构建签名字符串（键名按字母顺序排序）
     */
    static _buildSigningData(method, path, timestamp, digest) {
        const params = {
            method: method.toUpperCase(),
            path: path,
            timestamp: timestamp,
            digest: `sha-256=${digest}`
        };
        return Object.keys(params)
            .sort()
            .map(key => `${key}=${params[key]}`)
            .join('&');
    }

    /**
     * 计算HMAC-SHA256签名
     */
    static _computeHmac(secretKey, data) {
        return crypto.createHmac('sha256', secretKey)
            .update(data)
            .digest('base64');
    }
}

module.exports = SignUtils;