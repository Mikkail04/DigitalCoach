import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "@App/styles/interview/Results.module.scss";
import { IInterview } from "@App/lib/interview/models"
import { Calendar, Clock, Star, BookOpenText, Crown, Heart, Sparkles } from "lucide-react";
import Spinner from "@App/components/atoms/Spinner";
import AuthGuard from "@App/lib/auth/AuthGuard";
import { useParams } from "next/navigation";
import { useAuth } from "@App/lib/auth/AuthContextProvider";

/**
 * Webpage for a specific interview. 
 * @returns Webpage that displays the interview-related results
 */
export default function InterviewResults() {
    const params = useParams<{id: string}>();
    const router = useRouter();
    const [isLoading, setLoading] = useState(true);
    const [isReady, setReady] = useState(false); // flag representing whether the interview is "ready", i.e. it's done being analyzed
    const [interview, setInterview] = useState<IInterview | undefined>(undefined);
    const { user } = useAuth();

    useEffect(() => {
        const host = process.env.NEXT_PUBLIC_HOST;
        const getInterview = async () => {
            const interviewId = params.id.trim();
            try {
                const response = await fetch(`${host}/api/interview/${user!.uid}/${interviewId}`);
                if (response.ok) {
                    console.log("Successfully fetched interview!");
                    const data = await response.json();
                    const { interview } = data;
                    // check if interview is done being analyzed
                    if (interview.is_analyzed) {
                        setInterview(interview);
                        setLoading(false);
                        setReady(true)
                    }
                } else {
                    throw `Error ${response.statusText || "Something went wrong"}`;
                }
            } catch (e) {
                throw `Error getting interview=${interviewId}: ${e}`;
            }
        };
        
        // since we currently use the Next.js Page router, the query parameter (id) isn't available until the Page router is ready
        if (router.isReady && user) {
            getInterview();
        }
    }, [router.isReady, user]);

    if (isLoading) {
        return (
            <AuthGuard>
                <Spinner message={isReady
                    ? "Getting interview..."
                    : "Interview undergoing analysis. Please come back later."}/>
            </AuthGuard>
        )
    }
    return (
        <AuthGuard>
            <div className={styles.performanceResults}>
                <div className={styles.resultsContainer}>
                    {/* Overall Score */}
                    <div className={styles.overallScore}>
                        <h1>Interview Performance</h1>
                        <div className={styles.scoreDisplay}>
                            <div className={styles.scoreValue}>
                                <p>
                                    {interview && interview.metrics?.overall_score != undefined
                                        ? interview.metrics?.overall_score
                                        : 0 
                                    }
                                </p>
                            </div>
                            <p className={styles.scoreLabel}>Overall Score</p>
                        </div>
                        <div className={styles.metadata}>
                            <div className={styles.metadataItem}>
                                <Calendar/>
                                <span>{interview?.date}</span>
                            </div>
                            <div className={styles.metadataItem}>
                                <Clock/>
                                <span>{interview?.duration}</span>
                            </div>
                        </div>
                    </div>

                    {/* Overall Feedback */}
                    <div className={styles.overallFeedback}>
                        <div className={styles.feedbackHeader}>
                            <Sparkles className={styles.feedbackIcon}/>
                            <h2>Overall Feedback</h2>
                        </div>
                        <div className={styles.feedbackContent}>
                            <p>
                                {interview && interview.feedback?.ai_feedback
                                    ? interview.feedback.ai_feedback
                                    : "Feedback not available."}
                            </p>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className={styles.metricsGrid}>
                        {/* STAR Method */}
                        <div className={styles.metricCard}>
                            <div className={styles.metricHeader}>
                                <div className={styles.metricIcon}>
                                    <Star/>
                                </div>
                                <div className={styles.metricInfo}>
                                    <h3>STAR Method</h3>
                                    <p>Structure Quality</p>
                                </div>
                            </div>

                            <div className={styles.scoreBadge}>
                                <span className={styles.scoreText}>
                                    {interview && interview.feedback?.overall_competency.star.score != undefined
                                        ? interview.feedback.overall_competency.star.score
                                        : 0
                                    }
                                </span>
                                <p>/10</p>
                            </div>
                            <p className={styles.feedbackText}>
                                {interview && interview.feedback?.overall_competency.star.summary
                                    ? interview.feedback.overall_competency.star.summary
                                    : "Feedback not available."
                                }
                            </p>
                        </div>

                        {/* Pacing Score */}
                        <div className={styles.metricCard}>
                            <div className={styles.metricHeader}>
                                <div className={styles.metricIcon}>
                                    <BookOpenText/>
                                </div>
                                <div className={styles.metricInfo}>
                                    <h3>Clarity</h3>
                                    <p>Speech Rate</p>
                                </div>
                            </div>

                            <div className={styles.scoreBadge}>
                                <span className={styles.scoreText}>
                                    {interview && interview.feedback?.overall_competency.clarity.score != undefined
                                        ? interview.feedback.overall_competency.clarity.score
                                        : 0
                                    }
                                </span>
                                <p>/10</p>
                            </div>
                            <p className={styles.feedbackText}>
                                {interview && interview.feedback?.overall_competency.clarity.summary
                                    ? interview.feedback.overall_competency.clarity.summary
                                    : "Feedback not available."
                                }
                            </p>
                        </div>

                        {/* Filler Words */}
                        <div className={styles.metricCard}>
                            <div className={styles.metricHeader}>
                                <div className={styles.metricIcon}>
                                    <Crown/>
                                </div>
                                <div className={styles.metricInfo}>
                                    <h3>Confidence</h3>
                                    <p>Filler/Hedge Words</p>
                                </div>
                            </div>
                            <div className={styles.scoreBadge}>
                                <span className={styles.scoreText}>
                                    {interview && interview.feedback?.overall_competency.confidence.score != undefined
                                        ? interview.feedback.overall_competency.confidence.score
                                        : 0
                                    }    
                                </span>
                                <p>/10</p>
                            </div>
                            <p className={styles.feedbackText}>
                                {interview && interview.feedback?.overall_competency.confidence.summary
                                    ? interview.feedback.overall_competency.confidence.summary
                                    : "Feedback not available."
                                }
                            </p>
                        </div>

                        {/* Sentiment/Engagement */}
                        <div className={styles.metricCard}>
                            <div className={styles.metricHeader}>
                                <div className={styles.metricIcon}>
                                    <Heart/>
                                </div>
                                <div className={styles.metricInfo}>
                                    <h3>Engagement</h3>
                                    <p>Emotional Tone</p>
                                </div>
                            </div>
                            <div className={styles.scoreBadge}>
                                <div className={styles.scoreText}>
                                    {interview && interview.feedback?.overall_competency.engagement.score != undefined
                                        ? interview.feedback.overall_competency.engagement.score
                                        : 0
                                    }
                                </div>
                                <p>/10</p>
                                    
                            </div>
                            <p className={styles.feedbackText}>
                                {interview && interview.feedback?.overall_competency.engagement.summary
                                    ? interview.feedback.overall_competency.engagement.summary
                                    : "Feedback not available."
                                }
                            </p>
                            <p>Overall Sentiment:  
                                {interview && interview.sentiment
                                    ? ` ${interview.sentiment.toString()}`
                                    : " Inconclusive"
                                }
                            </p>
                        </div>
                    </div>

                    {/* Insert Transcript Here */}

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                        <button
                            onClick={() => router.push("/naturalconversation")}
                            className={styles.practiceButton}
                        >
                        Practice Again  
                        </button>
                        <button
                            onClick={() => router.push("/progress")}
                            className={styles.viewHistory}>
                            View All Interviews
                        </button>
                    </div>
                </div>    
            </div>
        </AuthGuard>

    )
}
