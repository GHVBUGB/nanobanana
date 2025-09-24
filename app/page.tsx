"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ImageGallery } from "@/components/image-gallery"
import { ModuleOperationPage } from "@/components/module-operation-page"

export default function HomePage() {
  const [activeModule, setActiveModule] = useState<string | null>(null)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeModule={activeModule} onModuleSelect={setActiveModule} />
      <main className="flex-1 overflow-hidden">
        {activeModule ? (
          <ModuleOperationPage module={activeModule} onBack={() => setActiveModule(null)} />
        ) : (
          <ImageGallery />
        )}
      </main>
    </div>
  )
}
