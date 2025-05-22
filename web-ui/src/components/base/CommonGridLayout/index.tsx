import { useContainerWidth } from "@/hooks"
import ReactGridLayout, { ReactGridLayoutProps } from "react-grid-layout"
import './grid.css'

const CommonGridLayout = (props: ReactGridLayoutProps & {
    spaceWidthY?: number,
    spaceWidthX?: number
    cols?: number,
    rowHeight?: number
}) => {
    const { spaceWidthX = 10, spaceWidthY = 10, cols = 20, rowHeight = 20 } = props
    const { ref, width } = useContainerWidth(window.innerWidth)
    return <div
        className="w-full h-full relative box-border"
        ref={ref}>
        <ReactGridLayout
            {...props}
            width={width}
            className="layout"
            cols={cols}
            rowHeight={rowHeight}
            margin={[spaceWidthX, spaceWidthY]}
            onDragStart={(_1, _2, _3, _4, e) => e.stopPropagation()}
            style={{ ...props.style, marginLeft: '0', boxSizing: 'border-box' }} />
    </div>
}

export default CommonGridLayout