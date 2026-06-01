/**
 * Handles uploading an image that will be hosted in Cloudinary.
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
    // const host = typeof window !== "undefined" ? "http://localhost:8000" : "api";
    // console.log(`profilePic.ts: ${host}`);
    const host = process.env.NEXT_PUBLIC_HOST;
    const cloudinaryURL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    const api_key = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const MAX_FILE_SIZE = 10485760; // Cloudinary has a max file size on the free plan


    if (!api_key) throw `Missing Cloudinary API key.`;
    if (file.size > MAX_FILE_SIZE) {
        throw `File size is too large. Maximum size is 10MB.`;
    }

    console.log("Uploading to Cloudinary...");
    // get the signature and timestamp needed by Cloudinary for signed upload 
    const apiResponse = await fetch(`${host}/api/user/profilePic`); 
    const { signature, timestamp } = await apiResponse.json(); // extract signature and timestamp

    const formData = new FormData(); // create the form data needed for Cloudinary Upload API request
    formData.append("file", file); // add the file to upload
    formData.append("api_key", api_key);
    formData.append("timestamp", timestamp)
    formData.append("signature", signature);
    // formData.append("upload_preset", `${process.env.NEXT_PUBLIC_UPLOAD_PRESET}`); // upload preset defined in Cloudinary console (optional for signed uploads)
    try {
        const cloudResponse = await fetch(cloudinaryURL, {
            method: "POST",
            body: formData
        });
        
        const data = await cloudResponse.json();
        if (cloudResponse.ok) {
            console.log("Upload successful");
            return data.secure_url;
        } else {
            console.error(`Upload failed: ${data.error.message}`);
            throw `Cloudinary upload failed: ${data.error.message}`;
        }
    } catch (e) {
        throw `Error uploading to Cloudinary: ${e}`;
    }
}