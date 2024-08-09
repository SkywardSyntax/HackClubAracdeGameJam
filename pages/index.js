import Link from 'next/link';

function Home() {
  return (
    <main>
      <Link href="/game" legacyBehavior>
        <a>Play Game</a>
      </Link>
    </main>
  );
}

export default Home;
