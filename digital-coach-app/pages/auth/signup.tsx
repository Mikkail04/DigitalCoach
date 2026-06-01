import { useForm } from "react-hook-form";
import Button from "@App/components/atoms/Button";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import styles from "@App/styles/LoginPage.module.scss";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { TextField } from "@App/components/molecules/TextField";
import Link from "next/link";
import UnAuthGuard from "@App/lib/auth/UnAuthGuard";
import CenteredComponent from "@App/components/atoms/CenteredComponent";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface LoginFormInputs {
  email: string;
  password: string;
  passwordConfirm: string;
}

const inputValidationSchema = yup
  .object({
    email: yup
      .string()
      .email("Must be a valid email")
      .max(255)
      .required("Email is required"),
    password: yup.string()
    .min(8, "Password must be at least 8 characters long")
    .max(16, "Password must be at most 16 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
    .test("no-spaces", "Password must not contain any spaces", (value) => !/\s/.test(value ?? ""))
    .required("Password is required"),
    passwordConfirm: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match"),
  })
  .required();

export default function SignUpPage() {
  const { error: authError, signup, clearError } = useAuth();
  useEffect(() => {
    clearError();
  }, []);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors: formError },
  } = useForm<LoginFormInputs>({
    mode: "onSubmit",
    resolver: yupResolver(inputValidationSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    const { email, password } = data;
    try {
      await signup(email, password);
      // clearError();
      // navigate to register page after signup
      router.push("/auth/register");
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };



  return (
    <UnAuthGuard>
      <CenteredComponent className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <div className={styles.logoBadge}>DC</div>
            </div>
            <h1>Digital Coach</h1>
            <p className={styles.subtitle}>AI-powered mock interview platform</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.titleBlock}>
              <h2>Register an Account</h2>
              <p className={styles.helperText}>
                Create an account with your email and password to get started.
              </p>
            </div>

            {authError && <p className={styles.issue}>{authError}</p>}

            <div className={styles.fieldGroup}>
              <h3>Email</h3>
              <TextField type="email" placeholder="" {...register("email")} />
              {formError.email && (
                <p className={styles.issue}>{formError.email.message}</p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <h3>Password</h3>
              <TextField
                type="password"
                autoComplete="on"
                placeholder=""
                {...register("password")}
              />
              {formError.password && (
                <p className={styles.issue}>{formError.password.message}</p>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <h3>Confirm Password</h3>
              <TextField
                type="password"
                autoComplete="on"
                placeholder=""
                {...register("passwordConfirm")}
              />
              {formError.passwordConfirm && (
                <p className={styles.issue}>
                  {formError.passwordConfirm.message}
                </p>
              )}
            </div>

            <Button type="submit">
              <HowToRegIcon />
              Register
            </Button>

            <p className={styles.footerText}>
              Have an account? <Link href="/auth/login">Log in</Link>
            </p>
          </form>
        </div>
      </CenteredComponent>
    </UnAuthGuard>
  );
}
