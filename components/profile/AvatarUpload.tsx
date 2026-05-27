'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2 } from 'lucide-react'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl: string | null
  initials: string
}

export function AvatarUpload({ userId, currentAvatarUrl, initials }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB.')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }

    setUploading(true)

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/avatar.${ext}`

    // Remove any previous avatar regardless of extension
    await supabase.storage.from('avatars').remove([
      `${userId}/avatar.jpg`,
      `${userId}/avatar.jpeg`,
      `${userId}/avatar.png`,
      `${userId}/avatar.webp`,
      `${userId}/avatar.gif`,
    ])

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error('Could not upload image. Please try again.')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    // Add cache-busting so the browser picks up the new image immediately
    const urlWithBust = `${publicUrl}?t=${Date.now()}`

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlWithBust })
      .eq('id', userId)

    if (updateError) {
      toast.error('Could not save avatar. Please try again.')
    } else {
      setAvatarUrl(urlWithBust)
      toast.success('Avatar updated!')
      window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { url: urlWithBust } }))
      router.refresh()
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative group cursor-pointer w-20 h-20 shrink-0"
        onClick={() => !uploading && fileInputRef.current?.click()}
        title="Click to change avatar"
      >
        <Avatar className="w-20 h-20">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback
            className="text-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Hover / loading overlay */}
        <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200 ${
          uploading ? 'bg-black/50' : 'bg-black/0 group-hover:bg-black/45'
        }`}>
          {uploading
            ? <Loader2 className="w-6 h-6 text-white animate-spin" />
            : <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          }
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <span className="text-xs text-muted-foreground">Click to change</span>
    </div>
  )
}
