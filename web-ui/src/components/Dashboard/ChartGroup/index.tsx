import BaseModal from "@/components/base/BaseModal";
import { ItemListForm } from "@/components/base/ItemList";
import { requiedRulesInput, requiredRuleSelect } from "@/constants";
import useList from "@/hooks/useList";
import request from "@/utils/request";
import { message } from "antd";
import { useMemo, useRef, useState } from "react";

export const useChartGroupModal = () => {
    const [chartGroups, { set }] = useList<ChartGroupVO>([])
    const [charts, setCharts] = useState<ChartVO[]>([])
    const [dashboardId, setDashboardId] = useState<number>()
    const ref = useRef<any>(null)
    const fetchGroups = () => request.GET<ChartGroupVO[]>(`/dashboard/group/list?dashboardId=${dashboardId}`)
        .then(set)
    return {
        setDashboardId,
        contextHolder: useMemo(() =>
            <BaseModal width={800} footer={null} ref={ref} title="管理图表组">
                <div className=" overflow-auto h-full" style={{ height: '500px' }}>
                    <ItemListForm
                        // listKey={'chart-group'}
                        newForm={{
                            title: '',
                            subTitle: '',
                            showTitle: true,
                            chartIds: [],
                            dashboardId: 0,
                            cfg: { filters: [], chartTabs: [] },
                            id: 0,
                            groupType: 'GRID',
                            customData: '',
                            styleCfg: {}
                        }}
                        list={chartGroups}
                        columns={[
                            { dataIndex: 'title', title: '标题', ...requiedRulesInput },
                            { dataIndex: 'subTitle', title: '副标题', valueType: 'textarea' },
                            {
                                dataIndex: 'groupType', title: '组类型',
                                ...requiredRuleSelect,
                                valueEnum: { TAB: '标签', GRID: '网格' }, valueType: 'segmented'
                            },
                            {
                                dataIndex: 'showTitle', title: '显示标题', valueType: 'segmented', fieldProps: {
                                    options: [{ value: true, label: '显示' }, { value: false, label: '不显示' }]
                                },
                            },
                            {
                                dataIndex: 'chartIds', title: '图表', valueType: 'select',
                                fieldProps: {
                                    mode: 'multiple', showSearch: true,
                                    options: charts.map(i => ({ value: i.id, label: i.name }))
                                }
                            },
                            // { dataIndex: 'customData', title: '自定义数据', valueType: 'textarea' }
                        ]} onSave={async item => {
                            const formData = { ...item, dashboardId }
                            let id
                            if (item.id === 0) {
                                id = await request.POST('/chart/group', formData)
                                message.success('创建成功！')
                            } else {
                                id = await request.PUT('/chart/group', formData)
                                message.success('修改成功！')
                            }
                            fetchGroups()
                            return id;
                        }} onRemove={item =>
                            request.DELETE(`/chart/group/${dashboardId}?groupId=${item.id}`).then(() => {
                                message.success('删除成功！')
                                fetchGroups()
                                return true
                            })
                        } />
                </div>
            </BaseModal>, [chartGroups]),
        open: (charts: ChartVO[]) => {
            setCharts(charts)
            fetchGroups().then(() => ref.current.open())
        }
    }
}