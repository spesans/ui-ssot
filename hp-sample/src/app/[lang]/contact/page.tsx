"use client";

import { Container } from "@/components/ui/Container";
import { ContactSection } from "@/components/ContactSection";

export default function Contact() {
  return (
    <Container className="pt-20 pb-12 md:pt-24 md:pb-20">
      <ContactSection headingLevel="h1" />
    </Container>
  );
}
