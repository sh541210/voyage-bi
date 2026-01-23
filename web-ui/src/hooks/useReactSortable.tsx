import React, { useRef, useState, useCallback, JSX } from 'react'
import { ReactSortable, SortableEvent, ReactSortableProps } from 'react-sortablejs'

/**
 * 通用 useReactSortable hook
 * - 维护 dragRef（from/over）
 * - 高亮 active/ready
 * - 提供 renderSource / renderTarget
 * - 拖拽关系通过 scopeId 管理
 */
interface UseReactSortableProps<T> {
    scopeId: string
}

interface RenderSourceProps<T> extends Omit<ReactSortableProps<T>, 'setList'> {
    id: string
    list: T[]
    renderItem: (item: T, idx: number) => React.ReactNode
    renderEmpty?: () => React.ReactNode
    onStart?: () => void
    onMove?: (evt: any) => boolean
    onEnd?: () => void
    groupName?: string
}

interface RenderTargetProps<T> extends Omit<ReactSortableProps<T>, 'list' | 'setList'> {
    id: string
    list: T[]
    setList: (list: T[]) => void
    renderItem: (item: T, idx: number) => React.ReactNode
    renderEmpty?: () => React.ReactNode
    onAddIndex?: (index: number, evt: SortableEvent) => void
    groupName?: string
}

export function useReactSortable<T = any>({
    scopeId,
}: UseReactSortableProps<T>) {
    // 维护拖拽起点/目标
    const dragRef = useRef<{ from?: string; over?: string }>({})
    const [dragState, setDragState] = useState<{ from?: string; over?: string }>({})

    // 派生高亮状态
    const getHighlightClass = useCallback((id?: string) => {
        if (!id) return ''
        if (dragState.over === id) return 'bg-primaryColor/10'
        if (dragState.from && dragState.over !== id) return 'bg-gray-100 dark:bg-antdDarkColorFillQuaternary'
        return 'rounded'
    }, [dragState.from, dragState.over])

    // 渲染源区域（如 sheetColumns/变量）
    function renderSource(props: RenderSourceProps<T>) {
        const { id, list, renderItem, renderEmpty, groupName, onStart, onMove, onEnd, ...restProps } = props

        return (
            <ReactSortable
                id={id}
                // @ts-ignore
                list={list}
                setList={() => { }}
                {...restProps}
                group={{
                    name: groupName || scopeId,
                    pull: 'clone',
                    put: false,
                }}
                sort={false}
                onStart={() => {
                    dragRef.current.from = id
                    setDragState({ ...dragRef.current })
                    onStart?.()
                }}
                onMove={evt => {
                    dragRef.current.over = evt.related?.id
                    setDragState({ ...dragRef.current })
                    return onMove ? onMove(evt) : !!evt.related?.id
                }}
                onEnd={() => {
                    dragRef.current.from = undefined
                    dragRef.current.over = undefined
                    setDragState({})
                    onEnd?.()
                }}
            >
                {list.length > 0 ? list.map((item, idx) => renderItem(item, idx)) : renderEmpty?.()}
            </ReactSortable>
        )
    }

    // 渲染目标区域（如 指标/维度/筛选框/参数）
    function renderTarget(props: RenderTargetProps<T>) {
        const { id, list, setList, renderItem, renderEmpty, groupName, onAddIndex, ...restProps } = props
        return (
            <ReactSortable
                id={id}
                // @ts-ignore
                list={list}
                // @ts-ignore
                setList={setList}
                {...restProps}
                group={{
                    name: groupName || scopeId,
                    pull: false,
                    put: true,
                }}
                onMove={evt => {
                    dragRef.current.over = id
                    setDragState({ ...dragRef.current })
                    return true
                }}
                onAdd={(evt: SortableEvent) => {
                    dragRef.current.over = undefined
                    setDragState({})
                    evt.oldIndex && onAddIndex?.(evt.oldIndex, evt)
                    // let item = (evt.item as any)?._sortableItem
                    // if (!item && evt.from && evt.oldIndex != null) {
                    //     const sourceList = (evt.from as any)._sortableList  // source 的 list
                    //     item = sourceList[evt.oldIndex]
                    // }
                    // if (item) {
                    //     onAddItem?.(item, evt)
                    // }
                }}
                onEnd={() => {
                    dragRef.current.over = undefined
                    setDragState({})
                }}>
                {list.length > 0 ? list.map((item, idx) => renderItem(item, idx)) :
                    <div id={id} className='fixed bottom-0 left-0 w-fulltext-white p-4'> {renderEmpty?.()}</div>}
            </ReactSortable>
        )
    }

    return {
        dragRef,
        dragState,
        getHighlightClass,
        renderSource,
        renderTarget,
    }
}