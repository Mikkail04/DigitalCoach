import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "@App/styles/interview/Results.module.scss";
import { IInterview } from "@App/lib/interview/models"
import { Calendar, Clock, Star, BookOpenText, Crown, Heart, CirclePlus } from "lucide-react";

/**
 * Webpage for a specific interview. 
 * @returns Webpage that displays the interview-related results
 */
export default function InterviewResults() {
    const router = useRouter();
    const [interview, setInterview] = useState<IInterview>();
    // THIS DATA IS TEMPORARY UNTIL WE IMPLEMENT THE FUNCTION TO READ THE INTERVIEWS FROM FIREBASE
    const mockData = {
        "id": "vsoSA7V72JFdBPMLJL29",
        "date": "03/04/2024",
        "timeStarted": "20:30",
        "duration": "5m 30s",
        "feedback": {
            ai_feedback: "Your enthusiasm was evident, and you established a great rapport early on. You used the STAR method effectively for behavioral questions, but your technical answers were slightly vague. Next time, focus more on specific metrics to quantify your past achievements, and try to pause briefly before answering complex questions to gather your thoughts.",
            overall_competency: {
                clarity: {
                    score: 8,
                    summary: "Excellent pacing at 150 WPM; your delivery was very clear and easy to follow.",
                },
                confidence: {
                    score: 10,
                    summary: "You had approximately 10 filler words or hedge phrases per minute, but you projected strong confidence throughout your interview!",
                },
                engagement: {
                    score: 9,
                    summary: "Great job varying your tone with 98% of your responses being expressive! You used 10 high-value keywords effectively in your responses.",
                },
                star: {
                    score: 88,
                    summary: "To elevate your solid foundation, focus on quantifying your 'Result' with concrete metrics and explicitly highlighting your individual contributions rather than just the team's effort during the 'Action' phase."
                }
            }
        },
        "metrics": {
            "filler_count": 2,
            "overall_score": 99,
            "wpm": 100,

        },
        "transcript": [],
        "url": "google.com",
        sentiment: undefined,
    }
    
    useEffect(() => {
        setInterview(mockData);
        alert("We haven't implemented the logic needed to retrieve interview data from the backend. Thus, the data seen here is mock data and doesn't reflect the actual interview's data.")
    }, []);

    /**
     * Gets the interview document using its id from the URL.
     */
    const getInterview = async () => {

    }

    /**
     * Converts an interview's duration HH:MM into HHh and MMm
     * @param duration 
     */
    const formatDuration = (duration: string) => {

    }

    return (
        <div className={styles.performanceResults}>
            <div className={styles.resultsContainer}>
                {/* Overall Score */}
                <div className={styles.overallScore}>
                    <h1>Interview Performance</h1>
                    <div className={styles.scoreDisplay}>
                        <div className={styles.scoreValue}>
                            {interview?.metrics?.overall_score}
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
                                {interview?.feedback?.overall_competency.star.score}
                            </span>
                        </div>
                        <p className={styles.feedbackText}>{interview?.feedback?.overall_competency.star.summary}</p>
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
                                {interview?.feedback?.overall_competency.clarity.score}
                            </span>
                        </div>
                        <p className={styles.feedbackText}>
                            {interview?.feedback?.overall_competency.clarity.summary}
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
                            <div className={styles.scoreText}>{interview?.feedback?.overall_competency.confidence.score}    
                            </div>
                        </div>
                        <p className={styles.feedbackText}>
                            {interview?.feedback?.overall_competency.confidence.summary}
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
                                {interview?.feedback?.overall_competency.engagement.score}
                            </div>
                        </div>
                        <p className={styles.feedbackText}>
                            {interview?.feedback?.overall_competency.engagement.summary}
                        </p>
                    </div>
                </div>

                {/* Transcript */}

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
    )
}