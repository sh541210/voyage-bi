import { FormSchema } from '@ant-design/pro-form/es/components/SchemaForm/typing'
import classNames from "classnames"
import SchemaForm from "../SchemaForm"

const FormModal = <T, ValueType = 'text'>(props: {
    uk?: string, triggerClassNames?: string
} & FormSchema<T, ValueType>) => {
    //@ts-ignore
    return <SchemaForm
        width={420}
        layoutType='ModalForm'
        modalProps={{
            destroyOnClose: true
        }}
        {...props}
        // @ts-ignore
        trigger={props.trigger || <div className={classNames(props.triggerClassNames, 'w-full')}>{props.title}</div>}
    />
}

export default FormModal