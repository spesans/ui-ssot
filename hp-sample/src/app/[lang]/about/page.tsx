"use client";

import { Container } from "@/components/ui/Container";
import { AboutSection } from "@/components/AboutSection";

export default function About() {
  return (
    <Container className="pt-16 pb-12 md:py-20">
      <AboutSection headingLevel="h1" />
    </Container>
  );
}
