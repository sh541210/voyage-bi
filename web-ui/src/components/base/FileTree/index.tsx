import './tree.less'
import { DownOutlined, FileTwoTone, FolderOpenTwoTone, FolderTwoTone } from '@ant-design/icons';
import DirectoryTree from 'antd/es/tree/DirectoryTree';
import { Dropdown } from 'antd';
import { JSX, Key, ReactNode, forwardRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { BasicDataNode, DataNode } from 'antd/es/tree';
import { useLocalStorage } from '@/hooks';
import { ItemType } from 'antd/es/menu/interface';
import { colorPrimary } from '@/constants/theme';

interface FileNode { id: number, pid: number }
export type FileTreeNode<T extends FileNode> = (BasicDataNode & DataNode) & {
    children?: FileTreeNode<T>[];
    key: string | number;
    title: string;
    directory: boolean;
    value: string | number;
    origin: T
};

export interface NodeOptions { selected: boolean, expanded: boolean }
interface FileTreeProps<T extends FileNode> {
    cacheKey: string;
    rootTitle?: string
    dataList: FileTreeNode<T>[],
    searchText: string,
    renderTitle?: (fileTreeNode: FileTreeNode<T>) => ReactNode;
    renderRightMenus: (fileTreeNode: FileTreeNode<T>) => ItemType[];
    onNodeClick: (fileTreeNode: FileTreeNode<T>) => void;
    onNodeMove?: (dragNode: FileTreeNode<T>, targetNode: FileTreeNode<T>) => void;
    onMoveStart?: (node: FileTreeNode<T>) => void;
    onMoveEnd?: (node: FileTreeNode<T>) => void
    renderIcon?: (node: FileTreeNode<T>, options: NodeOptions) => ReactNode
}

export interface FileTreeRefProps {
    selectNode: (id: number, expandedArray?: number[]) => void
    collpseNodes: (nodeIds: number[]) => void
}

// 将列表数据转换为树形结构
export const convertToTree = <T extends FileNode>(nodes: FileTreeNode<T>[], rootTitle: string = '根目录'): FileTreeNode<T>[] => {
    // 创建深拷贝节点，防止污染原始数据
    const nodesCopy = nodes.map(node => ({ ...node, children: [] as FileTreeNode<T>[] }));
    const nodeMap = Object.fromEntries(nodesCopy.map(node => [node.origin.id, node]));
    nodesCopy.sort((a, b) => (a.directory === b.directory ? a.origin.id - b.origin.id : a.directory ? -1 : 1));
    // 构建树结构
    const tree = nodesCopy.reduce((acc, node) => {
        if (node.origin.pid === 0) {
            acc.push(node);
        } else {
            nodeMap[node.origin.pid]?.children.push(node);
            nodeMap[node.origin.pid] && (nodeMap[node.origin.pid]['isLeaf'] = false);
        }
        return acc;
    }, [] as FileTreeNode<T>[]);
    return [{
        title: rootTitle, value: 0, key: '0', directory: true,
        selectable: false, children: tree, origin: { id: 0 }
    } as FileTreeNode<T>];
};

const defaultRenderIcon = <T extends FileNode>(node: FileTreeNode<T>, { selected, expanded }: NodeOptions) => {
    const twoToneColor: [string, string] = selected ? ['#fff', '#fff'] : [colorPrimary, colorPrimary]
    return node.directory ? (expanded ? <FolderOpenTwoTone twoToneColor={twoToneColor} /> :
        <FolderTwoTone twoToneColor={twoToneColor} />) :
        <><FileTwoTone /></>
}

const FileTree = forwardRef(<T extends FileNode,>(props: FileTreeProps<T>, ref: React.Ref<FileTreeRefProps>) => {
    const { dataList, onNodeClick, cacheKey, searchText,
        renderIcon = defaultRenderIcon, rootTitle = '根目录' } = props
    const [keys, setKeys] = useLocalStorage<{ selectedKeys: Key[], expandedKeys: Key[] }>
        (`TREE_CACHE_${cacheKey}`, { selectedKeys: [], expandedKeys: [] })

    useEffect(() => {
        const node = dataList.find(i => i.key === keys.selectedKeys[0])
        node && onNodeClick(node)
    }, [keys.selectedKeys, dataList])

    // 定义函数
    useImperativeHandle(ref, () => ({
        selectNode: (key: number, expandedArray?: number[]) => {
            setKeys({
                ...keys, selectedKeys: [key],
                expandedKeys: [...keys.expandedKeys, ...(expandedArray || [])]
            })
        },
        collpseNodes: (nodeIds?: number[]) => {
            setKeys({ ...keys, expandedKeys: [...(nodeIds || [])] })
        }
    }))

    const searchLoop = (
        tree: FileTreeNode<T>[],
        searchText: string
    ): { treeData: FileTreeNode<T>[]; expandedKeys: React.Key[] } => {
        const expandedKeys: React.Key[] = [];
        // 递归过滤和高亮节点
        const filterNode = (node: FileTreeNode<T>): FileTreeNode<T> | null => {
            const strTitle = node.title;
            const index = strTitle.indexOf(searchText);
            // 如果搜索文本存在于 title 中，设置高亮
            const title = (index > -1 ? <span key={node.key}>
                {strTitle.substring(0, index)}
                <span className="text-red-500">{searchText}</span>
                {strTitle.slice(index + searchText.length)}
            </span> : <span key={node.key}>{strTitle}</span>) as ReactNode
            // 递归处理子节点
            const filteredChildren = (node.children || [])
                .map(filterNode) // 处理子节点
                .filter(Boolean) as FileTreeNode<T>[]; // 去掉空节点并保证类型
            // 如果当前节点匹配或子节点有匹配，保留节点
            if (index > -1 || filteredChildren.length > 0) {
                // 如果有匹配的子节点，当前节点需要展开
                if (filteredChildren.length > 0) {
                    expandedKeys.push(node.key);
                }
                return { ...node, title, children: filteredChildren, } as FileTreeNode<T>;
            }
            // 不匹配时返回 null
            return null;
        };
        // 处理顶级节点
        const treeData = tree.map(filterNode).filter(Boolean) as FileTreeNode<T>[];
        // 返回过滤后的树和展开的 key 列表
        return { treeData, expandedKeys };
    };

    // 使用 useMemo 来计算结果
    const { treeData, expandedKeys } = useMemo(() => {
        return searchLoop(convertToTree(dataList, rootTitle), searchText);
    }, [dataList, searchText]);

    return <DirectoryTree<FileTreeNode<T>>
        treeData={treeData}
        titleRender={(node: FileTreeNode<T>) => {
            const options = {
                selected: keys.selectedKeys.includes(node.key),
                expanded: keys.expandedKeys.includes(node.key)
            }
            return <Dropdown trigger={['contextMenu']} menu={{ items: props.renderRightMenus({ ...node, title: '' }) }}>
                <div className='flex items-center  break-keep'>
                    <span className='!text-[18px]'>{renderIcon(node, options) || defaultRenderIcon(node, options)}</span>
                    <span className=" w-full ml-1 text-sm whitespace-nowrap !leading-[22px]">
                        {node.key === '0' ? node.title : (props.renderTitle?.(node) || node.title)}
                    </span>
                </div>
            </Dropdown>
        }}
        blockNode
        switcherIcon={<DownOutlined className='!text-[12px] !text-[#444]'/>}
        className='bg-transparent overflow-auto px-4 py-2 h-full'
        onDragEnter={({ node }) => props.onMoveStart?.(node)}
        onDragEnd={({ node }) => props.onMoveEnd?.(node)}
        allowDrop={({ dropNode }) => dropNode.directory}
        onDrop={({ dragNode, node }) => props.onNodeMove?.(dragNode, node)}
        draggable
        showIcon={false}
        defaultSelectedKeys={keys.selectedKeys}
        selectedKeys={keys.selectedKeys}
        expandedKeys={[...(searchText ? expandedKeys : keys.expandedKeys), '0']}
        defaultExpandAll
        // autoExpandParent={true}
        onSelect={(selectedKeys, { }) => setKeys({ ...keys, selectedKeys })}
        onExpand={expandedKeys => setKeys({ ...keys, expandedKeys })}
    />
}) as <T extends FileNode>(props: FileTreeProps<T> & { ref?: React.Ref<FileTreeRefProps> }) => JSX.Element;

export default FileTree