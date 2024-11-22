import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";

interface FeaturesProps {
  icon: string;
  title: string;
  description: string;
}

const featureList: FeaturesProps[] = [
  {
    icon: "TabletSmartphone",
    title: "One-Click Bundles",
    description:
      "Create and execute diversified portfolios across multiple Sui tokens with instant swap and bundling - all in a single transaction.",
  },
  {
    icon: "BadgeCheck",
    title: "Smart Investment Strategies",
    description:
      "Build customized investment bundles based on market trends, sectors, or risk tolerance. Share your winning strategies and earn from them.",
  },
  {
    icon: "Goal",
    title: "Automated Portfolio Rebalancing",
    description:
      "Set up automated portfolio rebalancing to maintain your desired allocation ratios. Stay optimized without constant monitoring.",
  },
  {
    icon: "PictureInPicture",
    title: "Real-Time Analytics",
    description:
      "Track bundle performance, market trends, and portfolio metrics through an intuitive dashboard with comprehensive insights.",
  },
  {
    icon: "MousePointerClick",
    title: "Index-Based Investing",
    description:
      "Invest in curated thematic bundles like DeFi, GameFi, or Infrastructure with pre-built portfolios managed by experts.",
  },
  {
    icon: "Newspaper",
    title: "Earn While You Share",
    description:
      "Track referral earnings in real-time dashboard",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        Features
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        What Makes Us Different
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptatem
        fugiat, odit similique quasi sint reiciendis quidem iure veritatis optio
        facere tenetur.
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ icon, title, description }) => (
          <div key={title}>
            <Card className="h-full bg-background border-0 shadow-none">
              <CardHeader className="flex justify-center items-center">
                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10 mb-4">
                  <Icon
                    name={icon as keyof typeof icons}
                    size={24}
                    color="hsl(var(--primary))"
                    className="text-primary"
                  />
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground text-center">
                {description}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
