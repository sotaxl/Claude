import {
  Body, Button, Container, Head, Heading, Hr, Html,
  Preview, Section, Text, Tailwind,
} from "@react-email/components"

interface DiscountOfferEmailProps {
  name: string
  discountCode: string
  discountPercent: number
  upgradeUrl: string
  expiresIn: string
}

export function DiscountOfferEmail({ name, discountCode, discountPercent, upgradeUrl, expiresIn }: DiscountOfferEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`🎁 ${discountPercent}% off ClientForge Pro — exclusive offer for you`}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-12 px-4 max-w-xl">
            <Section className="bg-white rounded-2xl shadow-sm p-10">
              <Text className="text-3xl mb-2">🎁</Text>
              <Heading className="text-2xl font-bold text-gray-900 mb-2">
                {discountPercent}% off, just for you
              </Heading>
              <Text className="text-gray-600 mb-6">
                Hi {name}, you&apos;ve been using ClientForge for a while now — and we want to make upgrading easy.
              </Text>

              <Section className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-6 mb-6 text-center">
                <Text className="text-white text-sm mb-2 opacity-80">Your exclusive code</Text>
                <Text className="text-white text-3xl font-bold tracking-widest mb-2">
                  {discountCode}
                </Text>
                <Text className="text-white text-sm opacity-80">
                  {discountPercent}% off Pro for your first 3 months
                </Text>
              </Section>

              <Text className="text-gray-600 text-sm mb-6">
                Pro unlocks unlimited clients, automated email sequences, and advanced analytics. Offer expires in {expiresIn}.
              </Text>

              <Button
                className="bg-indigo-600 text-white rounded-lg px-6 py-3 font-semibold text-base w-full text-center"
                href={upgradeUrl}
              >
                Claim {discountPercent}% Off Now →
              </Button>

              <Hr className="my-8 border-gray-200" />
              <Text className="text-gray-400 text-xs">
                Discount applies to monthly Pro plan only. Cannot be combined with other offers.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default DiscountOfferEmail
