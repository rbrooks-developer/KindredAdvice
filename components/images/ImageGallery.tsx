'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Flag, X } from 'lucide-react'
import type { RequestImage } from '@/lib/types'
import { ReportModal } from '@/components/report/ReportModal'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface ImageGalleryProps {
  images: RequestImage[]
  showReport?: boolean
  isAdmin?: boolean
}

export function ImageGallery({ images, showReport = true, isAdmin = false }: ImageGalleryProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const supabase = createClient()

  const getUrl = (path: string) => {
    const { data } = supabase.storage
      .from('request-images')
      .getPublicUrl(path)
    return data.publicUrl
  }

  const visible = images.filter((img) => !img.is_hidden)
  if (visible.length === 0) return null

  return (
    <>
      <div className="flex flex-wrap gap-3 my-4">
        {visible.map((img) => {
          const url = getUrl(img.storage_path)
          return (
            <div key={img.id} className="relative group">
              <button
                onClick={() => setLightboxSrc(url)}
                className="block w-28 h-28 rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Image
                  src={url}
                  alt="Attached image"
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </button>
              {showReport && (
                <ReportModal targetType="image" targetId={img.id} isAdmin={isAdmin}>
                  <button className="absolute top-1 right-1 bg-black/60 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Flag className="w-3 h-3 text-white" />
                  </button>
                </ReportModal>
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={!!lightboxSrc} onOpenChange={() => setLightboxSrc(null)}>
        <DialogContent className="max-w-3xl p-2 bg-black border-none">
          {lightboxSrc && (
            <div className="relative">
              <button
                onClick={() => setLightboxSrc(null)}
                className="absolute top-2 right-2 z-10 bg-black/60 rounded-full p-1.5 text-white hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
              <Image
                src={lightboxSrc}
                alt="Full size image"
                width={900}
                height={600}
                className="rounded object-contain max-h-[80vh] w-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
