import { watch } from "@/hooks"
import useList from "@/hooks/useList"
import { genKey } from "@/utils/biz"
import { deepEqual } from "@/utils/common/common"
import { PlusOutlined } from "@ant-design/icons"
import { ProFormColumnsType, ProFormInstance } from "@ant-design/pro-components"
import { Button } from "antd"
import classNames from "classnames"
import { useEffect, useRef, useState } from "react"
import SchemaForm from "../SchemaForm"

interface ItemListProps<T> {
    onSave?: (formData: T, index: number) => Promise<any>
    onRemove?: (formData: T, index: number) => Promise<boolean>
    columns: (ProFormColumnsType<T>[]) | ((item: T) => ProFormColumnsType<T>[])
    newForm: T
    list: T[]
    onListChange?: (list: T[]) => void
}

export const ItemListForm = <T extends Item>(props: ItemListProps<T>) => {
    const { list } = props
    const [items, { updateAt, removeAt, set: setItems }] = useList<T>(list)
    const [editIdx, setEditIdx] = useState<number>()
    const [newIdx, setNewIdx] = useState<number>()
    const refs = useRef<Record<number, ProFormInstance>>({})

    useEffect(() => {
        setItems(list)
    }, [list])

    watch(items, (pre, next) => {
        if (!deepEqual(pre, next)) {
            setItems(next)
            props.onListChange?.(items)
        }
    })

    useEffect(() => {
        if (editIdx === undefined) {
            setNewIdx(undefined)
        }
    }, [editIdx])

    const afterSave = (index: number, formData: T) => {
        setEditIdx(undefined)
        updateAt(index, formData)
    }

    const afterDelete = (index: number) => {
        removeAt(index)
    }

    const renderItem = (item: T, index: number) => {
        const edit = editIdx === index
        let columns = []
        if (typeof props.columns === 'function') {
            columns = props.columns?.(item)
        } else {
            columns = props.columns
        }
        columns = columns.map(j => !edit ? ({ ...j, readonly: true }) : j)
        return <div key={index} className={classNames('mr-4 relative rounded-sm shadow-sm p-4 mb-4 pb-0',
            edit ? 'border dark:border-antdDarkBorder dark:bg-antdDarkContainer' : 'bg-antdColorBgLayout dark:bg-black')}>
            <div className=" absolute right-0 top-0.5">
                {editIdx == undefined && <Button type='link' onClick={() => setEditIdx(index)}>{'编辑'}</Button>}
                {edit && <>
                    <Button type='link' onClick={async () => {
                        const formData = { ...item, ...await refs.current[index]?.validateFieldsReturnFormatValue!() }
                        props.onSave ? props.onSave(formData, index).then(() => afterSave(index, formData)) :
                            afterSave(index, formData)
                    }}>{'保存'}</Button>
                    <Button type='link' onClick={() => {
                        refs.current[index].resetFields()
                        setEditIdx(undefined)
                        newIdx === index && removeAt(index)
                    }}>{'取消'}</Button>
                </>}
                {!edit && <Button type='link' onClick={() => {
                    props.onRemove ? props.onRemove(item, index).then(data => {
                        data && afterDelete(index)
                    }) : afterDelete(index)
                }}>删除</Button>}
            </div>
            <SchemaForm
                key={genKey()}
                // @ts-ignore
                formRef={(ref: any) => ref && (refs.current[index] = ref)}
                className="mt-4"
                rowProps={{ gutter: 24 }}
                colProps={{ span: 24, }}
                grid={true}
                columns={columns}
                initialValues={{ ...item }}
                submitter={false}
            />
        </div>
    }

    return <><div className="flex flex-col flex-wrap items-stretch overflow-auto">
        {items.map(renderItem)}
        {newIdx === undefined ? <Button icon={<PlusOutlined />} onClick={() => {
            const index = items.length
            setEditIdx(index)
            setNewIdx(index)
        }}></Button> : <div>{renderItem({ ...props.newForm }, newIdx)}</div>}
    </div >
    </>
}