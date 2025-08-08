
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import FormPage from "./pages/FormPage";
import { AuthCallback } from "./pages/AuthCallback";
import { QRRedirect } from "./pages/QRRedirect";
import NotFound from "./pages/NotFound";
import MemberAttendancePage from "./pages/MemberAttendancePage";
import CellAttendancePage from "./pages/CellAttendancePage";
import MessagesPage from "./pages/MessagesPage";
import MinistriesPage from "./pages/MinistriesPage";
import KidsPage from "./pages/KidsPage";
import NotificationsPage from "./pages/NotificationsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/form" element={<FormPage />} />
                <Route path="/form/:id" element={<FormPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/qr/:token" element={<QRRedirect />} />
                <Route path="/attendance/member/:token" element={<MemberAttendancePage />} />
                <Route path="/attendance/cell/:cellId" element={<CellAttendancePage />} />
                
                {/* Rotas protegidas */}
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/contacts" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/cells" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/pipeline" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/ministries" element={<ProtectedRoute><MinistriesPage /></ProtectedRoute>} />
                <Route path="/kids" element={<ProtectedRoute><KidsPage /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/qr-codes" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <Sonner />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
