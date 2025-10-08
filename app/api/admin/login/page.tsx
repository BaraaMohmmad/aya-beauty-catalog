"use client"

import type React from "react"
import { useState, useMemo, useRef, useEffect } from "react"
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Lock, LogOut } from "lucide-react"

const CATEGORIES: Record<string, string[]> = {
  Body: ["Body Wash", "Lotion", "Scrub"],
  Hair: ["Shampoo", "Conditioner", "Hair Mask", "Hair Oil", "Serum"],
  Makeup: ["Foundation", "Concealer", "Lipstick", "Lip Gloss", "Blush", "Eyeshadow", "Mascara", "Eyeliner"],
  Perfumes: ["Women", "Men", "Unisex"],
  "Skin Care": ["Cleanser", "Toner", "Moisturizer", "Sunscreen", "Face Mask", "Serum", "Scrub"],
  Services: [
    "Makeup",
    "Hair Styling",
    "Facial Hair Removal",
    "Hair Oil Treatment",
    "Hair Botox",
    "Hair Coloring",
  ],
  "Hair Tools": ["Hair Dryer", "Hair Straightener"],
}

function extractCloudinaryPublicId(url?: string) {
  if (!url) return null
  try {
    const parts = url.split("/upload/")
    if (parts.length < 2) return null
    const afterUpload = parts[1]
    const segments = afterUpload.split("/")
    if (/^v\d+/.test(segments[0])) segments.shift()
    const publicWithExt = segments.join("/")
    const dotIndex = publicWithExt.lastIndexOf(".")
    return dotIndex === -1 ? publicWithExt : publicWithExt.slice(0, dotIndex)
  } catch {
    return null
  }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    subcategory: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetch("/api/admin/check").then(async (res) => {
      const data = await res.json()
      if (data.ok) setIsAuthenticated(true)
    })
  }, [])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      })

      if (res.ok) {
        setIsAuthenticated(true)
        setPasswordError(false)
      } else {
        setPasswordError(true)
        setPasswordInput("")
      }
    } catch (err) {
      console.error(err)
      setPasswordError(true)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    setIsAuthenticated(false)
    toast({ title: "Logged out", description: "You have been logged out successfully." })
  }

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      items.sort((a: any, b: any) => {
        const ta = a.createdAt ? new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt).getTime() : 0
        return tb - ta
      })
      setProducts(items)
    })
    return () => unsubscribe()
  }, [])

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value, subcategory: "" })
  }

  const subcategories = useMemo(() => {
    if (!formData.category) return []
    return CATEGORIES[formData.category] ?? []
  }, [formData.category])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0])
  }

  const startEditing = (p: any) => {
    setEditingProduct({ ...p, price: p.price?.toString?.() ?? "" })
    setImageFile(null)
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => { /* نفس الكود الأصلي */ }
  const handleDelete = async (product: any) => { /* نفس الكود الأصلي */ }
  const handleUpdateSubmit = async (e: React.FormEvent) => { /* نفس الكود الأصلي */ }

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.subcategory || "").toLowerCase().includes(q)
    )
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-pink-50 to-white">
        {/* Login form نفس الكود الأصلي */}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-serif text-pink-600">Aya Beauty Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 italic">Logged in as Admin</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Add/Edit Form */}
        {/* ... نفس الكود ... */}

        {/* Search */}
        <div>
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md mx-auto block"
          />
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((p) => (
            <Card key={p.id} className="shadow-sm relative z-10">
              <CardContent className="p-4 space-y-2 relative">
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-48 object-cover rounded-lg pointer-events-none"
                  />
                )}
                <h3 className="text-lg font-medium mt-2">{p.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {p.category} → {p.subcategory}
                </p>
                <p className="font-semibold">₪{p.price}</p>
                <div className="flex gap-2 mt-3 relative z-50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(p)}
                    className="relative z-50"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(p)}
                    className="relative z-50"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
