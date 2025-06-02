"use client"
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  CheckCircleIcon,
  XCircleIcon,
  TriangleIcon as ExclamationTriangleIcon,
  CircleIcon as InformationCircleIcon,
  XIcon as XMarkIcon,
} from "lucide-react"

interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  success: (title: string, message?: string, duration?: number) => void
  error: (title: string, message?: string, duration?: number) => void
  warning: (title: string, message?: string, duration?: number) => void
  info: (title: string, message?: string, duration?: number) => void
  remove: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }

    setNotifications((prev) => [...prev, newNotification])

    // Auto-remove after duration
    const duration = notification.duration || 5000
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, duration)
  }, [])

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      addNotification({ type: "success", title, message, duration })
    },
    [addNotification],
  )

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      addNotification({ type: "error", title, message, duration: duration || 7000 })
    },
    [addNotification],
  )

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      addNotification({ type: "warning", title, message, duration: duration || 6000 })
    },
    [addNotification],
  )

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      addNotification({ type: "info", title, message, duration })
    },
    [addNotification],
  )

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const value = {
    notifications,
    success,
    error,
    warning,
    info,
    remove,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={remove} />
    </NotificationContext.Provider>
  )
}

interface NotificationContainerProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onRemove={onRemove} />
      ))}
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onRemove: (id: string) => void
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case "warning":
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case "info":
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
        return "bg-blue-50 border-blue-200"
    }
  }

  const getTextColor = () => {
    switch (notification.type) {
      case "success":
        return "text-green-800"
      case "error":
        return "text-red-800"
      case "warning":
        return "text-yellow-800"
      case "info":
        return "text-blue-800"
    }
  }

  return (
    <div
      className={`max-w-sm w-full ${getBgColor()} border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 w-0 flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>{notification.title}</p>
          {notification.message && (
            <p className={`mt-1 text-sm ${getTextColor()} opacity-90`}>{notification.message}</p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none`}
            onClick={() => onRemove(notification.id)}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
