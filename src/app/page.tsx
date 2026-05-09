'use client';

import { useRef } from 'react';
import { MultiStepForm } from '../components/forms/MultiStepForm';
import { Button } from '../components/ui/button';

export default function Home() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find Hidden Savings in Your AI Stack
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Most startups overpay by 30%+ on AI tools. We'll show you exactly where.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={scrollToForm}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Start Free Audit →
              </Button>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              No credit card required • 2 minutes • Instant results
            </p>
          </div>
        </div>
      </section>
      
      {/* Trust bar */}
      <section className="border-b bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-600">
            Trusted by founders from YC, Techstars, and leading startups
          </p>
        </div>
      </section>
      
      {/* Form Section - Add ref here */}
      <section ref={formRef} className="py-16">
        <div className="container mx-auto px-4">
          <MultiStepForm />
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is this really free?", a: "Yes. We help startups optimize AI spend. If we find major savings, we'll introduce you to Credex's discounted credits." },
              { q: "How accurate is the audit?", a: "We use real-time pricing data from official vendor pages. All recommendations are backed by current pricing." },
              { q: "Do I need to share my email?", a: "No! See results instantly. Email only if you want to save or share the report." },
              { q: "What tools do you support?", a: "ChatGPT, Cursor, Claude, GitHub Copilot, Gemini, Anthropic API, OpenAI API, and Windsurf." },
              { q: "How does Credex save me money?", a: "We buy unused AI credits from companies and pass the savings to you - typically 20-40% off retail." },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}