// import React, { createContext, useContext, useEffect, useState } from "react";
// import { apiFetch } from "@/lib/api";
// import { Team, TeamMember } from "@/types";
// import { useAuth } from "@/contexts/AuthContext";
// import { generateEncryptionKey, exportKey } from "@/lib/crypto";

// interface TeamsContextType {
//   teams: Team[];
//   isLoading: boolean;

//   reloadTeams: () => Promise<void>;
//   deleteTeam: (teamId: string | number) => Promise<void>;

//   getTeam: (id: string | number) => Team | undefined;
//   getUserTeams: () => Team[];
//   getMemberRole: (teamId: string | number, userId: string | number) => string;

//   getTeamActivities: (teamId: string | number) => any[];
//   getTeamMessages: (teamId: string | number) => any[];
//   reloadTeamMessages: (teamId: string | number) => Promise<void>;
//   sendMessage: (teamId: string | number, encryptedContent: string, iv: string) => Promise<void>;

//   createTeam: (name: string, description: string) => Promise<Team>;
//   inviteMember: (teamId: string, email: string) => Promise<void>;
//   updateMemberRole: (teamId: string, userId: string, role: TeamMember["role"]) => Promise<void>;
//   removeMember: (teamId: string, userId: string) => Promise<void>;
// }

// const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

// export function TeamsProvider({ children }: { children: React.ReactNode }) {
//   const [teams, setTeams] = useState<Team[]>([]);
//   const [activities, setActivities] = useState<Record<string, any[]>>({});
//   const [messages, setMessages] = useState<Record<string, any[]>>({});
//   const [isLoading, setIsLoading] = useState(false);

//   const { user } = useAuth();

//   // Load teams on user load
//   useEffect(() => {
//     if (user) reloadTeams();
//   }, [user]);

//   // ================================
//   // LOAD TEAMS
//   // ================================
//   const reloadTeams = async () => {
//     if (!user) return;
//     setIsLoading(true);

//     try {
//       const res = await apiFetch("/teams");
//       const list = Array.isArray(res) ? res : [];

//       setTeams(
//         list.map((t: any) => ({
//           ...t,
//           members: Array.isArray(t.members) ? t.members : []
//         }))
//       );
//     } catch (err) {
//       console.error("Failed loading teams:", err);
//       setTeams([]);
//     }

//     setIsLoading(false);
//   };

//   // ================================
//   // DELETE TEAM (ADMIN ONLY)
//   // ================================
//   const deleteTeam = async (teamId: string | number) => {
//     await apiFetch(`/teams/${teamId}`, {
//       method: "DELETE",
//     });

//     await reloadTeams();
//   };

//   // ================================
//   // CREATE TEAM
//   // ================================
//   const createTeam = async (name: string, description: string) => {
//     const key = await generateEncryptionKey();
//     const exportedKey = await exportKey(key);

//     const created = await apiFetch("/teams", {
//       method: "POST",
//       body: JSON.stringify({
//         name,
//         description,
//         encryptedTeamKey: exportedKey
//       })
//     });

//     await reloadTeams();
//     return created;
//   };

//   const getTeam = (id: string | number) =>
//     teams.find((t) => String(t.id) === String(id));

//   const getUserTeams = () => {
//     if (!user) return [];
//     return teams.filter((t) =>
//       t.members.some((m) => String(m.userId) === String(user.id))
//     );
//   };

//   const getMemberRole = (teamId: string | number, userId: string | number) => {
//     const t = getTeam(teamId);
//     const m = t?.members.find((m) => String(m.userId) === String(userId));
//     return m?.role || "viewer";
//   };

//   // ================================
//   // ACTIVITY LOGS
//   // ================================
//   const getTeamActivities = (teamId: string | number) => {
//     const id = String(teamId);
//     return activities[id] || [];
//   };

//   const getTeamMessages = (teamId: string | number) =>
//     messages[String(teamId)] || [];

//   const reloadTeamMessages = async (teamId: string | number) => {
//     const res = await apiFetch(`/teams/${teamId}/messages`);
//     setMessages((p) => ({
//       ...p,
//       [teamId]: Array.isArray(res) ? res : [],
//     }));
//   };

//   const sendMessage = async (teamId: string | number, encryptedContent: string, iv: string) => {
//     await apiFetch(`/teams/${teamId}/messages`, {
//       method: "POST",
//       body: JSON.stringify({ encryptedContent, iv })
//     });
//     await reloadTeamMessages(teamId);
//   };

//   // ================================
//   // MEMBER MGMT
//   // ================================
//   const inviteMember = async (teamId: string, email: string) => {
//     await apiFetch(`/teams/${teamId}/invite`, {
//       method: "POST",
//       body: JSON.stringify({ email }),
//     });
//     await reloadTeams();
//   };

//   const updateMemberRole = async (teamId: string, userId: string, role: TeamMember["role"]) => {
//     await apiFetch(`/teams/${teamId}/members/${userId}/role`, {
//       method: "PUT",
//       body: JSON.stringify({ role }),
//     });
//     await reloadTeams();
//   };

//   const removeMember = async (teamId: string, userId: string) => {
//     await apiFetch(`/teams/${teamId}/members/${userId}`, {
//       method: "DELETE",
//     });
//     await reloadTeams();
//   };

//   return (
//     <TeamsContext.Provider
//       value={{
//         teams,
//         isLoading,

//         reloadTeams,
//         deleteTeam,

//         getTeam,
//         getUserTeams,
//         getMemberRole,

//         getTeamActivities,
//         getTeamMessages,
//         reloadTeamMessages,
//         sendMessage,

//         createTeam,
//         inviteMember,
//         updateMemberRole,
//         removeMember,
//       }}
//     >
//       {children}
//     </TeamsContext.Provider>
//   );
// }

// export function useTeams() {
//   const ctx = useContext(TeamsContext);
//   if (!ctx) throw new Error("useTeams must be inside TeamsProvider");
//   return ctx;
// }
