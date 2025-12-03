import HomePage from "./(home)/HomePage";
import ServerNotReady from "@/components/ServerNotReady";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://intelliformbackend.onrender.com";

async function checkServer() {
  try {
    const res = await fetch(`${API_URL}`, {
      cache: "no-store",
    });

    return res.ok;
  } catch (error) {
    return false;
  }
}

export default async function Home() {
  const isReady = await checkServer();

  if (!isReady) {
    return <ServerNotReady />;
  }

  return <HomePage />;
}
