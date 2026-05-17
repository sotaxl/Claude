import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Img, Preview, Section, Text, Tailwind,
} from "@react-email/components"

interface WelcomeEmailProps {
  name: string
  loginUrl: string
}

export function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to ClientForge — your client portal is ready</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-12 px-4 max-w-xl">
            <Section className="bg-white rounded-2xl shadow-sm p-10">
              <Heading className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to ClientForge, {name} 👋
              </Heading>
              <Text className="text-gray-600 text-base mb-6">
                You&apos;re all set. ClientForge helps you manage clients, projects and billing — all in one place.
              </Text>

              <Section className="bg-indigo-50 rounded-xl p-6 mb-6">
                <Text className="text-indigo-800 font-semibold mb-3 text-sm uppercase tracking-wide">
                  Get started in 3 steps
                </Text>
                <Text className="text-gray-700 mb-1">1. Add your first client</Text>
                <Text className="text-gray-700 mb-1">2. Create a project and link it to them</Text>
                <Text className="text-gray-700">3. Share the client portal link</Text>
              </Section>

              <Button
                className="bg-indigo-600 text-white rounded-lg px-6 py-3 font-semibold text-base"
                href={loginUrl}
              >
                Go to Dashboard →
              </Button>

              <Hr className="my-8 border-gray-200" />
              <Text className="text-gray-400 text-sm">
                You&apos;re on the free plan. Upgrade to Pro anytime to unlock unlimited clients and automated email sequences.
              </Text>
              <Text className="text-gray-400 text-xs mt-2">
                ClientForge · Unsubscribe · Privacy Policy
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default WelcomeEmail
