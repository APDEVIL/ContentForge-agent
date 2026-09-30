import { CharacterCarousel } from "~/components/landing/character-carousel";
import { CtaCard } from "~/components/landing/cta-card";
import { Footer } from "~/components/landing/footer";
import { Hero } from "~/components/landing/hero";
import { Navbar } from "~/components/landing/navbar";
import { Steps } from "~/components/landing/steps";

export default function LandingPage() {
	return (
		<main className="overflow-x-clip">
			<Navbar />
			<Hero />
			<CharacterCarousel />
			<Steps />
			<CtaCard />
			<Footer />
		</main>
	);
}
