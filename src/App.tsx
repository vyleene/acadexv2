import './App.css'
import { useAppViewModel } from './viewmodels/useAppViewModel'
import AppView from './views/AppView'

function App() {
  const appViewModel = useAppViewModel()

  return <AppView {...appViewModel} />
}

export default App