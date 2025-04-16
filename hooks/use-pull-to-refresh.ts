import { useCallback, useRef, useState } from "react"

export function usePullToRefresh(onRefresh: () => void) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const pullToRefreshRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pullToRefreshRef.current) return

      const touchY = e.touches[0].clientY
      const pullDistance = touchY - startY.current

      // Only trigger if we're at the top of the page and pulling down
      if (window.scrollY === 0 && pullDistance > 0) {
        e.preventDefault()
        setIsRefreshing(true)
      }
    },
    []
  )

  const handleTouchEnd = useCallback(() => {
    if (isRefreshing) {
      onRefresh()
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }, [isRefreshing, onRefresh])

  const setupListeners = useCallback(() => {
    if (!pullToRefreshRef.current) return

    pullToRefreshRef.current.addEventListener("touchstart", handleTouchStart)
    pullToRefreshRef.current.addEventListener("touchmove", handleTouchMove, { passive: false })
    pullToRefreshRef.current.addEventListener("touchend", handleTouchEnd)

    return () => {
      if (!pullToRefreshRef.current) return

      pullToRefreshRef.current.removeEventListener("touchstart", handleTouchStart)
      pullToRefreshRef.current.removeEventListener("touchmove", handleTouchMove)
      pullToRefreshRef.current.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    isRefreshing,
    pullToRefreshRef,
    setupListeners,
  }
} 