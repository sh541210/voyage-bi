import { DependencyList, MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { calculateTextWidth, debounce } from "@/utils/common/common";
import { useLocation } from "@umijs/max";

export const useContainerWidth = (initialWidth?: number, initialHeight?: number) => {
    const ref = useRef<HTMLDivElement | null>(null); // 容器的 ref
    const [width, setWidth] = useState(initialWidth);
    const [height, setHeight] = useState(initialHeight);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // 创建 ResizeObserver 实例
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { contentRect } = entry;
                setWidth(contentRect.width); // 设置宽度
                setHeight(contentRect.height); // 设置高度
            }
        });

        // 监听 ref 容器
        resizeObserver.observe(element);

        return () => {
            // 卸载时移除监听
            resizeObserver.unobserve(element);
        };
    }, []);

    return { ref, width, height };
};

export const useMode = () => {
    const [mode, setMode] = useState<Mode>('pc')
    const { ref, width } = useContainerWidth()

    useEffect(() => {
        setMode(width && width <= 500 ? 'mobile' : 'pc')
    }, [width])

    return { mode, ref }
}

export const watch = <T>(watchItem: T, callback: (prev: T | undefined, next: T) => void, deps?: DependencyList): void => {
    const ref = useRef<T>(watchItem)
    useEffect(() => {
        callback(ref.current, watchItem)
        ref.current = watchItem
    }, deps)
};

// export interface UseListReturnType<T extends Item> {
//     current: T[];
//     modifyByIndex: (idx: number, consumer: ((item: T) => void) | T) => void
//     modifyByField: (value: any, consumer: ((item: T) => void) | T) => void
//     removeByIndex: (index: number) => void
//     removeByField: (value: any) => void;
//     addItem: (newItem: T) => void;
//     getByField: (value: any) => T | undefined;
//     setList: (list: T[]) => void
//     saveItemByField: (item: T) => void
//     saveItemByIndex: (item: T, index: number) => void
// }

/**
 * useObject Hook
 * 管理对象状态，支持初始值、通过对象或 consumer 更新、获取当前状态
 * @param initialObject 初始对象
 * @returns {object} 包括当前对象和操作方法
 */
export const useObject = <T extends object>() => {
    // 当前对象状态
    const [object, setObject] = useState<T>();

    /**
     * 更新对象字段
     * @param updater 更新器，可以是 consumer 函数或部分字段的对象
     */
    const updateObject = useCallback(
        (updater: ((obj: T) => void) | Partial<T>) => {
            // @ts-ignore
            setObject((prevObject) => {
                if (typeof updater === 'function') {
                    const nextObject = { ...prevObject }; // 创建副本
                    // @ts-ignore
                    updater(nextObject); // Consumer 修改
                    return nextObject; // 返回新对象
                } else if (typeof updater === 'object' && updater !== null) {
                    return { ...prevObject, ...updater }; // 合并更新
                }
            });
        },
        []
    );

    /**
     * 设置新的对象，完全替换当前状态
     * @param newObject 新对象
     */
    const resetObject = useCallback((newObject: T) => {
        setObject(newObject);
    }, []);

    return {
        current: object, // 当前对象
        setObject: resetObject, // 完全替换对象
        updateObject, // 更新对象
    };
};

export const useLocalStorage = <T>(key: string, initialValue?: T): [T, (value: T) => void] => {
    // 初始化状态时直接从 localStorage 获取值
    const storedValue = localStorage.getItem(key);
    const initial = storedValue !== null && storedValue !== 'undefined'
        ? JSON.parse(storedValue)
        : initialValue;
    const [value, setValue] = useState<T>(initial);

    // 更新 localStorage 中的值
    const updateValue = (newValue: T | ((value: T) => T)) => {
        const newValueResolved = typeof newValue === 'function'
            ? (newValue as (value: T) => T)(value)
            : newValue;

        setValue(newValueResolved);
        localStorage.setItem(key, JSON.stringify(newValueResolved));
    };

    return [value, updateValue];
};

export const useScrollRestoration = <T extends HTMLElement>(): {
    scrollRef: MutableRefObject<T | null>
    topScroll: () => void
} => {
    const scrollRef = useRef<T | null>(null);
    const location = useLocation();
    const routeKey = location.pathname;
    const [scrollPositions, setScrollPositions] = useLocalStorage<{ [routeKey: string]: number } | undefined>('scrollPositions', {});

    useEffect(() => {
        requestAnimationFrame(() => scrollRef.current && (scrollRef.current.scrollTop = scrollPositions?.[routeKey] || 0))
    }, [routeKey, scrollRef.current])

    // 滚动事件监听
    useEffect(() => {
        const handleScroll = debounce(() => setScrollTop(scrollRef.current!.scrollTop), 200);
        const element = scrollRef.current;
        element?.addEventListener("scroll", handleScroll);
        return () => element?.removeEventListener("scroll", handleScroll)
    }, [routeKey, setScrollPositions]);

    const setScrollTop = (value: number) =>
        // @ts-ignore
        scrollRef.current && setScrollPositions((prev) => ({
            ...prev,
            [routeKey]: value,
        }));

    return { scrollRef, topScroll: () => setScrollTop(0) };
}

export const useIntersectionObserver = (threshold: number = 0.1) => {
    const [visibleItems, setVisibleItems] = useState<Set<string | number>>(new Set());
    const itemRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    // IntersectionObserver 的回调
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
            const key = entry.target.getAttribute('data-key') as string // 使用 data-key 作为标识
            if (entry.isIntersecting) {
                // 如果元素进入视口，设置为可见
                setVisibleItems((prev) => new Set(prev.add(key)));
            } else {
                // 如果元素离开视口，设置为不可见
                setVisibleItems((prev) => {
                    const updated = new Set(prev);
                    updated.delete(key);
                    return updated;
                });
            }
        });
    };

    useEffect(() => {
        const observer = new IntersectionObserver(observerCallback, {
            root: null, // 相对于视口
            rootMargin: '0px',
            threshold: threshold, // 视口中至少 10% 可见时触发
        });

        // 监听每个 item
        Object.values(itemRefs.current).forEach((el) => {
            if (el) {
                observer.observe(el);
            }
        });

        // 清理 observer
        return () => observer.disconnect();
    }, [threshold]);

    // setRef 用于将 ref 绑定到元素
    const setRef = (key: string | number) => (el: HTMLElement | null) => {
        if (el) {
            // 给每个元素设置一个 data-key 用于标识
            el.setAttribute('data-key', String(key));
        }
        itemRefs.current[key] = el;
    };

    return { setRef, visibleItems, refs: itemRefs };
};

export const useZoom = (fontSize: number,
    minPercent: number = .6,
    paddingPercent: number = .2) => {
    const { ref, width } = useContainerWidth()
    const getZoom = (value: string | number | undefined) => {
        let valueWidth = calculateTextWidth(value, fontSize)
        if (!width || !valueWidth) {
            return 1
        }
        return Math.min(1.2, (width * (1 - paddingPercent) * minPercent) / valueWidth) / 1.1
    }
    return { ref, getZoom }
}