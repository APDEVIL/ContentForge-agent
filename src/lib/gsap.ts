"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once, on the client only.
if (typeof window !== "undefined") {
	gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export { gsap, ScrollTrigger, useGSAP };
