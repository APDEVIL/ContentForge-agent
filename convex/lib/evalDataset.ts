import type { Platform } from "./platforms";

export const EVAL_PLATFORMS: Platform[] = ["instagram", "linkedin", "x"];

export const EVAL_DATASET = [
  {
    name: "Threadly",
    industry: "Fashion & Apparel",
    description: "Sustainable streetwear brand for Gen Z in India.",
    pastPosts: [
      "New drop alert 🚨 The Monsoon Hoodie is here and yes, it's as cozy as it looks. Tag your rainy-day twin 🌧️",
      "Thrifting is cool. Wearing clothes made from recycled cotton? Cooler. 🌿 #WearTheChange",
      "Outfit of the day: oversized tee + cargo + zero regrets. Which one's your fit? 👇",
      "Your closet called. It wants fewer fast-fashion fits and more stories. Swipe to meet our makers ✨",
    ],
    topics: [
      "Launch of our new monsoon hoodie collection",
      "Festive season lookbook for Diwali",
      "Behind the scenes: how we recycle cotton",
      "Flash sale this weekend, 20% off on tees",
      "Styling tips for college fresher week",
      "Meet the artisan behind our embroidered jackets",
      "Why slow fashion matters",
      "Customer spotlight: fits from our community",
      "Free shipping and easy returns announcement",
      "Winter collection teaser",
    ],
  },
  {
    name: "FlowDesk",
    industry: "B2B SaaS",
    description: "Project management software for remote engineering teams.",
    pastPosts: [
      "Standups shouldn't take 30 minutes. FlowDesk's async updates give your team that time back.",
      "We shipped Sprint Insights today: velocity, blockers and burndown in one view. No spreadsheets required.",
      "Remote teams don't fail from distance. They fail from unclear ownership. Here's how to fix that.",
      "3 metrics every engineering manager should track weekly: cycle time, review lag, and WIP.",
    ],
    topics: [
      "Launch of our new Sprint Insights dashboard",
      "Why async standups beat daily meetings",
      "Case study: a 40-person team cut meetings by 30%",
      "Webinar invite on managing remote engineering teams",
      "New Slack and GitHub integration announcement",
      "Tips to reduce sprint spillover",
      "Hiring: we are looking for a senior backend engineer",
      "Security and SOC 2 compliance update",
      "Product update: custom workflows",
      "Customer story: scaling engineering from 10 to 50",
    ],
  },
  {
    name: "Brew & Co",
    industry: "Food & Beverage",
    description: "Neighbourhood specialty coffee roastery and cafe in Bengaluru.",
    pastPosts: [
      "Sunday mornings were made for slow pours and good company ☕ Come sit with us.",
      "Meet our new single-origin from Chikmagalur: notes of jaggery, orange peel and dark chocolate.",
      "Fun fact: the best cup is the one you drink while it's still warm. Don't let it go cold! 😄",
      "Our baristas trained for 6 weeks before pulling their first shot for you. That's the Brew & Co promise.",
    ],
    topics: [
      "Introducing our new cold brew range for summer",
      "Weekend brunch menu launch",
      "Latte art workshop this Saturday",
      "Buy one get one on filter coffee this Friday",
      "Meet the farmers behind our beans",
      "World Coffee Day celebration",
      "New oat milk options now available",
      "Coffee subscription box launch",
      "Cafe reopening after renovation",
      "Live music night announcement",
    ],
  },
];