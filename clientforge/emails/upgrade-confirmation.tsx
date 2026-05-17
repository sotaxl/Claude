import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Tailwind,
} from "@react-email/components"

interface UpgradeConfirmationEmailProps {
  name: string
  planName: string
  dashboardUrl: string
}

export function UpgradeConfirmationEmail({ name, planName, dashboardUrl }: UpgradeConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re now on ClientForge {planName} — let&apos;s get you set up</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-12 px-4 max-w-xl">
            <Section className="bg-white rounded-2xl shadow-sm p-10">
              <Text className="text-4xl mb-4">🚀</Text>
              <Heading className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to {planName}, {name}!
              </Heading>
              <Text className="text-gray-600 mb-6">
                Your upgrade is confirmed. You now have access to all {planName} features.
              </Text>

              <Section className="bg-indigo-50 rounded-xl p-6 mb-6">
                <Text className="text-indigo-800 font-semibold mb-3">Now available to you:</Text>
                <Text className="text-gray-700 mb-1">✓ Unlimited clients & projects</Text>
                <Text className="text-gray-700 mb-1">✓ Automated email sequences</Text>
                <Text className="text-gray-700 mb-1">✓ Advanced analytics & reporting</Text>
                <Text className="text-gray-700 mb-1">✓ Discount code generation</Text>
                <Text className="text-gray-700">✓ Priority support</Text>
              </Section>

              <Button
                className="bg-indigo-600 text-white rounded-lg px-6 py-3 font-semibold text-base"
                href={dashboardUrl}
              >
                Open Dashboard →
              </Button>

              <Hr className="my-8 border-gray-200" />
              <Text className="text-gray-400 text-xs">
                You can manage your subscription anytime from the Billing page.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default UpgradeConfirmationEmail
