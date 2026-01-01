"use client";

import { Container } from "@/components/ui/Container";
import { ContactSection } from "@/components/ContactSection";

export default function Contact() {
  return (
    <Container className="pt-16 pb-12 md:py-20">
      <ContactSection headingLevel="h1" />
    </Container>
  );
}
