import { BetaSchemaForm, ProFormInstance } from "@ant-design/pro-components"
import { useEffect, useMemo, useRef, useState } from "react"
import { FormSchema, ProFormColumnsType } from '@ant-design/pro-form/es/components/SchemaForm/typing'

const SchemaForm = <T, ValueType = 'text'>(props: {
    uk?: string, triggerClassNames?: string
    columns: ProFormColumnsType<T, ValueType>[] | ((values: T) => ProFormColumnsType<T, ValueType>[])
} & FormSchema<T, ValueType>) => {
    const formRef = useRef<ProFormInstance>(null)
    const [data, setData] = useState<T>()

    useEffect(() => {
        formRef.current?.setFieldsValue(props.initialValues)
        // @ts-ignore
        setData(props.initialValues)
    }, [props.initialValues])

    let columns = useMemo(() => {
        if (typeof props.columns === 'function') {
            // @ts-ignore
            return data ? props.columns(data) : []
        }
        return props.columns
    }, [data, props.columns])

    // @ts-ignore
    return <BetaSchemaForm<T>
        onValuesChange={(changeValues, values) => {
            props.onValuesChange?.(changeValues, values)
            setData(pre => ({ ...pre, ...changeValues }))
        }}
        variant='filled'
        labelAlign="left"
        labelCol={{ span: 6 }}
        layout="horizontal"
        {...props}
        //@ts-ignore
        formRef={(ref: any) => {
            if (ref) {
                if (props.formRef) {
                    if (typeof props.formRef === 'function') {
                        // @ts-ignore
                        props.formRef(ref)
                    } else {
                        props.formRef.current = ref
                    }
                }
                formRef.current = ref
            }
        }}
        // @ts-ignore
        columns={columns}
        key={props.uk || props.title}
    />
}
export default SchemaForm