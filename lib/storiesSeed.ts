import StoryContent from "@/models/StoryContent";

const quoteAuthors = [
    "Maya Angelou",
    "Ruth Bader Ginsburg",
    "Malala Yousafzai",
    "Michelle Obama",
    "Oprah Winfrey",
    "Serena Williams",
    "Indra Nooyi",
    "Angela Merkel",
    "Jacinda Ardern",
    "Kamala Harris",
    "Brene Brown",
    "Gloria Steinem",
    "Marie Curie",
    "Ada Lovelace",
    "Frida Kahlo",
    "Eleanor Roosevelt",
    "Sheryl Sandberg",
    "Kiran Mazumdar-Shaw",
    "Kalpana Chawla",
    "Sudha Murty",
    "Mary Kom",
    "Savitribai Phule",
    "Chimamanda Ngozi Adichie",
    "Arianna Huffington",
    "Amal Clooney",
];

const quoteStarters = [
    "Your courage today is",
    "Every setback can become",
    "The discipline you build now is",
    "Your voice carries",
    "Small consistent steps create",
    "Even on hard days, your effort is",
    "The dream you protect is",
    "Confidence grows when you",
    "Your resilience is",
    "The work you do quietly becomes",
];

const quoteEndings = [
    "the foundation of tomorrow's breakthrough.",
    "a turning point with enough persistence.",
    "a gift your future self will thank you for.",
    "power that can move communities.",
    "results that look impossible to others.",
    "proof that growth is happening.",
    "worthy of your full commitment.",
    "stronger each time you act with intention.",
    "more visible than your doubts suggest.",
    "the story others will one day learn from.",
    "wisdom you can carry into leadership.",
    "valid, even before anyone applauds.",
    "an act of self-respect and strength.",
    "space for bigger opportunities.",
    "the quiet engine of real success.",
];

const successAuthors = [
    "Anonymous",
    "Community Member",
    "Founder Story",
    "Reader Submission",
    "Volunteer Lead",
    "Career Journal",
    "Student Voice",
    "Women in Tech Circle",
];

const successCategories = ["Recovery", "Education", "Business", "Career", "Growth", "Wellness", "Leadership"];
const successEmojis = ["✨", "🚀", "💼", "💪", "🎓", "🧠", "🌱", "🏆"];

const successTitleStarts = [
    "From Self-Doubt to",
    "How She Built",
    "Turning Rejection Into",
    "The Journey From Burnout To",
    "Building Confidence Through",
    "Finding Her Voice In",
    "A New Chapter In",
    "Leading With Courage In",
    "Breaking Through In",
    "Starting Over With",
];

const successTitleEnds = [
    "Leadership",
    "Growth",
    "Balance",
    "Purpose",
    "Impact",
    "Innovation",
    "Momentum",
    "Stability",
    "Opportunity",
    "Confidence",
];

const successExcerptTemplates = [
    "She rebuilt her routine, set boundaries, and found a healthier way to grow while staying consistent.",
    "After several setbacks, she kept improving her process and turned a difficult season into meaningful progress.",
    "She combined discipline and community support to reach goals she once thought were out of reach.",
    "By learning in public and asking for help, she transformed uncertainty into real momentum.",
    "Her story shows that small daily actions can create long-term change in career and well-being.",
];

function buildSeedQuotes(total = 150) {
    return Array.from({ length: total }, (_, i) => ({
        kind: "quote",
        sortOrder: i + 1,
        quote: `${quoteStarters[i % quoteStarters.length]} ${quoteEndings[Math.floor(i / quoteStarters.length) % quoteEndings.length]}`,
        author: quoteAuthors[i % quoteAuthors.length],
    }));
}

function buildSeedSuccessStories(total = 100) {
    return Array.from({ length: total }, (_, i) => ({
        kind: "success",
        sortOrder: i + 1,
        title: `${successTitleStarts[i % successTitleStarts.length]} ${successTitleEnds[Math.floor(i / successTitleStarts.length) % successTitleEnds.length]}`,
        excerpt: successExcerptTemplates[i % successExcerptTemplates.length],
        author: successAuthors[i % successAuthors.length],
        emoji: successEmojis[i % successEmojis.length],
        category: successCategories[i % successCategories.length],
        publishedLabel: `${(i % 14) + 1} days ago`,
    }));
}

export async function ensureStoriesSeeded() {
    const quoteCount = await StoryContent.countDocuments({ kind: "quote" });
    const successCount = await StoryContent.countDocuments({ kind: "success" });

    if (quoteCount < 150) {
        await StoryContent.deleteMany({ kind: "quote" });
        await StoryContent.insertMany(buildSeedQuotes(150));
    }

    if (successCount < 100) {
        await StoryContent.deleteMany({ kind: "success" });
        await StoryContent.insertMany(buildSeedSuccessStories(100));
    }
}
