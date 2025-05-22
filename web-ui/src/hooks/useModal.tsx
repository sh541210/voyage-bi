import useAntdModal, { HookAPI } from "antd/es/modal/useModal";
import React from "react";
const useModal = (key: string): [instance: HookAPI, contextHolder: React.ReactElement] => {
    const [modal, context] = useAntdModal()
    const info = modal.info
    modal.info = args => info({
        icon: <></>,
        closable: true,
        maskClosable: true,
        footer: null,
        ...args,
    })
    const confirm = modal.confirm
    modal.confirm = args => confirm({
        icon: null,
        closable: true,
        maskClosable: true,
        cancelText: '取消',
        okText: '确定',
        ...args,
    })
    return [modal, React.cloneElement(context, { key })]
}

export default useModal