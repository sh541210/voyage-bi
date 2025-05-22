import { CloseOutlined, SearchOutlined } from "@ant-design/icons"
import { Button, Input } from "antd"
import { useState } from "react"

const SearchButton = (props: {
    onChange: (value: string) => void,
    onClose: () => void
}) => {
    const [showSearch, setShowSearch] = useState<boolean>(false)
    const [searchText, setSearchText] = useState<string>('')
    return <>
        <Button onClick={() => { setShowSearch(true) }}
            size='small' icon={<SearchOutlined />} />
        {showSearch && <div className="bg-white dark:bg-black absolute -bottom-11 -right-26 border dark:border-black px-2 py-1 flex gap-1 items-center"
            style={{ zIndex: 20, flex: '0 0 36px' }}>
            <Input
                value={searchText}
                autoFocus
                className="!w-[250px]"
                onPressEnter={() => props.onChange(searchText)}
                onChange={e => setSearchText(e.target.value)}
                placeholder='请输入搜索内容，回车搜索'
                addonAfter={<CloseOutlined onClick={() => {
                    setShowSearch(false)
                    setSearchText('')
                    props.onClose()
                }} className=" cursor-pointer" />}
            />
        </div>}
    </>
}

export default SearchButton