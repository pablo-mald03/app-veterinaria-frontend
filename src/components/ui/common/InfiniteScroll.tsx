"use client";

import { useEffect, useRef } from "react";
import Spinner from "@/components/ui/common/Spinner";

interface InfiniteScrollProps {
    onLoadMore: () => void;
    hasMore: boolean;
    loading: boolean;
    threshold?: number;
    loader?: React.ReactNode;
    endMessage?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

/*Infinite scroll component */
export default function InfiniteScroll({
    onLoadMore,
    hasMore,
    loading,
    threshold = 200,
    loader,
    endMessage = "No hay más resultados.",
    className = "h-full overflow-y-auto",
    children,
}: InfiniteScrollProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const onLoadMoreRef = useRef(onLoadMore);

    useEffect(() => {
        onLoadMoreRef.current = onLoadMore;
    }, [onLoadMore]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) onLoadMoreRef.current();
            },
            { root: containerRef.current, rootMargin: `0px 0px ${threshold}px 0px` },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading, threshold]);

    return (
        <div ref={containerRef} className={className}>
            {children}

            <div ref={sentinelRef} aria-hidden="true" />

            {loading && (
                <div className="flex justify-center py-6">{loader ?? <Spinner />}</div>
            )}

            {!hasMore && !loading && endMessage && (
                <div className="py-6 text-center text-sm text-text-muted">{endMessage}</div>
            )}
        </div>
    );
}