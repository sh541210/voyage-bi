import { history, useModel, useSearchParams } from "@umijs/max"
import Dashboard from "../../components/Dashboard"
import { useCallback, useEffect, useState } from "react"
import request from "@/utils/request"
import { ThemeSwitch } from "@/components/setting/ThemeSwitch"
import Kanban from "@/components/Kanban"
import { setShareToken } from "@/utils/login/interceptor"
import { renderErrorPrint } from "@/utils/render"
import { getUserToken } from "@/utils/login/base"
import { ENABLE_SHARE_TOKEN_CHECK } from "@/options"

const DashboardPreview = () => {
    const [params] = useSearchParams()
    const key = params.get('dashboardKey') || params.get('key') || undefined
    const dark = params.get('theme') === 'dark'
    const hiddenThemeSwitch = params.get('hiddenThemeSwitch') === 'true'
    const hiddenInteractionIcon = params.get('hiddenInteractionIcon') === 'true'
    const { setHiddenInteractionIcon } = useModel('global')
    const { setDark } = useModel('global')
    const shareToken = params.get('shareToken')

    useEffect(() => {
        if (hiddenInteractionIcon) setHiddenInteractionIcon(true)
    }, [hiddenInteractionIcon])

    useEffect(() => {
        setDark(dark)
    }, [dark])

    const env = params.get('env')
    const [snapshot, setSnapshot] = useState<DashboardSnapshotVO>()
    const [message, setMessage] = useState<string>()
    const { setInitialState, initialState } = useModel('@@initialState')

    if (!key) {
        return <div className="" style={{ padding: '40px', textAlign: 'center' }}>没有找到仪表板/报表</div>
    }

    // 默认区域
    const regionStr = params.get('regions')
    const admin = !regionStr || regionStr.trim().length == 0 || regionStr == 'null'
    const regions = params.get('regions')?.split(',')
        .filter(i => i.trim() && i.trim() !== '' && i.trim() !== 'null')
        .map(i => i.trim()).filter(i => i && i != '')

    const fetchToken = async () => {
        const searchParams = new URLSearchParams(history.location.search);
        const shareKey = searchParams.get('key');
        if (shareKey) {
            const loginToken = getUserToken()
            if (loginToken) {
                setInitialState(pre => ({ ...pre, token: { tokenValue: loginToken, tokenTimeout: 0 } }))
            }
            if (ENABLE_SHARE_TOKEN_CHECK) {
                if (shareToken) {
                    setShareToken(shareToken)
                    setInitialState(pre => ({ ...pre, shareToken }))
                }
            } else {
                const shareToken = await request.POST(`/dashboard/share/token?key=${shareKey}`, null, { ignoreTip: true })
                setShareToken(shareToken)
                setInitialState(pre => ({ ...pre, shareToken }))
            }
        }
        return
    }

    // 获取分享表盘数据
    useEffect(() => {
        fetchToken().then(() => {
            request.GET<DashboardSnapshotVO>(`/dashboard/share?key=${key}&mobile=${false}`, { ignoreTip: true })
                .then(setSnapshot)
                .catch(setMessage)
        }).catch(setMessage)
    }, [])

    const renderPreview = useCallback((snapshot: DashboardSnapshotVO) => {
        let theme = snapshot.theme
        if (!theme) {
            return
        }
        if (snapshot.type === 'KANBAN') {
            return <div className="h-full w-full relative overflow-hidden">
                <Kanban theme={theme} dashboard={snapshot} />
            </div>
        } else {
            return <Dashboard
                theme={theme}
                env={env}
                displayMode='preview'
                dashboard={{ ...snapshot, charts: snapshot.charts.map(i => ({ ...i, shareKey: key })) }}
                // 省市区组件默认值
                initialValues={{ regions }}
                // 非admin按照省市区过滤树组件数据
                defaultFilterParameters={!admin ? { regions: { province: regions, city: regions, area: regions } } : {}}
                // admin用户不选的情况下不传区域字段（相当于全选）
                setupGlobalFilterForm={i => {
                    if (admin && i['regions'] !== undefined && i['regions'].length === 0) {
                        return { ...i, regions: null }
                    }
                    return i
                }}
                onExportChart={(chartId, name, parameters) => {
                    request.EXPORT(name, '/chart/data/export', { chartId, parameters, env })
                }}
            />
        }
    }, [])

    return <div className="bg-antdColorBgLayout dark:bg-antdDarkColorFillQuaternary preview-container text-black dark:text-white h-full w-full relative">
        {!hiddenThemeSwitch && <ThemeSwitch className=" absolute right-0 text-2xl" />}
        {snapshot ? renderPreview(snapshot) :
            renderErrorPrint(new Error(message), ' text-3xl font-thin text-red-500')
        }
    </div>
}

export default DashboardPreview