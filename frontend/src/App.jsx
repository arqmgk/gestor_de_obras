import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FlashProvider, sharedCSS } from './components/ui.jsx';
import { ArqLayout, CapLayout } from './layouts/ShellLayouts.jsx';

import RolePage        from './pages/RolePage.jsx';
import ObrasPage       from './pages/arquitecto/ObrasPage.jsx';
import NuevaObraPage   from './pages/arquitecto/NuevaObraPage.jsx';
import DetalleObraPage from './pages/arquitecto/DetalleObraPage.jsx';
import NuevaTareaPage  from './pages/arquitecto/NuevaTareaPage.jsx';
import CapDashboard    from './pages/capataz/CapDashboard.jsx';
import CapMedicion     from './pages/capataz/CapMedicion.jsx';

export default function App() {
  return (
    <>
      <style>{sharedCSS}</style>
      <FlashProvider>
        <BrowserRouter>
          <Routes>
            {/* Role selector */}
            <Route path="/" element={<RolePage />} />

            {/* Arquitecto */}
            <Route path="/arquitecto" element={<ArqLayout />}>
              <Route index          element={<ObrasPage />} />
              <Route path="nueva"   element={<NuevaObraPage />} />
              <Route path=":id"     element={<DetalleObraPage />} />
              <Route path=":id/nueva-tarea" element={<NuevaTareaPage />} />
            </Route>

            {/* Capataz */}
            <Route path="/capataz" element={<CapLayout />}>
              <Route index            element={<CapDashboard />} />
              <Route path="medicion"  element={<CapMedicion />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FlashProvider>
    </>
  );
}
