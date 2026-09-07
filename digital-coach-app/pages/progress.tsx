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

