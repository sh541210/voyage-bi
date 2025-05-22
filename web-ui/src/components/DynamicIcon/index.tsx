import { createFromIconfontCN } from "@ant-design/icons";
import { useModel } from "@umijs/max";
import { useEffect, useMemo, useState } from "react";


const fetchIconsFromScript = async (scriptUrl: string | undefined) => {
    if (!scriptUrl) {
        return []
    }
    const response = await fetch(scriptUrl);
    const scriptText = await response.text();

    // 提取图标名称的正则
    const matchIcons = scriptText.match(/"([^"]*icon-[^"]*)"/g);
    return matchIcons?.map(icon => icon.replace(/"/g, "")) || [];
};


// 动态加载远程图标
export const useDynamicIcon = () => {
    const { systemConfig } = useModel('system')
    const [DynamicIcon, setDynamicIcon] = useState(() => createFromIconfontCN({ scriptUrl: '' }));
    const [icons, setIcons] = useState<string[]>([])

    useEffect(() => {
        if (systemConfig?.iconFontJsUrl) {
            const Icon = createFromIconfontCN({ scriptUrl: systemConfig.iconFontJsUrl });
            setDynamicIcon(() => Icon);
            fetchIconsFromScript(systemConfig?.iconFontJsUrl).then(setIcons)
        }
    }, [systemConfig?.iconFontJsUrl]);

    return {
        DynamicIcon,
        iconOptions: useMemo(() => {
            return icons?.map(i => ({
                value: i, label: <div className="flex items-center gap-2">
                    <DynamicIcon style={{ fontSize: `${30}px` }} type={i} /> {i}
                </div>
            }))
        }, [icons])
    };
};
