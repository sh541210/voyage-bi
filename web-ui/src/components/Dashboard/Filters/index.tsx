import { convertToTreeData, distinctByKey } from "@/utils/common/common";
import request from "@/utils/request";
import { ProFormColumnsType, ProFormInstance, RequestOptionsType } from "@ant-design/pro-components"
import classNames from "classnames";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import './index.less'
import SchemaForm from "@/components/base/SchemaForm";

interface FilterProps {
    name: string | number
    filters: FilterCfg[]
    lite: boolean
    parameters?: Record<string, Record<string, any>>
    initialValues?: Record<string, any>
    onChange: (values: any) => void
    className?: string
}

const Filters = (props: FilterProps) => {
    const { onChange } = props
    const [initialValues, setInitialValues] = useState<any>()
    const ref = useRef<ProFormInstance>(null)
    const [columns, setColumns] = useState<ProFormColumnsType<any>[]>([])

    const filters = useMemo(() => props.filters
        .filter(i => i.props.enabled ?? true), [props.filters])

    useEffect(() => {
        const form = props.initialValues || {}
        setColumns(converFilterCfgsToColumns(filters))
        filters.forEach(i => {
            let value = form[i.key]
            const componentType = i.componentType
            if (!value) {
                if (componentType === 'dateRange') {
                    form[i.key + "_quick"] = 'custom'
                    form[i.key] = [
                        dayjs().subtract(0, 'month').startOf('month').format(i.props.dateFormat || 'YYYY-MM-DD'),
                        // dayjs().subtract(0, 'month').endOf('month')
                        dayjs()
                            .format(i.props.dateFormat || 'YYYY-MM-DD')]
                } else if (componentType === 'dateMonth') {
                    i.props
                    form[i.key] = dayjs().subtract(0, 'month').startOf('month').format(i.props.dateFormat || 'YYYY-MM')
                }
            }
        })
        onChange(form)
        setInitialValues(form)
    }, [props.filters])

    const converFilterCfgsToColumns = (filters: FilterCfg[]) => {
        const columns = filters.flatMap(i => {
            let componentType = i.componentType
            let column: ProFormColumnsType<any> = {
                dataIndex: i.key,
                valueType: componentType as any,
                title: i.props.showTitle && i.props.title,
                fieldProps: { ...i.fieldProps },
            }
            let fieldProps: any = { ...column.fieldProps }
            // TODO 多选组件反选
            if ((componentType === 'treeSelect' || componentType === 'select' ||
                componentType === 'segmented' || componentType === 'radioButton' || componentType === 'cascader'
                || componentType === 'radio')) {
                const datasheetId = i.optionsProps.dataSheetId
                if ((i.optionsProps.optionsType === 'dynamic' || componentType === 'treeSelect' || componentType === 'cascader') && datasheetId) {
                    fieldProps.maxTagTextLength = 4
                    fieldProps.maxTagCount = 3
                    const labelColumn = i.optionsProps.labelColumn
                    const valueColumn = i.optionsProps.valueColumn
                    if (valueColumn && labelColumn || ((componentType === 'treeSelect' || componentType === 'cascader') &&
                        (i.optionsProps.treeSortColumns?.length || 0) > 0)) {
                        column.debounceTime = 500
                        column.request = async (params: any) => {
                            const result = await request.POST<DataResult>('/data-sheet/data/v2', {
                                id: datasheetId,
                                parameters: { ...(props.parameters || {})[i.key], 'keyWords': params.keyWords },
                                columns: [i.optionsProps.labelColumn, i.optionsProps.valueColumn]
                                    .filter(i => i && i.trim().length > 0)
                            })
                            if (componentType === 'treeSelect' || componentType === 'cascader') {
                                return convertToTreeData(result.data, i.optionsProps.treeSortColumns
                                    || []) as RequestOptionsType[]
                            } else {
                                return distinctByKey(result.data.rows.map((list: any[]) => ({
                                    label: list[result.data.columns.findIndex(i => i === labelColumn)],
                                    value: list[result.data.columns.findIndex(i => i === valueColumn)]
                                })), 'value');
                            }
                        }
                    }
                } else {
                    fieldProps.options = distinctByKey(i.optionsProps.staticOptions?.map(j => ({ value: j, label: j })) || [], 'value')
                }
                if (componentType === 'cascader') {
                    fieldProps.changeOnSelect = true
                }
                fieldProps.allowClear = true
                fieldProps.showSearch = true
            }
            column.fieldProps = fieldProps
            if (componentType === 'dateRange' && i.props.showDateQuick) {
                const quickDataIndex = column.dataIndex + "_quick"
                column.fieldProps = {
                    ...column.fieldProps, onChange: () => {
                        // FIXME 这里没有效果？
                        ref.current?.setFieldValue(quickDataIndex, 'custom')
                    }
                }
                return [{
                    dataIndex: quickDataIndex, valueType: 'radioButton', fieldProps: {
                        options: [{ value: 'year', label: '本年' },
                        { value: 'month', label: '本月' },
                        { value: 'week', label: '本周' },
                        { value: 'custom', label: '自定义' }]
                    }
                }, column] as ProFormColumnsType<any>[]
            }
            return [column]
        })
        return columns;
    }
    if (filters.length === 0) {
        return
    }
    return <>
        {initialValues && <div className={classNames(props.className, 'px-2 pt-1')}>
            <SchemaForm
                autoFocusFirstInput={false}
                initialValues={initialValues}
                variant='filled'
                key={props.name}
                prefixCls='filters-form'
                formRef={ref}
                labelAlign='left'
                labelCol={{ flex: 'unset' }}
                wrapperCol={{ flex: 1 }}
                style={{ padding: '0' }}
                layoutType={props.lite ? 'LightFilter' : 'QueryFilter'}
                grid={false}
                size='small'
                submitter={false}
                onValuesChange={(data: any) => {
                    filters.filter(i => i.fieldProps?.mode === 'multiple').forEach(i => {
                        const value = data?.[i.key]
                        if (Array.isArray(value) && value && value.length === 0) {
                            // 注意：多选时的空数组希望是什么都不选的作用，所以需要赋值为null
                            data[i.key] = undefined
                        }
                    })
                    // 日期快速选择逻辑
                    Object.keys(data).forEach(key => {
                        if (key.endsWith('quick')) {
                            if (data[key]) {
                                const name = key.substring(0, key.length - 6)
                                const filter = filters.find(i => i.key === name)
                                if (filter) {
                                    if (filter.componentType === 'dateRange' &&
                                        ['year', 'month', 'week'].includes(data[key])) {
                                        data[name] = [dayjs().startOf(data[key]).format('YYYY-MM-DD'),
                                        dayjs().endOf(data[key]).format('YYYY-MM-DD')]
                                    }
                                }
                            }
                        }
                    })
                    onChange(data)
                }}
                // onFieldsChange={() => ref.current?.validateFieldsReturnFormatValue?.().then()}
                layout='horizontal'
                columns={columns}
            /></div>}
    </>
}

export default Filters