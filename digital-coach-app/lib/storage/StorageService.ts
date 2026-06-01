/**
 * Collection of functions for Firebase Storage. THIS IS STRICTLY FOR LOCAL DEVELOPMENT AS OUR PRODUCTION VERSION USES CLOUDINARY FOR MEDIA HOSTING
 */
import {
  ref, 
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid"; 
import { storage } from "@App/lib/firebase/firebase.config"; // import firebase storage service from firebase configuration

export enum EStorageFolders {
  profilePic = "profilePic",
  videos = "videos",
}

/**
 * Uploads a given file to a specific folder in Firebase Storage and returns the download URL.
 */
export async function uploadFile(file: File, folder: EStorageFolders, filename: string = uuidv4()) {
  const fileRef = ref(storage, `${folder}/${filename}`);
  await uploadBytes(fileRef, file, { contentType: file.type});
  return getDownloadURL(fileRef);
}

/**
 * Uploads a video to Firebase Storage and returns the download URL. 
 */
export async function uploadAnswerVideo(file: File | Blob | ArrayBuffer, interviewId: string) {
  const videoRef = ref(storage, `interview-responses/${interviewId}.mp4`);
  await uploadBytes(videoRef, file, { contentType: "video/mp4"});
  return getDownloadURL(videoRef);
}