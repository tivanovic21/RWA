export interface KorisniciI {
    poljeKorisnika: Array<KorisnikI>;
    [key: string]: any
}

export interface KorisnikI {
    id: number;
    ime: string;
    prezime: string;
    korime: string;
    email: string;
    lozinka: string;
    adresa: string;
    postanskiBroj: number;
    brojMobitela: string;
    tip_korisnika_id: number;
    totp: string;
}