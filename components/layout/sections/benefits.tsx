import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface BenefitsProps {
  icon: string;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: "Blocks",
    title: "One-Click Diversification",
    description:
      "Build and execute multi-token portfolios across various sectors of Solana such as DePIN, RWA and DeFi in a single transaction.",
  },
  {
    icon: "LineChart",
    title: "Monetize Your Strategies",
    description:
      "Create, share, and earn from your winning portfolio strategies with royalties or paywalls.",
  },
  {
    icon: "Wallet",
    title: "Set-and-Forget Investing",
    description:
      "Set up dollar-cost averaging (DCA) for your chosen portfolios, powered by Sui's speed.",
  },
  {
    icon: "Sparkle",
    title: "Real-Time Insights",
    description:
      "Track performance and discover top-performing strategies with our intuitive dashboard.",
  },
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div>
          <h2 className="text-lg text-primary mb-2 tracking-wider">Benefits</h2>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Diversify your portfolio
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Diversify Your Portfolio Effortlessly and Make Strategic Investments
            Turn Every Trade into Financial Growth
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 w-full">
          {benefitList.map(({ icon, title, description }, index) => (
            <Card
              key={title}
              className="bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number"
            >
              <CardHeader>
                <div className="flex justify-between">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={32}
                    color="hsl(var(--primary))"
                    className="mb-6 text-primary"
                  />
                  <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
