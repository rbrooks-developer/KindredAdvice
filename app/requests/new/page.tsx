'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ImagePlus, X, Lock, Globe } from 'lucide-react'
import Image from 'next/image'

const MAX_IMAGES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function NewRequestPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - images.length

    const valid = files.slice(0, remaining).filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} is too large (max 5MB)`)
        return false
      }
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not an image`)
        return false
      }
      return true
    })

    setImages((prev) => [...prev, ...valid])
    valid.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category) {
      toast.error('Please select a category.')
      return
    }
    if (title.trim().length < 5) {
      toast.error('Title must be at least 5 characters.')
      return
    }
    if (body.trim().length < 10) {
      toast.error('Please describe your situation in more detail.')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be signed in.')
      setLoading(false)
      return
    }

    // Insert request
    const { data: newRequest, error: requestError } = await supabase
      .from('help_requests')
      .insert({
        user_id: user.id,
        title: title.trim(),
        body: body.trim(),
        category,
        is_private: isPrivate,
      })
      .select('id')
      .single()

    if (requestError || !newRequest) {
      toast.error('Could not create your request. Please try again.')
      setLoading(false)
      return
    }

    // Upload images
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${newRequest.id}/${i}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('request-images')
          .upload(path, file)

        if (!uploadError) {
          await supabase.from('request_images').insert({
            request_id: newRequest.id,
            storage_path: path,
            display_order: i,
          })
        }
      }
    }

    toast.success('Your request has been posted!')
    router.push(`/requests/${newRequest.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ask for Advice</h1>
        <p className="text-muted-foreground mt-2">
          Share what&apos;s on your mind. Our community is here to help.
        </p>
      </div>

      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          <strong>Community Guidelines:</strong> By posting, you agree to keep content respectful and appropriate. Inappropriate content may result in removal and a ban from KindredAdvice. Read our{' '}
          <a href="/guidelines" className="underline hover:text-amber-900">
            full guidelines
          </a>
          .
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="Give your situation a brief title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/200</p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
            <Select onValueChange={(v) => setCategory((v ?? '') as Category)} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="What kind of advice do you need?" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Your Situation <span className="text-destructive">*</span></Label>
            <Textarea
              id="body"
              placeholder="Describe what's going on. The more detail you share, the better advice you'll receive…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              maxLength={5000}
              required
            />
            <p className="text-xs text-muted-foreground text-right">{body.length}/5000</p>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <Label>
              Supporting Images{' '}
              <span className="text-muted-foreground font-normal text-sm">
                (optional, up to {MAX_IMAGES})
              </span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Upload screenshots of texts or photos that help explain your situation.
            </p>

            <div className="flex flex-wrap gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={src}
                    alt={`Image ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-xs">Add</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageAdd}
              className="hidden"
            />
            {images.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {images.length}/{MAX_IMAGES} images added
              </Badge>
            )}
          </div>

          {/* Privacy toggle */}
          <div className="space-y-2">
            <Label>Visibility</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex-1 flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${
                  !isPrivate
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Globe className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Public</div>
                  <div className="text-xs opacity-70">Community can see and reply</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex-1 flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${
                  isPrivate
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Lock className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Private</div>
                  <div className="text-xs opacity-70">Only admins can see and reply</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading || !category || title.trim().length < 5 || body.trim().length < 10}
        >
          {loading ? 'Posting your request…' : 'Post Request'}
        </Button>
      </form>
    </div>
  )
}
