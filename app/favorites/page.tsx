"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ProductCard } from "@/components/product-card"
import { Spinner } from "@/components/ui/spinner"

interface Product {
  id: string
  name: string
  price: number
  description?: string
  imageUrl: string
  categoryId?: string
  createdAt: any
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const favoriteIds = JSON.parse(localStorage.getItem("favorites") || "[]")

        if (favoriteIds.length === 0) {
          setLoading(false)
          return
        }

        const productsRef = collection(db, "products")
        const querySnapshot = await getDocs(productsRef)
        const favProducts = querySnapshot.docs
          .filter((doc) => favoriteIds.includes(doc.id))
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]

        setFavorites(favProducts)
      } catch (error) {
        console.error("Error fetching favorites:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()

    // Listen for storage changes
    const handleStorageChange = () => {
      fetchFavorites()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">Your Favorites</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">Products you've saved for later</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg mb-4">You haven't added any favorites yet.</p>
          <p className="text-sm text-muted-foreground">Click the heart icon on products to save them here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
