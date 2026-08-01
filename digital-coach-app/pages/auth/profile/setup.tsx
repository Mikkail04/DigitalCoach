import { useState } from "react";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@App/lib/firebase/firebase.config";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import { useRouter } from "next/router";

export default function ProfileSetup() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [concentration, setConcentration] = useState("");
  const [proficiency, setProficiency] = useState("");

if (loading) {
  return <div>Loading...</div>;
}

if (!user) {
  router.push("/login");
  return null;
}


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

  if (!user) {
    console.error("No authenticated user yet");
    return;
  }

    try{
    await setDoc(
  doc(db, "users", user.uid),
  {
    name,
    concentration,
    proficiency,
    registrationCompletedAt: Timestamp.now(),
  },
  { merge: true }
);
  console.log("Profile saved");
  await router.push("/")
} catch (err) {
  console.error("Failed to save profile:", err);
}

  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
      />

      <input
        value={concentration}
        onChange={(e) => setConcentration(e.target.value)}
        placeholder="Career concentration"
      />

      <input
        value={proficiency}
        onChange={(e) => setProficiency(e.target.value)}
        placeholder="Experience level"
      />

      <button type="submit">
        Finish Profile
      </button>
    </form>
  );
}