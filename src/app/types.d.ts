export interface Episode {
    episodeNumber: string;
    url: string;
}

export interface Season {
    seasonNumber: string;
    episodes: Episode[];
}

export interface MovieCopy {
    id?: number;
    name: string;
    size: string;
    link: string;
}

export interface AutoCompleteResult {
    title: string;
    url: string;
    year: string;
    img: string;
    imdb?: string;
    site: "X265LK" | "MeloMovie" | "CeylonStream";
}

export interface X265SearchResult {
    title: string;
    url: string;
    img: string;
    extra: {
        date: string;
        imdb?: string;
    }
}

export interface X265SearchResults {
    [id: number]: X265SearchResult
}

