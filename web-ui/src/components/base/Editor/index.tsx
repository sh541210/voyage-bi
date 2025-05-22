import { useDiffCopmare } from "@/components/CodeCompare"
import { renderButton } from "@/utils/render"
import { ClearOutlined, FormatPainterOutlined, SaveOutlined } from "@ant-design/icons"
import { DiffEditor, DiffEditorProps, Editor, EditorProps, Monaco } from "@monaco-editor/react"
import { useModel } from "@umijs/max"
import { forwardRef, JSX, useEffect, useRef, useState } from "react"
import { formatCustomSql } from "./format"
import classNames from "classnames"
import { useHightlight } from "./highlight"

export const CodeEditor = (props: EditorProps) => {
    const { dark } = useModel('global')
    const { handleEditorDidMount } = useHightlight('sql', [{
        name: 'variables',
        regex: /(\$\{)([^}]+)(\})/,
        styles: {
            vs: { foreground: '#8A2BE2', fontStyle: 'italic', background: 'rgba(138,43,226,.15)' },
            'vs-dark': { foreground: '#DDA0DD', fontStyle: 'italic', background: 'rgba(138,43,226,.3)' }
        }
    }])

    return <Editor {...props}
        theme={dark ? 'vs-dark' : 'vs'}
        options={{ ...props.options, fontSize: 15 }}
        onMount={handleEditorDidMount}
        beforeMount={(monaco) => {
            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                jsx: monaco.languages.typescript.JsxEmit.React, // 启用 React JSX 转换
                target: monaco.languages.typescript.ScriptTarget.Latest, // 启用最新的 JavaScript 特性
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs, // 使用 Node.js 模块解析
                esModuleInterop: true, // 允许默认导入非 ES6 模块
            });
        }}
    />
}

export const CodeDiffEditor = (props: DiffEditorProps) => {
    const { dark } = useModel('global')
    return <DiffEditor  {...props} theme={dark ? 'vs-dark' : 'vs'}
        options={{ ...props.options, fontSize: 14 }} />
}


export const EditorContainer = forwardRef((props: {
    origin: string, language: string,
    onOk?: (text: string) => void, save?: boolean,
    actions?: (text?: string) => JSX.Element[]
    className?: string
}, ref) => {
    const { origin, language, save = true } = props
    const [text, setText] = useState<string | undefined>(origin)
    const { contextHolder, open } = useDiffCopmare()
    const editorRef = useRef<any>(null);

    useEffect(() => {
        setText(origin)
    }, [origin])

    const handleFormat = () => {
        if (editorRef.current) {
            const editor = editorRef.current;
            editor?.getAction('editor.action.formatDocument').run();
        }
        if (language === 'sql') {
            setText(formatCustomSql(text || ''))
        }
    };

    return <div className={classNames('h-full w-full relative', props.className)}>
        <div className="p-2 flex gap-2 items-center flex-row
     bg-white dark:bg-antdDarkContainer border-antdColorBorder dark:border-antdDarkBorder border-b">
            {[<FormatPainterOutlined key='格式化' onClick={handleFormat} />,
            <ClearOutlined key='重置' onClick={() => setText(origin)} />,
            ...save ? [
                <SaveOutlined key='保存' onClick={() => open(origin, text, language, {
                    okText: '确定保存',
                    onOk: () => props.onOk?.(text || '')
                })} />] : []].map(renderButton)}
            {props.actions?.(text)}
        </div>
        <CodeEditor
            onMount={(editor) => editorRef.current = editor}
            language={language}
            height='calc(100% - 41px)' value={text || ''}
            onChange={setText}
        />
        {contextHolder}
    </div>
})