import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

interface NewsItem {
    title: string;
    link: string;
    source: string;
    publishedAt: string;
    image: string;
}

const RSS_URL =
    "https://news.google.com/rss/search?q=(women+OR+female)+achievement+OR+success+OR+award+OR+leader&hl=en-US&gl=US&ceid=US:en";

const fallbackNews: NewsItem[] = [
    {
        title: "Women leaders continue to break records across business and science",
        link: "https://news.google.com",
        source: "Google News",
        publishedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "New initiatives highlight achievements by women in technology",
        link: "https://news.google.com",
        source: "Google News",
        publishedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "Global spotlight grows on women-founded startups and innovation",
        link: "https://news.google.com",
        source: "Google News",
        publishedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "Athletes and creators recognized for major women-led achievements",
        link: "https://news.google.com",
        source: "Google News",
        publishedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    },
];

const placeholderImages = [
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
];

function decodeHtml(value: string) {
    return value
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/<!\[CDATA\[|\]\]>/g, "")
        .trim();
}

function getImageFromItem(item: string) {
    const fromMedia = item.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/i)?.[1]
        || item.match(/<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*>/i)?.[1];
    if (fromMedia) return decodeHtml(fromMedia);

    const description = item.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || "";
    const fromDescription = description.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)?.[1];
    return fromDescription ? decodeHtml(fromDescription) : "";
}

function relevanceScore(title: string) {
    const t = title.toLowerCase();
    let score = 0;

    const mustTerms = ["women", "woman", "female", "girls"];
    const achievementTerms = ["achievement", "success", "award", "leader", "wins", "milestone", "breakthrough", "founded", "ceo", "scientist"];

    if (mustTerms.some((term) => t.includes(term))) score += 4;
    achievementTerms.forEach((term) => {
        if (t.includes(term)) score += 2;
    });
    if (t.includes("opinion") || t.includes("crime") || t.includes("gossip")) score -= 4;

    return score;
}

function parseRss(xml: string): NewsItem[] {
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    return items
        .map((item) => {
            const title = decodeHtml(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
            const link = decodeHtml(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "");
            const pubDate = decodeHtml(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || "");
            const source = decodeHtml(item.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] || "Google News");
            const image = getImageFromItem(item);

            return {
                title: title.replace(/\s-\s[^-]+$/, "").trim(),
                link,
                source,
                publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                image,
            };
        })
        .filter((item) => item.title && item.link.startsWith("http"))
        .sort((a, b) => {
            const scoreDiff = relevanceScore(b.title) - relevanceScore(a.title);
            if (scoreDiff !== 0) return scoreDiff;
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        })
        .filter((item, idx, arr) => arr.findIndex((x) => x.title.toLowerCase() === item.title.toLowerCase()) === idx)
        .map((item, idx) => ({
            ...item,
            image: item.image || placeholderImages[idx % placeholderImages.length],
        }));
}

export async function GET() {
    try {
        const response = await fetch(RSS_URL, {
            next: { revalidate: 600 },
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch RSS: ${response.status}`);
        }

        const xml = await response.text();
        const parsed = parseRss(xml);

        return NextResponse.json({
            success: true,
            fetchedAt: new Date().toISOString(),
            news: parsed.slice(0, 8),
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error?.message || "Failed to fetch live news",
            fetchedAt: new Date().toISOString(),
            news: fallbackNews,
        });
    }
}

