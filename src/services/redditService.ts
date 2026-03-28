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
    title: "Je ne suis pas le trou du cul pour ne pas conduire mes beaux-parents à l'aéroport",
    body: `Ma femme (32F) et moi (35M) sommes ensemble depuis 8 ans et mariés depuis 3. Nous avons toujours eu une relation équilibrée où nous respectons les engagements de chacun. Cependant, un conflit est apparu cette semaine qui a mis notre communication à l'épreuve.

Mes beaux-parents habitent à environ 2 heures de route et ont besoin d'être déposés à l'aéroport international pour un vol international important samedi prochain. Le problème est que leur vol est à 10h du matin, ce qui signifie que je devrais partir de chez nous à 5h du matin pour être sûr d'arriver à temps compte tenu du trafic.

Le même jour, j'ai un rendez-vous médical crucial que j'ai attendu depuis 6 mois. J'ai des problèmes de dos chroniques et ce rendez-vous avec un spécialiste renommé est enfin disponible. C'est à 9h du matin dans une clinique à 30 minutes de chez nous dans l'autre direction.

Quand j'ai expliqué à ma femme que je ne pouvais pas annuler ce rendez-vous médical pour des raisons évidentes, elle est devenue furieuse. Elle dit que je suis égoïste et que je choisis mon confort personnel sur les besoins de sa famille. Elle suggère que je reporte le rendez-vous, mais ce spécialiste est complet pour les 8 prochains mois.

J'ai proposé des alternatives : prendre un taxi pour ses parents (que je paierai), ou demander à son frère qui habite plus près de l'aéroport, mais elle refuse toutes ces options. Elle insiste que c'est mon "devoir" en tant que gendre.

Je suis réellement coincé entre ma santé et les attentes de ma femme. Je ne veux pas négliger ma santé, mais je ne veux pas non plus créer un conflit familial majeur. Ma femme ne parle plus à moi depuis 2 jours à cause de cela.`,
    permalink: "/r/AmItheAsshole/comments/abc123/mock_story_1",
  },
  {
    title: "Refus d'inviter ma sœur à mon mariage après ce qu'elle a fait",
    body: `Je (28F) vais me marier avec mon fiancé (30M) dans 6 mois. Nous planifions un mariage intime avec seulement 50 invités. Cependant, une situation familiale complexe menace de gâcher cette célébration.

Ma sœur aînée (34F) et moi avons eu une relation compliquée toute notre vie. Elle a toujours été compétitive et jalouse de mes réussites. Il y a 4 ans, alors que j'étais fiancée à mon ex, elle a saboté délibérément ma relation en flirtant avec lui, puis en lui révélant des secrets personnels que je lui avais confiés en confidence.

Cela a mené à la fin de ma relation précédente dans des circonstances très douloureuses. Ce n'est que 2 ans plus tard que j'ai découvert qu'elle avait fait tout ça exprès pour me "ramener à ma place" selon ses propres mots. Elle a admis avoir fait ça par jalousie car elle était en phase de divorce à ce moment-là.

Depuis cette révélation, je n'ai aucun contact avec elle. Elle a tenté de s'excuser une fois par message, mais ses excuses étaient superficielles et mettaient en partie la faute sur moi pour être "trop parfaite". Je n'ai jamais reçu d'excuses sincères ni d'acknowledgement réel du tort causé.

Maintenant que je me marie, ma mère et mon père insistent pour que j'invite ma sœur. Ils disent que c'est l'occasion de "réparer la famille" et que je devrais "passer l'éponge" pour la paix familiale. Ils menacent même de ne pas venir s'ils ne peuvent pas être "toute la famille ensemble".

Mon fiancé me soutient totalement dans ma décision de ne pas l'inviter, ayant vu les dommages causés par ses actions. Mais la pression familiale devient insupportable. Je reçois des messages quotidiens de ma mère me disant que je suis une mauvaise sœur et que je gâche l'harmonie familiale.

Je ne peux pas imaginer ma sœur à mon mariage, feignant la joie alors qu'elle a détruit délibérément mon bonheur passé. Mais je ne veux pas non plus que mes parents boycottent mon mariage. Je suis émotionnellement épuisée par cette situation.`,
    permalink: "/r/AmItheAsshole/comments/def456/mock_story_2",
  },
  {
    title: "J'ai pris le siège prioritaire dans le bus et on m'a traité d'égoïste",
    body: `J'ai (45M) des problèmes de dos chroniques depuis un accident de voiture il y a 5 ans. J'ai des hernies discales et une sciatique qui me causent des douleurs constantes. Mon médecin m'a conseillé d'éviter de rester debout de longues périodes et de toujours chercher un siège avec un bon soutien lombaire.

Hier, je prenais le bus pour aller à un rendez-vous médical. Le bus était presque plein mais j'ai trouvé un siège prioritaire vacant près de la sortie. Ces sièges ont un meilleur soutien et sont recommandés pour les personnes avec des problèmes de dos.

Deux arrêts plus tard, une femme visiblement enceinte (environ 7-8 mois) est montée. Elle a regardé autour d'elle et s'est dirigée vers moi, attendant que je lui cède mon siège. Les autres sièges prioritaires étaient occupés par des personnes âgées qui ne pouvaient pas se lever facilement.

J'ai poliment expliqué que j'avais des problèmes de dos médicalement documentés et que je ne pouvais pas rester debout longtemps. J'ai montré ma carte de priorité délivrée par le médecin. Elle a semblé comprendre mais une autre passagère s'est mise à me crier dessus, disant que j'étais un "homme sans cœur" et que la grossesse était plus importante que mon "petit mal de dos".

La situation est devenue très inconfortable. D'autres passagers ont commencé à me regarder avec jugement. Une personne a même filmé la scène avec son téléphone. J'ai tenté d'expliquer à nouveau ma condition médicale, mais on m'a accusé de mentir car je ne suis pas âgé et je ne porte pas de béquilles.

Finalement, j'ai cédé ma place car la pression sociale était trop intense, et j'ai passé les 25 minutes restantes du trajet debout, souffrant le martyre. J'ai dû prendre des antidouleurs supplémentaires hier soir pour gérer la douleur causée.

Ma femme pense que j'aurais dû rester ferme et ne pas céder à la pression. Je me demande si j'ai vraiment été égoïste de prioriser ma santé documentée par rapport à une grossesse visible, même si les deux sont des conditions médicales valides.`,
    permalink: "/r/AmItheAsshole/comments/ghi789/mock_story_3",
  },
  {
    title: "Ne pas partager l'héritage avec ma demi-sœur que mon père a abandonnée",
    body: `Mon père est décédé il y a 3 mois après une longue maladie. Dans son testament, il m'a (38M) légué sa maison principale, valeur estimée à environ 450 000€. Il a également laissé des économies importantes à ma mère, mais rien à ma demi-sœur (42F) de son premier mariage.

Le contexte est complexe. Mon père a divorcé de sa première femme quand ma demi-sœur avait 5 ans. Il a ensuite rencontré ma mère et m'a eu moi. Selon ce que j'ai toujours su, son ex-femme l'a empêché de voir sa fille et ils ont perdu contact progressivement.

Ce que je ne savais pas, c'est que ma demi-sœur a tenté de reprendre contact avec lui plusieurs fois pendant son adolescence et sa vingtaine, mais mon père a toujours refusé. Il disait qu'elle était "trop comme sa mère" et qu'il voulait tourner la page. Il n'a pas assisté à son mariage, ni à la naissance de ses enfants.

Depuis le décès de mon père, ma demi-sœur est apparue et réclame une part équitable de l'héritage. Elle dit qu'elle a été privée de père toute sa vie et que c'est injuste que je récolte tous les bénéfices de sa relation coupée. Elle mentionne qu'elle a grandi dans la pauvreté avec sa mère pendant que nous vivions confortablement.

J'ai découvert des lettres que mon père n'a jamais envoyées où elle implorait une relation, et des photos de ses enfants qu'il n'a jamais vus. Il semble qu'il ait sciemment ignoré sa fille pour construire une nouvelle famille "parfaite" avec nous.

Moralement, je comprends sa douleur. Elle a été effectivement abandonnée. Cependant, légalement, le testament est clair et elle n'y figure pas. Mon avocat dit que je n'ai aucune obligation légale de partager.

Ma mère insiste pour que je garde tout car "c'est ce que ton père voulait". Mais je ne peux pas m'empêcher de me sentir coupable de profiter d'un héritage construit sur l'abandon d'un enfant. D'un autre côté, cette maison représente mon enfance et mes souvenirs avec mon père, malgré ses défauts.

Ma demi-sœur me traite de parasite profitant de l'injustice de son père. Je ne sais plus quoi penser de cette situation morale complexe.`,
    permalink: "/r/AmItheAsshole/comments/jkl012/mock_story_4",
  },
  {
    title: "Appeler la police sur mes voisins bruyants et maintenant la copropriété me déteste",
    body: `Je (33F) vis dans un appartement en copropriété depuis 5 ans. L'endroit était toujours calme et respectueux jusqu'à ce que de nouveaux voisins emménagent au-dessus de chez moi il y a 8 mois. C'est un couple jeune (environ 25 ans) qui aime visiblement organiser des fêtes.

Au début, ce n'était qu'occasionnel - un week-end sur deux. Mais ces dernières 3 mois, c'est devenu presque quotidien. La musique forte, les cris, les allers-retours constants commencent vers 22h et continuent souvent jusqu'à 3h ou 4h du matin. Et ce, même en semaine quand je dois travailler le lendemain.

J'ai essayé l'approche amicale d'abord. Je suis montée 4 fois différentes pour demander poliment qu'ils baissent le volume après minuit. La première fois, ils ont été désagréables et m'ont dit de "me détendre". Les autres fois, ils ont promis de faire attention mais n'ont rien changé.

J'ai ensuite contacté le syndic de copropriété qui a envoyé un rappel à l'ordre officiel. Ils ont ignoré cela aussi. J'ai essayé de parler aux autres voisins pour créer une coalition, mais ils ont tous peur des conflits et préfèrent souffrir en silence.

La semaine dernière, après 3 nuits consécutives avec moins de 3 heures de sommeil, j'ai craqué. J'appelé la police à 2h du matin un mardi. Les forces de l'ordre sont arrivées, ont constaté le tapage nocturne et ont mis une amende de 450€ à mes voisins pour trouble à l'ordre public.

Depuis, les voisins me détestent ouvertement. Ils me croisent dans les parties communes en m'insultant, disant que je suis une "balance" et une "personne sans vie" qui gâche leur plaisir. Leur musique est encore plus forte maintenant, en guise de vengeance.

Le plus choquant est que plusieurs autres résidents de la copropriété ont pris leur parti! Ils disent que j'aurais dû "faire preuve de tolérance" et que appeler la police était "excessif pour du bruit". Le conseil syndical m'a envoyé un mail disant que je devrais chercher des solutions "consensuelles" plutôt que légales.

Je suis à bout. Je n'ai pas eu une nuit complète de sommeil depuis des mois. Mon travail en souffre, ma santé mentale aussi. J'ai consulté un médecin pour de l'anxiété et des problèmes de sommeil causés par cette situation.

Je commence à regretter d'avoir acheté cet appartement et envisage sérieusement de déménager, ce qui représenterait une perte financière importante. J'ai juste voulu protéger mon droit fondamental au repos, mais maintenant je suis traitée comme le problème de la copropriété.`,
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
