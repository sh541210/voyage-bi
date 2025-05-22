import { DataModeSwitch } from "@/components/setting/DataModeSwitch"
import { ThemeSwitch } from "@/components/setting/ThemeSwitch"
import { CaretDownFilled, PoweroffOutlined } from "@ant-design/icons"
import { useModel } from "@umijs/max"
import { Avatar, Dropdown } from "antd"
import { history } from '@umijs/max';
import { doLogout } from "@/utils/login/base"
import { MenuInfo } from "rc-menu/lib/interface"

const RightContent = () => {
    const { initialState } = useModel('@@initialState')

    const getItems = (path: string) => {
        // @ts-ignore
        const items: any[] = Object.values(window.routes).filter(i => i.path.startsWith(path) && !i.redirect).map(i => ({ key: i.path, label: i.name, icon: i.icon, onClick: e => handleClick(e, true) }))
        return { ...items.find(i => i.key === path), children: items.filter(i => i.key !== path) }
    }

    const handleClick = ({ key }: MenuInfo, routeLink?: boolean) => {
        routeLink && history.push(key)
        if (key === 'logout') {
            doLogout()
        }
    }

    return <div className='flex items-center gap-2 mr-4'>
        <DataModeSwitch />
        <ThemeSwitch />
        <Dropdown trigger={['hover']} menu={{
            items: [
                // getItems('/system'),
                getItems('/user'),
                { key: 'logout', label: '退出登录', icon: <PoweroffOutlined />, onClick: handleClick }
            ]
        }} >
            <div className="flex items-center gap-2 select-none cursor-pointer hover:bg-gray-200 dark:hover:bg-black px-2">
                <Avatar src={initialState?.user?.avatarImgUrl} />
                <div className="pr-2 flex items-center gap-1">
                    {initialState?.user?.nickname}
                    <CaretDownFilled />
                </div>
            </div>
        </Dropdown>
    </div>
}

export default RightContent