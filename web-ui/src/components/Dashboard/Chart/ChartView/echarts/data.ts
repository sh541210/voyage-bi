import { request } from "@umijs/max"


const baseUrl = 'http://file.geojson.cn/china/1.6.2/'
export const getGeoJson = async (code: number[]) => {
    let url = baseUrl
    if (code.length == 1) {
        url += 'china.json'
    } else if (code.length == 2) {
        url += `${code[1]}.json`
    } else if (code.length === 3) {
        url += `${code[1]}/${code[2]}.json`
    } else {
        throw new Error('县级数据无法加载')
    }
    return await request(url, {})
}