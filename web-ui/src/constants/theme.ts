import { ConfigProviderProps } from "antd"

export const colorPrimary = '#4A5FDF'

const themeConfig: ConfigProviderProps['theme'] = {
    token: {
        colorPrimary: colorPrimary,
        borderRadius: 2,
        colorLink: colorPrimary,
        // colorBgLayout: 'rgb(240,240,240)',
        // colorPrimaryActive: '#1DA57A'
    },
    components: {
        Form: {
            itemMarginBottom: 10,
        }
    },
}
export default themeConfig