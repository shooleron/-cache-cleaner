import { Trend } from '../types';

interface PHPost {
  id: string;
  name: string;
  tagline: string;
  url: string;
  votesCount: number;
  commentsCount: number;
  createdAt: string;
  thumbnail?: { url: string };
  topics?: { edges: { node: { name: string } }[] };
}

const PH_QUERY = `
  query {
    posts(first: 15, order: VOTES) {
      edges {
        node {
          id
          name
          tagline
          url
          votesCount
          commentsCount
          createdAt
          thumbnail { url }
          topics(first: 3) { edges { node { name } } }
        }
      }
    }
  }
`;

export async function fetchProductHunt(): Promise<Trend[]> {
  const apiKey = process.env.PRODUCTHUNT_API_KEY;
  if (!apiKey) return [];

  const res = await fetch('https://api.producthunt.com/v2/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query: PH_QUERY }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.warn('ProductHunt fetch failed:', res.status);
    return [];
  }

  const { data } = await res.json();
  const posts: PHPost[] = data?.posts?.edges?.map((e: { node: PHPost }) => e.node) ?? [];
  const maxVotes = Math.max(...posts.map((p) => p.votesCount));

  return posts.map((p): Trend => ({
    id: `ph-${p.id}`,
    title: `${p.name} — ${p.tagline}`,
    url: p.url,
    source: 'producthunt',
    category: 'business',
    score: maxVotes > 0 ? Math.round((p.votesCount / maxVotes) * 100) : 50,
    rawScore: p.votesCount,
    commentCount: p.commentsCount,
    publishedAt: p.createdAt,
    thumbnail: p.thumbnail?.url,
    tags: p.topics?.edges?.map((e) => e.node.name) ?? [],
    description: p.tagline,
  }));
}
