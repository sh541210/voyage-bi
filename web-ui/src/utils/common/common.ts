import { DefaultOptionType } from 'antd/lib/select';
import ts from 'typescript';

export const convertToTreeData = (dataSet: DataSet, keys: string[]): DefaultOptionType[] => {
  if (!dataSet || !dataSet.rows || dataSet.rows.length === 0 || !dataSet.columns || dataSet.columns.length === 0 || !keys || keys.length === 0) {
    return [];
  }

  const { rows, columns } = dataSet;
  const rootNode: DefaultOptionType = { label: '', value: '', children: [] };
  const map: Map<string, DefaultOptionType> = new Map();

  const buildTree = (node: DefaultOptionType, level: number): void => {
    const key = keys[level];

    rows.forEach(row => {
      const label = row[columns.indexOf(key)];  // 根据列名索引获取每一行的值
      const mapKey = `${label}-${level}`; // 使用组合键保证唯一性
      if (!map.has(mapKey)) {
        const newNode: DefaultOptionType = { label, value: label, title: label, children: [] };
        map.set(mapKey, newNode);

        if (level === 0) {
          rootNode.children?.push(newNode);
        } else {
          const parentLabel = keys[level - 1];
          const parentMapKey = `${row[columns.indexOf(parentLabel)]}-${level - 1}`;
          const parentNode = map.get(parentMapKey);
          if (parentNode) {
            parentNode.children?.push(newNode);
          }
        }
      }
    });

    if (keys[level + 1]) {
      node.children?.forEach(child => buildTree(child, level + 1));
    }
  };

  buildTree(rootNode, 0);

  return rootNode.children || [];
};


export const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;

  if (typeof a === 'object' && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (let key of keysA) {
      if (!isEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
};

export const deepMerge = (target: any, source: any): any => {
  if (typeof target !== 'object' || target === null || target === undefined) {
    return source;
  }

  const output = Array.isArray(target) ? target.slice() : { ...target };

  if (source === null || source === undefined) {
    return output
  }
  Object.keys(source).forEach(key => {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (sourceValue == null) {
      output[key] = null
    } else if (typeof sourceValue === 'undefined') {
      // 如果源对象的属性值为 undefined，也要覆盖目标对象的属性值
      output[key] = undefined;
    } else if (Array.isArray(sourceValue)) {
      output[key] = sourceValue.slice(); // 对数组进行浅拷贝，以避免引用问题
    } else if (typeof sourceValue === 'object' && sourceValue !== null) {
      if (typeof targetValue !== 'object' || targetValue === null) {
        // 如果目标对象的属性值不是对象，或者为空，则直接覆盖
        output[key] = deepMerge({}, sourceValue); // 对源对象的属性值进行深度合并
      } else {
        // 否则递归进行深度合并
        output[key] = deepMerge(targetValue, sourceValue);
      }
    } else {
      // 对于其他类型的属性值，直接覆盖
      output[key] = sourceValue;
    }
  });

  return output;
};

export const max = <T>(objects: T[], fieldToCompare: keyof T): T | undefined => {
  if (objects.length == 0) {
    return
  }
  return objects.reduce((prev, current) =>
    prev[fieldToCompare] > current[fieldToCompare] ? prev : current
  );
}

type KeyOf<T> = keyof T;
// @ts-ignored
export function arrayToRecord<T, K extends KeyOf<T>, V extends KeyOf<T>>(array: T[], keyProp: K, valueProp: V): Record<T[K], T[V]> {
  return array.reduce((acc, curr) => {
    acc[curr[keyProp]] = curr[valueProp];
    return acc;
    // @ts-ignored
  }, {} as Record<T[K], T[V]>);
}

export const recordToObjectArray = <K extends keyof any, T, V>(record: Record<K, T> | undefined,
  transform: (k: K, t: T) => V) => {
  return record ? Object.entries(record).map(([key, value]) => transform(key as K, value as T)) : [];
};

export const recordToOptions = <K extends keyof any, T, V>(record: Record<K, T> | undefined) =>
  recordToObjectArray(record, (value, label) => ({ value, label }))


export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => keys2.includes(key) && deepEqual(obj1[key], obj2[key]));
}

export function distinctByKey<T, K extends keyof T>(arr: T[], key: K): T[] {
  const seen = new Set<T[K]>();
  return arr.filter(item => {
    if (seen.has(item[key])) {
      return false;
    }
    seen.add(item[key]);
    return true;
  });
}

export const fixTreeSelect = (tree: any[]) => {
  return [...tree, ...Array.from({ length: 20 },
    (i) => ({ key: i, title: '', disabled: true }))]
}

export function parseTemplate(template: string, data: Record<string, any>): any {
  const regex = /\$\{([^}]+)\}/; // 匹配第一个占位符

  const match = regex.exec(template);
  if (!match) {
    return template; // 如果没有占位符，直接返回原模板
  }

  const key = match[1].trim(); // 获取 `${}` 中的键
  let value;

  try {
    value = new Function("data", `return data.${key};`)(data); // 动态解析值
  } catch (e) {
    console.error(`解析错误: ${key}`, e);
    value = undefined; // 返回 undefined 而不是字符串
  }

  return value; // 返回解析后的值
}

export function replaceVariables(template: string, values: Record<string, any> | undefined): string {
  return template.replace(/\$\{([^}]+)\}/g, (match, key) => {
    // 如果 values 为 undefined 或 key 不存在，返回空字符串
    if (!values || !(key in values)) {
      return "";
    }
    return String(values[key]);
  });
}

export function execTs(renderCode: string, args: Record<string, any>) {
  // 将 TypeScript 转换为 JavaScript
  const transpiledCode = ts.transpileModule(renderCode, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;

  // 包装为模块化执行环境
  const exec = new Function('args', `${transpiledCode}; return main(args);`);

  // 执行动态代码，并调用定义的主函数
  return exec(args);
}

// 防抖函数，用于减少频繁更新状态的开销
export const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const displayResult = (a?: string, b?: string) => {
  if (a?.trim().length == 0) {
    a = undefined
  }
  if (b?.trim().length == 0) {
    b = undefined
  }
  // 检查 a 和 b 是否都有值
  if (a && b) {
    return `${a}-${b}`;
  }
  // 如果 a 有值，显示 a；否则显示 b
  return a || b;
}


export function calculateTextWidth(text: string | number | undefined, fontSize: number) {
  if (!text) {
    return
  }
  const numberWidth = fontSize * 0.6; // 数字宽度
  const punctuationWidth = fontSize * 0.3; // 逗号、小数点宽度
  const chineseWidth = fontSize * 1; // 中文字符宽度

  let totalWidth = 0;

  for (const char of text.toString()) {
    if (/[0-9]/.test(char)) {
      totalWidth += numberWidth; // 数字
    } else if (/[,\.]/.test(char)) {
      totalWidth += punctuationWidth; // 逗号、小数点
    } else if (/[\u4e00-\u9fa5]/.test(char)) {
      totalWidth += chineseWidth; // 中文字符
    }
  }

  return totalWidth;
}

export const toggle2Array = <T = number | string>(items: T[], item: T) => {
  if (items?.includes(item)) {
    const index = items.indexOf(item);
    if (index !== -1) {
      items.splice(index, 1);
    }
  } else {
    items.push(item);
  }
  return [...items]
}

export const toIndexes = <T>(
  objects: T[], // 对象数组
  targetValues: Array<T[keyof T]>, // 目标值列表
  field: keyof T // 动态指定字段
): number[] => {
  return targetValues
    .map(targetValue => objects.findIndex(obj => obj[field] === targetValue)) // 找到索引
    .filter(index => index !== -1); // 过滤未找到的项
};

/**
 * 计算字符串的哈希值
 * @param {string} str - 输入的字符串
 * @return {number} 哈希值
 */
export function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // 将哈希值转换为32位整数
  }
  return hash;
}

/**
 * 根据字符串内容从颜色数组中取色
 * @param {string} str - 输入的字符串
 * @param {string[]} colors - 颜色数组
 * @return {string} 颜色值
 */
export function getColorFromString(str: string, colors: string[]) {
  const hash = hashString(str);
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}