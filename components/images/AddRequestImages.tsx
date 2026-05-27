'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RequestImage } from '@/lib/types'

interface AddRequestImagesProps {
  requestId: string
  userId: string
  existingImages: RequestImage[]
  highestDisplayOrder: number
}

export function AddRequestImages({ requestId, userId, existingImages, highestDisplayOrder }: AddRequestImagesProps) {
  const supabase = createClient()

  const getUrl = (path: string) => supabase.storage.from('request-images').getPublicUrl(path).data.publicUrl

  const [open, setOpen] = useState(false)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const visibleExisting = existingImages.filter((img) => !hiddenIds.has(img.id))
  const totalVisible = visibleExisting.length + newFiles.length
  const maxAdd = 5 - visibleExisting.length

  const handleDelete = async (img: RequestImage) => {
    setDeletingId(img.id)
    const { error } = await supabase
      .from('request_images')
      .update({ is_hidden: true })
      .eq('id', img.id)
    if (error) {
      toast.error('Could not remove image.')
    } else {
      setHiddenIds((prev) => new Set([...prev, img.id]))
      setNewFiles((prev) => prev.slice(0, 5 - (visibleExisting.length - 1)))
      setNewPreviews((prev) => prev.slice(0, 5 - (visibleExisting.length - 1)))
    }
    setDeletingId(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = maxAdd - newFiles.length
    const valid = files.slice(0, remaining).filter((f) => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} is too large (max 5MB)`); return false }
      if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false }
      return true
    })
    setNewFiles((prev) => [...prev, ...valid])
    valid.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeNewImage = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (newFiles.length === 0) return
    setUploading(true)
    let uploaded = 0
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]
      const ext = file.name.split('.').pop()
      const path = `${userId}/${requestId}/${Date.now()}-${i}.${ext}`
      const { error: uploadError } = await supabase.storage.from('request-images').upload(path, file)
      if (uploadError) { toast.error(`Failed to upload ${file.name}: ${uploadError.message}`); continue }
      const { error: insertError } = await supabase.from('request_images').insert({
        request_id: requestId,
        storage_path: path,
        display_order: highestDisplayOrder + i + 1,
      })
      if (insertError) { toast.error(`Could not save image: ${insertError.message}`) } else { uploaded++ }
    }
    setUploading(false)
    if (uploaded > 0) {
      toast.success(`${uploaded} image${uploaded > 1 ? 's' : ''} added.`)
      setNewFiles([])
      setNewPreviews([])
      setOpen(false)
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-4"
      >
        <ImagePlus className="w-3.5 h-3.5" />
        Manage images ({visibleExisting.length}/5)
      </button>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Manage images <span className="text-muted-foreground font-normal">({totalVisible}/5)</span>
        </p>
        <button
          onClick={() => { setOpen(false); setNewFiles([]); setNewPreviews([]) }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Close
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Existing images with delete buttons */}
        {visibleExisting.map((img) => (
          <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getUrl(img.storage_path)} alt="Attached image" className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => handleDelete(img)}
              disabled={deletingId === img.id}
              className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all"
            >
              {deletingId === img.id
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <X className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              }
            </button>
          </div>
        ))}

        {/* New image previews */}
        {newPreviews.map((src, i) => (
          <div key={`new-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-primary/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`New image ${i + 1}`} className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => removeNewImage(i)}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add button — only when under the limit */}
        {totalVisible < 5 && (
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

      {newFiles.length > 0 && (
        <Button size="sm" onClick={handleUpload} disabled={uploading}>
          {uploading
            ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Uploading…</>
            : `Upload ${newFiles.length} image${newFiles.length > 1 ? 's' : ''}`
          }
        </Button>
      )}
    </div>
  )
}
