import { useState } from 'react'
import { Pass } from './Dashboard'
import { OpenAIAccess } from './services/OpenAIAccess'
import { SpotifyAccess } from './services/SpotifyAccess'
import { NetflixAccess } from './services/NetflixAccess'

interface ContentAccessProps {
  validPasses: Pass[]
}

export function ContentAccess({ validPasses }: ContentAccessProps) {
  const [activeService, setActiveService] = useState<number | null>(null)

  const hasValidPass = (serviceType: number) => {
    return validPasses.some(pass => pass.serviceType === serviceType && pass.isValid)
  }

  const getValidPass = (serviceType: number) => {
    return validPasses.find(pass => pass.serviceType === serviceType && pass.isValid)
  }

  const services = [
    { id: 0, name: 'OpenAI', icon: '🤖', color: 'bg-blue-500' },
    { id: 1, name: 'Spotify', icon: '🎵', color: 'bg-green-500' },
    { id: 2, name: 'Netflix', icon: '🎬', color: 'bg-red-500' }
  ]

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Access Content</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {services.map((service) => {
          const hasAccess = hasValidPass(service.id)
          return (
            <button
              key={service.id}
              onClick={() => hasAccess ? setActiveService(service.id) : null}
              disabled={!hasAccess}
              className={`p-4 rounded-lg border-2 transition-all ${
                hasAccess
                  ? `border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer ${
                      activeService === service.id ? 'ring-2 ring-green-500' : ''
                    }`
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{service.icon}</div>
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className={`text-sm mt-1 ${hasAccess ? 'text-green-600' : 'text-gray-500'}`}>
                  {hasAccess ? 'Access Available' : 'No Valid Pass'}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {activeService !== null && (
        <div className="border-t pt-6">
          {activeService === 0 && hasValidPass(0) && (
            <OpenAIAccess pass={getValidPass(0)!} />
          )}
          {activeService === 1 && hasValidPass(1) && (
            <SpotifyAccess pass={getValidPass(1)!} />
          )}
          {activeService === 2 && hasValidPass(2) && (
            <NetflixAccess pass={getValidPass(2)!} />
          )}
        </div>
      )}

      {validPasses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No active passes. Purchase a pass to access content.</p>
        </div>
      )}
    </div>
  )
}
