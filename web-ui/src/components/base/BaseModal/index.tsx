import { Modal } from "antd";
import { forwardRef, JSX, useImperativeHandle, useState } from "react";
import { ModalProps } from 'antd/es/modal/interface'

interface ModalProps2 extends ModalProps {
    children?: JSX.Element
}

const BaseModal = forwardRef((props: ModalProps2, ref) => {
    const [opened, setOpened] = useState<boolean>(false)
    useImperativeHandle(ref, () => ({
        open: () => setOpened(true),
        close: () => setOpened(false)
    }))

    return <Modal
        height={100}
        width={600}
        destroyOnClose={true}
        closable={true}
        maskClosable={true}
        onCancel={() => setOpened(false)}
        open={opened}
        loading={props.children == undefined}
        {...props}
        className="!min-h-[200px] !max-h-[500px]"
    >
        <div style={{
            height: props.height || 'auto',
            // minHeight: '200px', maxHeight: '500px'
        }}>
            {props.children}
        </div>
    </Modal >
})

export default BaseModal