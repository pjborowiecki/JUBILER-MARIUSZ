import Link from "next/link"

import type { Category, Product } from "@/db/schema/index"

import { Icons } from "@/components/icons"
import { CategoryCard } from "@/components/store-front/category-card"

interface StoreFrontProps {
  products: Product[]
  categories: Category[]
}

export function StoreFront({
  products,
  categories,
}: Readonly<StoreFrontProps>): JSX.Element {
  return (
    <div>
      <section className="grrid-cols-1 xs:grid-cols-2 grid animate-fade-up gap-4 md:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </section>
    </div>
  )
}
