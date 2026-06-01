import AuthGuard from "@App/lib/auth/AuthGuard";
import styles from "@App/styles/HistoryPage.module.scss";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, Target, TrendingUp, Calendar, Clock, ChevronRight } from "lucide-react";
import { IInterview } from "@App/lib/interview/models"
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import Spinner from "@App/components/atoms/Spinner";
import { Tooltip, IconButton } from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function ProgressPage() { 
  const [interviews, setInterviews] = useState<IInterview[]>([]); // stores an array of all the user's interviews (the data function we use returns the list in descending chronological order)
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const { user } = useAuth();
  const windowSize = 3; // number of interviews that will contribute to SMA

  // Get user's analyzed interview from database 
  useEffect(() => {
    /**
     *  Fetch all of the user's analyzed interviews using the Firebase Client SDK.
     */
    const getInterviews = async () => {
      try {
        const host = process.env.NEXT_PUBLIC_HOST;

        const response = await fetch(`${host}/api/interview/${user?.uid}`);
        if (response.ok) {
          console.log("Successfully fetched interviews!");
          const data = await response.json();
          setInterviews(data);
          setLoading(false);
        } else {
          throw `Error: ${response.statusText || "Something went wrong"}`;
        }
      } catch (e) {
        throw `Error getting interviews: ${e}`;
      }
    };
    // wait until user context is loaded before getting interviews
    if (user) {
      getInterviews();
    }
    
  }, [user]);

  /**
   * Computes a user's improvement over time. This can be done in different ways, e.g. slope of linear regression, exponential moving average (EMA).
   * 
   * Currently we're returning the simple moving average (SMA) of the user's 3 most recent overall interview scores. This prioritizes the user's most recent capability to interview. 
   * 
   * We can assume the interviews are in descending chronological order because of the implementation of the database function used to get the interviews.
   */
  const calculateImprovement = () => {
    if (interviews.length === 0) return 0;
    let currSMA = 0; 
    // iterate over most recent interviews to compute SMA
    const scoreWindow = interviews.slice(0, windowSize);

    scoreWindow.forEach((interview) => {
      if (interview.metrics && interview.metrics.overall_score) {
        currSMA += interview.metrics.overall_score;
      }
    });
    
    return Math.ceil(currSMA / scoreWindow.length); // divide by the number of interviews actually computed in case there aren't enough to fit the window size
  }

  /**
   * Compute the user's arithmetic average interview performance score.
   */
  const calculateAverage = () => {
    if (interviews.length) {
      let sum = 0; 
      for (const interview of interviews) {
        sum += interview.metrics!.overall_score
      }
      return Math.floor(sum / interviews.length);
    } else {
      return 0;
    }
  }

  /**
   * Given an interview, create a button that navigates user to its results page on click.
   * @param interview The interview the button is for
   */
  const createInterviewBtn = (interview: IInterview) => {
    if (interview == undefined || interview.metrics.overall_score == undefined) {
      return;
    }
    const btn = <button
      key={interview.id} // identifier for button within an array of buttons
      onClick={() => router.push(`/interviews/${interview.id}`)}
      className="interview-item"
      >

      <div className={styles.itemContent}>
        <div className={styles.itemMain}>
          <div className={styles.itemPrimary}>
            <div className={styles.scoreBadge}>
              <span className={styles.scoreValue}>
                {interview.metrics.overall_score}
              </span>
            </div>

            <div className={styles.itemInfo}>
              <div className={`${styles.infoRow} ${styles.date}`}>
                <Calendar/>
                <span>
                  {interview.timeStarted}
                </span>
              </div>
              <div className={`${styles.infoRow} ${styles.duration}`}>
                <Clock/>
                <span>
                  Duration: {interview.duration}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.itemMetrics}>
            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <Award/>
                <span>STAR</span>
              </div>
              <span className={styles.metricValue}>
                  {interview.feedback.overall_competency.star.score}
              </span>
            </div>
                
            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <TrendingUp/>
                <span>Pacing</span>
              </div>
              <span className={styles.metricValue}>
                {interview.metrics.wpm}
              </span>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <Target/>
                <span>Fillers</span>
              </div>
              <span className={styles.metricValue}>
                {interview.metrics.filler_count}
              </span>
            </div>
          </div>
        </div>

        <ChevronRight className={styles.chevronIcon}/>
      </div>
    </button>

    return btn;
  }
  
  if (isLoading) {
    return (
      <AuthGuard>
        <Spinner message="Getting interviews..."/>
      </AuthGuard>
    ) 
  }
  return (
    <AuthGuard>
      <div className={styles.ProgressPage}>
        <div className={styles.pageHeader}>
          <h1>Interview History</h1>
          <p>Track your interview results and performance over time. Some interviews may not appear as they're being analyzed.</p>
        </div>

        {/* Statistics */}
        {interviews.length > 0 && (
          <div className={styles.statisticsGrid}>
            {/* Interview Count */}
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon}>
                  <Award/>
                </div>

                <h3>Total Interviews</h3>
              </div>
              <p className={styles.statValue}>{interviews.length}</p>
            </div>

            {/* Average Score */}
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon}>
                  <Target/>
                </div>
                <h3>Average Score</h3>
              </div>
              {/* user's average score across all interview performances */}
              <p className={styles.statValue}>{interviews && calculateAverage()}</p>
            </div>

            {/* Overall Improvement */}
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
               <div className={styles.statIcon}>
                  <TrendingUp/>
                </div> 
                <h3>Momentum</h3>
              </div>
                {/* how much the user has improved overtime  */}
                <p className={styles.statValue}>{interviews && calculateImprovement()}</p>
                <div className={styles.stateLabelWrapper}>
                  <span className={styles.statLabel}>
                    Most Recent Improvement ({windowSize}-IMA)
                  </span>
                  <Tooltip title={`${windowSize}-Interview Moving Average (3IMA) of the overall scores from your ${windowSize} most recent interviews. Moving average will be equal to average score if there aren't enough interviews.`} placement="top">
                    <IconButton size="small" className={styles.tooltipBtn}>
                      <HelpOutlineIcon fontSize="inherit" className={styles.tooltipIcon} />
                    </IconButton>
                  </Tooltip>

                </div>
            </div>
          </div>
        )}

        {/* Interview List */}
        <div className={styles.interviewsList}>
          <div className={styles.listHeader}>
            <h2>Past Interviews</h2>
          </div>
        </div>

        {/* Handle case where there's no interview */}
        {interviews.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Award/>
            </div>
            <h3>No interviews yet</h3>
            <p>
              Start your first interview to begin tracking your progress!
              </p>
              <button
                onClick={() => router.push("/naturalconversation")}>
                  Start Interview
                </button>
          </div>
        ) : (
          // for every interview, create a button that navigates them to their individual results (i.e. /interviews/[id])
          <div className={styles.tableContainer}>
              {interviews.map((interview) => createInterviewBtn(interview))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}