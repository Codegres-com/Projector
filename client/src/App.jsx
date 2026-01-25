import { useState, useEffect } from 'react'

function App() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setStatus(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching health status:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">Projector App</h1>
        <div className="border-t pt-4">
          <p className="text-gray-600 mb-2">Backend Status:</p>
          {loading ? (
            <p className="text-yellow-500">Loading...</p>
          ) : status ? (
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-green-700 font-semibold">{status.message}</p>
              <p className="text-xs text-green-500 mt-1">{status.timestamp}</p>
            </div>
          ) : (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-red-700">Failed to connect to backend</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
