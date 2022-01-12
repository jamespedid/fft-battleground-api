import axios, { AxiosInstance } from 'axios';

export interface TournamentsLatestParams {
    totalPages?: number
    limit?: number
    before?: number
    filter?: 'complete'
}

export interface ChampionQueryParams {
    totalPages?: number
    season?: number
    limit?: number
    after?: number
    sort?: 'latest' | 'rank'
}

export interface TournamentSummaryData {
    ID: number
    LastMod: string
    Maps: string[]
    Winners: string[]
    SkillDrop: string
    Complete: boolean
}

export interface TournamentData {
    Type: string
    ID: number
    LastMod: string
    Teams: Record<string, TeamData>
    Maps: string[]
    Winners: string[]
    Pots: unknown
    SkillDrop: string
    Entrants: string[]
    Snubs: string[]
}

export interface TeamData {
    Player: string
    Name: string
    Palettes: string
    Units: UnitData[]
}

export interface UnitData {
    Name: string
    Gender: string
    Sign: string
    Brave: number
    Faith: number
    Class: string
    ActionSkill: string
    SupportSkill: string
    MoveSkill: string
    Mainhand: string
    Offhand: string
    Head: string
    Armor: string
    Accessory: string
    ClassSkills: string[]
    ExtraSkills: string[]
    RaidBoss: boolean
}

export interface ChampionData {
    ID: number
    Rank: number
    Team: TeamData
    Streak: number
    Defeat: number
    DefeatTime: string
    LastUpdated: string
    Season: number
    Color: string
}

export interface TipData {
    Items: Record<string, string>
    ItemLastMod: string
    Ability: Record<string, string>
    AbilityLastMod: string
    UserSkill: Record<string, string>
    UserSkillLastMod: string
    Zodiac: Record<string, string>
    ZodiacLastMod: string
    Class: Record<string, string>
    ClassLastMod: string
    MonsterSkills: Record<string, string[]>
    MonsterLastMod: string
}

export class Client {
    constructor() {
        this.axios = axios.create({
            baseURL: 'https://fftbg.com',
            validateStatus: status => status >= 200 && status < 300 || status === 404,
        });
        this.tournaments = new Tournaments(this);
        this.champions = new Champions(this);
        this.tips = new Tips(this);
    }

    public axios: AxiosInstance;
    public tournaments: Tournaments;
    public champions: Champions;
    public tips: Tips;
}

const nextLinkRegexp = /^<(.+)>; rel="next"$/;

class Tournaments {
    constructor(private apiClient: Client) {
    }

    async* latest({
        totalPages = 1,
        limit = 50,
        before = undefined,
        filter = undefined,
    }: TournamentsLatestParams): AsyncIterable<TournamentSummaryData> {
        totalPages = totalPages ?? Infinity;
        let pageCount = 0;

        let more: boolean = false;
        let params: TournamentsLatestParams = {
            limit,
            before,
            filter,
        };
        do {
            const response = await this.apiClient.axios.get('/api/tournaments', {
                params,
            });
            for (const record of response.data as TournamentSummaryData[]) {
                yield record;
            }
            pageCount += 1;
            if (pageCount >= totalPages) {
                more = false;
                break;
            }
            const {link} = response.headers;
            if (link) {
                let match = link.match(nextLinkRegexp);
                if (!match) {
                    more = false;
                    break;
                }
                const url = new URL(match[1]);
                if (url.searchParams.has('limit')) {
                    params.limit = Number(url.searchParams.get('limit') as string);
                }
                if (url.searchParams.has('before')) {
                    params.before = Number(url.searchParams.get('before') as string);
                }
                if (url.searchParams.has('filter')) {
                    params.filter = url.searchParams.get('filter') as 'complete' | undefined;
                }
                more = true
            } else {
                more = false;
            }
        } while (more)
    }

    async byId(id: number): Promise<TournamentData | null> {
        const response = await this.apiClient.axios.get(`/api/tournament/${id}`);
        if (response.status === 404) {
            return null;
        }
        return response.data as TournamentData;
    }
}

class Champions {
    constructor(private apiClient: Client) {
    }

    async* query({
        totalPages = 1,
        season = undefined,
        sort = undefined,
        limit = 50,
        after = undefined,
    }: ChampionQueryParams): AsyncIterable<ChampionData> {
        totalPages = totalPages ?? Infinity;
        let pageCount = 0;
        const params = {
            sort,
            limit,
            after,
        }
        let more: boolean = false;
        const targetUrl = season ? `/api/champions/${season}` : '/api/champions';
        do {
            const response = await this.apiClient.axios.get(targetUrl, {
                params,
            });
            for (const championData of response.data as ChampionData[]) {
                yield championData;
            }
            pageCount += 1;
            if (pageCount >= totalPages) {
                more = false;
                break;
            }
            const {link} = response.headers;
            if (link) {
                let match = link.match(nextLinkRegexp);
                if (!match) {
                    more = false;
                    break;
                }
                const url = new URL(match[1]);
                if (url.searchParams.has('limit')) {
                    params.limit = Number(url.searchParams.get('limit') as string);
                }
                if (url.searchParams.has('after')) {
                    params.after = Number(url.searchParams.get('after') as string);
                }
                if (url.searchParams.has('filter')) {
                    params.sort = url.searchParams.get('sort') as 'latest' | 'rank' ?? 'rank';
                }
                more = true
            } else {
                more = false;
            }
        } while (more)
    }

    byRank(params: Omit<ChampionQueryParams, 'sort'>): AsyncIterable<ChampionData> {
        (params as ChampionQueryParams).sort = 'rank';
        return this.query(params);
    }

    latest(params: Omit<ChampionQueryParams, 'sort'>): AsyncIterable<ChampionData> {
        (params as ChampionQueryParams).sort = 'latest';
        return this.query(params);
    }

    async byId(id: number): Promise<ChampionData | null> {
        const response = await this.apiClient.axios.get(`/api/champion/${id}`);
        if (response.status === 404) {
            return null;
        }
        return response.data as ChampionData;
    }
}

class Tips {
    constructor(private apiClient: Client) {
    }

    async getTipData(): Promise<TipData> {
        const response = await this.apiClient.axios.get(`/api/tips`);
        if (response.status === 404) {
            throw new Error('could not retrieve all tip data');
        }
        return response.data as TipData;
    }
}