// import AuthGuard from "@App/lib/auth/AuthGuard";
// // import styles from "@App/styles/ProgressPage.module.scss";
// import styles from "@App/styles/HistoryPage.module.scss";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Award, Target, TrendingUp, Calendar, Clock, ChevronRight } from "lucide-react";
// import { doc, getDoc } from "firebase/firestore";
// import { IInterview } from "@App/lib/interview/models"


// export default function ProgressPage() {
//     const [interviews, setInterviews] = useState<IInterview[]>([]); // stores an array of all the user's interviews
//     const [averageScore, setAverageScore] = useState<number>(100); // user's average score across all interview performances
//     const [improvement, setImprovement] = useState<number>(100); // how much the user has improved overtime
//     const router = useRouter();

//     // THIS DATA IS TEMPORARY UNTIL WE IMPLEMENT THE FUNCTION TO READ THE INTERVIEWS FROM FIREBASE
//     const mockData = {
//         "id": "vsoSA7V72JFdBPMLJL29",
//         "date": "03/04/2024",
//         "timeStarted": "20:30",
//         "duration": "5m 30s",
//         "feedback": {
//             ai_feedback: "Your enthusiasm was evident, and you established a great rapport early on. You used the STAR method effectively for behavioral questions, but your technical answers were slightly vague. Next time, focus more on specific metrics to quantify your past achievements, and try to pause briefly before answering complex questions to gather your thoughts.",
//             overall_competency: {
//                 clarity: {
//                     score: 8,
//                     summary: "Excellent pacing at 150 WPM; your delivery was very clear and easy to follow.",
//                 },
//                 confidence: {
//                     score: 10,
//                     summary: "You had approximately 10 filler words or hedge phrases per minute, but you projected strong confidence throughout your interview!",
//                 },
//                 engagement: {
//                     score: 9,
//                     summary: "Great job varying your tone with 98% of your responses being expressive! You used 10 high-value keywords effectively in your responses.",
//                 },
//                 star: {
//                     score: 88,
//                     summary: "To elevate your solid foundation, focus on quantifying your 'Result' with concrete metrics and explicitly highlighting your individual contributions rather than just the team's effort during the 'Action' phase."
//                 }
//             }
//         },
//         "metrics": {
//             "filler_count": 2,
//             "overall_score": 99,
//             "wpm": 100,
//         },
//         "transcript": [],
//         "url": "google.com",
//         sentiment: undefined,
//     }

//     useEffect(() => {
//         setInterviews([...interviews, mockData, mockData])
//         alert("We haven't implemented the logic needed to retrieve interview data from the backend. Thus, the data seen here is mock data and doesn't reflect the actual interviews' data.")
//     }, [])

//     /**
//      * TODO: Fetch all of the user's interviews using the Firebase Client SDK.
//      */
//     const getInterviews = async () => {

//     }

//     /**
//      * TODO: Computes a user's improvement over time. This can be done in different ways, e.g. slope of linear regression. Currently using exponential moving average (EMA) where recent performance scores have more weight in computing the average which prioritizes the user's most recent capability to interview.
//      */
//     const calculateImprovement = () => {

//     }

//     /**
//      * TODO: Computes the user's average performance score.
//      */
//     const calculateAverage = () => {

//     }

//     /**
//      * Given an interview, create a button that navigates user to its results page on click.
//      * @param interview The interview the button is for
//      */
//     const createInterviewBtn = (interview: IInterview) => {
//         return (
//             <div key={interview.id} className={styles.interviewItem}>
//                 <div className={styles.itemContent}>
//                     <div className={styles.itemMain}>
//                         <div className={styles.itemPrimary}>
//                             <div className={styles.scoreBadge}>
//                                 <span className={styles.scoreValue}>
//                                     {interview.metrics?.overall_score ?? "-"}
//                                 </span>
//                             </div>

//                             <div className={styles.itemInfo}>
//                                 <div className={`${styles.infoRow} ${styles.date}`}>
//                                     <Calendar />
//                                     <span>
//                                         {new Date(`${interview.date} ${interview.timeStarted}`).toLocaleDateString("en-US", {
//                                             weekday: "long",
//                                             month: "2-digit",
//                                             day: "2-digit",
//                                             year: "numeric",
//                                             hour: "2-digit",
//                                             minute: "2-digit",
//                                         })}
//                                     </span>
//                                 </div>
//                                 <div className={`${styles.infoRow} ${styles.duration}`}>
//                                     <Clock />
//                                     <span>Duration: {interview.duration}</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className={styles.itemMetrics}>
//                             <div className={styles.metric}>
//                                 <div className={styles.metricHeader}>
//                                     <Award />
//                                     <span>STAR</span>
//                                 </div>
//                                 <span className={styles.metricValue}>
//                                     {interview.feedback?.overall_competency?.star?.score ?? "-"}
//                                 </span>
//                             </div>

//                             <div className={styles.metric}>
//                                 <div className={styles.metricHeader}>
//                                     <TrendingUp />
//                                     <span>Pacing</span>
//                                 </div>
//                                 <span className={styles.metricValue}>
//                                     {interview.metrics?.wpm ?? "-"}
//                                 </span>
//                             </div>

//                             <div className={styles.metric}>
//                                 <div className={styles.metricHeader}>
//                                     <Target />
//                                     <span>Fillers</span>
//                                 </div>
//                                 <span className={styles.metricValue}>
//                                     {interview.metrics?.filler_count ?? "-"}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Action buttons */}
//                     <div className={styles.itemActions}>
//                         <button
//                             onClick={() => router.push(`/interviews/${interview.id}`)}
//                             className={styles.viewBtn}
//                         >
//                             View
//                         </button>

//                         {interview.url && (
//                             <a
//                                 href={interview.url}
//                                 download={`interview-${interview.id}.mp4`}
//                                 className={styles.downloadBtn}
//                             >
//                                 Download
//                             </a>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <AuthGuard>
//             <div className={styles.ProgressPage}>
//                 <div className={styles.pageHeader}>
//                     <h1>Interview History</h1>
//                     <p>Track your interview results and performance over time.</p>
//                 </div>

//                 {/* Statistics */}
//                 {interviews.length > 0 && (
//                     <div className={styles.statisticsGrid}>
//                         {/* Interview Count */}
//                         <div className={styles.statCard}>
//                             <div className={styles.statHeader}>
//                                 <div className={styles.statIcon}>
//                                     <Award />
//                                 </div>

//                                 <h3>Total Interviews</h3>
//                             </div>
//                             <p className={styles.statValue}>{interviews.length}</p>
//                         </div>

//                         {/* Average Score */}
//                         <div className={styles.statCard}>
//                             <div className={styles.statHeader}>
//                                 <div className={styles.statIcon}>
//                                     <Target />
//                                 </div>
//                                 <h3>Average Score</h3>
//                             </div>
//                             <p className={styles.statValue}>{averageScore}</p>
//                         </div>

//                         {/* Overall Improvement */}
//                         <div className={styles.statCard}>
//                             <div className={styles.statHeader}>
//                                 <div className={styles.statIcon}>
//                                     <TrendingUp />
//                                 </div>
//                                 <h3>Momentum</h3>
//                             </div>
//                             <p className={styles.statValue}>{improvement}</p>
//                             <p className={styles.statLabel}>Improvement over time</p>
//                         </div>
//                     </div>
//                 )}

//                 {/* Interview List */}
//                 <div className={styles.interviewsList}>
//                     <div className={styles.listHeader}>
//                         <h2>Past Interviews</h2>
//                     </div>
//                 </div>

//                 {/* Handle case where there's no interview */}
//                 {interviews.length === 0 ? (
//                     <div className={styles.emptyState}>
//                         <div className={styles.emptyIcon}>
//                             <Award />
//                         </div>
//                         <h3>No interviews yet</h3>
//                         <p>
//                             Start your first interview to begin tracking your progress!
//                         </p>
//                         <button
//                             onClick={() => router.push("/naturalconversation")}>
//                             Start Interview
//                         </button>
//                     </div>
//                 ) : (
//                     // for every interview, create a button that navigates them to their individual results (i.e. /interviews/[id])
//                     <div className={styles.tableContainer}>
//                         {interviews.map((interview) => createInterviewBtn(interview))}
//                     </div>
//                 )}
//             </div>
//         </AuthGuard>
//     );
// }

// function ProgressInit() {
//   const { userData } = useAuth();
//   return (
//     <div className={styles.ProgressPage}>
//       <h1>Your Progress</h1>

//       <div className={styles.ProgressPage_avatarWrapper}>
//         {userData?.avatarUrl && (
//           <Avatar size={125} src={userData?.avatarUrl} />
//         )}
//       </div>

//       <div className={styles.ProgressPage_body}>
//         <div className={styles.ProgressPage_bodyLeft}>
//           <Card title="Initial Interview">
//             <Link href="/video" className={styles.linksText}>
//               Start an Interview
//             </Link>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Progress() {
//   //Store user's id here
//   const { userData } = useAuth();
//   let hasInterviewed = userData?.hasCompletedInterview;
//   //Add flag to user that says if they've completed an interview or not
//   if (hasInterviewed) {
//     return (
//       <AuthGuard>
//         <ProgressPage />
//       </AuthGuard>
//     );
//   } else {
//     return (
//       <AuthGuard>
//         <ProgressInit />
//       </AuthGuard>
//     );
//   }
// }
import AuthGuard from "@App/lib/auth/AuthGuard";
import styles from "@App/styles/HistoryPage.module.scss";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    Award,
    Target,
    TrendingUp,
    Calendar,
    Clock,
} from "lucide-react";
import {
    collection,
    getDocs,
    query,
    orderBy,
} from "firebase/firestore";
import { IInterview } from "@App/lib/interview/models";
import { db } from "@App/lib/firebase/firebase.config";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import Spinner from "@App/components/atoms/Spinner";

export default function ProgressPage() {
    const [interviews, setInterviews] = useState<IInterview[]>([]);
    const [averageScore, setAverageScore] = useState<number>(0);
    const [improvement, setImprovement] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const { user } = useAuth();

    /**
     * Fetch all interviews belonging to the logged-in user.
     */
    const getInterviews = async () => {
        if (!user) {
            setInterviews([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            const interviewsRef = collection(
                db,
                "users",
                user.uid,
                "interviews"
            );

            const interviewsQuery = query(
                interviewsRef,
                orderBy("date", "desc")
            );

            const snapshot = await getDocs(interviewsQuery);

            const fetchedInterviews: IInterview[] = snapshot.docs.map(
                (doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as IInterview)
            );

            setInterviews(fetchedInterviews);

            calculateAverage(fetchedInterviews);
            calculateImprovement(fetchedInterviews);
        } catch (error) {
            console.error("Failed to fetch interviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Computes the user's average overall interview score.
     */
    const calculateAverage = (data: IInterview[]) => {
        const scores = data
            .map((interview) => interview.metrics?.overall_score)
            .filter(
                (score): score is number =>
                    typeof score === "number"
            );

        if (scores.length === 0) {
            setAverageScore(0);
            return;
        }

        const average =
            scores.reduce((sum, score) => sum + score, 0) /
            scores.length;

        setAverageScore(Math.round(average));
    };

    /**
     * Calculates improvement from the first completed interview
     * to the most recent completed interview.
     */
    const calculateImprovement = (data: IInterview[]) => {
        const completed = data
            .filter(
                (interview) =>
                    typeof interview.metrics?.overall_score === "number"
            )
            .sort((a, b) => {
                const dateA = new Date(
                    `${a.date} ${a.timeStarted}`
                ).getTime();

                const dateB = new Date(
                    `${b.date} ${b.timeStarted}`
                ).getTime();

                return dateA - dateB;
            });

        if (completed.length < 2) {
            setImprovement(0);
            return;
        }

        const firstScore =
            completed[0].metrics!.overall_score;

        const latestScore =
            completed[completed.length - 1].metrics!.overall_score;

        if (firstScore === 0) {
            setImprovement(0);
            return;
        }

        const percentage =
            ((latestScore - firstScore) / firstScore) * 100;

        setImprovement(Math.round(percentage));
    };

    useEffect(() => {
        getInterviews();
    }, [user]);

    /**
     * Given an interview, create a button that navigates
     * to its results page.
     */
    const createInterviewBtn = (interview: IInterview) => {
        return (
            <div
                key={interview.id}
                className={styles.interviewItem}
            >
                <div className={styles.itemContent}>
                    <div className={styles.itemMain}>
                        <div className={styles.itemPrimary}>
                            <div className={styles.scoreBadge}>
                                <span className={styles.scoreValue}>
                                    {interview.metrics?.overall_score ?? "-"}
                                </span>
                            </div>

                            <div className={styles.itemInfo}>
                                <div
                                    className={`${styles.infoRow} ${styles.date}`}
                                >
                                    <Calendar />
                                    <span>
                                        {new Date(
                                            `${interview.date} ${interview.timeStarted}`
                                        ).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            month: "2-digit",
                                            day: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>

                                <div
                                    className={`${styles.infoRow} ${styles.duration}`}
                                >
                                    <Clock />
                                    <span>
                                        Duration: {interview.duration}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.itemMetrics}>
                            <div className={styles.metric}>
                                <div className={styles.metricHeader}>
                                    <Award />
                                    <span>STAR</span>
                                </div>

                                <span className={styles.metricValue}>
                                    {interview.feedback
                                        ?.overall_competency
                                        ?.star?.score ?? "-"}
                                </span>
                            </div>

                            <div className={styles.metric}>
                                <div className={styles.metricHeader}>
                                    <TrendingUp />
                                    <span>Pacing</span>
                                </div>

                                <span className={styles.metricValue}>
                                    {interview.metrics?.wpm ?? "-"}
                                </span>
                            </div>

                            <div className={styles.metric}>
                                <div className={styles.metricHeader}>
                                    <Target />
                                    <span>Fillers</span>
                                </div>

                                <span className={styles.metricValue}>
                                    {interview.metrics?.filler_count ?? "-"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.itemActions}>
                        <button
                            onClick={() =>
                                router.push(
                                    `/interviews/${interview.id}`
                                )
                            }
                            className={styles.viewBtn}
                        >
                            View
                        </button>

                        {interview.url && (
                            <a
                                href={interview.url}
                                download={`interview-${interview.id}.mp4`}
                                className={styles.downloadBtn}
                            >
                                Download
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <AuthGuard>
                <Spinner message="Loading your interview history..." />
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className={styles.ProgressPage}>
                <div className={styles.pageHeader}>
                    <h1>Interview History</h1>
                    <p>
                        Track your interview results and performance over time.
                    </p>
                </div>

                {interviews.length > 0 && (
                    <div className={styles.statisticsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={styles.statIcon}>
                                    <Award />
                                </div>
                                <h3>Total Interviews</h3>
                            </div>

                            <p className={styles.statValue}>
                                {interviews.length}
                            </p>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={styles.statIcon}>
                                    <Target />
                                </div>
                                <h3>Average Score</h3>
                            </div>

                            <p className={styles.statValue}>
                                {averageScore}
                            </p>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <div className={styles.statIcon}>
                                    <TrendingUp />
                                </div>

                                <h3>Momentum</h3>
                            </div>

                            <p className={styles.statValue}>
                                {improvement > 0
                                    ? `+${improvement}%`
                                    : `${improvement}%`}
                            </p>

                            <p className={styles.statLabel}>
                                Improvement over time
                            </p>
                        </div>
                    </div>
                )}

                <div className={styles.interviewsList}>
                    <div className={styles.listHeader}>
                        <h2>Past Interviews</h2>
                    </div>
                </div>

                {interviews.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <Award />
                        </div>

                        <h3>No interviews yet</h3>

                        <p>
                            Start your first interview to begin tracking
                            your progress!
                        </p>

                        <button
                            onClick={() =>
                                router.push("/naturalconversation")
                            }
                        >
                            Start Interview
                        </button>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        {interviews.map(createInterviewBtn)}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}

