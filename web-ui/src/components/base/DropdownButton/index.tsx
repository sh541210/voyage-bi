import { Button, ButtonProps, Dropdown } from "antd"
import classNames from "classnames"
import { CSSProperties, JSX, useEffect, useState } from "react"
import { MyIcon } from "../MyIcon"

interface DropdownButtonProps<T extends React.Key> {
    value: T | undefined
    options: {
        label: string | JSX.Element | React.ReactNode,
        value: T
    }[]
    className?: string
    style?: CSSProperties
    onChange?: (value: T) => void
    buttonProps?: ButtonProps
}
const DropdownButton = <T extends React.Key,>(props: DropdownButtonProps<T>) => {
    const { value, options, style = {}, className, onChange } = props
    const [active, setActive] = useState<T | undefined>(value)

    return <Dropdown menu={{
        items: options.filter(i => i.value !== value).map(i => ({
            label: <div className=" cursor-pointer" onClick={() => { setActive(i.value); onChange?.(i.value) }} >
                {i.label}
            </ div>,
            key: i.value
        }))
    }}>
        <Button
            {...props.buttonProps}
            onClick={(e) => e.preventDefault()}
            className={classNames(className)}
            style={{ ...style, border: 'none', boxShadow: 'none' }}
            size='small' icon={<MyIcon className=" fill-gray-500" name='down' />}>
            {options.find(i => i.value === value)?.label}</Button>
    </Dropdown>
}


export default DropdownButton