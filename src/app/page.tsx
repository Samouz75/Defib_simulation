"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Particles from "./components/Particles";
import ChromaGrid from "./components/ChromaGrid";
import SpotlightCard from "./components/SpotlightCard";
import BlurText from "./components/BlurText";
import Timeline from "./components/Timeline";
import CardSwap, { Card } from "./components/CardSwap";
import ScrollProgress from "./components/ScrollProgress";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

export default function LandingPage() {
  const [showMore, setShowMore] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 relative pb-40">
      <ScrollProgress />

      {/* Background Particles */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={["#3b82f6", "#1d4ed8", "#ffffff"]}
          particleCount={170}
          particleSpread={15}
          speed={0.05}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          particleHoverFactor={0.5}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 backdrop-blur-sm">
        <div className="flex items-center">
          <Image
            src="/images/badge.png"
            alt="Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
        <div className="hidden md:flex space-x-8 text-sm items-center">
          <a
            href="#features"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Fonctionnalités
          </a>
          <a
            href="#scenarios"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Scénarios
          </a>
        </div>

        {/* Bouton menu burger - visible seulement sur mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors p-2"
          aria-label="Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-md transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <span className="text-white font-semibold">Menu</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Fermer le menu"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col p-6 space-y-6">
          <a
            href="#features"
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-400 hover:text-white transition-colors text-lg border-b border-gray-700 pb-3"
          >
            Fonctionnalités
          </a>
          <a
            href="#scenarios"
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-400 hover:text-white transition-colors text-lg border-b border-gray-700 pb-3"
          >
            Scénarios
          </a>

          <div className="pt-6">
            <Link href="/simulator">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
              >
                Commencer la Formation
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu en cliquant à côté */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-6">
        <div className="max-w-4xl mx-auto">
          <BlurText
            text="Plateforme de Formation aux techniques de défibrillation"
            className="mb-8 block text-white text-center text-5xl md:text-7xl mt-2 leading-tight mb-10"
            animateBy="words"
            direction="top"
            style={{
              fontFamily: "Amidone Grotesk, sans-serif",
              fontWeight: 400,
            }}
          />

          {/* Tagline toujours visible */}
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Formez-vous en sécurité, répondez avec confiance.
          </p>

          {/* Bouton En savoir plus - visible seulement sur mobile */}
          <button
            onClick={() => setShowMore(!showMore)}
            className=" mb-8 text-gray-400 hover:text-white transition-all duration-300 flex items-center justify-center mx-auto gap-2"
          >
            <span className="text-sm">En savoir plus</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                showMore ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Paragraphe explicatif - toujours visible sur desktop, toggle sur mobile */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showMore ? "max-h-96 opacity-100 mb-12" : "max-h-0  opacity-0"
            }`}
          >
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              Ce simulateur a été créé lors d'un stage de développement web de 2
              mois à
              <span className="text-white font-semibold">
                {" "}
                l'Hôpital Saint-Louis
              </span>
              . Notre mission est de fournir un outil de formation médicale
              accessible et de haute qualité pour préparer les professionnels de
              santé aux situations d'urgence réelles.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">4+</div>
              <div className="text-gray-500 text-sm">
                Scénarios de Formation
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-gray-500 text-sm">
                Apprentissage Sécurisé
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-500 text-sm">Accès</div>
            </div>

            <div>
              <div className="text-3xl font-bold text-white mb-2">Gratuit</div>
              <div className="text-gray-500 text-sm">Sans Limitation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-25">
            <h2 className="text-4xl font-bold text-white mb-4">
              Fonctionnalités
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <h3 className="text-xl font-semibold text-white mb-3 text-center">
                Tracé ECG Authentique
              </h3>
              <p className="text-gray-400 text-sm text-center">
                Rythmes cardiaques authentiques incluant rythme sinusal, FV, TV,
                asystolie avec modification en temps réel.
              </p>
            </SpotlightCard>

            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <h3 className="text-xl font-semibold text-white mb-3 text-center">
                Modes Multiples
              </h3>
              <p className="text-gray-400 text-sm text-center">
                Modes DAE, Manuel, Moniteur et Stimulateur.
              </p>
            </SpotlightCard>

            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <h3 className="text-xl font-semibold text-white mb-3 text-center">
                Qualité Hospitalière
              </h3>
              <p className="text-gray-400 text-sm text-center">
                Scénarios développés avec l'Hôpital Saint-Louis pour une
                formation authentique.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      <div
        style={{ height: "600px", position: "relative", marginBottom: "60px" }}
      >
        <CardSwap
          cardDistance={60}
          verticalDistance={70}
          delay={3500}
          pauseOnHover={false}
        >
          <Card className="flex flex-col">
            <h3 className="ml-4 py-2 text-white text-sm font-semibold">
              Moniteur
            </h3>
            <div className="w-full h-0.5 bg-black" />
            <div className="flex-1 relative">
              <Image
                src="/images/CardSwap1.png"
                alt="Card 1"
                fill
                className="object-cover rounded-lg [image-rendering:auto] [image-rendering:high-quality] [image-rendering:-webkit-optimize-contrast]"
                quality={95}
                priority
              />
            </div>
          </Card>
          <Card className="flex flex-col">
            <h3 className="ml-4 py-2 text-white text-sm font-semibold">
              Manuel
            </h3>
            <div className="w-full h-0.5 bg-black" />
            <div className="flex-1 relative">
              <Image
                src="/images/CardSwap2.png"
                alt="Card 2"
                fill
                className="object-cover rounded-lg [image-rendering:auto] [image-rendering:high-quality] [image-rendering:-webkit-optimize-contrast]"
                quality={95}
              />
            </div>
          </Card>
          <Card className="flex flex-col">
            <h3 className="ml-4 py-2 text-white text-sm font-semibold">
              Stimulateur
            </h3>
            <div className="w-full h-0.5 bg-black" />
            <div className="flex-1 relative">
              <Image
                src="/images/CardSwap3.png"
                alt="Card 3"
                fill
                className="object-cover rounded-lg [image-rendering:auto] [image-rendering:high-quality] [image-rendering:-webkit-optimize-contrast]"
                quality={95}
              />
            </div>
          </Card>
          <Card className="flex flex-col">
            <h3 className="ml-4 py-2 text-white text-sm font-semibold">DAE</h3>
            <div className="w-full h-0.5 bg-black" />
            <div className="flex-1 relative">
              <Image
                src="/images/CardSwap4.png"
                alt="Card 3"
                fill
                className="object-cover rounded-lg [image-rendering:auto] [image-rendering:high-quality] [image-rendering:-webkit-optimize-contrast]"
                quality={95}
              />
            </div>
          </Card>
        </CardSwap>
      </div>

      {/* Scenarios Section */}
      <section
        id="scenarios"
        className="relative z-10 py-20 px-6 bg-gray-900/30"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Scénarios de Formation
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Situations d'urgence réelles pour une formation médicale complète
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Fibrillation Ventriculaire
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                Défibrillation d'urgence avec défibrillateur manuel. Maîtrisez
                la reconnaissance ECG et la délivrance de choc.
              </p>
            </SpotlightCard>

            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Utilisation DAE
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                Formation à l'utilisation du DAE pour intervenir en cas d'arrêt
                cardiaque.
              </p>
            </SpotlightCard>

            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Stimulation Cardiaque
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                Stimulation cardiaque d'urgence pour bradycardie avec ajustement
                des paramètres.
              </p>
            </SpotlightCard>

            <SpotlightCard
              className="custom-spotlight-card"
              spotlightColor="rgba(0, 229, 255, 0.2)"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Cardioversion
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                Cardioversion synchronisée pour traitement de la fibrillation
                atriale.
              </p>
            </SpotlightCard>
          </div>
        </div>
        {/* CTA Button */}

        <h3 className="text-2xl md:text-3xl font-semibold text-white mb-5 animate-fade-in-delay text-center mt-30">
          Prêt à sauver des vies ?
        </h3>
        <p className="text-gray-500 max-w-2xl mx-auto text-center mb-10">
          Rejoignez la formation utilisée par les professionnels de santé de
          l'Hôpital Saint-Louis.
        </p>
        <div className="flex justify-center items-center mt-12 mb-10">
          <Link href="/simulator">
            <button className="group relative inline-flex items-center justify-center px-12 py-5 font-bold text-lg overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <span className="relative text-white mr-3">
                Commencer la Formation
              </span>
            </button>
          </Link>
        </div>
      </section>

      {/* Timeline Section */}
      <Timeline />

      {/* Contributors Section */}
      <section
        id="contributors"
        className="relative z-10 py-20 px-6 bg-gray-900/20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Contributeurs
            </h2>
          </div>

          <div style={{ position: "relative", marginTop: "100px" }}>
            <ChromaGrid
              items={[
                {
                  image: "/images/marcdinh.jpg",
                  title: "Marc Dinh",
                  subtitle: "ML/Deep Learning Engineer",
                  borderColor: "#3B82F6",
                  gradient: "linear-gradient(145deg, #3B82F6, #000)",
                  url: "https://www.linkedin.com/in/marc-dinh/",
                },
                {
                  image: "/images/mariusgal.jpg",
                  title: "Marius GAL",
                  subtitle: "Engineering student",
                  borderColor: "#10B981",
                  gradient: "linear-gradient(145deg, #3B82F6, #000)",
                  url: "https://www.linkedin.com/in/marius-gal/",
                },
                {
                  image: "/images/samiellouze.jpg",
                  title: "Dr. Sami Ellouze",
                  subtitle: "Médecin Urgentiste",
                  borderColor: "#EF4444",
                  gradient: "linear-gradient(145deg, #3B82F6, #000)",
                  url: "https://www.linkedin.com/in/sami-ellouze-23791330/",
                },
                {
                  image: "/images/papasami.jpg",
                  title: "Ellouze",
                  subtitle:
                    "Professeur émérite, ENITunis / Centrale Lille – Traitement du signal",
                  borderColor: "#EF4444",
                  gradient: "linear-gradient(145deg, #3B82F6, #000)",
                },
                {
                  image: "/images/benedict.jpg",
                  title: "Benedict O'donnell",
                  subtitle: "Advisor",
                  borderColor: "#EF4444",
                  gradient: "linear-gradient(145deg, #3B82F6, #000)",
                  url: "https://www.linkedin.com/in/benedict-odonnell/",
                },
              ]}
              radius={300}
              imageSize="w-full h-full md:w-80 md:h-90"
              damping={0.45}
              ease="power3.out"
              imageClassName="p-4"
              imageBorderRadius="rounded-3xl"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 border-t border-gray-800 -mb-35">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center">
          <div className="text-gray-500 text-sm text-center md:text-right">
            © 2025 Plateforme de Formation d'Urgence Médicale
            <br className="md:hidden" />
            <span className="hidden md:inline"> • </span>
            Développée pour l'Hôpital Saint-Louis
          </div>
        </div>
      </footer>
    </div>
  );
}
