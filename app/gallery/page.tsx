"use client"

import { useEffect, useState } from "react"
import { ref, listAll, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { motion } from "framer-motion"

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGalleryImages() {
      try {
        const galleryRef = ref(storage, "gallery")
        const result = await listAll(galleryRef)
        const urls = await Promise.all(result.items.map((item) => getDownloadURL(item)))
        setImages(urls)
      } catch (error) {
        console.error("Error fetching gallery images:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryImages()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-rose-700 mb-4">
            Aya Beauty Gallery
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Discover our elegant atmosphere and stunning transformations.
          </p>
          <div className="mx-auto mt-6 w-24 h-1 bg-gradient-to-r from-pink-400 via-rose-300 to-yellow-300 rounded-full"></div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner className="h-10 w-10 text-pink-500" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Gallery images coming soon ✨</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          >
            {images.map((imageUrl, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedImage(imageUrl)}
                whileHover={{ scale: 1.03 }}
                className="relative aspect-square overflow-hidden rounded-2xl shadow-md hover:shadow-pink-100 transition-all duration-300"
              >
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Lightbox */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-5xl bg-transparent border-none shadow-none p-0">
            {selectedImage && (
              <motion.img
                src={selectedImage}
                alt="Gallery image"
                className="w-full h-auto rounded-2xl shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
