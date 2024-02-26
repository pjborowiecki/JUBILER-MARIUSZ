import type { Metadata } from "next"

import { env } from "@/env.mjs"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Produkty",
  description: "Zarządzaj produktami w swoim asortymencie",
}

export default function AdminProductsPage(): JSX.Element {
  return (
    <div>
      <div className="flex min-h-20 items-center border-b bg-tertiary p-4">
        <h2 className="text-2xl font-bold tracking-tight">Produkty</h2>
      </div>

      <div className="p-4">
        <p>Strona w budowie</p>
      </div>
    </div>
  )
}