import { history, useModel, useSearchParams } from "@umijs/max"
import { useCallback, useEffect, useState } from "react"
import request from "@/utils/request"
import { ThemeSwitch } from "@/components/setting/ThemeSwitch"
import Kanban from "@/components/Kanban"
import { setShareToken } from "@/utils/login/interceptor"
import { renderErrorPrint } from "@/utils/render"
import Dashboard from "@/components/Dashboard"

const DashboardPreview = (props: { shareKey: string, dataMode?: DataMode, showThemeSwitch?: boolean }) => {
    const [params] = useSearchParams()
    const { shareKey: key, showThemeSwitch = true } = props
    const env = params.get('env')
    const [snapshot, setSnapshot] = useState<DashboardSnapshotVO>()
    const [message, setMessage] = useState<string>()
    const { setInitialState } = useModel('@@initialState')

    const fetchToken = async () => {
        const searchParams = new URLSearchParams(history.location.search);
        const shareKey = searchParams.get('key');
        if (shareKey) {
            const shareToken = await request.POST(`/dashboard/share/token?key=${shareKey}`, null, { ignoreTip: true })
            setShareToken(shareToken)
            setInitialState(pre => ({ ...pre, shareToken }))
        }
        return
    }

    // 获取分享表盘数据
    useEffect(() => {
        fetchToken().then(() => {
            request.GET<DashboardSnapshotVO>(`/dashboard/share?key=${key}&mobile=${false}`, { ignoreTip: true })
                .then(setSnapshot).catch(setMessage)
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
                dataMode={props.dataMode}
                theme={theme}
                env={env}
                displayMode='preview'
                dashboard={{ ...snapshot, charts: snapshot.charts.map(i => ({ ...i, shareKey: key })) }}
                initialValues={{}}
                onExportChart={(chartId, name, parameters) => {
                    request.EXPORT(name, '/chart/data/export', { chartId, parameters, env })
                }}
            />
        }
    }, [])

    return <div className=" bg-transparent preview-container text-black dark:text-white h-full w-full relative">
        {showThemeSwitch && <ThemeSwitch className=" absolute right-0 text-2xl" />}
        {snapshot ? renderPreview(snapshot) : renderErrorPrint(new Error(message), ' text-3xl font-thin text-red-500')}
    </div>
}

export default DashboardPreview