import request from "@/utils/request"
import { CSSProperties, useEffect, useState } from "react"
import DropdownButton from "@/components/base/DropdownButton"

export const useTheme = () => {
    const [theme, setTheme] = useState<ThemeVO>()
    return {
        selectorContext: <ThemeSelector onChange={setTheme} />,
        themeCfg: theme
    }
}

const ThemeSelector = (props: { onChange: (theme: ThemeVO) => void, hidden?: boolean, className?: string, style?: CSSProperties }) => {
    const [themeList, setThemeList] = useState<ThemeVO[]>([])
    const [themeId, setThemeId] = useState<number>()
    const { hidden } = props

    useEffect(() => {
        const theme = themeList.find(i => i.id === themeId)
        theme && props.onChange(theme)
    }, [themeId])

    useEffect(() => {
        request.GET<ThemeVO[]>(`/theme/list`).then(data => {
            setThemeList(data)
            if (data.length > 0) {
                setThemeId(data[0].id)
            }
        })
    }, [])
    return themeId && <DropdownButton<number>
        value={themeId}
        onChange={setThemeId}
        style={{ display: hidden ? 'none' : '' }}
        options={themeList.map(i => ({ value: i.id, label: `${i.name}[${i.graphRenderType}]` }))} />
}

export default ThemeSelector