
import { format } from 'sql-formatter';

export const formatCustomSql = (text: string): string => {
    // Step 1: 处理 ${变量} → __VARIABLE_PLACEHOLDER_X__
    const variablePlaceholders: string[] = [];
    let varIndex = 0;
    const varSafeText = text.replace(/\${(.*?)}/g, (match, varName) => {
      variablePlaceholders.push(varName.trim()); // 存储变量名
      return `__VARIABLE_PLACEHOLDER_${varIndex++}__`; // 生成唯一占位符
    });
  
    // Step 2: 处理 !{...}! → __DYNAMIC_BLOCK_X__
    const dynamicBlocks: string[] = [];
    let blockIndex = 0;
    const tempText = varSafeText.replace(/!\{([\s\S]*?)\}!/g, (match, content) => {
      dynamicBlocks.push(content); // 存储动态块内容
      return `__DYNAMIC_BLOCK_${blockIndex++}__`; // 生成唯一占位符
    });
  
    // Step 3: 格式化 SQL（此时所有动态部分已被保护）
    const formattedSql = format(tempText);
  
    // Step 4: 恢复所有占位符
    let finalSql = formattedSql;
    // 先恢复 !{...}! 动态块
    dynamicBlocks.forEach((block, index) => {
      finalSql = finalSql.replace(
        new RegExp(`__DYNAMIC_BLOCK_${index}__`, 'g'),
        `!{${block}}!` // 注意保持原样，不修改缩进
      );
    });
    // 再恢复 ${变量}
    variablePlaceholders.forEach((varName, index) => {
      finalSql = finalSql.replace(
        new RegExp(`__VARIABLE_PLACEHOLDER_${index}__`, 'g'),
        `\${${varName}}` // 恢复为原始变量语法
      );
    });
  
    return finalSql;
  };
