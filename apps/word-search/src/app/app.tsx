import { Route, Routes } from 'react-router-dom'
import { Generated } from './generated'

enum RoutesDef {
  Index = '/',
}

export function App() {
  return (
    <Routes>
      <Route path={RoutesDef.Index} element={<Generated key="generated" />} />
    </Routes>
  )
}

export default App
