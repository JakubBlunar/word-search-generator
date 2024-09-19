import { Route, Routes } from 'react-router-dom'
import { Generated } from './generated'

enum RoutesDef {
  Index = '/',
  Cz = '/cz',
}

export function App() {
  return (
    <Routes>
      <Route path={RoutesDef.Index} element={<Generated key="generated" />} />
      <Route
        path={RoutesDef.Cz}
        element={<Generated key="generated" lang="cz" />}
      />
    </Routes>
  )
}

export default App
