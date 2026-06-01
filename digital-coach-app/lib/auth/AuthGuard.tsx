import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import Spinner from "@App/components/atoms/Spinner"

export default function AuthGuard({children} : {children: React.ReactNode}) {
  const {user, loading} = useAuth(); // extract user identity from Firebase Authentication and loading flag to check if Firebase is done verifying that user is logged in
  const router = useRouter();
  
  useEffect(() => {
    // if firebase is done verifying whether user is logged in, and the user isn't logged in, redirect them to login page
    if (!loading && !user) {
      const isAuthPage = router.pathname.startsWith("/auth");
      if (!isAuthPage) router.push("/auth/login");
      
    }
  }, [user, loading, router]);

  // while waiting for authentication, return a loading page
  if (loading) {
    return <Spinner />
  }

  // if we're on a page that requires the user to be logged in, and there isn't a user, return null causing a redirect
  if (!user && !router.pathname.startsWith("/auth")) return null;

  return <>{children}</>;
}