import postits from './data/postits.json'

function App() {
  return (
    <main className="app">
      <h1>Hello World</h1>
      <p>Sections in JSON: {postits.length}</p>
    </main>
  )
}

export default App
