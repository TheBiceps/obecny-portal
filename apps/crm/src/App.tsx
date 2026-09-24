import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from '@obec/ui'
import { TenantProvider } from './app/tenant'
import { AuthProvider } from './app/auth'
import { Layout } from './components/Layout'
import { ChranenaCesta } from './components/ChranenaCesta'
import { Prihlasenie } from './pages/Prihlasenie'
import { Podania } from './pages/Podania'
import { DetailPodania } from './pages/DetailPodania'
import { Pouzivatelia } from './pages/Pouzivatelia'

export function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <ToastProvider>
          <HashRouter>
            <Routes>
              <Route path="/prihlasenie" element={<Prihlasenie />} />
              <Route
                element={
                  <ChranenaCesta>
                    <Layout />
                  </ChranenaCesta>
                }
              >
                <Route index element={<Navigate to="/podania" replace />} />
                <Route path="podania" element={<Podania />} />
                <Route path="podania/:podanieId" element={<DetailPodania />} />
                <Route path="pouzivatelia" element={<Pouzivatelia />} />
              </Route>
              <Route path="*" element={<Navigate to="/podania" replace />} />
            </Routes>
          </HashRouter>
        </ToastProvider>
      </AuthProvider>
    </TenantProvider>
  )
}
