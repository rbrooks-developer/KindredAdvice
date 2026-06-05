import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const WEBHOOK_SECRET = Deno.env.get('NOTIFY_WEBHOOK_SECRET')
const FROM_EMAIL = 'KindredAdvice <noreply@kindredadvice.com>'
const SITE_URL = 'https://kindredadvice.com'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  if (WEBHOOK_SECRET) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${WEBHOOK_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }
  }

  let payload: { type: string; record: Record<string, unknown> }
  try {
    payload = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (payload.type !== 'INSERT') {
    return new Response('Ignored: not an INSERT', { status: 200 })
  }

  const record = payload.record
  const requestId = record.id as string
  const title = record.title as string
  const category = record.category as string
  const isPrivate = record.is_private as boolean

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Fetch all admin profile IDs
  const { data: adminProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  if (profilesError || !adminProfiles?.length) {
    return new Response('No admins found', { status: 200 })
  }

  const adminIds = new Set(adminProfiles.map((p) => p.id as string))

  // Fetch emails from auth.users via admin API
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (usersError) {
    console.error('Failed to list users:', usersError)
    return new Response('Failed to fetch admin emails', { status: 500 })
  }

  const adminEmails = usersData.users
    .filter((u) => adminIds.has(u.id) && u.email)
    .map((u) => u.email as string)

  if (!adminEmails.length) {
    return new Response('No admin emails found', { status: 200 })
  }

  const categoryLabel =
    category === 'romantic'
      ? 'Romantic'
      : category === 'family'
      ? 'Family'
      : category === 'friendship'
      ? 'Friendship'
      : 'General'

  const requestUrl = `${SITE_URL}/requests/${requestId}`
  const subject = isPrivate
    ? `Private request needs your attention: ${title}`
    : `New ${categoryLabel} advice request: ${title}`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.10)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a0533 0%,#2d0854 50%,#1e0a3c 100%);padding:28px 32px;text-align:center">
            <p style="margin:0;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px">
              <span style="color:#ffffff">Kindred</span><span style="color:#f9a87c">Advice</span>
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase">Admin Notification</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${isPrivate ? '#dc2626' : '#7c3aed'}">
              ${isPrivate ? '🔒 Private Request' : '🌐 Public Request'}
            </p>
            <h1 style="margin:0 0 20px;font-size:20px;font-weight:800;color:#1c1917;line-height:1.3">${title}</h1>

            <table cellpadding="0" cellspacing="0" style="width:100%;background:#f5f3ff;border-radius:10px;overflow:hidden;margin-bottom:24px">
              <tr>
                <td style="padding:16px 20px">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#78716c;width:90px">Category</td>
                      <td style="padding:4px 0;font-size:13px;font-weight:600;color:#1c1917">${categoryLabel}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#78716c">Visibility</td>
                      <td style="padding:4px 0;font-size:13px;font-weight:600;color:#1c1917">${isPrivate ? 'Private (admin only)' : 'Public'}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${
              isPrivate
                ? `<p style="margin:0 0 24px;padding:12px 16px;background:#fef2f2;border-left:3px solid #dc2626;border-radius:4px;font-size:13px;color:#991b1b">
                    This is a <strong>private</strong> request — only administrators can view it.
                   </p>`
                : ''
            }

            <table cellpadding="0" cellspacing="0" style="width:100%">
              <tr>
                <td align="center">
                  <a href="${requestUrl}"
                     style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#9333ea);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.2px">
                    View Request →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f0ebff;text-align:center">
            <p style="margin:0;font-size:11px;color:#a8a29e">
              You're receiving this because you're an admin on KindredAdvice.<br>
              <a href="${SITE_URL}/admin" style="color:#7c3aed;text-decoration:none">Go to Admin Dashboard</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  console.log(`Sending to ${adminEmails.length} admin(s): ${adminEmails.join(', ')}`)
  console.log(`RESEND_API_KEY set: ${!!RESEND_API_KEY}`)

  let notified = 0
  for (const email of adminEmails) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject, html }),
    })
    if (res.ok) {
      notified++
      console.log(`Email sent to ${email}`)
    } else {
      const errBody = await res.text()
      console.error(`Resend error for ${email} — HTTP ${res.status}: ${errBody}`)
    }
  }

  console.log(`Done: notified ${notified}/${adminEmails.length} admins for request ${requestId}`)

  return new Response(
    JSON.stringify({ notified, total: adminEmails.length }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
