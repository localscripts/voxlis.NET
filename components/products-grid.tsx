"use client"

import ProductCard from "./product-card"

interface Selection {
  id: number
  title: string
  image: string
  redirectUrl: string
  price: string
  resellers: string
  shadeColor: string
  popular: boolean
}

interface ProductsGridProps {
  selections: Selection[]
  onProductSelect?: (productTitle: string) => void
  selectedProduct?: string | null
}

export default function ProductsGrid({ selections, onProductSelect, selectedProduct }: ProductsGridProps) {
  return (
    <div className="mb-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 text-shadow">
            Premium Executors
          </h2>
          
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {selections.map((selection, index) => (
            <div key={selection.id} className="w-full">
              <ProductCard
                {...selection}
                index={index}
                onProductSelect={onProductSelect}
                isSelected={selectedProduct === selection.title}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
