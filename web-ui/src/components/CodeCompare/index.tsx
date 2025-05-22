import { MonacoDiffEditor } from "@monaco-editor/react";
import { ModalFuncProps } from "antd";
import { CodeDiffEditor } from "../base/Editor";
import useModal from "@/hooks/useModal";

export const useDiffCopmare = () => {
    const [modal, contextHolder] = useModal('diff-compare');
    return {
        open: (original: string | undefined, text: string | undefined, language: string, modalProps?: ModalFuncProps) =>
            modal.confirm({
                title: '代码对比',
                height: '500px',
                width: 'calc(100% - 100px)',
                content: <div className="" style={{ height: '600px' }}><CodeCompare original={original} text={text} language={language} /></div>,
                ...modalProps
            }),
        contextHolder
    }
}

const CodeCompare = (props: { original: string | undefined, text: string | undefined, language: string }) => {
    return <CodeDiffEditor
        height="100%"
        language={props.language}
        original={props.original}
        modified={props.text}
        options={{
            readOnly: true
        }}
        keepCurrentModifiedModel={false}
        keepCurrentOriginalModel={true}
        onMount={(editor: MonacoDiffEditor) => {
            // @ts-ignore
            const ed = editor.getModel().modified;
            ed.onDidChangeContent(() => {
                // setText(ed.getValue())
            });
        }}
    />
}

export default CodeCompare