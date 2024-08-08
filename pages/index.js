import Game from '../components/Game'
import Link from 'next/link'

function Home() {
  return (
    <main>
      <Game />
      <Link href="/game">
        Play the Black Hole Game
      </Link>
    </main>
  )
}

export default Home
