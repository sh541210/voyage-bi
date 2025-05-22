import Transfer from "@/components/base/Transfer"
import useModal from "@/hooks/useModal"
import { getSetupList, } from "@/utils/biz"
import { renderColumnLine, renderSheetColumnTitle } from "@/utils/render"
import { useRef } from "react"

export const useBatchModal = (
    sheetColumns: DataSheetColumnSimpleVO[] | undefined) => {
    const [batchModal, batchModalContext] = useModal('batch')
    const listRef = useRef<ColumnLine[]>([]);
    const open = (title: string, choosedList: ColumnLine[],
        sortKey: ColumnKey | undefined,
        isMertic: boolean,
        onOk: (list: ColumnLine[]) => void) => batchModal.confirm({
            title: `批量处理${title}`,
            width: 600,
            onOk() { onOk(listRef.current) },
            content: <Transfer<DataSheetColumnSimpleVO, ColumnLine>
                name='batch'
                target={{
                    setup: value => getSetupList(value as ColumnLine[], isMertic),
                    keyField: 'key',
                    defaultValue: choosedList,
                    onChange: (value: ColumnLine[]) => listRef.current = value,
                    renderItem: i => renderColumnLine(sortKey, i)
                }}
                source={{
                    keyField: 'id',
                    readOnly: true,
                    defaultValue: sheetColumns,
                    renderItem: renderSheetColumnTitle
                }}
                style={{ height: '600px' }} />
        })
    return { open, batchModalContext }
}