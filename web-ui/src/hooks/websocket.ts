import { Result } from "@/utils/request";
import React, { useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { useModel } from "@umijs/max";

export interface ChartWebsocketResponse extends Result<DataResult> {
    requestId: string;
    chartId: number;
}

export const useChartWebSocket = (shareKey?: string) => {
    const { initialState } = useModel('@@initialState')
    const params: any = {
        token: initialState?.token?.tokenValue,
        shareToken: initialState?.shareToken,
        shareKey
    }
    let address = `${getWebSocketURL('chart/data/v2')}`;
    address = address + "?" + Object.keys(params).filter(i => params[i])
        .map(i => `${i}=${params[i]}`).join('&')

    // 用于存储requestId对应回调函数
    const responseCallbacks = React.useRef<Map<string, (data: ChartWebsocketResponse) => void>>(new Map());

    useEffect(() => {
        return () => {
            responseCallbacks.current.clear();
        };
    }, []);

    const { sendMessage } = useWebSocket(address, {
        shouldReconnect: () => true,
        onMessage: (event) => {
            const res = JSON.parse(event.data) as ChartWebsocketResponse;
            res.chartId = Number(res.requestId);

            // 查找并完成对应的 Promise
            const callback = responseCallbacks.current.get(res.requestId);
            if (callback) {
                callback(res); // 完成 Promise
            } else {
                console.warn(`未找到对应的回调, requestId: ${res.requestId}`);
            }
        },
        onClose: () => console.debug('WebSocket 已关闭'),
        onError: (error) => console.error('WebSocket 出现错误:', error),
    });

    return {
        fetchData: (data: ChartDataRequest, callback: (dataResult: DataResult) => void) => {
            const requestId = data.chartId.toString(); // 确保请求中有唯一的 requestId
            responseCallbacks.current.set(requestId, response => {
                if (response.success) {
                    callback(response.data)
                } else {
                    console.error('Websocket响应出现错误, code=' + response.code, response.message)
                }
            })
            try {
                sendMessage(JSON.stringify(data));
            } catch (ex: any) {
                // @ts-ignore
                callback({ success: false, message: ex.message })
                responseCallbacks.current.delete(requestId); // 如果发送失败，清理 pending
                console.error('Weboscket发送请求出错', ex)
            }
        }
    };
};

// 获取 WebSocket URL 的函数
const getWebSocketURL = (path: string): string => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    let host = window.location.host;
    return `${protocol}://${host}/ws/${path}`;
};