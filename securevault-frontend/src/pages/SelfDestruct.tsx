// import { useState } from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { useToast } from "@/hooks/use-toast";
// import { Bomb, AlertTriangle, Save } from "lucide-react";

// export default function SelfDestruct() {
//   const { user, updateSelfDestructSettings } = useAuth();

//   const [enabled, setEnabled] = useState(user?.selfDestructEnabled ?? false);
//   const [threshold, setThreshold] = useState(
//     user?.failedLoginThreshold ?? 5
//   );
//   const [autoDeleteDays, setAutoDeleteDays] = useState(
//     user?.autoDeleteDays ?? 30
//   );

//   const { toast } = useToast();

//   const handleSave = async () => {
//     const ok = await updateSelfDestructSettings({
//       selfDestructEnabled: enabled,
//       failedLoginThreshold: threshold,
//       autoDeleteDays,
//     });

//     toast({
//       title: ok ? "Settings saved" : "Error saving settings",
//       variant: ok ? "default" : "destructive",
//     });
//   };

//   return (
//     <div className="max-w-xl mx-auto space-y-6 animate-in">
//       <div>
//         <h1 className="text-3xl font-bold">Self-Destruct Mode</h1>
//         <p className="text-muted-foreground">
//           Configure automatic security measures
//         </p>
//       </div>

//       <Card className="glass-card border-destructive/20">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-destructive">
//             <Bomb className="h-5 w-5" /> Self-Destruct Settings
//           </CardTitle>
//           <CardDescription>
//             These settings will permanently delete your data when triggered
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
//             <div className="flex items-center gap-3">
//               <AlertTriangle className="h-5 w-5 text-destructive" />
//               <p className="text-sm">Warning: These actions are irreversible!</p>
//             </div>
//           </div>

//           <div className="flex items-center justify-between">
//             <div>
//               <Label className="text-base">Enable Self-Destruct</Label>
//               <p className="text-sm text-muted-foreground">
//                 Delete account after failed login attempts
//               </p>
//             </div>
//             <Switch checked={enabled} onCheckedChange={setEnabled} />
//           </div>

//           {enabled && (
//             <>
//               <div className="space-y-2">
//                 <Label>Failed Login Threshold</Label>
//                 <Input
//                   type="number"
//                   min={3}
//                   max={20}
//                   value={threshold}
//                   onChange={(e) => setThreshold(Number(e.target.value))}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Auto-Delete Files After (days)</Label>
//                 <Input
//                   type="number"
//                   min={7}
//                   max={365}
//                   value={autoDeleteDays}
//                   onChange={(e) => setAutoDeleteDays(Number(e.target.value))}
//                 />
//               </div>
//             </>
//           )}

//           <Button
//             onClick={handleSave}
//             className={
//               enabled ? "bg-destructive hover:bg-destructive/90" : ""
//             }
//           >
//             <Save className="mr-2 h-4 w-4" /> Save Settings
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
