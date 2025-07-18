import EchartsMapView from "@/components/Dashboard/Chart/ChartView/echarts/MapView"

const Test = () => {
    const config = {
        option: {
    "backgroundColor": "transparent",
    "series": [
        {
           
            "data": [{
                    "name": "宁夏",
                    "value": "10368171.41"
                },
                {
                    "name": "黑龙江",
                    "value": "11420421.43"
                },
                {
                    "name": "河北",
                    "value": "6177833.68"
                },
                {
                    "name": "西藏",
                    "value": "12096240.93"
                },],
        }
    ],
}
    }
    return <EchartsMapView config={config} />
    // return <div className="h-screen w-screen flex flex-col">
    //     <div className="h-[50px] bg-green-100 w-full">
    //         <div className="h-[50px]">top</div>
    //     </div>
    //     <div className="flex-1 min-h-0 w-full flex">
    //         <div className=" w-[240px] bg-blue-200">
    //             <div className="w-[240px]">left</div>
    //         </div>
    //         <div className="flex-1 min-h-0">
    //             <div className="h-full p-4 bg-red-200 box-border">
    //                 <div className="bg-white h-full overflow-auto text-9xl break-words break-all">
    //                     dsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdfdsfsdfdsfsfsdfsdf
    //                 </div>
    //             </div>
    //         </div>
    //         <div className=" w-[290px] bg-yellow-300" >
    //             <div className="w-[290px]">right</div>
    //         </div>
    //     </div>
    // </div>
}

export default Test