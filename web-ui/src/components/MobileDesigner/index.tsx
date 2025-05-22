import React, { ReactNode, useState, useMemo } from 'react';
import { Radio } from 'antd';
import { useContainerWidth } from '@/hooks';

interface PhoneModel {
    width: number;
    height: number;
}

const phoneModels: Record<string, PhoneModel> = {
    iPhoneSE: { width: 375, height: 667 },
    iPhone12Pro: { width: 390, height: 844 },
    // oppoFindx8: { width: 1256, height: 2760 },
    iPhone14ProMax: { width: 430, height: 932 },
};

interface MobileDesignerProps {
    children: ReactNode;
}

const MobileDesigner: React.FC<MobileDesignerProps> = ({ children }) => {
    const [selectedPhone, setSelectedPhone] = useState<string>('iPhoneSE');
    const { ref, height: maxHeight } = useContainerWidth(phoneModels.iPhoneSE.width, phoneModels.iPhoneSE.height)

    const handlePhoneChange = (e: any) => {
        setSelectedPhone(e.target.value);
    };
    const { width, height } = phoneModels[selectedPhone];

    // 实际设备显示高度计算（根据屏幕高度判断是否需要缩放）
    const deviceHeight = useMemo(() => {
        const maxDisplayHeight = (maxHeight || 0) - 20 * 2 - 8 * 2; // 屏幕可用最大高度
        return Math.min(height, maxDisplayHeight); // 设备高度不能超过屏幕可用高度
    }, [height, maxHeight]);

    // 设备宽度根据高度等比例缩放
    const deviceWidth = useMemo(() => {
        const scaleFactor = deviceHeight / height; // 按高度缩放比例计算宽度
        return width * scaleFactor;
    }, [deviceHeight, height, width]);

    // 计算设备高度占屏幕高度百分比
    const heightPercentage = maxHeight && useMemo(
        () => ((deviceHeight / height) * 100).toFixed(2),
        [deviceHeight]
    );

    return (
        <div className="flex h-full w-full" ref={ref}>
            {/* 左侧设备展示区域 */}
            <div className="flex-1 flex justify-center items-center bg-transparent px-5">
                <div
                    className="relative border-8 border-gray-700 dark:border-antdDarkColorFillSecondary  shadow-md rounded-2xl overflow-hidden"
                    style={{
                        height: `${deviceHeight}px`, // 最终高度
                        width: `${deviceWidth}px`, // 根据高度比例缩放的宽度
                    }}
                >
                    <div className='h-full w-auto relative rounded-2xl'>
                        {children}
                    </div>
                </div>
            </div>

            {/* 右侧设备选择区域 */}
            <div className="w-72 border-l border-gray-300 dark:border-antdDarkColorFillSecondary p-5 dark:bg-antdDarkContainer bg-white">
                <h3 className="mb-4 text-lg font-semibold">选择手机型号</h3>
                <Radio.Group
                    className="space-y-3"
                    onChange={handlePhoneChange}
                    value={selectedPhone}
                >
                    {Object.entries(phoneModels).map(([key, { width, height }]) => (
                        <Radio key={key} value={key}>
                            {key} ({width}x{height})
                        </Radio>
                    ))}
                </Radio.Group>
                <div className="mt-5 text-gray-600">
                    <p>当前设备高度：{deviceHeight.toFixed(0)}px</p>
                    <p>设备高度占屏幕高度比例：{heightPercentage}%</p>
                    <p>当前设备宽度：{deviceWidth.toFixed(0)}px</p>
                </div>
            </div>
        </div>
    );
};

export default MobileDesigner;