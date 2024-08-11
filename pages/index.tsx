import Link from 'next/link';
import { FC } from 'react';

const Home: FC = () => {
  return (
    <main>
      <Link href="/game" legacyBehavior>
        <a>Play Game</a>
      </Link>
    </main>
  );
}

export default Home;
