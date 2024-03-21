-- Creator:       MySQL Workbench 8.0.34/ExportSQLite Plugin 0.1.0
-- Author:        Toni Ivanovic
-- Caption:       New Model
-- Project:       Name of the project
-- Changed:       2023-11-26 20:36
-- Created:       2023-10-18 15:51

CREATE TABLE "tip_korisnika"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "naziv" VARCHAR(100) NOT NULL,
  "opis" VARCHAR(1000)
);
CREATE TABLE "serije"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "naziv" VARCHAR(100) NOT NULL,
  "opis" VARCHAR(1500),
  "broj_sezona" INTEGER,
  "broj_epizoda" INTEGER,
  "popularnost" INTEGER,
  "slika" VARCHAR(500),
  "poveznica" VARCHAR(500),
  "tmdb_id" INTEGER,
  CONSTRAINT "tmdb_id_UNIQUE"
    UNIQUE("tmdb_id")
);
CREATE TABLE "sezona"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "naziv" VARCHAR(100) NOT NULL,
  "opis" VARCHAR(1500),
  "broj_sezone" INTEGER,
  "broj_epizoda_sezone" INTEGER,
  "slika" VARCHAR(500),
  "tmdb_id_sezone" INTEGER,
  "serije_id" INTEGER NOT NULL,
  CONSTRAINT "tmdb_id_sezone_UNIQUE"
    UNIQUE("tmdb_id_sezone"),
  CONSTRAINT "fk_sezona_serije1"
    FOREIGN KEY("serije_id")
    REFERENCES "serije"("id")
    ON DELETE CASCADE
);
CREATE INDEX "sezona.fk_sezona_serije1_idx" ON "sezona" ("serije_id");
CREATE TABLE "korisnik"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "ime" VARCHAR(50),
  "prezime" VARCHAR(100),
  "korime" VARCHAR(50) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "lozinka" VARCHAR(100) NOT NULL,
  "adresa" VARCHAR(100),
  "postanskiBroj" INTEGER,
  "brojMobitela" VARCHAR(100),
  "tip_korisnika_id" INTEGER NOT NULL,
  "totp" VARCHAR(100),
  "hoce2fa" BOOLEAN,
  CONSTRAINT "email_UNIQUE"
    UNIQUE("email"),
  CONSTRAINT "korime_UNIQUE"
    UNIQUE("korime"),
  CONSTRAINT "fk_korisnik_tip_korisnika1"
    FOREIGN KEY("tip_korisnika_id")
    REFERENCES "tip_korisnika"("id")
    ON DELETE CASCADE
);
CREATE INDEX "korisnik.fk_korisnik_tip_korisnika1_idx" ON "korisnik" ("tip_korisnika_id");
CREATE TABLE "dnevnik"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "metode" VARCHAR(100),
  "datum" TIMESTAMP(2),
  "resurs" VARCHAR(100),
  "tijelo" VARCHAR(100),
  "korisnik_id" INTEGER NOT NULL,
  CONSTRAINT "fk_dnevnik_korisnik"
    FOREIGN KEY("korisnik_id")
    REFERENCES "korisnik"("id")
    ON DELETE CASCADE
);
CREATE INDEX "dnevnik.fk_dnevnik_korisnik_idx" ON "dnevnik" ("korisnik_id");
CREATE TABLE "favoriti"(
  "korisnik_id" INTEGER NOT NULL,
  "serije_id" INTEGER NOT NULL,
  CONSTRAINT "fk_korisnik_has_serije_korisnik1"
    FOREIGN KEY("korisnik_id")
    REFERENCES "korisnik"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_korisnik_has_serije_serije1"
    FOREIGN KEY("serije_id")
    REFERENCES "serije"("id")
    ON DELETE CASCADE
);
CREATE INDEX "favoriti.fk_korisnik_has_serije_serije1_idx" ON "favoriti" ("serije_id");
CREATE INDEX "favoriti.fk_korisnik_has_serije_korisnik1_idx" ON "favoriti" ("korisnik_id");

COMMIT;