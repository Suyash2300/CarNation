import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
          Welcome to CarNation
        </h1>
        <p className="text-gray-600 text-center mb-8">
          React + TypeScript + Vite + Tailwind CSS
        </p>
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCount((count) => count - 1)}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              -
            </button>
            <div className="text-3xl font-bold text-gray-800 min-w-[100px] text-center">
              {count}
            </div>
            <button
              onClick={() => setCount((count) => count + 1)}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              +
            </button>
          </div>
          
          <button
            onClick={() => setCount(0)}
            className="mt-4 px-8 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Reset
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700 text-center">
            Edit <code className="bg-gray-200 px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

