import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Tailwind,
} from "@react-email/components"

interface PaymentFailedEmailProps {
  name: string
  updatePaymentUrl: string
  retryDate: string
}

export function PaymentFailedEmail({ name, updatePaymentUrl, retryDate }: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Action required: your ClientForge payment failed</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-12 px-4 max-w-xl">
            <Section className="bg-white rounded-2xl shadow-sm p-10">
              <Section className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <Text className="text-red-700 font-semibold text-sm">⚠️ Payment failed</Text>
              </Section>

              <Heading className="text-xl font-bold text-gray-900 mb-2">
                We couldn&apos;t process your payment
              </Heading>
              <Text className="text-gray-600 mb-6">
                Hi {name}, your latest ClientForge payment didn&apos;t go through. Please update your payment method to keep access to Pro features.
              </Text>

              <Text className="text-gray-500 text-sm mb-6">
                We&apos;ll retry on <strong>{retryDate}</strong>. If payment continues to fail, your account will be downgraded to the free plan.
              </Text>

              <Button
                className="bg-red-600 text-white rounded-lg px-6 py-3 font-semibold text-base"
                href={updatePaymentUrl}
              >
                Update Payment Method
              </Button>

              <Hr className="my-8 border-gray-200" />
              <Text className="text-gray-400 text-xs">
                Need help? Reply to this email and we&apos;ll sort it out.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default PaymentFailedEmail
