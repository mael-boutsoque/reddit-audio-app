import type { RedditPost, Story, Category, TimeFilter } from '../types';
// import { translationService } from './translationService';

interface RedditComment {
  author: string;
  body: string;
  score: number;
  replies: RedditComment[];
}

const MOCK_STORIES: Story[] = [
  {
    title: "Je ne suis pas le trou du cul",
    body: "Ma femme veut que je conduise mes beaux-parents à l'aéroport tôt le matin, mais j'ai un rendez-vous médical important. Elle dit que je suis égoïste de ne pas les aider.",
    permalink: "/r/AmItheAsshole/comments/abc123/mock_story_1",
  },
  {
    title: "Refus d'inviter ma sœur à mon mariage",
    body: "Ma sœur a saboté ma relation passée et n'a jamais présenté d'excuses sincères. Ma famille pense que je devrais lui pardonner pour la paix familiale.",
    permalink: "/r/AmItheAsshole/comments/def456/mock_story_2",
  },
  {
    title: "J'ai pris le siège prioritaire dans le bus",
    body: "J'ai des problèmes de dos chroniques mais ils ne sont pas visibles. Une femme enceinte a demandé le siège et j'ai refusé car j'avais vraiment mal.",
    permalink: "/r/AmItheAsshole/comments/ghi789/mock_story_3",
  },
  {
    title: "Ne pas partager mon héritage avec ma demi-sœur",
    body: "Mon père m'a laissé toute sa maison dans son testament. Ma demi-sœur, qu'il n'a pas vu depuis 20 ans, dit qu'elle mérite une partie.",
    permalink: "/r/AmItheAsshole/comments/jkl012/mock_story_4",
  },
  {
    title: "J'ai appelé la police sur des voisins bruyants",
    body: "Les voisins font des fêtes jusqu'à 3h du matin en semaine. J'ai essayé de parler avec eux mais ils m'ont ignoré. Ma copropriété dit que je suis un délateur.",
    permalink: "/r/AmItheAsshole/comments/mno345/mock_story_5",
  },
];

const REDDIT_BASE_URL = 'https://corsproxy.io/?https://www.reddit.com';

const cleanText = (text: string): string => {
  return text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export class RedditService {
  private async fetchJson(url: string, retries: number = 3): Promise<unknown> {
    console.log('Fetching:', url);
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        
        if (response.status === 429) {
          console.warn(`Rate limited, retrying in ${(i + 1) * 2}s...`);
          await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('Max retries exceeded');
  }

  async fetchSubredditPosts(
    subreddit: string,
    limit: number = 10,
    category: Category = 'hot',
    timeFilter: TimeFilter = 'all'
  ): Promise<RedditPost[]> {
    const url = `${REDDIT_BASE_URL}/r/${subreddit}/${category}.json?limit=${limit}&t=${timeFilter}&raw_json=1`;
    
    const data = await this.fetchJson(url) as { data?: { children?: { data: RedditPost }[] } };
    const posts = data.data?.children || [];
    
    return posts.map((post: { data: RedditPost }) => ({
      title: post.data.title,
      author: post.data.author,
      permalink: post.data.permalink,
      score: post.data.score,
      num_comments: post.data.num_comments,
      created_utc: post.data.created_utc,
      selftext: post.data.selftext || '',
    }));
  }

  async fetchPostDetails(permalink: string): Promise<{ title: string; body: string; comments: RedditComment[] } | null> {
    const url = `${REDDIT_BASE_URL}${permalink}.json`;
    
    const data = await this.fetchJson(url);
    
    if (!Array.isArray(data) || data.length < 2) {
      console.error('Unexpected post data structure');
      return null;
    }
    
    const mainPost = data[0]?.data?.children?.[0]?.data;
    if (!mainPost) {
      return null;
    }
    
    const comments = this.extractComments(data[1]?.data?.children || []);
    
    return {
      title: mainPost.title || '',
      body: mainPost.selftext || '',
      comments,
    };
  }

  private extractComments(comments: unknown[]): RedditComment[] {
    const extracted: RedditComment[] = [];
    
    for (const comment of comments) {
      if (comment && typeof comment === 'object' && 'kind' in comment && comment.kind === 't1') {
        const commentData = (comment as { data?: { author?: string; body?: string; score?: number; replies?: { data?: { children?: unknown[] } } } }).data || {};
        const extractedComment: RedditComment = {
          author: commentData.author || '',
          body: commentData.body || '',
          score: commentData.score || 0,
          replies: [] as RedditComment[],
        };
        
        if (commentData.replies && typeof commentData.replies === 'object') {
          extractedComment.replies = this.extractComments(
            commentData.replies.data?.children || []
          );
        }
        
        extracted.push(extractedComment);
      }
    }
    
    return extracted;
  }

  async fetchStories(
    subreddit: string,
    limit: number = 5,
    category: Category = 'hot',
    timeFilter: TimeFilter = 'all'
  ): Promise<Story[]> {
    console.log('fetchStories called with:', subreddit, limit);
    
    try {
      const posts = await this.fetchSubredditPosts(subreddit, limit * 3, category, timeFilter);
      console.log('Got posts:', posts.length);
      const stories: Story[] = [];
      
      for (const post of posts) {
        if (stories.length >= limit) break;
        
        // Skip posts without content (link posts, etc.)
        if (!post.selftext || post.selftext.trim().length < 50) {
          continue;
        }
        
        const story: Story = {
          title: cleanText(post.title),
          body: cleanText(post.selftext),
          permalink: post.permalink,
        };

        stories.push(story);
      }
      
      console.log('Returning stories:', stories.length);
      
      // Return mock stories if no real stories found
      if (stories.length === 0) {
        console.log('No stories from Reddit, using mock data');
        return MOCK_STORIES.slice(0, limit);
      }
      
      return stories;
    } catch (error) {
      console.error('Error fetching from Reddit:', error);
      console.log('Using mock stories as fallback');
      return MOCK_STORIES.slice(0, limit);
    }
  }
}

export const redditService = new RedditService();
