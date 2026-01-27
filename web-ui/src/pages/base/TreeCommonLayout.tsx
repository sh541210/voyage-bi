import FileTree, { FileTreeNode, FileTreeRefProps } from "@/components/base/FileTree"
import request from "@/utils/request"
import { AimOutlined, LoadingOutlined, LockOutlined, NodeCollapseOutlined, PlusOutlined } from "@ant-design/icons"
import { PageContainer, PageContainerProps, ProFormColumnsType, ProFormInstance } from "@ant-design/pro-components"
import { css } from "@emotion/css"
import { Button, ConfigProvider, Dropdown, message, theme, Tooltip } from "antd"
import classNames from "classnames"
import { forwardRef, JSX, ReactNode, useEffect, useMemo, useRef, useState } from "react"
import SplitPane from "react-split-pane"
import { MenuInfo } from 'rc-menu/lib/interface'
import { convertToNode, converVOListToNodes, useFileNodes } from "@/utils/biz"
import { ItemType } from "antd/es/menu/interface"
import { formatDateTime } from "@/utils/common/date"
import { Icon, useModel } from "@umijs/max"
import { colorPrimary } from "@/constants/theme"
import { fixTreeSelect } from "@/utils/common/common"
import SearchButton from "@/components/SearchButton"
import { MyIcon } from "@/components/base/MyIcon"
import { requiedRulesInput, requiredRuleSelect } from "@/constants"
import useModal from "@/hooks/useModal"
import SchemaForm from "@/components/base/SchemaForm"

interface CreateMenu {
    title: string
    icon: string
    disabled?: boolean
    valueMapper: (node: FileTreeNodeForm) => FileTreeNodeForm
    columns?: ProFormColumnsType[]
}

interface CommonLayoutProps<B, T extends string> extends PageContainerProps {
    bizName: string
    bizType: FileTreeNodeBizType
    headerExtra?: ReactNode[] | ((node: FileTreeNodeVO) => ReactNode[])
    defaultTab?: T,
    createMenus: CreateMenu[]
    renderContent: (tab?: T) => ReactNode
    bizFetch: (refId: number) => Promise<B>
    onFileSelect: (b: B) => void
    onFolderSelect?: (node: FileTreeNodeVO) => void
    hideLeftTree?: boolean
    bizRefId?: number
}

export interface TreeCommonLayoutRefProps {
    selectNode: (nodeId: number) => void
}

const CommonLayout = forwardRef(<B, T extends string = string>(props: CommonLayoutProps<B, T>, ref: React.Ref<TreeCommonLayoutRefProps>) => {
    const { token } = theme.useToken()
    const { bizType, createMenus, hideLeftTree, onTabChange, bizFetch } = props
    const { nodeList, setNodeList, toNodeId, initExecute, buildFullPathChain } = useFileNodes(props.bizType)
    const [rightLoading, setRightLoading] = useState<boolean | ReactNode>(false)
    const [node, setNode] = useState<FileTreeNodeVO>()
    const [rightTab, setRightTab] = useState<T | undefined>(props.defaultTab)
    const [splitSize, setSplitSize] = useState<number>(320)
    const [formModal, formModalContextHolder] = useModal('form')
    const formRef = useRef<ProFormInstance>(null)
    const treeRef = useRef<FileTreeRefProps>(null)
    const bizName = props.bizName
    const [dragging, setDragging] = useState<boolean>(false)
    const { dark } = useModel('global')
    const fullPathChain = useMemo(() => buildFullPathChain(node), [node])

    // 定义函数
    // useImperativeHandle(ref, () => ({
    //     selectNode: (refId: number) => {
    //         const nodeId = toNodeId(refId)
    //         nodeId && treeRef.current?.selectNode(nodeId)
    //     }
    // }))

    useEffect(() => {
        initExecute(() => {
            const nodeId = props.bizRefId && toNodeId(props.bizRefId)
            nodeId && treeRef.current?.selectNode(nodeId)
        })
    }, [props.bizRefId, initExecute])

    // 搜索
    const [filterText, setFilterText] = useState<string>('')

    const dataList = useMemo(() =>
        nodeList.map(vo => convertToNode(vo, i => i.bizRefId > 0, i => false)),
        [nodeList])

    const updateNodeList = (node: FileTreeNodeVO) => {
        if (nodeList.map(i => i.id).includes(node.id)) {
            setNodeList(nodeList.map(i => i.id === node.id ? node : i))
        } else {
            setNodeList([...nodeList, node])
        }
    }

    const getEditPromise = (title: String) =>
        (value: FileTreeNodeForm) => request.PUT('/file-tree-node', value).then(() => {
            message.success(title + '成功！')
            setNodeList(nodeList.map(i => (i.id === value?.id ?
                { ...i, ...value } : i)))
        })

    const renderCeateModal = (keyPath: string[], node?: FileTreeNode<FileTreeNodeVO>) => {
        const selectDicNode = node && node?.origin.bizRefId == 0
        const groupKey = keyPath[keyPath.length - 1]
        const name = node?.directory ? '文件夹' : bizName
        let title: string = ''
        const createMenu = createMenus?.find(j => j.title === keyPath[0])
        const valueMapper = createMenu?.valueMapper || (i => i)

        let requestPromise: (value: FileTreeNodeForm) => Promise<void>;
        // @ts-ignore
        let initialValues: FileTreeNodeForm = { ...node?.origin, bizType }
        if (groupKey.includes('new')) {
            initialValues = {
                id: 0, name: '', description: '',
                // @ts-ignore
                pid: node?.origin.id, bizType
            }
        }
        if (groupKey === 'newFolder') {
            title = '新建文件夹'
            requestPromise = value => request.POST<FileTreeNodeVO>('/file-tree-node/folder', value)
                .then(node => {
                    message.success('创建成功！')
                    updateNodeList(node)
                })
        } else if (groupKey == 'new') {
            title = '新建' + bizName + keyPath[0]
            requestPromise = value => {
                let requestData
                try {
                    requestData = valueMapper({ ...value })
                } catch (error: any) {
                    message.error(error.message)
                    return Promise.reject(error.message)
                }
                return request.POST<FileTreeNodeVO>('/file-tree-node/file', requestData)
                    .then(node => {
                        message.success(title + '成功！')
                        updateNodeList(node)
                        treeRef.current?.selectNode(node.id)
                    })
            }
        } else if (groupKey === 'move') {
            title = '移动' + name
            requestPromise = getEditPromise(title)
        } else if (groupKey === 'rename') {
            title = '重命名' + name
            requestPromise = getEditPromise(title)
        }
        let columns: ProFormColumnsType[] = [{ title: '名称', dataIndex: 'name', ...requiedRulesInput },
        { title: '描述', dataIndex: 'description', valueType: 'textarea' }]
        if (groupKey === 'move') {
            columns = columns.map(i => ({ ...i, readonly: true }))
        }
        if (groupKey !== 'rename') {
            const tree = converVOListToNodes(nodeList.filter(i => i.bizRefId == 0), i => !i.locked, i => i.locked)
            columns.push({
                title: '所属文件夹', dataIndex: 'pid',
                valueType: 'treeSelect',
                ...requiredRuleSelect,
                fieldProps: {
                    // @ts-ignore
                    treeData: fixTreeSelect([{
                        ...tree[0],
                        selectable: selectDicNode || groupKey === 'newFolder',
                        disabled: !(selectDicNode || groupKey === 'newFolder')
                    }]),
                    showSearch: true,
                    treeDefaultExpandedKeys: [0],
                    treeNodeFilterProp: 'title',
                    disabled: groupKey.includes('new') && node
                },
            })
        }
        if (groupKey === 'new') {
            const cols = createMenu?.columns
            cols && columns.push(...cols)
        }

        formModal.confirm({
            title: title,
            onOk: async () => {
                return requestPromise({
                    ...initialValues,
                    ...await formRef.current?.validateFields(),
                    bizType,
                })
            },
            content: <SchemaForm
                formRef={formRef}
                initialValues={initialValues}
                columns={columns}
                submitter={false} />
        })
    }

    const renderCreateMenus = (node?: FileTreeNode<FileTreeNodeVO>) => {
        const menus = []
        menus.push({
            key: 'newFolder', label: '新建文件夹',
            onClick: ({ key, keyPath }: MenuInfo) => renderCeateModal(keyPath, node)
        })
        menus.push({
            key: 'new', label: '新建' + bizName,
            children: createMenus?.map(i => ({
                key: i.title, label: i.title,
                disabled: i.disabled,
                icon: <MyIcon className=" fill-primaryColor" name={i.icon} />
            })),
            onClick: ({ key, keyPath }: MenuInfo) => renderCeateModal(keyPath, node)
        })
        return menus
    }

    const renderRightMenus = (node: FileTreeNode<FileTreeNodeVO>) => {
        const locked = node.origin.locked
        const lockLabel = locked ? '解锁' : '锁定'
        let menus: ItemType<any>[] = [
            { key: 'rename', label: '重命名', onClick: ({ key, keyPath }: MenuInfo) => renderCeateModal(keyPath, node) },
            { key: 'move', label: '移动', onClick: ({ key, keyPath }: MenuInfo) => renderCeateModal(keyPath, node) },
            ...((locked ? node.origin.unLockable : node.origin.lockable) ? [{
                key: 'lock', label: lockLabel, onClick: () => {
                    request.POST(`/file-tree-node/lock/${node.origin.id}/${!locked}`)
                        .then(() => {
                            message.success(`${lockLabel}成功！`)
                            updateNodeList({
                                ...node.origin, locked: !locked,
                                lockTime: !locked ? new Date().getTime() : 0
                            })
                        })
                }
            },] : []),
            {
                key: 'remove', label: '删除', disabled: !node.isLeaf,
                onClick: ({ key }: MenuInfo) => request.DELETE(`/file-tree-node?id=${node.origin.id}`).then(() => {
                    message.success('删除成功！')
                    setNodeList(nodeList.filter(i => i.id !== node.origin.id));
                })
            }]
        node.directory && menus.push(...renderCreateMenus(node))
        return menus.map(i => ({
            ...i, onClick: (info: MenuInfo) => {
                info.domEvent.stopPropagation()
                i.onClick && i.onClick(info)
            }
        })).filter(i => {
            if (node.origin.id === 0) {
                return i.key === 'newFolder'
            }
            return true
        })
    }

    const getBreadcrumbItems = (nodeList: FileTreeNodeVO[]) => {
        const renderMenuItem = (targetNode: FileTreeNodeVO, level: number) => {
            return <div className={classNames(fullPathChain[level]?.id === targetNode.id
                && '!text-primaryColor')}
                onClick={() => treeRef.current?.selectNode(targetNode.id)}
            >{targetNode.name}</div>
        }
        return [{
            title: '根目录', menu: {
                items: nodeList.filter(n => n.pid === 0).map(n => ({
                    key: n.id, label: renderMenuItem(n, 0)
                }))
            }
        },
        ...fullPathChain.map((node, index) => ({
            title: node.name,
            ...(node.bizRefId === 0 && {
                menu: {
                    items: nodeList.filter(n => n.pid === node.id && n.bizRefId > 0)
                        .map(child => ({
                            key: child.id,
                            label: renderMenuItem(child, index + 1)
                        }))
                }
            })
        }))]
    };

    return <ConfigProvider><div className="h-full w-full relative flex">
        {formModalContextHolder}
        {/* @ts-ignore */}
        <SplitPane
            pane2Style={{
                minWidth: '0px'
                // maxWidth: 'calc(100% - 1px)'
            }}
            split="vertical"
            size={hideLeftTree != undefined && hideLeftTree ? 0 : splitSize}
            minSize={240}
            maxSize={420}
            onChange={(num) => setSplitSize(num)}
        >
            <div className='relative h-full flex flex-col' style={{
                borderColor: token.colorBorderSecondary,
                background: !dark ? token.colorBgBase : token.colorBgContainer
            }}>
                <div style={{ borderBottomColor: token.colorBorderSecondary, flex: '0 0 40px' }}
                    className={classNames(' relative', css(`height: 40px`),
                        'px-4 py-2 flex justify-between items-center border-b')}>
                    <div className=" text-sm font-bold">{bizName}</div>
                    <div className="flex items-center gap-2">
                        <Button size='small' icon={<NodeCollapseOutlined />} onClick={() => {
                            treeRef.current?.collpseNodes([])
                        }} />
                        <Button size='small' icon={<AimOutlined />} onClick={() => {
                            const ids = fullPathChain.map(i => i.id)
                            treeRef.current?.selectNode(ids[ids.length - 1],
                                ids.slice(0, ids.length - 1)
                            )
                        }} />
                        {/* @ts-ignore */}
                        <Dropdown menu={{ items: renderCreateMenus() }}>
                            <Button size="small" icon={<PlusOutlined />} />
                        </Dropdown>
                        <SearchButton onChange={setFilterText}
                            onClose={() => setFilterText('')} />
                    </div>
                </div>
                <div className=" overflow-auto" style={{ flex: 1 }}>
                    <FileTree<FileTreeNodeVO>
                        searchText={filterText}
                        renderIcon={(node, { selected, expanded }) => {
                            const dict = node.origin.bizRefId === 0;
                            // const props = {
                            //     width: 18,
                            //     height: 18,
                            //     fill: 
                            //     icon: `local:${}`
                            // }
                            // @ts-ignore
                            return <div className="flex items-center">
                                <MyIcon size={dict ? 22 : 18} style={{
                                    fill: selected ? '#fff' : colorPrimary,
                                }} name={dict ? (expanded ? 'folder_open' : 'folder') : node.origin.bizTypeExtra} />
                                {node.origin.locked && <MyIcon name="lock" size={18}
                                    className={classNames('ml-1 -mr-0.5 ',
                                        selected ? 'fill-yellow-300' : 'fill-yellow-500'
                                    )}
                                />}
                            </div>
                        }}
                        renderTitle={node => {
                            const { origin } = node
                            return <Tooltip style={{ display: dragging ? 'none' : '' }}
                                mouseEnterDelay={0.5} mouseLeaveDelay={0} title={<div>
                                    <div>描述：{origin.description}</div>
                                    <div>创建用户：{origin.createUser?.trim().length == 0
                                        ? '未知' : origin.createUser}</div>
                                    <div>创建时间：{formatDateTime(origin.createTime)}</div>
                                    <div>修改用户：{origin.updateUser}</div>
                                    {origin.locked && <div>锁定时间：{formatDateTime(origin.lockTime)}</div>}
                                    {origin.locked && <div>锁定用户：{origin.lockUserName}</div>}
                                </div>}>
                                {node.title}
                            </Tooltip>
                        }}
                        ref={treeRef}
                        renderRightMenus={renderRightMenus}
                        cacheKey={bizType}
                        onMoveStart={() => setDragging(true)}
                        onMoveEnd={() => setDragging(false)}
                        onNodeMove={(dragNode, target) => {
                            const pid = target.directory ? target.origin.id : target.origin.pid
                            const { id, name, description } = dragNode.origin
                            getEditPromise('移动')({ id, name, description, pid: pid || 0, bizType })
                        }}
                        dataList={dataList}
                        onNodeClick={(node) => {
                            setNode(node.origin)
                            setRightLoading(true)
                            if (node.origin.bizRefId !== 0) {
                                bizFetch(node.origin.bizRefId).then((data: B) => {
                                    props.onFileSelect(data)
                                    setRightLoading(false)
                                })
                            } else {
                                props.onFolderSelect?.(node.origin)
                                setRightLoading(false)
                            }
                        }}
                    />
                </div>
            </div>
            <div className="h-full relative w-full">
                {node && <PageContainer
                    breadcrumb={{
                        style: { paddingBlockStart: 0 },
                        items: getBreadcrumbItems(nodeList),
                        separator: <span className="mx-1">/</span>
                    }}
                    tabActiveKey={rightTab}
                    childrenContentStyle={{
                        paddingInline: '0', paddingBlockEnd: '0',
                        position: 'relative', overflow: 'auto',
                        // TODO 
                        height: 'calc(100vh - 43px - 12px - 69px)',
                        background: token.colorBgLayout
                    }}
                    header={{
                        title: <div className="flex items-center gap-2"><MyIcon name={node.bizTypeExtra}
                            size={24} className=" fill-primaryColor" />{node.locked && (
                                <MyIcon size={24} name="lock"
                                    className="fill-yellow-500 -ml-0.5 -mr-1 "
                                />
                            )}{node.name}</div>,
                        subTitle: node.description,
                        style: {
                            padding: '10px 20px', height: '100%', position: 'relative',
                            borderBottom: `1px solid ${token.colorBorderSecondary}`,
                            // paddingBlockStart: 0,
                            // marginBlockStart: 0
                        },
                        extra: (typeof props.headerExtra === 'function' ? props.headerExtra(node) : props.headerExtra)?.map((i, idx) => <div key={idx}>{i}</div>),
                    }}
                    loading={rightLoading && {
                        spinning: true,
                        indicator: <LoadingOutlined />
                    }}
                    style={{
                        background: token.colorBgContainer,
                        height: '100%', position: 'relative', overflow: 'hidden',
                    }}
                    fixedHeader
                    {...props}
                    onTabChange={tab => {
                        setRightTab(tab as T)
                        onTabChange && onTabChange(tab as T)
                    }}
                >
                    {props.renderContent(rightTab)}
                </PageContainer>}
            </div>
        </SplitPane>
    </div>
    </ConfigProvider>
}) as <B, T extends string = string>(props: CommonLayoutProps<B, T> & { ref?: React.Ref<TreeCommonLayoutRefProps> }) => JSX.Element;

export default CommonLayout