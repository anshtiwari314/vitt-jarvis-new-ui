"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { FaTimes, FaExpand, FaCompress } from "react-icons/fa"

// Define the props for the new generic component
interface DraggableWindowProps {
  children: React.ReactNode // Accepts any valid React child
  title: string
  isOpen: boolean
  onClose: () => void
  initialPosition?: { x: number; y: number }
}

const DraggableWindow: React.FC<DraggableWindowProps> = ({
  children,
  title,
  isOpen,
  onClose,
  initialPosition: initialPos = { x: 500, y: 100 },
}) => {
  const [position, setPosition] = useState(initialPos)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 })
  const dragRef = useRef<HTMLDivElement | null>(null)
  const [isResized, setIsResized] = useState(false)

  // Get viewport bounds for constraining drag
  const getViewportBounds = useCallback(() => {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    // These dimensions are now part of the window's own state
    const elementWidth = isResized ? 840 : 420
    const elementHeight = 580

    return {
      minX: 0,
      minY: 0,
      maxX: windowWidth - elementWidth,
      maxY: windowHeight - elementHeight,
    }
  }, [isResized])

  // Constrain position within viewport bounds
  const constrainPosition = useCallback(
    (pos: { x: number; y: number }) => {
      const bounds = getViewportBounds()
      return {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, pos.x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, pos.y)),
      }
    },
    [getViewportBounds],
  )

  const toggleResize = () => {
    setIsResized((prev) => {
      const newResized = !prev
      // Adjust position if needed when resizing to prevent going out of bounds
      setTimeout(() => {
        setPosition((current) => constrainPosition(current))
      }, 0)
      return newResized
    })
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setDragStart({ x: e.clientX, y: e.clientY })
      setInitialPosition({ x: position.x, y: position.y })
      setIsDragging(true)

      document.body.classList.add("dragging")
      document.body.style.userSelect = "none"
      document.body.style.cursor = "grabbing"
    },
    [position],
  )

  // Mouse move handler with requestAnimationFrame for smooth performance
  useEffect(() => {
    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()

      animationFrameId = requestAnimationFrame(() => {
        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y
        const newPosition = {
          x: initialPosition.x + deltaX,
          y: initialPosition.y + deltaY,
        }
        setPosition(constrainPosition(newPosition))
      })
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      setIsDragging(false)

      document.body.classList.remove("dragging")
      document.body.style.userSelect = ""
      document.body.style.cursor = ""

      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, { passive: false })
      document.addEventListener("mouseup", handleMouseUp, { passive: false })
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [isDragging, dragStart, initialPosition, constrainPosition])

  // Handle window resize to keep chat window in bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition((current) => constrainPosition(current))
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [constrainPosition])

  if (!isOpen) return null

  return (
    <>
      {/* Global styles for preventing text selection during drag */}
      <style jsx global>{`
        .dragging, .dragging * {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }
      `}</style>

      <div
        ref={dragRef}
        className={`fixed bg-white border border-gray-600 rounded-xl shadow-2xl flex flex-col z-[9999] transition-all duration-150 ease-in-out ${
          isResized ? "w-[840px]" : "w-[420px]"
        } h-fit ${isDragging ? "select-none" : ""}`}
        style={{
          top: position.y,
          left: position.x,
          willChange: isDragging ? "transform" : "auto",
          
        }}
      >
        {/* Window Header */}
        <div
          className={`bg-blue-800 border-b border-gray-100 px-4 py-3 rounded-t-xl flex justify-between items-center select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          //style={{border:'1rem solid red'}}
        >
          <div className="flex items-center space-x-2 pointer-events-none">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-m font-bold text-white">{title}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleResize}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1 pointer-events-auto"
              title={isResized ? "Shrink" : "Expand"}
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag
            >
              {isResized ? <FaCompress size={14} /> : <FaExpand size={14} />}
            </button>
            {/* <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1 pointer-events-auto"
              aria-label="Close window"
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag
            >
              <FaTimes size={16} />
            </button> */}
          </div>
        </div>

        {/* Content Area where children will be rendered */}
        <div className="relative flex-1 bg-gray-50 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  )
}

export default DraggableWindow