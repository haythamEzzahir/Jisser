"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, X, Check } from "lucide-react";

interface CarouselStep {
  icon: React.ElementType;
  title: string;
  description: string;
  details: string[];
  action: { label: string; href: string } | null;
}

export function OnboardingCarousel({
  steps,
  onDismiss,
}: {
  steps: CarouselStep[];
  onDismiss: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const isLast = current === steps.length - 1;
  const isFirst = current === 0;

  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="relative w-full max-w-xl overflow-hidden border-none shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-primary to-secondary" />

        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8">
          <div className="mb-6 flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i <= current ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
              <Icon className="h-10 w-10 text-primary" />
            </div>

            <h2 className="font-heading text-2xl font-bold">{step.title}</h2>
            <p className="mt-2 text-muted-foreground max-w-sm">{step.description}</p>

            <ul className="mt-6 space-y-2 text-left">
              {step.details.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setCurrent((c) => c - 1)}
              disabled={isFirst}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Précédent
            </Button>

            <span className="text-sm text-muted-foreground">
              {current + 1} / {steps.length}
            </span>

            {isLast ? (
              <Button onClick={onDismiss} className="gap-1">
                Commencer <ArrowRight className="h-4 w-4" />
              </Button>
            ) : step.action ? (
              <Link href={step.action.href}>
                <Button onClick={onDismiss} className="gap-1">
                  {step.action.label} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button onClick={() => setCurrent((c) => c + 1)} className="gap-1">
                Suivant <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
