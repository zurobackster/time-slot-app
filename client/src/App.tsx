function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-primary">
          Daily Activity Planner
        </h1>
        <p className="text-muted-foreground text-lg">
          MVP Project Setup Complete
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <span className="px-3 py-1 bg-vibrant-blue text-white rounded-md">React</span>
          <span className="px-3 py-1 bg-vibrant-violet text-white rounded-md">Vite</span>
          <span className="px-3 py-1 bg-vibrant-emerald text-white rounded-md">TypeScript</span>
          <span className="px-3 py-1 bg-vibrant-amber text-white rounded-md">Tailwind CSS</span>
          <span className="px-3 py-1 bg-vibrant-pink text-white rounded-md">Express</span>
          <span className="px-3 py-1 bg-vibrant-teal text-white rounded-md">SQLite</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Ready to build features!
        </p>
      </div>
    </div>
  )
}

export default App
