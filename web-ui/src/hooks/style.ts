import { useEffect, useState } from "react";
import less from 'less'

export const useCSS = (initial = '') => {
    const [cssText, setCssText] = useState(initial);

    useEffect(() => {
        // 当 initial 变化时，更新 cssText
        setCssText(initial);
    }, [initial]);

    useEffect(() => {
        if (!cssText) {
            return;
        }

        // 创建一个新的 <style> 元素
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.appendChild(document.createTextNode(cssText));

        // 将 <style> 元素添加到 <head> 中
        document.head.appendChild(styleElement);

        // 清理函数，用于组件卸载时移除注入的样式
        return () => {
            document.head.removeChild(styleElement);
        };
    }, [cssText]); // 当 cssText 变化时重新执行

    return { setCssText };
};

export const useLess = (initial = '') => {
    const [lessText, setLessText] = useState(initial);

    useEffect(() => {
        // 当 initial 变化时，更新 lessText
        setLessText(initial);
    }, [initial]);

    useEffect(() => {
        if (!lessText) {
            return;
        }

        // 创建一个新的 <style> 元素
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';

        // 使用 less.js 编译 lessText
        less.render(lessText)
            .then(output => {
                styleElement.appendChild(document.createTextNode(output.css));
                // 将 <style> 元素添加到 <head> 中
                document.head.appendChild(styleElement);
            })
            .catch(error => {
                console.error('Less compilation error:', error);
            });

        // 清理函数，用于组件卸载时移除注入的样式
        return () => {
            if (styleElement.parentNode) {
                document.head.removeChild(styleElement);
            }
        };
    }, [lessText]); // 当 lessText 变化时重新执行

    return { setLessText };
};