import { convertToTree, FileTreeNode } from "@/components/base/FileTree";
import { useCallback, useEffect, useMemo, useState } from "react";
import request from "./request";
import { formatDateTime } from "./common/date";

type ResultSet = Array<Array<string>>
// 将结果集转换为 dataSource 和 columns
export const convertResultSetToAntdTable = (resultSet: ResultSet) => {
    const [metadata, ...data] = resultSet; // 将第一行作为元数据，剩余行作为数据

    // 解析元数据为表格列配置 columns
    const columns = metadata.map((title: any, index: number) => ({
        title,
        dataIndex: index,
        key: `column_${index}`,
    }));

    // 解析数据为 dataSource
    const dataSource = data.map((row: any, rowIndex: number) => {
        const rowData: Record<string, any> = {};
        row.forEach((value: any, columnIndex: number) => {
            rowData[columnIndex] = value;
        });
        return { key: rowIndex, ...rowData };
    });
    return { columns, dataSource };
};

export const convertToNode = (i: FileTreeNodeVO,
    mapper: (j: FileTreeNodeVO) => boolean,
    disabledMapper: (j: FileTreeNodeVO) => boolean) => {
    return {
        origin: { ...i },
        key: i.id,
        value: i.id,
        title: i.name, isLeaf: true,
        directory: i.bizRefId == 0,
        selectable: mapper(i),
        disabled: disabledMapper(i)
    }
}

export const converVOListToNodes = (origin: FileTreeNodeVO[],
    mapper: (j: FileTreeNodeVO) => boolean = i => true,
    disabledMapper: (j: FileTreeNodeVO) => boolean = i => false): FileTreeNode<FileTreeNodeVO>[] => {
    return convertToTree(origin.map(i => convertToNode(i, mapper, disabledMapper)))
}

export const useFileNodes = (bizTpye: FileTreeNodeBizType) => {
    const [nodeList, setNodeList] = useState<FileTreeNodeVO[]>([])
    const [_n, set_N] = useState<number>(0)
    useEffect(() => {
        request.GET<FileTreeNodeVO[]>
            (`/file-tree-node/list?bizType=${bizTpye}`).then(_setNodeList)
    }, [])

    const _setNodeList = (list: FileTreeNodeVO[]) => {
        setNodeList(list)
        set_N(pre => pre + 1)
    }

    return {
        initExecute: useCallback((func: () => void) => {
            if (_n === 1) {
                func()
            }
        }, [_n]),
        nodeList,
        setNodeList: _setNodeList,
        buildFullPathChain: (node: FileTreeNodeVO | undefined) => {
            const nodeMap = new Map(nodeList.map(n => [n.id, n]));
            const chain: FileTreeNodeVO[] = [];
            let current: FileTreeNodeVO | undefined = node;
            while (current) {
                chain.unshift(current); // 从当前节点向上追溯父节点
                current = nodeMap.get(current.pid);
            }
            return chain; // 示例结果：[根节点, 父节点A, 父节点B, 当前节点]
        },
        treeSelectData: useMemo(() =>
            converVOListToNodes(nodeList, i => i.bizRefId > 0,
                i => i.bizRefId == 0), [nodeList]),
        toRefId: (nodeId?: number) => nodeList.find(i => i.id === nodeId)?.bizRefId,
        toNodeId: (refId?: number) => nodeList.find(i => i.bizRefId === refId)?.id,
        getName: (refId?: number) => nodeList.find(i => i.bizRefId === refId)?.name,
        toRefIds: (nodeIds: number[]) => nodeList.filter(i => nodeIds.includes(i.id))
            .map(i => i.bizRefId),
        toNodeIds: (refIds: number[]) => nodeList.filter(i => refIds.includes(i.bizRefId)).map(i => i.id)
    }
}


export const getUpdateTime = (charts: ChartVO[]) => {
    const times = charts
        .map(i => i.dataUpdateTime)
        .filter(i => i)
    return times.length > 0 ? formatDateTime(Math.max(...times)) : '-'
}

export const getGroupType = (dashboardStyleCfg: DashboardStyleCfg | undefined, group: ChartGroupVO, mode: Mode) => mode === 'mobile' ?
    (dashboardStyleCfg?.mobileGroupTypes?.[group.id] || group.groupType)
    : group.groupType

export const generateMockData = (com: ChartComponentVO): { yColumns: Column[], xColumns: Column[], data: DataSet } => {
    return {
        data: {
            rows: [[1, 2, 3], [1, 2, 3]],
            columns: ['字段1', '字段2', '字段3'],
            x: [], y: []
        },
        //@ts-ignore
        xColumns: [[{ key: 1, alias: '字段1' }, { key: 2, alias: '字段2' }, { key: 3, alias: '字段3' }]],
        //@ts-ignore
        yColumns: [[{ key: 1, alias: '字段1' }, { key: 2, alias: '字段2' }, { key: 3, alias: '字段3' }]]
    }
}

const getDefault = (i: ColumnLine) => {
    return i.valueProps || ({
        percent: false,
        numberSplit: i.dataType === 'NUMBER',
        digit: i.dataType === 'NUMBER' ? 2 : undefined
    } as ValueProps)
}

export const getSetupList = (list: ColumnLine[], isMetric: boolean) => {
    // 默认设置函数
    if (isMetric) {
        list = list.map(i => {
            const func = i.func || (i.dataType === 'NUMBER' ? 'SUM' : 'COUNT')
            return {
                ...i, func, key: i.key ?? genKey(),
                valueProps: getDefault(i)
            }
        })
    } else {
        list = list.map(i => ({ ...i, key: i.key ?? genKey(), func: undefined, valueProps: getDefault(i) }))
    }
    return list
}

export const genKey = () => {
    const timestamp = new Date().getTime()
    // 当前时间戳 - 随机数
    return timestamp - Math.floor(Math.random() * (100001));
}