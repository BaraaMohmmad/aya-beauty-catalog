"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion } from "framer-motion"
import { Spinner } from "@/components/ui/spinner"
import { Heart } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  imageUrl?: string
  category?: string
  description?: string
}

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
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
    async function fetchProduct() {
      if (!id) return
      setLoading(true)
      try {
        const docRef = doc(db, "products", id as string)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...(docSnap.data() as Product) }
          setProduct(productData)
          await fetchRelated(productData.category)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchRelated(category?: string) {
      if (!category) return
      const q = query(
        collection(db, "products"),
        where("category", "==", category),
        limit(4)
      )
      const snapshot = await getDocs(q)
      const relatedData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as Product) }))
        .filter((item) => item.id !== id)
      setRelated(relatedData)
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner className="h-10 w-10 text-pink-500" />
      </div>
    )
  }

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Product not found.</div>
  }

  const isFav = favorites.includes(product.id)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-10"
    >
      {/* Product Image & Info */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-white rounded-2xl shadow-md p-4 relative">
          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(product.id)}
            className={`absolute top-3 right-3 p-2 rounded-full transition ${
              isFav ? "bg-red-500 text-white" : "bg-white/80 text-gray-600"
            }`}
          >
            <Heart className={`h-6 w-6 ${isFav ? "fill-white" : "fill-transparent"}`} />
          </button>

          <img
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            className="w-full h-auto rounded-xl object-cover"
          />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">₪{product.price}</p>
          <p className="text-gray-500 leading-relaxed">
            {product.description || "No description available."}
          </p>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {related.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/product/${item.id}`)}
                className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-3"
              >
                <div className="aspect-square overflow-hidden rounded-xl">
                  <img
                    src={item.imageUrl || "/placeholder.png"}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="text-center mt-3">
                  <h3 className="text-sm font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-gray-500 text-sm">₪{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
