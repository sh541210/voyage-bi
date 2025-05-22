// import useModal from "@/hooks/useModal";
// import { useRef } from "react";

// export const useBatchModal = (
//     sheetColumns: DataSheetColumnSimpleVO[] | undefined) => {
//     const [batchModal, batchModalContext] = useModal('batch')
//     const listRef = useRef<ColumnLine[]>([]);
//     const open = (title: string, choosedList: ColumnLine[],
//         sortKey: ColumnKey | undefined,
//         isMertic: boolean,
//         onOk: (list: ColumnLine[]) => void) => batchModal.confirm({
//             icon: <></>,
//             closable: true,
//             maskClosable: true,
//             title: `批量处理${title}`,
//             width: 600,
//             cancelText: '取消',
//             okText: '确定',
//             onOk() {
//                 onOk(listRef.current)
//             },
//             content: 
//         })
//     return { open, batchModalContext }
// }