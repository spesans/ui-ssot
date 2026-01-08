"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { HeroMatrixBackground } from "@/components/HeroMatrixBackground";
import { Zap, Music, Share2, Brain, Cloud, TrendingUp } from "lucide-react";

export function HomeContent() {
  const { t } = useLanguage();

  const icons = {
    sns: Share2,
    ai: Brain,
    saas: Cloud,
    marketing: Zap,
    music: Music,
    investment: TrendingUp,
  };

  return (
    <div className="flex flex-col">
      <section className="hero-section isolate min-h-[60vh] md:min-h-[80vh] flex items-center justify-center py-16 md:py-0">
        <HeroMatrixBackground />
        <Container className="relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-6 md:mb-8 whitespace-pre-wrap leading-[1.1]">
            {t.home.heroTitle}
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] mb-10 md:mb-12 max-w-2xl mx-auto whitespace-pre-wrap leading-relaxed">
            {t.home.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="primary">
              <a href="#company">{t.nav.about}</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#contact">{t.nav.contact}</a>
            </Button>
          </div>
        </Container>
      </section>

      <section id="business" className="py-16 md:py-24">
        <Container>
          <h2 className="text-xl md:text-2xl font-semibold mb-10 md:mb-14 text-center">
            {t.home.businessTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {Object.entries(t.business).map(([key, value]) => {
              const Icon = icons[key as keyof typeof icons];
              return (
                <Card key={key} title={value.title} className="h-full">
                  <div className="mb-4 flex justify-center">
                    <Icon size={24} strokeWidth={1.5} className="text-[var(--text-subtle)]" />
                  </div>
                  <p>{value.desc}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="company" className="py-16 md:py-24 border-t border-[var(--border-color)]">
        <Container>
          <AboutSection headingLevel="h2" />
        </Container>
      </section>

      <section id="contact" className="py-16 md:py-24 border-t border-[var(--border-color)]">
        <Container>
          <ContactSection headingLevel="h2" />
        </Container>
      </section>
    </div>
  );
}
