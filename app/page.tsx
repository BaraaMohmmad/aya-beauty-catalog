import { HeroSection } from "@/components/hero-section"
import { ProductsGrid } from "@/components/products-grid"

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
            Our Collection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover our curated selection of premium beauty products and services
          </p>
        </div>

        <ProductsGrid />
      </section>
    </div>
  )
}
