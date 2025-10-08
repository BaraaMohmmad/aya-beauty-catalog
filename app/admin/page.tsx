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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let imageUrl = ""
      let imagePublicId = ""
      if (imageFile) {
        const form = new FormData()
        form.append("file", imageFile)
        form.append("upload_preset", "unsigned_upload")
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "dgersnzf7"
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form })
        const data = await res.json()
        if (!data.secure_url) throw new Error("Image upload failed")
        imageUrl = data.secure_url
        imagePublicId = data.public_id || extractCloudinaryPublicId(data.secure_url) || ""
      }

      if (!formData.name || !formData.price || !formData.category || !formData.subcategory)
        throw new Error("Please fill all required fields.")

      await addDoc(collection(db, "products"), {
        ...formData,
        price: Number.parseFloat(formData.price),
        imageUrl,
        imagePublicId,
        createdAt: new Date(),
      })

      toast({ title: "Success!", description: "Product added successfully." })
      setFormData({ name: "", price: "", description: "", category: "", subcategory: "" })
      setImageFile(null)
      if (imageInputRef.current) imageInputRef.current.value = ""
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add product.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (product: any) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    setLoading(true)
    try {
      if (product.imagePublicId) {
        await fetch("/api/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: product.imagePublicId }),
        })
      }
      await deleteDoc(doc(db, "products", product.id))
      toast({ title: "Deleted", description: "Product deleted successfully." })
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (p: any) => {
    setEditingProduct({ ...p, price: p.price?.toString?.() ?? "" })
    setImageFile(null)
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setLoading(true)
    try {
      let imageUrl = editingProduct.imageUrl || ""
      let newPublicId = editingProduct.imagePublicId || ""

      if (imageFile) {
        const form = new FormData()
        form.append("file", imageFile)
        form.append("upload_preset", "unsigned_upload")
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "dgersnzf7"
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form })
        const data = await res.json()
        if (!data.secure_url) throw new Error("Image upload failed")
        imageUrl = data.secure_url
        newPublicId = data.public_id || extractCloudinaryPublicId(data.secure_url) || ""
      }

      await updateDoc(doc(db, "products", editingProduct.id), {
        ...editingProduct,
        price: Number.parseFloat(editingProduct.price),
        imageUrl,
        imagePublicId: newPublicId,
        updatedAt: new Date(),
      })

      toast({ title: "Updated", description: "Product updated successfully." })
      setEditingProduct(null)
      setImageFile(null)
    } catch (err) {
      toast({ title: "Error", description: "Failed to update product.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

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
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-pink-600" />
            </div>
            <CardTitle className="text-3xl font-serif">Admin Access</CardTitle>
            <CardDescription className="text-base">
              Enter password to access the Aya Beauty dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value)
                    setPasswordError(false)
                  }}
                  className={passwordError ? "border-destructive" : ""}
                  required
                />
                {passwordError && (
                  <p className="text-sm text-destructive">Incorrect password. Please try again.</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* 🌸 Navbar */}
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
        {/* Add/Edit Product Form */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingProduct ? handleUpdateSubmit : handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingProduct ? editingProduct.name : formData.name}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, name: e.target.value })
                        : setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editingProduct ? editingProduct.price : formData.price}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, price: e.target.value })
                        : setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProduct ? editingProduct.description : formData.description}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, description: e.target.value })
                      : setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={editingProduct ? editingProduct.category : formData.category}
                    onValueChange={(value) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, category: value, subcategory: "" })
                        : handleCategoryChange(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CATEGORIES).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Subcategory</Label>
                  <Select
                    value={editingProduct ? editingProduct.subcategory : formData.subcategory}
                    onValueChange={(value) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, subcategory: value })
                        : setFormData({ ...formData, subcategory: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {(editingProduct
                        ? CATEGORIES[editingProduct.category] ?? []
                        : subcategories
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Image</Label>
                <Input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} />
              </div>

              <Button type="submit" disabled={loading}>
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </form>
          </CardContent>
        </Card>

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
            <Card key={p.id} className="shadow-sm">
              <CardContent className="p-4 space-y-2">
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <h3 className="text-lg font-medium">{p.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {p.category} → {p.subcategory}
                </p>
                <p className="font-semibold">${p.price}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEditing(p)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(p)}>
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
