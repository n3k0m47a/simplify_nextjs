import { getLuckydex } from "../actions";
import { LuckydexClient } from "./luckydex-client";

export default async function LuckydexPage() {
  const { pokedexEntries, avatars, luckyEntries } = await getLuckydex();
  return (
    <LuckydexClient
      pokedex={pokedexEntries}
      avatars={avatars}
      luckyEntries={luckyEntries}
    />
  );
}
