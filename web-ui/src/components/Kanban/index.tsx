import { CSSProperties, useEffect, useState } from "react"
import Dashboard from "../Dashboard"
import request from "@/utils/request"
import Tabs from "../base/Tabs"
import { useMode } from "@/hooks"
import { colorPrimary } from "@/constants/theme"
import classNames from "classnames"
import { useLess } from "@/hooks/style"


interface Kanban_Props {
    dashboard: DashboardVO
    theme: ThemeVO
}

const Kanban = (props: Kanban_Props) => {
    const { theme, dashboard } = props
    const [snapshots, setSnapshots] = useState<DashboardSnapshotVO[]>([])
    const kanbanProp = dashboard.styleCfg.kanbanProp
    useLess(theme.dashboardStyleCfg.css + dashboard.styleCfg?.css)
    const { ref, mode } = useMode()

    useEffect(() => {
        const keys = kanbanProp?.items.flatMap(i => i.keys)
        keys && keys.length > 0 &&
            request.GET(`/dashboard/share/snapshot/list?keys=${keys.join(',')}`).then(list => {
                setSnapshots(list)
            })
    }, [kanbanProp])

    const renderPreviewList = (keys: string[]) => {
        return keys.map(j => {
            const snapshot = snapshots.find(i => i.key === j)
            return snapshot && <Dashboard key={j} dashboard={{
                ...snapshot,
                key: (dashboard as DashboardSnapshotVO).key
            }}
                displayMode='preview' theme={props.theme} />
        })
    }

    const renderKanaban = (kanbanProp: KanbanProp) => {
        const { type, tabPosition = 'BOTTOM' } = kanbanProp.props[mode]
        if (type === 'SEQUENCE') {
            return <div className="kanban-list h-full w-full relative overflow-auto">
                {kanbanProp.items.map(i => <div className="kanban-item" key={i.name}>
                    {renderPreviewList(i.keys)}</div>)}
            </div>
        } else if (type === 'TAB') {
            // const name = tabPosition.substring(0, 1).toUpperCase() + tabPosition.substring(1, tabPosition.length).toLowerCase()
            const tabStyle: CSSProperties = {
                textAlign: 'center',
                margin: 0, padding: '2px 10px',
                border: '1px '
            }
            return <Tabs className={classNames(' shadow-black flex w-full bg-white dark:bg-antdDarkContainer',
                mode === 'pc' ? 'border-b dark:border-antdDarkColorFill' : '')}
                style={{
                    tabs: { boxShadow: `0 ${tabPosition === 'BOTTOM' ? '-' : ''}4px 6px rgba(0, 0, 0, 0.05)`, zIndex: 10 },
                    tab: mode === 'mobile' ? ({ ...tabStyle, flex: 'auto', padding: '4px', fontSize: '14px', lineHeight: '20px' }) : { padding: '6px 10px', fontSize: '14px' },
                    active: mode === 'mobile' ? { backgroundColor: colorPrimary, color: '#fff' } : undefined
                }}
                tabPosition={tabPosition}
                items={kanbanProp.items
                    .map(i => ({
                        key: i.name, content: renderPreviewList(i.keys)
                    }))} />
        }
    }

    return <div ref={ref} className={classNames('relative w-full h-full overflow-auto kanban', mode)}>
        {kanbanProp && renderKanaban(kanbanProp)}
    </div>
}

export const useKanbanEditor = (props: { dashboard: DashboardVO }) => {

    return {
        renderContent: <>
        </>
    }
}

export default Kanban