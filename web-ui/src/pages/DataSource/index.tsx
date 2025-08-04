import request from "@/utils/request"
import { ProFormInstance } from "@ant-design/pro-components"
import { message } from "antd"
import { useEffect, useRef, useState } from "react"
import TreeCommonLayout from "../base/TreeCommonLayout"
import SelectDB from '@/assets/SelectDB.png'
import MySQL from '@/assets/MySQL.png'
import { renderButton } from "@/utils/render"
import DropdownButton from "@/components/base/DropdownButton"
import { EditOutlined, LinkOutlined } from "@ant-design/icons"
import SchemaForm from "@/components/base/SchemaForm"
const images: any = { MySQL, SelectDB }

const records: Record<string, string> = {
    'local': '本地',
    'development': "开发",
    'dev': '开发',
    'test': '测试',
    'default': '默认',
    'prod': '线上',
    'production': '线上',
    'pro': '线上',
    'pre': '预发'
}

const DatasourcePage = () => {
    const [datasource, setDatasource] = useState<DatasourceVO>()
    const [env, setEnv] = useState<string>()
    const [readOnly, setReadOnly] = useState<boolean>(true)
    const formRef = useRef<ProFormInstance>(null)

    useEffect(() => {
        datasource && setEnv(Object.keys(datasource?.cfgStore.data as any)[0])
        setReadOnly(true)
        setEnv(datasource?.cfgStore.defaultEnv)
    }, [datasource])

    const updateCfg = (env: string, cfg: DatasourceCfg) => {
        datasource && setDatasource({
            ...datasource,
            cfgStore: {
                ...datasource.cfgStore, data: { ...datasource?.cfgStore.data, [env]: cfg }
            }
        })
    }

    const renderPanel = (type: string, env: string, cfg: DatasourceCfg) => {
        return <div>
            <div className="flex justify-center mb-8">
                <img className=" h-[120px] w-auto" src={images[type]} />
            </div>
            <SchemaForm
                className=" break-words m-auto w-[600px]"
                key={`${datasource?.id}-${env}`}
                formRef={formRef}
                labelCol={{ span: 4 }}
                initialValues={cfg}
                columns={[{ dataIndex: 'url', title: '数据库连接' },
                { dataIndex: 'username', title: '用户名' },
                { dataIndex: 'password', title: '密码', valueType: 'password' },
                { dataIndex: 'version', title: '版本' },
                ].map(i => ({ ...i, readonly: readOnly }))}
                onFinish={async (form: any) => {
                    return request.PUT('/datasource/cfg', { ...form, env, id: datasource?.id }).then(() => {
                        message.success('保存成功!')
                        setReadOnly(true)
                        updateCfg(env, form)
                        return true
                    })
                }}
                submitter={readOnly ? false : { searchConfig: { submitText: '保存' } }}
            />
        </div>
    }

    return <>
        <TreeCommonLayout<DatasourceVO>
            headerExtra={[
                <DropdownButton
                    onChange={env => {
                        const form = {
                            ...datasource, cfgStore: {
                                ...datasource?.cfgStore,
                                defaultEnv: env
                            }
                        }
                        request.PUT(`/datasource`, form).then(() => {
                            setDatasource(form as DatasourceVO)
                            message.success(`切换默认环境至「${env}」！`)
                        })
                    }}
                    value={datasource?.cfgStore.defaultEnv}
                    options={Object.keys(datasource?.cfgStore?.data || {})
                        .map(i => ({ value: i, label: records[i] || i }))} />,
                renderButton(<EditOutlined key={readOnly ? '编辑' : '取消'} onClick={() => {
                    if (!readOnly) {
                        formRef.current?.resetFields()
                    }
                    setReadOnly(!readOnly)
                }} />),
                renderButton(<LinkOutlined onClick={() => {
                    env && request.POST(`/datasource/checkConnect?datasourceType=${datasource?.type}`,
                        { ...datasource?.cfgStore.data[env] })
                        .then(data => data ? message.success('检查通过！')
                            : message.error('检查未通过！'))
                }} key='测试连通性' />),
            ]}
            tabActiveKey={env}
            hideLeftTree={false}
            bizType='datasource'
            bizName="数据源"
            createMenus={['MySQL', 'SelectDB']
                .map(type => ({ title: type, icon: type, valueMapper: i => ({ ...i, bizTypeExtra: type }) }))}
            onTabChange={setEnv}
            tabList={!datasource ? [] : Object.keys(datasource?.cfgStore.data as any).map(env => ({
                key: env, label: records[env] || env, children: renderPanel(datasource.type, env, datasource.cfgStore.data[env])
            }))}
            bizFetch={async (id: number) => request.GET<DatasourceVO>(`/datasource?id=${id}`)}
            renderContent={() => datasource && <></>}
            onFileSelect={setDatasource} />
    </>
}

export default DatasourcePage