'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AddRequestImagesProps {
  requestId: string
  userId: string
  currentCount: number
  highestDisplayOrder: number
}

export function AddRequestImages({ requestId, userId, currentCount, highestDisplayOrder }: AddRequestImagesProps) {
  const maxAdd = 5 - currentCount
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  if (maxAdd <= 0) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = maxAdd - images.length
    const valid = files.slice(0, remaining).filter((f) => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} is too large (max 5MB)`); return false }
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false }
      return true
    })
    setImages((prev) => [...prev, ...valid])
    valid.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (images.length === 0) return
    setUploading(true)

    let uploaded = 0
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext = file.name.split('.').pop()
      const path = `${userId}/${requestId}/${Date.now()}-${i}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('request-images')
        .upload(path, file)

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}: ${uploadError.message}`)
        continue
      }

      const { error: insertError } = await supabase.from('request_images').insert({
        request_id: requestId,
        storage_path: path,
        display_order: highestDisplayOrder + i + 1,
      })

      if (insertError) {
        toast.error(`Could not save image: ${insertError.message}`)
      } else {
        uploaded++
      }
    }

    setUploading(false)
    if (uploaded > 0) {
      toast.success(`${uploaded} image${uploaded > 1 ? 's' : ''} added.`)
      setImages([])
      setPreviews([])
      setOpen(false)
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <ImagePlus className="w-3.5 h-3.5" />
        Add images ({currentCount}/5)
      </button>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Add images <span className="text-muted-foreground font-normal">({currentCount + images.length}/5)</span></p>
        <button onClick={() => { setOpen(false); setImages([]); setPreviews([]) }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Preview ${i + 1}`} className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {images.length < maxAdd && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <ImagePlus className="w-4 h-4" />
            <span className="text-xs">Add</span>
          </button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

      {images.length > 0 && (
        <Button size="sm" onClick={handleUpload} disabled={uploading}>
          {uploading ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Uploading…</> : `Upload ${images.length} image${images.length > 1 ? 's' : ''}`}
        </Button>
      )}
    </div>
  )
}
