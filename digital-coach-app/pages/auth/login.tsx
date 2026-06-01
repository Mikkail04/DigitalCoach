import { SubmitHandler, useForm } from "react-hook-form";
import Button from "@App/components/atoms/Button";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import styles from "@App/styles/LoginPage.module.scss";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import UnAuthGuard from "@App/lib/auth/UnAuthGuard";
import { TextField } from "@App/components/molecules/TextField";
import LoginIcon from "@mui/icons-material/Login";
import CenteredComponent from "@App/components/atoms/CenteredComponent";
import { useEffect } from "react";

interface LoginFormInputs {
  email: string;
  password: string;
}

const inputValidationSchema = yup
  .object({
    email: yup
      .string()
      .email("Must be a valid email")
      .max(255)
      .required("Email is required"),
    password: yup.string().min(8).max(16).required("Password is required"),
  })
  .required();

export default function LoginPage() {

  const {
    error: authError,
    clearError,
    login,
  } = useAuth();

  useEffect(() => {
    clearError();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors: formError },
  } = useForm<LoginFormInputs>({
    mode: "onSubmit",
    resolver: yupResolver(inputValidationSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = (data: LoginFormInputs) => {
    clearError();
    const { email, password } = data;
    login(email, password);
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
              <h2>Login</h2>
              <p className={styles.helperText}>
                Sign in with your email and password to continue your practice.
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

            <Button type="submit">
              <LoginIcon />
              Login
            </Button>

            <p className={styles.footerText}>
              New user? <Link href="/auth/signup">Create an account</Link>
            </p>
          </form>
        </div>
      </CenteredComponent>
    </UnAuthGuard>
  );
}
