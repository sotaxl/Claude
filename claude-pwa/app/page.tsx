import dynamic from "next/dynamic"

// No SSR — needs browser APIs (IndexedDB, navigator.onLine)
const ChatPage = dynamic(() => import("@/components/ChatPage"), { ssr: false })

export default function Home() {
  return <ChatPage />
}
