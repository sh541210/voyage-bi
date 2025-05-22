import { theme } from "antd";

export const ColorTest = () => {
    const { token } = theme.useToken()
    return (
        <div className="items-center">
            <div className="mt-2 flex flex-wrap h-full overflow-auto">
                {Object.keys(token).filter(i => i.toLowerCase().includes('color'))
                    .map(i => <div key={i}>
                        {/* @ts-ignore */}
                        <div className="mr-2 p-2" style={{ background: token[i], fontSize: 20 }}>{i}</div>
                    </div>)}
            </div>
        </div>

    );
}