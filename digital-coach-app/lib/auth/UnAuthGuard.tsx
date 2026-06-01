import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import Spinner from "@App/components/atoms/Spinner"

/**
 * Prevents users who have an account (regardless of whether they completed their profile) from accessing the account creation pages, i.e. /signup and /login pages.
 * 
 * Users with completed profiles get redirected to the homepage. 
 * Users with incomplete profiles get redirected to /register.
 */
export default function UnAuthGuard({children} : {children: React.ReactNode}) {
  const {user, userData, loading} = useAuth(); // extract relevant user data
  const router = useRouter();

  useEffect(() => {
    // if loading is done and we have a user, redirect them from public pages, e.g. login/register
    if (!loading && user) {
      // redirect based on profile status


      // user is logged in but profile is incomplete
      if (userData && !userData.registrationCompletedAt) {
        router.replace("/auth/register");
      } else {
        // user is logged in and fully registered
        router.replace("/");
      }
    }
  }, [user, userData, loading, router]);

  // while waiting for firebase to check whether user is logged in or if user is found, show loading page until redirection above occurs
  if (loading || user) { 
    return <Spinner />
  };

  // only render children if we can't find the user
  return <>{children}</>
}