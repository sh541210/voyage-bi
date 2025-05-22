import React from 'react';
// @ts-ignore
import * as Babel from '@babel/standalone';
import { MyIcon } from '@/components/base/MyIcon';
import classNames from 'classnames';
import { renderErrorPrint } from '@/utils/render';
import { ErrorBoundary } from '@/components/base/ErrorBoundary';
import ReactDOM from 'react-dom';

// 添加插件，处理模块化导入
// Babel.registerPlugin('transform-modules-commonjs',
//  require('@babel/plugin-transform-modules-commonjs'));

export const executeDynamicCode = (name: string, code: string, args: Record<string, any>) => {
    let transformedCode
    try {
        // 1. 使用 Babel 转换 JSX 代码
        transformedCode = Babel.transform(code, {
            presets: ['react', 'env'], // ✅ 解析 JSX + ES6
            // plugins: ['transform-modules-commonjs'],
        }).code;
    } catch (error) {
        return { success: false, error: renderErrorPrint(error) };
    }
    try {
        // 2. 使用 new Function 执行转换后的代码
        const func = new Function('React', 'ReactDOM', 'MyIcon', 'classNames', 'args',
            `${transformedCode}; return ${name};`);
        return { success: true, com: func(React, ReactDOM, MyIcon, classNames, args) } // ✅ 返回动态组件
    } catch (error) {
        return { success: false, error: renderErrorPrint(error) }
    }
};

interface DynamicRendererProps {
    name: string
    code: string;
    args: Record<string, any>;
}

const DynamicRenderer: React.FC<DynamicRendererProps> = ({ name, code, args }) => {
    const { success, com: DynamicComponent, error } = executeDynamicCode(name, code, args);
    return success ? <ErrorBoundary title='组件渲染出错'>
        <DynamicComponent args={args} />
    </ErrorBoundary> : error;
};

export default DynamicRenderer;