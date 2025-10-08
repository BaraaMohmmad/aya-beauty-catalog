"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"
import { Heart, SlidersHorizontal, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

interface Product {
  id: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  category: string
  subcategory?: string
  createdAt?: any
}

// 🔹 Define categories and subcategories
const CATEGORIES: Record<string, string[]> = {
  body: ["body wash", "lotion", "scrub"],
  hair: ["shampoo", "conditioner", "hair mask", "hair oil", "serum"],
  makeup: ["foundation", "concealer", "lipstick", "lip gloss", "blush", "eyeshadow", "mascara", "eyeliner"],
  perfumes: ["women", "men", "unisex"],
  "skin care": ["cleanser", "toner", "moisturizer", "sunscreen", "face mask", "serum", "scrub"],
services: [
  "Makeup",
  "Hair Styling",
  "Facial Hair Removal",
  "Hair Oil Treatment",
  "Hair Botox",
  "Hair Coloring"
],
  "hair tools": ["hair dryer", "hair straightener"],
}

export default function CategoryPage({ params }: { params: { categoryId: string } }) {
  const { categoryId } = params
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [selectedSub, setSelectedSub] = useState("all")
  const [favorites, setFavorites] = useState<string[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 200])

  // Load favorites
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]")
    setFavorites(stored)
  }, [])

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id]
    setFavorites(updated)
    localStorage.setItem("favorites", JSON.stringify(updated))
    window.dispatchEvent(new Event("storage"))
  }

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
// Normalize category name to match Firestore
let formattedCategory = categoryId.toLowerCase().replace("-", " ")

// Handle cases like "skincare" vs "skin care"
if (formattedCategory === "skincare") formattedCategory = "skin care"
if (formattedCategory === "hairtools") formattedCategory = "hair tools"
if (formattedCategory === "bodycare") formattedCategory = "body care"

const conds = [where("category", "==", formattedCategory)]

        if (selectedSub !== "all") conds.push(where("subcategory", "==", selectedSub))
        const q = query(collection(db, "products"), ...conds)
        const snap = await getDocs(q)
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Product),
        }))
        setProducts(data)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [categoryId, selectedSub])

useEffect(() => {
  let formattedCategory = categoryId.toLowerCase().replace(/-/g, " ")

  // Normalize some category names to match keys in CATEGORIES
  if (formattedCategory === "skincare") formattedCategory = "skin care"
  if (formattedCategory === "hairtools") formattedCategory = "hair tools"
  if (formattedCategory === "bodycare") formattedCategory = "body"

  const subs = CATEGORIES[formattedCategory] || []
  console.log("✅ Category:", formattedCategory, "→ Subcategories:", subs)
  setSubcategories(subs)
}, [categoryId])


  const filteredProducts = products.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
  )

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header with Filter Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground capitalize">
          {categoryId}
        </h1>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Filter Drawer */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-w-sm bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Filter Options</h2>
            <button onClick={() => setFilterOpen(false)}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {/* Subcategory Filter */}
          {subcategories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Subcategory</h3>
              <Select value={selectedSub} onValueChange={(v) => setSelectedSub(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Price Range</h3>
            <Slider
              min={0}
              max={500}
              step={5}
              value={priceRange}
              onValueChange={(v) => setPriceRange(v as [number, number])}
            />
            <div className="flex justify-between text-sm mt-2 text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedSub("all")
                setPriceRange([0, 200])
              }}
            >
              Clear
            </Button>
            <Button onClick={() => setFilterOpen(false)}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Spinner />
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground col-span-full">
            No products found.
          </p>
        ) : (
          filteredProducts.map((product) => {
            const isFav = favorites.includes(product.id)
            return (
              <div
                key={product.id}
                className="group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all bg-background relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(product.id)
                  }}
                  className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition ${
                    isFav
                      ? "bg-white text-red-500"
                      : "bg-white text-gray-400 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 transition-all ${
                      isFav ? "fill-red-500" : "fill-transparent"
                    }`}
                  />
                </button>

                <div
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="aspect-square overflow-hidden cursor-pointer"
                >
                  <img
                    src={
                      product.imageUrl && product.imageUrl.trim() !== ""
                        ? product.imageUrl
                        : "/placeholder.png"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-3 text-center">
                  <h3 className="text-sm md:text-base font-medium text-foreground line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    ₪{product.price}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
