import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import RegistrationGuard from "@App/lib/user/RegistrationGuard";
import Button from "@App/components/atoms/Button";
import { Select } from "@App/components/Select";
import styles from "@App/styles/RegisterPage.module.scss";
import {
  IBaseUserAttributes,
  EUserConcentrations,
  EUserProficiencies,
} from "@App/lib/user/models";
import { TextField } from "@App/components/molecules/TextField";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import { registerUser } from "@App/lib/user/UserService";
import { uploadFile, EStorageFolders } from "@App/lib/storage/StorageService";
import { uploadToCloudinary } from "@App/util/profilePic";

interface RegFormInputs extends IBaseUserAttributes {
  avatar: FileList;
}
const MAX_FILE_SIZE = 10485760; // Cloudinary has a max file size on the free plan

const inputValidationSchema = yup
  .object({
    name: yup.string().max(255).required("Name is required"),
    concentration: yup.string().max(255).required("Concentration is required"),
    proficiency: yup.string().max(255).required("Proficiency is required"),
    avatar: yup.mixed<FileList>().test("fileSize", "File size is too large. Maximum size is 10MB", (file) => {
      return file && file.length > 0 ? file[0].size <= MAX_FILE_SIZE : false;
    }),
  })
  .required();

export default function RegisterPage() {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors: formError, isSubmitting }, 
  } = useForm<RegFormInputs>({
    mode: "onSubmit",
    resolver: yupResolver(inputValidationSchema),
  });

  const onSubmit = async (data: RegFormInputs) => {
    if (!user) return;
    try {
      const { name, concentration, proficiency, avatar } = data;
      // upload avatar
      let avatarURL = "";
      const imageFile = avatar[0];
      // upload to Emulators or Cloudinary
      if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR == "true") {
        console.log("Uploading to Firebase Storage Emulator...");
        avatarURL = await uploadFile(
          imageFile,
          EStorageFolders.profilePic, // use profile picture folder
          user.uid, // use authentication ID for filename 
        );
      } else {
        console.log("Uploading to Cloudinary...");
        avatarURL = await uploadToCloudinary(imageFile);
      }

      // update firestore profile
      await registerUser(user.uid, {
        name,
        concentration,
        proficiency,
        avatarURL,
      });

      // refresh homepage to get updated profile data
      window.location.href = "/";

    } catch (e) {
      console.error("Registration failed", e);
      alert("Something went wrong. Please try again.");
    }
  };


  return (
    <RegistrationGuard>
      <div className={styles.registerBox}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <h1>Register</h1>

          <label>Select a profile picture:</label>
          <input type="file" id="profilePic" required accept="image/*" {...register("avatar")} />
          {formError.avatar && <span>{formError.avatar.message}</span>}

          <label>Enter your name:</label>
          <TextField placeholder="Full Name" {...register("name")}/>
          {formError.name && <span>{formError.name.message}</span>}

          <label>Select a concentration:</label>
          <Select {...register("concentration")}>
            {Object.values(EUserConcentrations).map((concentration) => (
              <option value={concentration} key={concentration}>
                {concentration}
              </option>
            ))}
            </Select>
          {formError.concentration && (
            <span>{formError.concentration.message}</span>
          )}

          <label>Select a proficiency:</label>
          <Select {...register("proficiency")}>
            {Object.values(EUserProficiencies).map((proficiency) => (
              <option value={proficiency} key={proficiency}>
                {proficiency}
              </option>
            ))}
          </Select>
          {formError.proficiency && (
            <span>{formError.proficiency.message}</span>
          )}
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing up..." : "Sign up" }
          </Button>
        </form>
      </div>
    </RegistrationGuard>
  );
}