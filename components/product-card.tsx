"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  description?: string
  imageUrl: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    setIsFavorite(favorites.includes(product.id))
  }, [product.id])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    let newFavorites: string[]

    if (favorites.includes(product.id)) {
      newFavorites = favorites.filter((id: string) => id !== product.id)
    } else {
      newFavorites = [...favorites, product.id]
    }

    localStorage.setItem("favorites", JSON.stringify(newFavorites))
    setIsFavorite(!isFavorite)
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.imageUrl || "/placeholder.svg?height=400&width=400&query=beauty+product"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-primary text-primary" : "text-foreground"}`} />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-serif text-xl text-foreground mb-2 text-balance">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <p className="text-lg font-semibold text-primary">₪{product.price.toFixed(2)}</p>
      </CardFooter>
    </Card>
  )
}
