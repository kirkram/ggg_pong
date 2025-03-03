import { useEffect, useState } from 'react'
import { AppInfoIface } from './context/app-info/interface'
import { info } from './service'
import { AppInfoContext } from './context/app-info/context'
import { AuthorisedApp } from './components'

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [appInfo, setAppInfo] = useState<AppInfoIface | undefined>(undefined)

  useEffect(() => {
    info()
    .then(setAppInfo)
    .catch(setError)
    .finally(() => setLoading(false))
  }, [])

  if (loading)
    return <div>app is loading</div>

  if (error)
    return <div>app errored: {error.message}</div>

  return (
    <AppInfoContext.Provider value={appInfo}>
      <AuthorisedApp />
    </AppInfoContext.Provider>
  )
}

export default App
