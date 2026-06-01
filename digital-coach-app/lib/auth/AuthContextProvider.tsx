import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode
} from "react";

import {
    User, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";

import { auth } from "@App/lib/firebase/firebase.config"; // import Firebase services from Firebase configuration
import { IUser } from "@App/lib/user/models";
import { getUser, createUser } from "@App/lib/user/UserService";

// define the shape of our authentication context
interface AuthContextType {
    user: User | null; // Firebase Auth user
    userData : IUser | null; // Firebase Firestore user profile
    loading: boolean; // flag used when checking if user is logged in, i.e. tells the app to "wait" until firebase is done verifying whether user is logged in
    login: (email: string, pass: string) => Promise<void>; // user login function
    signup: (email: string, pass: string) => Promise<void>; // user signup function
    logout: () => Promise<void>;
    error: string | null; // user logout function
    clearError: () => void;
}

// initialize new authentication context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Enables other components access to authentication data based on AuthContext.
 * @returns Authentication Context 
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be within an AuthProvider.");
    return context;
}

/**
 * Return user-friendly error messages based on given error object returned from Firebase Authentication service calls.
 */
export function getAuthErrorMessage(error: { code?: string; message?: string }): string {
  const code = error?.code ?? "";
  const messages: Record<string, string> = {
    "auth/invalid-credential": "Invalid email or password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "This email is already registered. Try logging in or use a different email.",
    "auth/weak-password": "Password is too weak. Use at least 8 characters with upper and lowercase letters, a number, and a special character.",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Please contact support.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
  };
  return messages[code] ?? "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: {children: ReactNode}) {

  const [user, setUser] = useState<User | null>(null); // firebase authentication user identity
  const [userData, setUserData] = useState<IUser | null>(null); // firebase firestore user identity
  const [loading, setLoading] = useState(true); // before redirects, wait and check if user is logged in
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Listener performs session handling, i.e. checks whether user is logged in. This is called whenever authentication state has changed
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser); // update firebase authentication as soon as authentication state changes
    
        if (firebaseUser) {
            // logged in, retrieve user data from firestore
            try {
                const userData = await getUser(firebaseUser.uid);
                // cast user data as our defined IUser model
                setUserData(userData as IUser);

            } catch (e) {
                console.error(`Error fetching user profile: ${e}`);
            }
        } else {
            // not logged in
            setUserData(null);
        }
        setLoading(false); // we're done verifying whether user is logged in
    });
    return () => unsubscribe();
  }, []);

  /**
   * Handles logging in the user given an email and password.
   */
  const login = async (email: string, pass: string) => {
    setError(""); // set error to empty
    
    try {
        email = email.trim();
        pass = pass.trim();
        // log in user, we don't have to update user here since onAuthStateChanged will be triggered
        await signInWithEmailAndPassword(auth, email, pass);

    } catch (e: any) {
        setError(getAuthErrorMessage(e)); // update error message using our predefined user-friendly error messages
    }
  }

  /**
   * Handles user signup.
   */
  const signup = async (email: string, pass: string) => {
    setError(""); // set error to empty
    try {
        email = email.trim();
        pass = pass.trim();
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await createUser(cred.user); // create user document and add it to Firestore database

        // onAuthStateChanged will handle updating userData
    } catch (e: any) {
        setError(getAuthErrorMessage(e));
        throw `Error signing up: ${getAuthErrorMessage(e)}`;
    }
  };

  /**
   * Handles user logout.
   */
  const logout = async () => {
    setError(""); // initialize empty error
    try {
        await signOut(auth);
    } catch (e: any) {
        setError(getAuthErrorMessage(e));
    }
  };

  /**
   * Clears out current authentication error.
   */
  const clearError = () => {
    setError("");
  };

  const value = {
    user, 
    userData,
    loading,
    login,
    signup,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>;
};
