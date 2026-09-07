import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import Spinner from "@App/components/atoms/Spinner"

export default function AuthGuard({children} : {children: React.ReactNode}) {
  const {user, loading, userData, userDataLoading } = useAuth(); // extract user identity from Firebase Authentication and loading flag to check if Firebase is done verifying that user is logged in
  const router = useRouter();
  
  // useEffect(() => {
  //   // if firebase is done verifying whether user is logged in, and the user isn't logged in, redirect them to login page
  //   if (!loading && !user) {
  //     const isAuthPage = router.pathname.startsWith("/auth");
  //     if (!isAuthPage) router.push("/auth/login");
      
  //   }
  // }, [user, loading, router]);
//   useEffect(() => {
//   if (!loading) {

//     // Not logged in
//     if (!user) {
//       const isAuthPage = router.pathname.startsWith("/auth");

//       if (!isAuthPage) {
//         router.push("/auth/login");
//       }

//       return;
//     }

//     // Logged in but profile not completed
//     if (
//       user &&
//       userData &&
//       !userData.registrationCompletedAt &&
//       router.pathname !== "/auth/profile/setup"
//     ) {
//       router.push("/auth/profile/setup");
//     }
//   }
// }, [user, userData, loading, router]);

useEffect(() => {
  if (loading || userDataLoading) return;

  if (!user) {
    router.replace("/auth/login");
    return;
  }

  // Extra onboarding
  // if (
  //   !userData?.registrationCompletedAt &&
  //   router.pathname !== "/auth/register"
  // ) {
  //   router.replace("/auth/register");
  // }

}, [user, userData, loading, userDataLoading, router]);


// THIS is outside useEffect
if (loading || userDataLoading) {
  return <Spinner />;
}

if (!user && !router.pathname.startsWith("/auth")) {
  return null;
}

return <>{children}</>;
}