import Link from "next/link";
import Button from "../atoms/Button";
import style from "./Navbar.module.scss";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function NavBar() {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    // <div className={style.main}>
    //   <div className={style.barcontainer}>
    //     <Link href="/" className={style.logo_text}>
    //       Digital Coach
    //     </Link>
    //     <div className={style.links}>
    //       <Link href="/" className={style.linksText}>
    //         Dashboard
    //       </Link>
    //       <Link href="/video" className={style.linksText}>
    //         Record a Mock Interview
    //       </Link>
    //       <Link href="/storytelling" className={style.linksText}>
    //         Practice Storytelling
    //       </Link>
    //       <Link href="/naturalconversation" prefetch={true} className={style.linksText}>
    //         Natural Conversation
    //       </Link>
    //       {/* <Link href='/start' className={style.linksText}>
    //         Start an Interview
    //       </Link> */}
    //       {/* <Link href='/past'>
    //         <a className={style.linksText}>Review Past Interviews</a>
    //       </Link> */}
    //       <Link href="/start/custom" className={style.linksText}>
    //         Create Custom Question Set
    //       </Link>
    //       {/*Here while developing, can be removed later if desired */}
    //       <Link href="/connections" className={style.linksText}>
    //         Connections
    //       </Link>
    //       <Link href="/progress" className={style.linksText}>
    //         Progress Tracking
    //       </Link>
    //       <Link href="/profile" className={style.linksText}>
    //         Profile
    //       </Link>
    //     </div>

    //     <Button onClick={logout} className={style.logout}>
    //       <LogoutIcon />
    //       <div>Log out</div>
    //     </Button>
    //   </div>
    // </div>
  <div className={`${style.main} ${menuOpen ? style.open : style.closed}`}>
    <div className={style.barcontainer}>
  <div className={style.topBar}>
  <Link href="/" className={style.logo_text}>
    Digital Coach
  </Link>

  <button
    className={style.mobileMenuButton}
    onClick={() => setMenuOpen(!menuOpen)}
    aria-label="Toggle navigation menu"
  >
    {menuOpen ? <X size={24}/> : <Menu size={24}/>}
  </button>
</div>

  <div
    className={`${style.links} ${
      menuOpen ? style.mobileMenuOpen : ""
    }`}
  >
    <Link href="/" className={style.linksText}>
      Dashboard
    </Link>

    {/* <Link href="/video" className={style.linksText}>
      Record a Mock Interview
    </Link>

    <Link href="/storytelling" className={style.linksText}>
      Practice Storytelling
    </Link> */}

    <Link
      href="/naturalconversation"
      prefetch={true}
      className={style.linksText}
    >
      Natural Conversation
    </Link>
{/* 
    <Link href="/start/custom" className={style.linksText}>
      Create Custom Question Set
    </Link>

    <Link href="/connections" className={style.linksText}>
      Connections
    </Link> */}

    <Link href="/progress" className={style.linksText}>
      Progress Tracking
    </Link>

    <Link href="/profile" className={style.linksText}>
      Profile
    </Link>

    <Button onClick={logout} className={style.mobileLogout}>
      <LogoutIcon />
      <div>Log out</div>
    </Button>
  </div>

  <Button onClick={logout} className={style.logout}>
    <LogoutIcon />
    <div>Log out</div>
  </Button>
</div>
</div>
  );
}
