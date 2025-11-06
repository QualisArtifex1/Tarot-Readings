import React, { useState, useCallback, useMemo } from 'react';
import { GameState, Card as CardType, DrawnCard } from './types';
import { TAROT_DECK } from './constants';
import { getTarotReading } from './services/geminiService';
import Card from './components/Card';
import Loader from './components/Loader';
import MajorArcanaAlert from './components/MajorArcanaAlert';

const markdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    return markdown
        .split('\n\n') // Split by paragraphs
        .map(block => {
            block = block.trim();
            if (block.startsWith('# ')) { return `<h1>${block.substring(2)}</h1>`; }
            if (block.startsWith('## ')) { return `<h2>${block.substring(3)}</h2>`; }
            if (block.startsWith('### ')) { return `<h3>${block.substring(4)}</h3>`; }
            if(block.length > 0) {
              const processedBlock = block
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br/>'); 
              return `<p>${processedBlock}</p>`;
            }
            return '';
        })
        .join('');
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [deck, setDeck] = useState<CardType[]>(() => [...TAROT_DECK]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [reading, setReading] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cutIndex, setCutIndex] = useState<number | null>(null);

  const beginShuffle = useCallback(() => {
    setGameState(GameState.Shuffling);
    setTimeout(() => {
      setDeck((prevDeck) => {
        const shuffled = [...prevDeck];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      });
      setDrawnCards([]);
      setReading('');
      setGameState(GameState.ReadyToCut);
    }, 1500);
  }, []);

  const handleCutDeck = useCallback((index: number) => {
    if (gameState !== GameState.ReadyToCut) return;
    setCutIndex(index);
    setGameState(GameState.Cutting);
    setTimeout(() => {
        setDeck(prevDeck => {
            return [...prevDeck.slice(index), ...prevDeck.slice(0, index)];
        });
        setCutIndex(null);
        setGameState(GameState.ReadyToDraw);
    }, 2000);
  }, [gameState]);

  const handleDrawCards = useCallback(() => {
    if (deck.length < 3) return;
    const newDrawnCards: DrawnCard[] = [];
    const newDeck = [...deck];
    for (let i = 0; i < 3; i++) {
      const card = newDeck.pop();
      if (card) {
        newDrawnCards.push({ ...card, isReversed: Math.random() < 0.5 });
      }
    }
    setDrawnCards(newDrawnCards);
    setDeck(newDeck);
    setGameState(GameState.Drawing);
    setTimeout(() => setGameState(GameState.Revealing), 1500);
  }, [deck]);

  const handleGetReading = useCallback(async () => {
    if (drawnCards.length !== 3) return;
    setIsLoading(true);
    setGameState(GameState.Reading);
    const result = await getTarotReading(drawnCards);
    setReading(result);
    setIsLoading(false);
    setGameState(GameState.Done);
  }, [drawnCards]);
  
  const reset = useCallback(() => {
      setDeck([...TAROT_DECK]);
      setDrawnCards([]);
      setReading('');
      setIsLoading(false);
      setGameState(GameState.Start);
  }, []);

  const actionButton = useMemo(() => {
    switch (gameState) {
      case GameState.Start:
        return <button onClick={beginShuffle} className="action-button">Begin Reading</button>;
      case GameState.ReadyToDraw:
        return <button onClick={handleDrawCards} className="action-button">Draw Three Cards</button>;
      case GameState.Revealing:
        return <button onClick={handleGetReading} className="action-button">Reveal Your Fate</button>;
      case GameState.Done:
        return <button onClick={reset} className="action-button">Read Again</button>;
      default:
        return null;
    }
  }, [gameState, beginShuffle, handleDrawCards, handleGetReading, reset]);

  const renderDeck = () => {
    const isSplayed = gameState === GameState.ReadyToCut;
    if (isSplayed) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
            {deck.map((card, i) => (
                <div 
                    key={i} 
                    className="absolute transition-transform duration-300 ease-in-out hover:!scale-105 hover:!translate-y-[-20px] cursor-pointer"
                    style={{
                        transform: `translateX(${(i - deck.length / 2) * 15}px) rotateZ(${(i - deck.length / 2) * 2}deg)`,
                        zIndex: i
                    }}
                    onClick={() => handleCutDeck(i)}
                >
                    <Card card={card} isFlipped={false} isReversed={false} className="!w-28 !h-[12.25rem] md:!w-32 md:!h-[14rem]" />
                </div>
            ))}
        </div>
      )
    }

    // Default Pile view for Start, Shuffle, Cut, Draw states
    const isCutting = gameState === GameState.Cutting;
    return (
      <div className={`relative w-40 h-[17.5rem] md:w-48 md:h-[21rem] deck-pile ${gameState === GameState.Shuffling ? 'shuffling' : ''}`}>
        {deck.map((card, i) => {
            let style = {};
            if (isCutting && cutIndex !== null) {
                if (i < cutIndex) { // Top part of cut
                    style = { transform: 'translateX(-150%)', transition: 'transform 1s ease-in-out' };
                } else { // Bottom part of cut
                    style = { transform: 'translateX(150%)', transition: 'transform 1s ease-in-out' };
                }
            }
           return (
              <div
                  key={i}
                  className="absolute w-full h-full"
                  style={{
                      top: `${i * -1}px`,
                      left: `${i * -1}px`,
                      zIndex: deck.length - i,
                      ...style
                  }}
              >
                <Card card={card} isFlipped={false} isReversed={false} />
              </div>
           )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900 text-gray-200 flex flex-col items-center justify-center p-4 overflow-x-hidden">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-cinzel text-yellow-300 tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
          Mystic Insight
        </h1>
        <p className="text-yellow-100/70 text-lg">A journey through the cards</p>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center w-full">
        <div className="h-96 flex items-center justify-center w-full">
          {gameState < GameState.Drawing ? renderDeck() : null}
          {drawnCards.length > 0 && (
            <div className="grid grid-cols-3 gap-4 md:gap-8 w-full max-w-3xl">
              {drawnCards.map((card, index) => (
                 <div key={index} className="relative flex flex-col items-center card-container" style={{ animationDelay: `${index * 0.4}s` }}>
                    <Card card={card} isFlipped={gameState >= GameState.Revealing} isReversed={card.isReversed} />
                    {gameState >= GameState.Revealing && card.type === 'major' && <MajorArcanaAlert />}
                    <h2 className={`mt-4 text-xl font-cinzel text-yellow-300 transition-opacity duration-1000 ${gameState >= GameState.Revealing ? 'opacity-100' : 'opacity-0'}`}>
                        {['Past', 'Present', 'Future'][index]}
                    </h2>
                 </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="h-32 mt-8 flex flex-col items-center justify-center">
          {gameState === GameState.ReadyToCut && <p className="text-yellow-200 text-lg font-cinzel tracking-widest mb-4">Click a card to cut the deck</p>}
          {actionButton}
        </div>

        {gameState === GameState.Reading && isLoading && <Loader />}
        
        {gameState === GameState.Done && reading && (
           <div className="mt-8 p-6 bg-black/30 rounded-lg max-w-4xl w-full prose prose-invert prose-headings:text-yellow-300 prose-headings:font-cinzel reading-text">
              <div dangerouslySetInnerHTML={{ __html: markdownToHtml(reading) }} />
           </div>
        )}
      </main>
      
      <footer className="text-center text-xs text-gray-500 py-4">
        <p>Tarot readings are for entertainment purposes only.</p>
      </footer>

      <style>{`
        .action-button {
          padding: 0.75rem 2rem;
          font-family: 'Cinzel', serif;
          font-size: 1.125rem;
          color: #fde68a; /* yellow-200 */
          background-color: transparent;
          border: 2px solid #ca8a04; /* yellow-600 */
          border-radius: 9999px;
          transition: all 0.3s ease-in-out;
          box-shadow: 0 0 10px rgba(253, 230, 138, 0.3), inset 0 0 5px rgba(202, 138, 4, 0.2);
          text-shadow: 0 0 5px rgba(0,0,0,0.5);
        }
        .action-button:hover {
          background-color: #ca8a04;
          color: #111827; /* gray-900 */
          box-shadow: 0 0 20px rgba(253, 230, 138, 0.7);
        }
        .perspective-1000 {
            perspective: 1000px;
        }
        @keyframes dealCardAnimation {
          from { opacity: 0; transform: translateY(-60px) scale(0.7); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .card-container {
          opacity: 0;
          animation: dealCardAnimation 0.5s ease-out forwards;
        }
        .reading-text p {
          font-family: 'Playfair Display', serif; font-size: 1.2rem; line-height: 1.8; color: #d1d5db;
        }
        .reading-text strong { color: #fde68a; }

        @keyframes shuffleAnimation {
          0%, 100% { transform: translateY(0) rotate(0); }
          25% { transform: translateY(-10px) rotate(-2deg); }
          75% { transform: translateY(10px) rotate(2deg); }
        }
        .shuffling .deck-pile > div:nth-child(odd) { animation: shuffleAnimation 0.5s ease-in-out infinite; }
        .shuffling .deck-pile > div:nth-child(even) { animation: shuffleAnimation 0.5s ease-in-out infinite reverse; }

        @keyframes majorArcanaFade {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          20% { opacity: 1; transform: translateY(0) scale(1.1); }
          80% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-20px) scale(0.9); }
        }
        .major-arcana-alert {
          animation: majorArcanaFade 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
