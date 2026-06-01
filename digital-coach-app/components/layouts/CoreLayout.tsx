import Head from "next/head";
import styles from "./layout.module.scss";
import { PropsWithChildren } from "react";
import NavBar from "../organisms/NavBar";
import { useAuth } from "@App/lib/auth/AuthContextProvider";

export const siteTitle = "Digital Coach";

export default function CoreLayout({ children }: PropsWithChildren<{}>) {
  const auth = useAuth();

  return (
    <>
      <Head>
        <title>Digital Coach</title>
        <meta name="description" content="Senior Design" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.page_container}>
        {auth.userData && <NavBar />}
        <div className={styles.container}>
          <Head>
            <title>{siteTitle}</title>
          </Head>

          <main className={styles.mainContainer}>{children}</main>
        </div>
      </div>
    </>
  );
}
