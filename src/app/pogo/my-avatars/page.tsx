import { getAvatars } from "../actions";
import { AvatarsClient } from "./avatars-client";

export default async function MyAvatarsPage() {
  const avatars = await getAvatars();
  return <AvatarsClient initialAvatars={avatars} />;
}
