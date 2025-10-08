"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"

export function FavoriteButton({ productId }: { productId: string }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    setIsFavorite(favorites.includes(productId))
  }, [productId])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    let updatedFavorites

    if (favorites.includes(productId)) {
      updatedFavorites = favorites.filter((id: string) => id !== productId)
      setIsFavorite(false)
    } else {
      updatedFavorites = [...favorites, productId]
      setIsFavorite(true)

      // ❤️ Pulse animation when adding
      setAnimate(true)
      setTimeout(() => setAnimate(false), 400)
    }

    localStorage.setItem("favorites", JSON.stringify(updatedFavorites))

    // ✅ Update navigation badge instantly
    window.dispatchEvent(new CustomEvent("favoritesUpdated", { detail: updatedFavorites }))
  }

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation()
        toggleFavorite()
      }}
      animate={animate ? { scale: [1, 1.4, 1] } : {}}
      transition={{ duration: 0.4 }}
      className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm hover:bg-white transition"
      aria-label="Add to favorites"
    >
      <Heart
        className={`h-5 w-5 transition-all ${
          isFavorite ? "text-red-500 fill-red-500" : "text-gray-500"
        }`}
      />
    </motion.button>
  )
}
