import { Resend } from "resend"
import { render } from "@react-email/render"
import { WelcomeEmail } from "@/emails/welcome"
import { DiscountOfferEmail } from "@/emails/discount-offer"
import { PaymentFailedEmail } from "@/emails/payment-failed"
import { UpgradeConfirmationEmail } from "@/emails/upgrade-confirmation"
import { absoluteUrl } from "@/lib/utils"

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = "ClientForge <noreply@clientforge.io>"

export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  const html = render(WelcomeEmail({ name, loginUrl: absoluteUrl("/dashboard") }))
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to ClientForge, ${name}!`,
    html: await html,
  })
}

export async function sendDiscountOfferEmail({
  to, name, discountCode = "LAUNCH25", discountPercent = 25,
}: { to: string; name: string; discountCode?: string; discountPercent?: number }) {
  const html = render(DiscountOfferEmail({
    name,
    discountCode,
    discountPercent,
    upgradeUrl: absoluteUrl(`/billing?coupon=${discountCode}`),
    expiresIn: "7 days",
  }))
  return resend.emails.send({
    from: FROM,
    to,
    subject: `🎁 ${discountPercent}% off ClientForge Pro — just for you`,
    html: await html,
  })
}

export async function sendPaymentFailedEmail({ to, name }: { to: string; name: string }) {
  const html = render(PaymentFailedEmail({
    name,
    updatePaymentUrl: absoluteUrl("/billing"),
    retryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      month: "long", day: "numeric",
    }),
  }))
  return resend.emails.send({
    from: FROM,
    to,
    subject: "⚠️ Action required: payment failed",
    html: await html,
  })
}

export async function sendUpgradeConfirmationEmail({ to, name, planName = "Pro" }: {
  to: string; name: string; planName?: string
}) {
  const html = render(UpgradeConfirmationEmail({
    name, planName, dashboardUrl: absoluteUrl("/dashboard"),
  }))
  return resend.emails.send({
    from: FROM,
    to,
    subject: `🚀 You're on ClientForge ${planName}!`,
    html: await html,
  })
}
