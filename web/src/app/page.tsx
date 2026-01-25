"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: "🔍",
      title: "Complete Observability",
      description:
        "Track and monitor your smart contracts throughout their entire lifecycle on the Casper Network with comprehensive visibility.",
    },
    {
      icon: "📋",
      title: "Changelog Management",
      description:
        "Maintain detailed changelogs for contract upgrades, ensuring transparency and preserving integrity across versions.",
    },
    {
      icon: "🔄",
      title: "Upgrade Tracking",
      description:
        "Leverage Casper's unique upgrade capabilities with robust tracking and versioning for evolved smart contracts.",
    },
    {
      icon: "🔐",
      title: "Security Auditing",
      description:
        "Audit contract changes and deployments with a complete history, ensuring security and compliance at every step.",
    },
    {
      icon: "🚀",
      title: "Seamless Integration",
      description:
        "Integrate effortlessly with your development workflow for smooth application development and deployment.",
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description:
        "Gain insights into contract usage, performance metrics, and deployment patterns with intuitive visualizations.",
    },
  ];

  const useCases = [
    {
      title: "Application Developers",
      description:
        "Streamline smart contract integration with clear lifecycle tracking and version management.",
      gradient: "from-primary-dark to-primary-darker",
    },
    {
      title: "Security Auditors",
      description:
        "Conduct thorough audits with complete contract history and transparent changelog documentation.",
      gradient: "from-success-dark to-success",
    },
    {
      title: "Project Teams",
      description:
        "Collaborate effectively with shared visibility into contract deployments and upgrades.",
      gradient: "from-warning-dark to-warning",
    },
  ];

  return (
    <div className="min-h-screen bg-app">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 border-x border-gray-800">
        <div
          className={`text-center transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary-dark border border-primary-darker">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-primary text-sm font-medium">
              Observability for Casper Network
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-linear-to-r from-text-primary via-primary-light to-text-primary bg-clip-text text-transparent">
            CasperLens
          </h1>

          <p className="text-xl md:text-2xl text-secondary mb-4 max-w-3xl mx-auto">
            Smart Contract Lifecycle Management & Observability Platform
          </p>

          <p className="text-lg text-muted mb-12 max-w-2xl mx-auto">
            Track, monitor, and manage your smart contracts on Casper Network
            with comprehensive observability and changelog management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/contracts"
              className="px-8 py-4 bg-primary-lighter hover:bg-primary-light text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
            >
              Launch Dashboard
            </a>
            <a
              href="https://github.com/casperlens/casperlens"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-card border border-primary hover:border-primary-light text-primary hover:text-primary-light font-semibold rounded-lg transition-all duration-300"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="max-w-7xl mx-auto px-6 py-16 border-x border-gray-800 flex flex-col gap-3">
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-center">
          Why CasperLens?
        </h2>
        <div className="bg-card border border-primary rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 text-secondary">
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                The Challenge
              </h3>
              <p className="leading-relaxed mb-4">
                Smart contract lifecycle monitoring and management is essential
                for ensuring smooth integration, security auditing, and
                continuous evolution with collective knowledge.
              </p>
              <p className="leading-relaxed">
                While Casper Network allows upgrading smart contracts after
                deployment, unlike Ethereum the lack of robust lifecycle
                tracking creates integration challenges for development teams.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                The Solution
              </h3>
              <p className="leading-relaxed mb-4">
                CasperLens provides transparent observability that preserves
                integrity throughout the contract lifecycle, making it easier to
                integrate, audit, and analyze smart contract usage.
              </p>
              <p className="leading-relaxed">
                Our platform simplifies smart contract lifecycle and changelog
                management, enabling teams to work more efficiently and
                securely.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 border-x border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Everything you need to manage and monitor your smart contracts
            effectively
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-primary rounded-xl p-6 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-7xl mx-auto px-6 py-16 border-x border-gray-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Built For Everyone
          </h2>

          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Whether you're a developer, auditor, or project team, CasperLens has
            you covered
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className={`bg-linear-to-br ${useCase.gradient} rounded-xl p-6 border border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105`}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {useCase.title}
              </h3>
              <p className="text-gray-200 leading-relaxed">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-7xl mx-auto px-6 py-16 border-x border-gray-800">
        <div className="bg-card border border-primary rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
            Built with Modern Technology
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Next.js Frontend
              </h3>
              <p className="text-secondary">
                Fast, responsive web application built with Next.js and React
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🦀</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Rust Backend
              </h3>
              <p className="text-secondary">
                High-performance server powered by Rust for reliability and
                speed
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Casper Network
              </h3>
              <p className="text-secondary">
                Native integration with Casper blockchain using Odra framework
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-6 py-8 border-x border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center text-muted">
          <a
            href="https://github.com/casperlens/casperlens/tree/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 md:mb-0 underline underline-offset-4"
          >
            © 2026 CasperLens. Licensed under Apache-2.0.
          </a>
          <div className="flex gap-6">
            <a
              href="https://github.com/casperlens/casperlens"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              GitHub
            </a>
            <a
              href="https://github.com/casperlens/casperlens/tree/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              Documentation
            </a>
            <a
              href="/contracts"
              className="hover:text-primary transition-colors underline underline-offset-4"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
