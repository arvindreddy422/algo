import type { PatternSummary } from "./types";

export const PATTERN_SUMMARIES: PatternSummary[] = [
  { slug: "singleton", title: "Singleton", tagline: "One shared instance, reached from anywhere that needs it.", category: "creational" },
  { slug: "factory-method", title: "Factory Method", tagline: "Let subclasses decide which product to build.", category: "creational" },
  { slug: "abstract-factory", title: "Abstract Factory", tagline: "Create a family of related objects that must stay consistent.", category: "creational" },
  { slug: "builder", title: "Builder", tagline: "Assemble a complex object step by step, then build once.", category: "creational" },
  { slug: "prototype", title: "Prototype", tagline: "Create a new object by copying one you already have.", category: "creational" },
  { slug: "adapter", title: "Adapter", tagline: "Make a foreign API look like the one your code already uses.", category: "structural" },
  { slug: "decorator", title: "Decorator", tagline: "Wrap an object to add behavior without changing its class.", category: "structural" },
  { slug: "facade", title: "Facade", tagline: "One simple door in front of a messy subsystem.", category: "structural" },
  { slug: "proxy", title: "Proxy", tagline: "A stand-in that controls access to the real object.", category: "structural" },
  { slug: "composite", title: "Composite", tagline: "Treat a leaf and a tree the same way.", category: "structural" },
  { slug: "strategy", title: "Strategy", tagline: "Swap an algorithm without changing the code that uses it.", category: "behavioral" },
  { slug: "observer", title: "Observer", tagline: "When one object changes, dependents are told — they are not polled.", category: "behavioral" },
  { slug: "state", title: "State", tagline: "Behavior changes with an object's state, without a giant switch.", category: "behavioral" },
];
