"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)

  const categories = [
    { id: "body", name: "Body" },
    { id: "hair", name: "Hair" },
    { id: "makeup", name: "Makeup" },
    { id: "perfumes", name: "Perfumes" },
    { id: "skincare", name: "Skin Care" },
    { id: "services", name: "Services" },
    { id: "hair-tools", name: "Hair Tools" },
  ]

  // 🔹 Load and listen for favorite count updates
useEffect(() => {
  const loadFavorites = () => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    setFavoriteCount(storedFavorites.length)
  }

  loadFavorites()

  // ✅ Listen for both browser storage + custom update events
  window.addEventListener("storage", loadFavorites)
  window.addEventListener("favoritesUpdated", loadFavorites)

  return () => {
    window.removeEventListener("storage", loadFavorites)
    window.removeEventListener("favoritesUpdated", loadFavorites)
  }
}, [])


  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-serif text-primary tracking-wide">
              Aya Beauty
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-foreground/80 hover:text-primary transition-colors font-light tracking-wide"
            >
              Home
            </Link>

            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="text-foreground/80 hover:text-primary transition-colors font-light tracking-wide"
              >
                {category.name}
              </Link>
            ))}

            <Link
              href="/contact"
              className="text-foreground/80 hover:text-primary transition-colors font-light tracking-wide"
            >
              Contact
            </Link>

            {/* Favorites Button with Counter */}
            <Link href="/favorites">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {favoriteCount}
                  </span>
                )}
                <span className="sr-only">Favorites</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Controls (Heart + Menu) */}
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/favorites" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {favoriteCount}
                  </span>
                )}
              </Button>
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="text-foreground/80 hover:text-primary transition-colors py-2"
              >
                Home
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  onClick={() => setIsOpen(false)}
                  className="text-foreground/80 hover:text-primary transition-colors py-2"
                >
                  {category.name}
                </Link>
              ))}

              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="text-foreground/80 hover:text-primary transition-colors py-2"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
