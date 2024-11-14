import { BenefitsSection } from "@/components/layout/sections/benefits";
import { CommunitySection } from "@/components/layout/sections/community";
import { FAQSection } from "@/components/layout/sections/faq";
import { FeaturesSection } from "@/components/layout/sections/features";
import { FooterSection } from "@/components/layout/sections/footer";
import { HeroSection } from "@/components/layout/sections/hero";
import { SponsorsSection } from "@/components/layout/sections/sponsors";
import { TeamSection } from "@/components/layout/sections/team";

export const metadata = {
  title: "Baskt",
  description: "",
  openGraph: {
    type: "website",
    url: "https://github.com/Not-Sarthak/baskt.git",
    title: "Baskt",
    description: "",
    images: [
      {
        url: "",
        width: 1200,
        height: 630,
        alt: "Baskt",
      },
    ],
  },
};

export default function Home() {
  return (
    <div className="">
      <HeroSection />
      <SponsorsSection />
      <BenefitsSection />
      <FeaturesSection />
      <TeamSection />
      <CommunitySection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
