"use client";

import { Container } from "@/components/ui/Container";
import { AboutSection } from "@/components/AboutSection";

export default function About() {
  return (
    <Container className="pt-20 pb-12 md:pt-24 md:pb-20">
      <AboutSection headingLevel="h1" />
    </Container>
  );
}
