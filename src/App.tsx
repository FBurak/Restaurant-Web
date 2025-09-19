import { useEffect, useState } from "react";
import { auth} from "./firebase";
import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import LoginScreen from "./screens/LoginScreen";
import AdminScreen from "./screens/AdminScreen";

/* ---------------- App (auth gate) ---------------- */
export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  if (user === undefined) return null;
  if (user === null) return <LoginScreen />;

  return <AdminScreen user={user} />;
}




