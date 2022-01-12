# fft-battleground-api
API client for fft battleground api https://fftbg.com/api

# FFT Battlegrounds API

See the documentation for FFT Battlegrounds API here: https://gist.github.com/guregu/473acbe02b6ae6f956b2e8cc9177df2e

# Using this library

## installation

```bash
npm install fft-battleground-api
```

## Usage

This library is written in typescript. You can import the Client object in order to do do api calls. Here is an example usage of all of the api calls. Note that the returned values here are async iterators. There is an additional totalPages parameter that controls the total number of pages that will be iterated across. Set this to undefined or Infinity to iterate over the entire dataset. Please avoid doing this if possible though.

```typescript
import {
    Client,
    TournamentData,
    TournamentSummaryData,
    ChampionData,
    TipData,
} from "fft-battleground-api";

const client = new Client();
for await (const tournamentData: TournamentSummaryData of client.tournaments.latest({
    totalPages: 1,
    limit: 50,
    filter: 'complete',
    before: 1581183844227,
})) {
    console.log(tournamentData)
}

const tournamentData: TournamentData = await client.tournaments.byId(1581360864550);
console.log(tournamentData);

for await (const championData: ChampionData of client.champions.query({
    totalPages: 1,
    season: 1,
    limit: 8,
    after: 8,
    sort: 'rank',
})) {
    console.log(tournamentData);
}


for await (const championData: ChampionData of client.champions.byRank({
    totalPages: 1,
    season: 1,
    limit: 8,
    after: 8,
})) {
    console.log(tournamentData);
}

for await (const championData: ChampionData of client.champions.latest({
    totalPages: 1,
    season: 1,
    limit: 8,
    after: 244,
})) {
    console.log(tournamentData);
}

const championData: ChampionData = await client.champions.byId(244);
console.log(championData);

const allTipData: TipData = await client.tips.getTipData();
console.log(allTipData);
```