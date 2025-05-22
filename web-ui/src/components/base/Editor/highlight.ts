import { Monaco } from "@monaco-editor/react";
import { useModel } from "@umijs/max";
import { useEffect } from "react";

interface Rule {
    name: string
    regex: RegExp
    styles: {
        [theme: string]: {
            foreground?: string
            fontStyle?: string
            background?: string
        }
    }
}

export const useHightlight = (language: string, rules: Rule[]) => {
    const { dark } = useModel('global')
    const theme = dark ? 'vs-dark' : 'vs'

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        // 设置高亮
        setHighlight(editor, monaco, theme, language, rules)
    }

    useEffect(() => {
        const styleTag = document.createElement('style');
        // TODO 未找到api, 暂时硬编码.mtk25
        styleTag.textContent =
            rules.map(i => `.monaco-editor .mtk25 { background: ${i.styles[theme].background} !important; }`)
                .join('\n')
        document.head.appendChild(styleTag);
        return () => { document.head.removeChild(styleTag); }
    }, [dark]);

    return {
        handleEditorDidMount
    }
}

const setHighlight = (editor: any, monaco: Monaco,
    theme: string, language: string, rules: Rule[]) => {
    const lang = monaco.languages.getLanguages().find(l => l.id === language)!;
    //@ts-ignore
    lang.loader().then(({ language: originalConfig }: any) => {
        const tokenizerStates = { ...originalConfig.tokenizer };
        ['string'].forEach(stateName => {
            if (tokenizerStates[stateName]) {
                tokenizerStates[stateName] = [
                    ...rules.map(i => [i.regex, i.name]),
                    ...tokenizerStates[stateName]
                ];
            }
        })
        monaco.languages.setMonarchTokensProvider('sql', {
            ...originalConfig,
            tokenizer: {
                ...tokenizerStates,  // 使用修改后的状态
                root: [
                    ...rules.map(i => [i.regex, i.name]),
                    ...(originalConfig.tokenizer?.root || [])
                ]
            }
        });
    }).catch(console.error);

    ['vs', 'vs-dark'].forEach(t => {
        monaco.editor.defineTheme(t, {
            // @ts-ignore
            base: t,
            inherit: true,
            rules: rules.map(i => ({
                token: i.name,
                ...i.styles[t],
                background: undefined
            })),
            colors: {}
        });
    })
    editor.updateOptions({ theme });
}