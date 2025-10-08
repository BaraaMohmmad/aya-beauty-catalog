"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, limit, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Spinner } from "@/components/ui/spinner"
import { Heart } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  imageUrl?: string
}

export function ProductsGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const router = useRouter()

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    setFavorites(storedFavorites)
  }, [])

  // Toggle favorite
  const toggleFavorite = (productId: string) => {
    const updatedFavorites = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId]

    setFavorites(updatedFavorites)
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
    window.dispatchEvent(new Event("storage"))
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const q = query(collection(db, "products"), limit(12))
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Product),
        }))
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner className="h-10 w-10 text-pink-500" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        No products available yet ✨
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {products.map((product) => {
        const isFav = favorites.includes(product.id)
        return (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.02 }}
            className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-3 relative"
          >
            {/* Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(product.id)
              }}
              className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition ${
                isFav ? "bg-white text-red-500" : "bg-white text-gray-400 hover:text-red-500"
              }`}
            >
              <Heart
                className={`h-5 w-5 transition-all ${
                  isFav ? "fill-red-500" : "fill-transparent"
                }`}
              />
            </button>

            {/* Product Image */}
            <div onClick={() => router.push(`/product/${product.id}`)}>
              <div className="aspect-square overflow-hidden rounded-xl">
                <img
                  src={
                    product.imageUrl && product.imageUrl.trim() !== ""
                      ? product.imageUrl
                      : "/placeholder.png"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="text-center mt-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm">₪{product.price}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
