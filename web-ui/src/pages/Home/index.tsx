import { useModel } from '@umijs/max';
import { Row, Col } from 'antd';
import { useEffect, useState } from 'react';
import request from '@/utils/request';
import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import DashboardPreview from '../Dashboard/Preview';

const HomePage: React.FC = () => {
  const { initialState } = useModel('@@initialState')
  const [data, setData] = useState<HomeCenterDataVO>()
  const { systemConfig } = useModel('system')

  useEffect(() => {
    // 请求首页数据
    request.GET('/home-center/data').then(setData)
  }, [])

  // 数据展示项
  const stats = [
    { label: '数据源', value: data?.datasourceCount, color: 'text-blue-600 dark:text-blue-300' },
    { label: '数据集', value: data?.dataSheetCount, color: 'text-green-600 dark:text-green-300' },
    { label: '仪表盘', value: data?.dashboardCount, color: 'text-orange-600 dark:text-orange-300' },
  ]

  return (
    data && initialState && <div className="min-h-screen bg-antdColorBgLayout dark:bg-black flex flex-col items-start justify-start px-6 py-6">
      {/* 最外层容器，设置最大宽度 */}
      <div className="w-full max-w-md bg-white dark:bg-antdDarkContainer rounded-md p-6">
        {/* 头像和用户名并排显示 */}
        <div className="flex items-center mb-6">
          <img
            src={initialState?.user?.avatarImgUrl}
            alt="avatar"
            className="w-12 h-12 rounded-full ring-2 p-1 ring-primaryColor/80 mr-4"
          />
          <div>
            <div className="text-2xl font-semibold text-gray-800 dark:text-white">
              {initialState?.user?.nickname || '用户'} {(initialState?.user?.gender || 1) > 0 ?
                <ManOutlined className='text-blue-500' /> : <WomanOutlined className='text-pink-500' />}
            </div>
            <div className=' text-gray-500 dark:text-gray-400'>{initialState.user?.username}</div>
          </div>
        </div>

        {/* 数据展示 */}
        <Row gutter={16} justify="start" className="mt-4">
          {stats.map((item, index) => (
            <Col key={index} span={8}>
              <div className="text-center p-3 rounded-md bg-white dark:bg-antdDarkContainer">
                <div className={`text-sm font-medium ${item.color}`}>
                  {item.label}
                </div>
                <div className="text-3xl font-bold text-gray-700 dark:text-gray-200">
                  {item.value || 0}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* 右侧空白区域 */}
      {systemConfig.homeDashboardKey &&
        <DashboardPreview showThemeSwitch={false} dataMode='REAL_TIME'
          shareKey={systemConfig.homeDashboardKey} />}
    </div>
  );
};

export default HomePage;