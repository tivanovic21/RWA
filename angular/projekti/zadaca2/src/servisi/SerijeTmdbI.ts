export interface SerijeTmdbI {
    page: Number;
    results: Array<SerijaTmdbI>;
    total_pages: Number;
    total_results: Number;
}

export interface SerijaTmdbI {
    adult: boolean;
    backdrop_path: string;
    genres: Array<number>;
    id: number;
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    name: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    number_of_seasons: number;
    number_of_episodes: number;
    homepage: string;
    seasons: Array<object>;
    tmdb_id: number;
}

export interface SezonaI{
    name: string,
    overview: string,
    season_number: number,
    episode_count: number,
    poster_path: string,
    id: number,
    serijaId: number;
}