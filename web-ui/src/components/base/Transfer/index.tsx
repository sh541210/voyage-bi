import { toggle2Array } from "@/utils/common/common"
import { DeleteFilled, LeftSquareOutlined, RightSquareOutlined } from "@ant-design/icons"
import { Checkbox } from "antd"
import classNames from "classnames"
import { CSSProperties, forwardRef, JSX, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { GroupOptions, ItemInterface, ReactSortable } from "react-sortablejs"

type ItemId = string | number
interface TransferItemProps extends ItemInterface {
}

interface ItemProps<T> {
    keyField: string
    defaultValue?: T[]
    onChange?: (list: T[]) => void
    readOnly?: boolean
    renderItem: (t: T) => JSX.Element
    setup?: (list: T[]) => T[]
}

interface TransferProps<T1 extends TransferItemProps, T2 extends TransferItemProps> {
    name: string
    source: ItemProps<T1>
    target: ItemProps<T2>
}
const empty: any[] = []

const Transfer = <T1 extends TransferItemProps, T2 extends TransferItemProps>(props: TransferProps<T1, T2> & { style: CSSProperties }) => {
    const { source, target, name } = props
    const [choosedData, setChooseData] = useState<boolean[]>([false, false])
    const sourceRef = useRef<SortableRefProps<T1>>(null)
    const targetRef = useRef<SortableRefProps<T2>>(null)

    const ICONS = [LeftSquareOutlined, RightSquareOutlined, DeleteFilled]
    const LeftIcon = ICONS[!source.readOnly ? 0 : 2]
    const RightIcon = ICONS[!target.readOnly ? 1 : 2]

    return <div className="flex flex-row gap-1 h-full relative" style={props.style}>
        <Sortable<T1> className='flex-grow-[2] basis-0' onChoosed={(value) => setChooseData(pre => [value, pre[1]])} ref={sourceRef} name={name} {...source} />
        <div className=" w-[40px] flex flex-col justify-center items-center gap-8">
            <LeftIcon onClick={() => {
                // @ts-ignore
                sourceRef.current?.addList(targetRef.current?.getChoosedList())
                targetRef.current?.removeCheckList()
            }} className={classNames('text-2xl ',
                choosedData[1] ? 'text-primaryColor fill-white cursor-pointer' : ' disabled cursor-not-allowed text-gray-200 dark:text-antdDarkColorFill')} />
            <RightIcon onClick={() => {
                // @ts-ignore
                targetRef.current?.addList(sourceRef.current?.getChoosedList())
                sourceRef.current?.removeCheckList()
            }} className={classNames('text-2xl ',
                choosedData[0] ? ' text-primaryColor cursor-pointer' : ' disabled cursor-not-allowed text-gray-200 dark:text-antdDarkColorFill')} />
        </div>
        <Sortable<T2> className='flex-grow-[3] basis-0' onChoosed={(value) => setChooseData(pre => [pre[0], value])}
            ref={targetRef} name={name} {...target} />
    </div >
}

interface SrotableProps<T> extends ItemProps<T> {
    name: string
    onChoosed: (value: boolean) => void
    onChange?: (list: T[]) => void
    className?: string
}

interface SortableRefProps<T> {
    getChoosedList: () => T[]
    addList: (list: T[] | undefined) => void
    removeCheckList: () => void
}

const Sortable = forwardRef(<T extends TransferItemProps,>(props: SrotableProps<T>, ref: any) => {
    const { name, renderItem, keyField, className, setup = i => i } = props
    const [list, setList] = useState<T[]>(props.defaultValue || empty)
    const [checkList, setCheckList] = useState<ItemId[]>([])
    const group = useMemo(() => (props.readOnly ? { name, 'pull': 'clone', put: false } : { name, 'pull': () => true }), [props.readOnly])

    useEffect(() => { props.onChange?.(list) }, [list])

    useImperativeHandle(ref, () => ({
        getChoosedList: () => list.filter(i => checkList.includes(i[keyField])) || [],
        addList: (newList: T[] | undefined) => !props.readOnly && setList([...list, ...setup((newList || []))]),
        removeCheckList: () => {
            !props.readOnly && setList(pre => pre.filter(i => !checkList.includes(i[keyField])))
            setCheckList([])
        }
    }), [checkList, list])

    useEffect(() => { props.onChoosed(checkList.length > 0) }, [checkList])

    return <div
        className={classNames('flex flex-col h-full gap-2', className)}>
        <Checkbox onChange={e => {
            setCheckList(e.target.checked ? list.map(i => i[keyField]) : [])
        }} indeterminate={(list.length > 0 && checkList.length > 0) &&
            checkList.length < list.length}>全选</Checkbox>
        <ReactSortable
            className="border bg-antdColorBgLayout dark:bg-antdDarkContainer  dark:border-antdDarkBorder flex-1 p-2 flex flex-col gap-2 overflow-auto"
            direction='vertical'
            group={group as unknown as GroupOptions}
            list={list}
            setList={list => setList(setup(list))} >
            {list?.map((i, index) =>
                <div key={i[keyField]} className="group/item p-2 border dark:border-antdDarkBorder flex justify-between select-none cursor-pointer bg-white dark:bg-black">
                    <div className="flex items-center">
                        <Checkbox
                            checked={checkList.includes(i[keyField])}
                            onChange={() => setCheckList(toggle2Array(checkList, i[keyField]))}
                            className="mr-2" />
                        {renderItem(i)}
                    </div>
                    {!props.readOnly && <DeleteFilled
                        className="  hover:text-primaryColor text-lg opacity-0 group-hover/item:opacity-100"
                        onClick={() => setList?.(list.slice(0, index).concat(list.slice(index + 1)))} />}
                </div>)}
        </ReactSortable></div>
}) as <T extends TransferItemProps, >(props: SrotableProps<T> & { ref?: React.Ref<SortableRefProps<T>> }) => JSX.Element;

export default Transfer