import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from '@obec/ui'
import { TenantProvider } from './app/tenant'
import { AuthProvider } from './app/auth'
import { NazovStranky } from './app/NazovStranky'
import { Layout } from './components/Layout'
import { ChranenaCesta } from './components/ChranenaCesta'
import { Domov } from './pages/Domov'
import { Prihlasenie } from './pages/Prihlasenie'
import { Registracia } from './pages/Registracia'
import { ZabudnuteHeslo } from './pages/ZabudnuteHeslo'
import { OchranaUdajov } from './pages/OchranaUdajov'
import { ZoznamFormularov } from './pages/ZoznamFormularov'
import { Formular } from './pages/Formular'
import { Odoslane } from './pages/Odoslane'
import { MojePodania } from './pages/MojePodania'
import { Profil } from './pages/Profil'
import { Nenajdene } from './pages/Nenajdene'

export function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <ToastProvider>
          <HashRouter>
            <NazovStranky />
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Domov />} />
                <Route path="prihlasenie" element={<Prihlasenie />} />
                <Route path="registracia" element={<Registracia />} />
                <Route path="zabudnute-heslo" element={<ZabudnuteHeslo />} />
                <Route path="ochrana-udajov" element={<OchranaUdajov />} />
                <Route path="formulare" element={<ZoznamFormularov />} />
                <Route path="formular/:formId" element={<Formular />} />
                <Route path="odoslane/:podanieId" element={<Odoslane />} />
                <Route
                  path="moje-podania"
                  element={
                    <ChranenaCesta>
                      <MojePodania />
                    </ChranenaCesta>
                  }
                />
                <Route
                  path="profil"
                  element={
                    <ChranenaCesta>
                      <Profil />
                    </ChranenaCesta>
                  }
                />
                <Route path="404" element={<Nenajdene />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
            </Routes>
          </HashRouter>
        </ToastProvider>
      </AuthProvider>
    </TenantProvider>
  )
}
