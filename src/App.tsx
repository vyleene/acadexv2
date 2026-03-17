import './App.css'
import { AppController } from './controllers/useAppController'
import AppView from './views/AppView'

function App() {
  const appViewModel = AppController()

  return <AppView {...appViewModel} />
}

export default App