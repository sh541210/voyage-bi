import { execTs } from '@/utils/common/common';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import React, { JSX, useEffect, useRef, useState } from 'react';
import { MyIcon } from '../MyIcon';
import { renderActive } from '@/utils/render';

export interface HighlightProps {
  className?: string
  logical: string
  indexes: number[]
}

interface DataTableProps {
  data: DataSet;
  scrollOptions?: {
    auto?: boolean;          // 是否自动滚动
    interval?: number;       // 间隔 ms
    step?: number;           // 步长 px
    loop?: boolean;          // 是否循环
    loopCount?: number
  }
  size?: 'mini' | 'small';
  pagination?: { pageSize: number; hidden?: boolean, total?: number };
  actions?: (rowData: any[], index: number) => JSX.Element[];
  onColClick?: (rowIndex: number, colIndex: number, value: any) => void
  showIndex?: boolean; // 是否显示索引列
  indexColumnName?: string; // 索引列的自定义名称
  highlights?: HighlightProps[]
  sortedIndexes?: number[]
  hideColumnIndexes?: number[]
  onSortChange?: (index: number, orderBy: SortOrderBy | undefined) => void
}

const DataTable: React.FC<DataTableProps> = ({ data: { columns, rows }, pagination, size = 'small',
  actions, showIndex, indexColumnName, highlights,
  onColClick, sortedIndexes, onSortChange, hideColumnIndexes, scrollOptions = { auto: false } }) => {
  const { auto = false, loop = false, loopCount = 3, interval = 100, step = 2 } = scrollOptions
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null);
  const pageSize = pagination?.pageSize || 10
  const total = pagination?.total || rows.length
  const [sorts, setSorts] = useState<Record<number, SortOrderBy | undefined>>({})

  const handlePrevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1,
      Math.ceil(total / pageSize)));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCellHover = (rowIndex: number | null, colIndex: number | null) => {
    setHoveredRowIndex(rowIndex);
    setHoveredColIndex(colIndex);
  };
  const hiddenPagination = !pagination || pagination.hidden

  const observerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pagination?.hidden) {
      setCurrentPage(1)
      return
    } // 仅在分页隐藏时启用懒加载

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    }, {
      root: scrollContainerRef.current,
      rootMargin: '0px',
      threshold: 0.1,
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [pagination?.hidden]);

  useEffect(() => {
    if (!pagination?.hidden || !auto) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let lastIndex = -1;
    const scrollStep = 1;
    const interval = 50;

    const timer = setInterval(() => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      // 到底部自动回滚
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        container.scrollTo({ top: 0, behavior: 'auto' });
        lastIndex = -1;
        return;
      }

      // 执行滚动
      container.scrollBy({ top: scrollStep, behavior: 'smooth' });

      // 获取当前 scrollTop，匹配哪一行最接近 scrollTop
      for (let i = 0; i < rows.length * loopCount; i++) {
        const row = container.querySelector(`.row${i}`);
        if (!row) continue;
        const rowTopInContainer = row.getBoundingClientRect().top - container.getBoundingClientRect().top;
        if (Math.abs(rowTopInContainer) <= 1) {
          if (lastIndex !== i) {
            lastIndex = i;
            const index = i % rows.length
            onColClick?.(index, 0, rows[index]);
          }
          break;
        }
      }
    }, interval);

    return () => clearInterval(timer);
  }, [pagination?.hidden, auto, rows]);

  const renderPagination = () => {
    if (hiddenPagination) {
      return
    }
    const totalPages = Math.ceil(total / pageSize);
    const pagesToShow = size === 'mini' ? 3 : 5; // 要显示的页码数量
    const pagesAroundEllipsis = 1; // 省略号两侧要显示的页码数量

    // 计算要显示的页码范围
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    // 如果当前显示的页码数量小于要显示的数量，则重新计算
    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
      <div className={classNames('flex justify-end w-full flex-wrap items-end', size === 'mini' ? 'mt-1' : ' mt-2')}>
        {/* <span className={classNames('mr-3 text-base', size === 'mini' ? 'mr-1 text-sm w-full text-right mb-2' : '')}>总页数: {totalPages}</span> */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={classNames('py-1 bg-gray-300 dark:bg-antdDarkColorFill rounded-sm disabled:opacity-50 text-sm mr-1 select-none',
            size === 'mini' ? 'text-xs mr-1 px-2' : 'px-3')}
        >
          {size === 'mini' ? <LeftOutlined /> : '上一页'}
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className={classNames(`py-1  dark:bg-antdDarkBorder rounded-sm text-sm mx-1`,
                1 === currentPage ? ' text-white dark:text-black' : 'bg-gray-200',
                size === 'mini' ? 'text-xs px-2' : 'px-3 mx-1 text-sm')}
            >
              1
            </button>
            {startPage > 2 && <span>...</span>}
          </>
        )}
        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={classNames(`select-none py-1 dark:bg-antdDarkBorder  rounded-sm`,
              page === currentPage ? 'text-white bg-primaryColor/80 dark:bg-primaryColor font-bold ' : 'bg-gray-200',
              size === 'mini' ? 'text-xs px-2 mx-1' : 'px-3 text-sm mx-1')}
          >
            {page}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {totalPages - endPage > 1 && <span>...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className={classNames(`py-1  dark:bg-antdDarkBorder rounded-sm select-none`,
                totalPages === currentPage ? ' text-white' : 'bg-gray-200',
                size === 'mini' ? 'text-xs px-2 mx-1' : 'px-3 mx-1 text-sm')}
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={classNames("py-1 bg-gray-300 dark:bg-antdDarkColorFill rounded-sm disabled:opacity-50 select-none",
            size === 'mini' ? 'text-xs ml-1 px-2' : 'px-3 text-sm ml-1')}
        >
          {size === 'mini' ? <RightOutlined /> : '下一页'}
        </button>
      </div>
    );
  };
  const renderTdContent = (value: any) => {
    if (value == null) {
      return renderActive('NULL')
    }
    if (typeof value === 'boolean') {
      return `${value}`
    }
    if (typeof value === 'object') {
      return JSON.stringify(value)
    } else if (typeof value === 'string') {
      if (value.startsWith('https') || value.startsWith('http')) {
        if (isImage(value)) {
          return <img height={100} width={100} src={value} />
        }
        return <a target='_blank' className='text-primaryColor'
          href={value}>{value.substring(value.lastIndexOf('/') + 1, value.length)}</a>
      }
    }
    return value
  }

  const isImage = (url: string) => {
    const list = ['png', 'jpg', 'jpeg', 'avif', 'gif']
    for (let i = 0; i < list.length; i++) {
      if (url.endsWith(list[i]) || url.endsWith(list[i].toUpperCase())) {
        return true
      }
    }
    return false
  }

  const renderTableHeader = () => {
    const classNameList = ['relative py-1 border border-gray-200 dark:border-antdDarkBorder text-left bg-transparent whitespace-nowrap select-none',
      size === 'mini' ? 'text-xs px-2 py-2' : ' text-sm px-3 py-2.5'
    ]
    const className = classNames(classNameList);
    return (<tr className="border
    sticky top-0 z-10 border-antdDarkBorder bg-antdColorBgLayout dark:bg-antdDarkContainer">
      {/* 显示索引列 */}
      {showIndex && <th className={className}>{indexColumnName || '序号'}</th>}
      {columns.length > 0 &&
        columns.filter((_, idx) => !hideColumnIndexes || !hideColumnIndexes.includes(idx))
          .map((key, index) => {
            const sorted = sortedIndexes?.includes(index)
            return <th key={index} className={classNames(classNameList,
              sorted && 'hover:bg-gray-200/50 dark:hover:bg-black/30 cursor-pointer'
            )}><div className={classNames('flex items-center ', size === 'mini' ? 'gap-1' : 'gap-3')} onClick={() => {
              if (!sorted) return
              const orderBy = !sorts[index] ? 'ASC' : (sorts[index] === 'ASC' ? 'DESC' : undefined);
              setSorts({ [index]: orderBy })
              onSortChange?.(index, orderBy)
            }}>{key} {sorted && <div><MyIcon size={size === 'mini' ? 12 : 16}
              className={classNames('',
                !sorts[index] ? 'fill-gray-300 dark:fill-antdDarkColorFill' :
                  ' fill-black dark:fill-white')}
              name={sorts[index] || 'ASC'} />
            </div>}
              </div>
            </th>
          })}
      {actions && actions?.([], 0).length > 0 && <th className={className}>操作</th>}
    </tr>
    );
  };

  const renderTableBody = () => {
    const startIndex = pagination?.hidden ? 0 : (currentPage - 1) * pageSize;
    const endIndex = pagination?.hidden ? currentPage * pageSize : Math.min(startIndex + pageSize, total);

    const className = (rowIndex: number, colIndex: number, value: any) => {
      let baseClass = [
        "py-1 border border-gray-200 dark:border-antdDarkBorder whitespace-nowrap select-none",
        size === 'mini' ? 'text-xs px-1 py-0.5' : 'px-3 py-2 text-sm',
        hoveredRowIndex === rowIndex && hoveredColIndex === colIndex
          ? 'bg-gray-400 bg-opacity-30 dark:bg-antdDarkColorFillSecondary'
          : hoveredRowIndex === rowIndex || hoveredColIndex === colIndex
            ? 'bg-antdColorBgLayout dark:bg-antdDarkBorder bg-opacity-30 dark:bg-antdDarkColorFillQuaternary'
            : 'bg-transparent'
      ]

      // 高亮逻辑
      highlights?.forEach(i => {
        if (i.indexes.includes(colIndex)) {
          const values = rows.map(row => row[colIndex])
          const result = execTs(i.logical, { values, value })
          if (result) baseClass.push(i.className as string)
        }
      })
      return classNames(baseClass);
    };

    const dataToRender = pagination?.hidden
      ? (auto && loop
        ? Array.from({ length: loopCount * rows.length }, (_, i) => rows[i % rows.length]) // 循环
        : rows.slice(startIndex, endIndex)) // 懒加载
      : rows.slice(startIndex, endIndex); // 正常分页

    return dataToRender.map((item, rowIndex) => {
      // 如果是循环模式，计算真实的原始行索引
      const realRowIndex = pagination?.hidden && auto && loop
        ? rowIndex % rows.length
        : startIndex + rowIndex;

      const doms = actions?.(item, realRowIndex);

      return (
        <tr key={rowIndex} className={`row${rowIndex}`}>
          {/* 显示索引列 */}
          {showIndex && (
            <td className={className(realRowIndex, -1, realRowIndex + 1)}>{realRowIndex + 1}</td>
          )}
          {item
            .filter((_, idx) => !hideColumnIndexes || !hideColumnIndexes.includes(idx))
            .map((value, colIndex) => {
              const colName = columns[colIndex]; // 获取列名
              return (
                <td
                  key={colIndex}
                  className={className(realRowIndex, colIndex, value)}
                  onMouseEnter={() => handleCellHover(realRowIndex, colIndex)}
                  onMouseLeave={() => handleCellHover(null, null)}
                  onClick={() => onColClick?.(realRowIndex, colIndex, value)}
                >
                  {renderTdContent(value)}
                </td>
              );
            })}
          {doms && doms.length > 0 && (
            <td className={className(realRowIndex, item.length, '')}>
              {doms.map((dom, index) =>
                React.cloneElement(dom, {
                  key: index,
                  className: classNames(
                    dom.props.className,
                    size === 'mini' ? 'text-xs' : 'text-sm'
                  ),
                })
              )}
            </td>
          )}
        </tr>
      );
    });
  };
  if (total == 0) {
    return <div className=' flex justify-center'>没有数据</div>
  }

  return (
    <div className="relative w-full h-full overflow-hidden text-black dark:text-white flex flex-col justify-between">
      <div className="w-full min-h-0 flex-1 overflow-hidden">
        <div className='h-full w-full relative overflow-y-auto scroll-container' ref={scrollContainerRef}>
          <table className="border-spacing-0 min-w-full bg-transparent border-gray-200 dark:border-antdDarkBorder border-collapse bg-white dark:bg-black">
            <thead>
              {renderTableHeader()}
            </thead>
            <tbody>
              {renderTableBody()}
            </tbody>
          </table>
          {pagination?.hidden && <div ref={observerRef} className="observer-element" style={{
            height: '30px',
            background: 'transparent',
          }}></div>}
        </div>
      </div>
      {!pagination?.hidden && (pageSize < total) &&
        <div className={classNames(size === 'mini' ? 'text-xs' : 'text-sm')}
          style={{ flex: `0 0 ${size === 'small' ? '28px' : '20px'}` }}>
          {renderPagination()}
        </div>}
    </div>
  );
};

export default DataTable;
