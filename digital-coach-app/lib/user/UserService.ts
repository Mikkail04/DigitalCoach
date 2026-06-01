/**
 * Collection of Firestore functions for interacting with the users collection. Example: Creating a user.
 */
import {
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import { User as FirebaseUser } from "firebase/auth";
import { db } from "@App/lib/firebase/firebase.config";
import { IUser, IBaseUserAttributes } from "@App/lib/user/models"; 


/**
 * Fetch user document with given id from Firebase Firestore. Returns data only if the user document exists.
 */
export async function getUser(userId: string) {
  userId = userId.trim();
  const snap = await getDoc(doc(db, 
    "users", userId));
  if (!snap.exists()) {
    throw `User with id=${userId} doesn't exist.`;
  }
  return snap.data();
};

/**
 * Creates the initial user document in Firestore after signup has been completed. Returns a reference to that document.
 */
export async function createUser(user: FirebaseUser) {
  const newUser: IUser = {
    id: user.uid,
    email: user.email || "",
    name: "",
    avatarURL: "",
    concentration: null,
    proficiency: null,
    registrationCompletedAt: null,
    createdAt: Timestamp.now(),
    hasCompletedInterview: false,
  };

  return setDoc(doc(db, "users", user.uid), newUser);
};

/**
 * Updates the user's profile when they completed the registration process.
 */
export async function registerUser(userId: string, userDetails: IBaseUserAttributes) {
  return await updateDoc(doc(db, "users", userId), {
    ...userDetails,
    registrationCompletedAt: Timestamp.now(),
    hasCompletedInterview: false,
  })
};

/**
 * Updates user attributes and marks interview as complete.
 */
export async function updateUser(userId: string, userDetails: IBaseUserAttributes) {
  return updateDoc(doc(db, "users", userId), {
    ...userDetails,
    hasCompletedInterview: true,
  });
}