"use client"

import { Phone, Instagram, Facebook, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 text-balance">
          Get in Touch
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Contact us through the following platforms or visit us directly at our salon.
        </p>
      </div>

      {/* Contact Information */}
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Contact Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Phone */}
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Phone</p>
                <a
                  href="tel:+972569892038"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  +972 56-989-2038
                </a>
              </div>
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-3">
              <Instagram className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Instagram</p>
                <a
                  href="https://instagram.com/aya_salon222"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  @aya_salon222
                </a>
              </div>
            </div>

            {/* Facebook */}
            <div className="flex items-center gap-3">
              <Facebook className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Facebook</p>
                <a
                  href="https://facebook.com/AyaMohammadKarajah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Aya Mohammad Karajah
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Salon Location</p>
                <p className="text-muted-foreground">
                  قرية صفا - وسط البلد، بجانب صالون شادي للرجال، مقابل محمص أرام.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
