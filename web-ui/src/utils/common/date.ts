// date.ts

/**
 * 将时间戳转换为指定格式的日期字符串
 * @param {number} timestamp - 时间戳，单位为毫秒
 * @param {string} format - 日期格式字符串，如 'yyyy-MM-dd HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
/**
 * 将时间戳格式化为指定的日期字符串
 * @param timestamp - 要格式化的时间戳
 * @param format - 日期格式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatTimestamp = (timestamp: number, format: string = 'YYYY-MM-dd HH:mm:ss'): string => {
    const date = new Date(timestamp);

    // 年、月、日
    const year = String(date.getFullYear());
    const shortYear = year.slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 时、分、秒
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
        .replace(/YYYY/g, year)        // 完整年份
        .replace(/YY/g, shortYear)     // 两位年份
        .replace(/Y/g, year)           // 年份（可变长度）
        .replace(/MM/g, month)         // 两位月份
        .replace(/M/g, String(date.getMonth() + 1)) // 月份（可变长度）
        .replace(/dd/g, day)           // 两位日期
        .replace(/d/g, String(date.getDate()))      // 日期（可变长度）
        .replace(/HH/g, hours)         // 两位小时
        .replace(/H/g, String(date.getHours()))     // 小时（可变长度）
        .replace(/mm/g, minutes)       // 两位分钟
        .replace(/m/g, String(date.getMinutes()))   // 分钟（可变长度）
        .replace(/ss/g, seconds)       // 两位秒
        .replace(/s/g, String(date.getSeconds()));  // 秒（可变长度）
};

export const formatDateTime = (timestamp: number) => formatTimestamp(timestamp, 'YYYY-MM-dd HH:mm:ss')
export const formatDateTime2 = (timestamp: number) => formatTimestamp(timestamp, 'YYYYMMddHHmmss')
export const formatDate = (timestamp: number) => formatTimestamp(timestamp, 'YYYY-MM-dd')