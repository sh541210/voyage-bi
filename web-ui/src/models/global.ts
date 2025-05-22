// 全局共享数据示例
import { DEFAULT_NAME } from '@/constants';
import { useLocalStorage } from '@/hooks';
import { useAntdConfigSetter } from '@umijs/max';
import { theme } from 'antd';
import { useEffect, useState } from 'react';

const useGlobal = () => {
  const [name, setName] = useState<string>(DEFAULT_NAME);
  const [dark, setDark] = useLocalStorage<boolean>('theme_dark', false)
  const setAntdConfig = useAntdConfigSetter();
  const { darkAlgorithm, defaultAlgorithm } = theme;
  const [dataMode, setDataMode] = useLocalStorage<DataMode>('data_mode', 'CACHE')

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    setAntdConfig({
      theme: { algorithm: [dark ? darkAlgorithm : defaultAlgorithm], },
    });
  }, [dark])

  return {
    name, setName,
    dark, setDark,
    dataMode, setDataMode
  };
};

export default useGlobal;
