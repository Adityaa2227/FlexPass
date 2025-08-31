import { useState } from 'react'
import { Pass } from '../Dashboard'
import { useX402 } from '../../hooks/useX402'

interface OpenAIAccessProps {
  pass: Pass
}

export function OpenAIAccess({ pass }: OpenAIAccessProps) {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const { makeX402Request } = useX402()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    try {
      setLoading(true)
      setResponse('')

      const result = await makeX402Request({
        service: 'openai',
        tokenId: pass.tokenId,
        endpoint: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150
        })
      })

      if (result.success) {
        const data = JSON.parse(result.data || '{}')
        setResponse(data.choices?.[0]?.message?.content || 'No response received')
      } else {
        setResponse(`Error: ${result.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">OpenAI Chat Access</h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          Pass #{pass.tokenId}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your prompt:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask me anything..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="btn-primary"
        >
          {loading ? 'Generating...' : 'Generate Response'}
        </button>
      </form>

      {response && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Response:</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>⚡ Powered by X402 access control</p>
        <p>🔒 Your pass is verified on-chain before each request</p>
      </div>
    </div>
  )
}
