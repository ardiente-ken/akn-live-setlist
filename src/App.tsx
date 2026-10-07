import Hero from './components/Hero';
import Setlist from './components/Setlist';
import Tips from './components/Tips';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Hero />
      <main>
        <Setlist />
        <Tips />
      </main>
      <Footer />
    </>
  );
}
