"use client"
import { useState, useCallback } from "react"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

let listeners: ((toasts: Toast[]) => void)[] = []
let toastList: Toast[] = []

function emit() {
  listeners.forEach((l) => l([...toastList]))
}

export function toast(t: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2)
  toastList = [...toastList, { ...t, id }]
  emit()
  setTimeout(() => {
    toastList = toastList.filter((x) => x.id !== id)
    emit()
  }, 4000)
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useState(() => {
    listeners.push(setToasts)
    return () => { listeners = listeners.filter((l) => l !== setToasts) }
  })

  const dismiss = useCallback((id: string) => {
    toastList = toastList.filter((x) => x.id !== id)
    emit()
  }, [])

  return { toasts, dismiss }
}
