import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
// import { TeamsProvider } from "@/contexts/TeamsContext";
import { FilesProvider } from "@/contexts/FilesContext";
import { NotesProvider } from "@/contexts/NotesContext";
import { VaultProvider } from "@/contexts/VaultContext";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Files from "./pages/Files";
import Profile from "./pages/Profile";

import Notes from "./pages/notes/Notes";
import CreateNote from "./pages/notes/CreateNote";
import NoteDetail from "./pages/notes/NoteDetail";

import Passwords from "./pages/vault/Passwords";

import Sessions from "./pages/Sessions";
import Activity from "./pages/Activity";
import Security from "./pages/Security";
import TwoFactorSetup from "./pages/TwoFactorSetup";
// import SelfDestruct from "./pages/SelfDestruct";

import Admin from "./pages/admin/Admin";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminFiles from "./pages/admin/AdminFiles";

import CreateShare from "./pages/share/CreateShare";
import SharedView from "./pages/share/SharedView";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {/* ORDER FIXED ✔ */}
      {/* <TeamsProvider> */}
        <FilesProvider>
          <NotesProvider>
            <VaultProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>

                    {/* Public */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Public Share View */}
                    <Route path="/share/:token" element={<SharedView />} />

                    {/* Protected */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/upload"
                      element={
                        <ProtectedRoute>
                          <Upload />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/files"
                      element={
                        <ProtectedRoute>
                          <Files />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />

                    {/* Notes */}
                    <Route
                      path="/notes"
                      element={
                        <ProtectedRoute>
                          <Notes />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/notes/create"
                      element={
                        <ProtectedRoute>
                          <CreateNote />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/notes/:id"
                      element={
                        <ProtectedRoute>
                          <NoteDetail />
                        </ProtectedRoute>
                      }
                    />

                    {/* Vault */}
                    <Route
                      path="/vault/passwords"
                      element={
                        <ProtectedRoute>
                          <Passwords />
                        </ProtectedRoute>
                      }
                    />

                    {/* Security */}
                    <Route
                      path="/sessions"
                      element={
                        <ProtectedRoute>
                          <Sessions />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/activity"
                      element={
                        <ProtectedRoute>
                          <Activity />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/security"
                      element={
                        <ProtectedRoute>
                          <Security />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/2fa/setup"
                      element={
                        <ProtectedRoute>
                          <TwoFactorSetup />
                        </ProtectedRoute>
                      }
                    />

                    {/* <Route
                      path="/self-destruct"
                      element={
                        <ProtectedRoute>
                          <SelfDestruct />
                        </ProtectedRoute>
                      }
                    /> */}

                    {/* Create Share Link */}
                    <Route
                      path="/share/create/:fileId"
                      element={
                        <ProtectedRoute>
                          <CreateShare />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute adminOnly>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminUsers />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin/files"
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminFiles />
                        </ProtectedRoute>
                      }
                    />

                    {/* Not Found */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </VaultProvider>
          </NotesProvider>
        </FilesProvider>
      {/* </TeamsProvider> */}
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
