import type { Metadata } from 'next'
import { Heart, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'KindredAdvice community rules and values.',
}

export default function GuidelinesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10 space-y-3">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="w-7 h-7 text-primary fill-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Community Guidelines</h1>
        <p className="text-muted-foreground text-lg">
          KindredAdvice is built on kindness, trust, and respect. These guidelines keep our community safe for everyone.
        </p>
      </div>

      <Alert className="mb-8 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Important:</strong> Violating these guidelines may result in a warning, temporary suspension, or permanent ban from KindredAdvice.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Be Kind and Supportive</h2>
          </div>
          <div className="space-y-3 text-muted-foreground leading-relaxed pl-7">
            <p>People come to KindredAdvice in vulnerable moments. Respond with the empathy you&apos;d want someone to show you.</p>
            <p>Offer genuine advice, not judgment. You can disagree respectfully — that&apos;s healthy discussion. Personal attacks are not.</p>
            <p>Remember: you&apos;re hearing one side of a story. Stay open-minded.</p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Keep Content Appropriate</h2>
          </div>
          <div className="space-y-3 text-muted-foreground leading-relaxed pl-7">
            <p>Do not post explicit sexual content, graphic violence, or disturbing imagery.</p>
            <p>No hate speech based on race, gender, sexuality, religion, disability, or any other characteristic.</p>
            <p>No harassment, threatening language, or doxxing of any kind.</p>
            <p>Spam and self-promotion are not allowed.</p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Protect Privacy</h2>
          </div>
          <div className="space-y-3 text-muted-foreground leading-relaxed pl-7">
            <p>Never share someone else&apos;s personal information without their consent.</p>
            <p>If you include screenshots or photos of others, blur out identifying information like names and faces when possible.</p>
            <p>What&apos;s shared here should stay here — don&apos;t screenshot and share others&apos; posts.</p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Consequences</h2>
          </div>
          <div className="space-y-3 text-muted-foreground leading-relaxed pl-7">
            <p><strong className="text-foreground">Warning:</strong> First-time minor violations receive a formal warning. The content will be removed.</p>
            <p><strong className="text-foreground">Temporary Ban:</strong> Repeated or moderate violations result in a suspension ranging from 1–30 days.</p>
            <p><strong className="text-foreground">Permanent Ban:</strong> Severe violations — including harassment, explicit content, or hate speech — result in a permanent ban with no appeal.</p>
            <p>Content that receives 5 or more reports is automatically hidden for admin review.</p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Reporting</h2>
          </div>
          <div className="space-y-3 text-muted-foreground leading-relaxed pl-7">
            <p>Every request, reply, and image has a &quot;Report&quot; link. Use it if something feels wrong.</p>
            <p>Our admin team reviews all reports. False reporting to harass others is itself a violation.</p>
            <p>Reports are anonymous — the person being reported will not know who flagged them.</p>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center space-y-2">
        <p className="font-semibold">Questions about these guidelines?</p>
        <p className="text-sm text-muted-foreground">
          Use the report system to contact admins, or post a public request tagged as &quot;General&quot; and mention it&apos;s a guidelines question.
        </p>
      </div>
    </div>
  )
}
