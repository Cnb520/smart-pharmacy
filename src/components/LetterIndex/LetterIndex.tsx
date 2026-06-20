import styles from './LetterIndex.module.css'

interface LetterIndexProps {
  letters: string[]
  activeLetter: string
  onLetterClick: (letter: string) => void
}

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('')

export default function LetterIndex({ letters, activeLetter, onLetterClick }: LetterIndexProps) {
  return (
    <div className={styles.container}>
      {ALL_LETTERS.map((letter) => {
        const isActive = letter === activeLetter
        const isDisabled = !letters.includes(letter) && letter !== '#'

        return (
          <span
            key={letter}
            className={`${styles.letter} ${isActive ? styles.active : ''}`}
            style={{
              color: isDisabled ? '#ddd' : undefined,
              cursor: isDisabled ? 'default' : 'pointer',
            }}
            onClick={() => {
              if (!isDisabled) {
                onLetterClick(letter)
              }
            }}
          >
            {letter}
          </span>
        )
      })}
    </div>
  )
}
