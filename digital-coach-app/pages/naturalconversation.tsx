import { useState } from "react";
import AuthGuard from "@App/lib/auth/AuthGuard";
import { v4 as uuidv4 } from "uuid";
import styles from "@App/styles/interview/NaturalConversationPage.module.scss";
import InteractiveAvatar from "@App/components/organisms/InteractiveAvatar";
import VideoRecorder from "@App/components/video";
import { useRouter } from "next/router";
import { CircleAlert } from "lucide-react";
import { MAX_SESSION_TIME } from "@App/components/video";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import Spinner from "@App/components/atoms/Spinner";
import { IInterview } from "@App/lib/interview/models";
import { computeWPM } from "@App/util/computeMetrics";

export default function NaturalConversationPage() {
    
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [heygenToken, setHeyGenToken] = useState(""); // HeyGen authentication token
  const [timeLeft, setTimeLeft] = useState(MAX_SESSION_TIME);
  const [cameraError, setCameraError] = useState("");
  const { user, userData } = useAuth();
  const router = useRouter();
  const [fullTranscript, setFullTranscript] = useState(""); // transcript of the entire interview 
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const host = process.env.NEXT_PUBLIC_HOST;

  /**
   * Requests backend to get a session token from HeyGen LiveAvatar API.
   */
  const handleStartInterview = async () => {
    // request heygen session token
    console.log("Requesting Interview Session...");
    setIsLoading(true);
    setLoadingMessage("Requesting Interview Session...");
    try {
      const response = await fetch(`${host}/api/heygen/session_token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        console.log("HeyGen token request successful!");
        setHeyGenToken(data);
      } else {
        throw `Error: ${response.statusText || "Something went wrong"}`;
      }
    } catch (error) {
        console.error(`Submission error: ${error}`);
    } finally {
        setIsLoading(false);
    }
  };

  /**
   * Handle creating a new interview document within the user's collection of interviews using the interview's data like its duration.
   */
  const handleStopInterview = async (duration: string, timeStarted: string) => {
    // compute WPM with transcript, duration, and user name
    const wpm = computeWPM(fullTranscript, duration, userData ? userData.name : "User");

    const newInterview: IInterview = {
      id: uuidv4(), // create intreview id
      date: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
      }), // MM/DD/YYYY
      timestamp: Date.now(),
      timeStarted, // HH:MM AM/PM
      duration, // MMm SSs
      // these values will be populated later by the backend once the interview has been processed
      feedback: {
        ai_feedback: null,
        overall_competency: null,
      },
      metrics: {
        filler_count: NaN,
        wpm: wpm,
        overall_score: NaN,
      },
      transcript: fullTranscript,
      sentiment: undefined,
      url: undefined,
      is_analyzed: false
    }

    const req = {
      userId: user!.uid,
      interview: newInterview,
    }
    // submit new interview to backend
    setIsLoading(true);
    setLoadingMessage("Submitting Interview Session...");
    console.log("Submitting Interview Session...")
    const response = await fetch(`${host}/api/interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify(req),
    });
    if (!response.ok) {
      const errData = await response.json();
      alert(`Error creating interview: ${JSON.stringify(errData)}`);
      setIsLoading(false);
      return;
    }
    setFullTranscript("") // clear transcript
    setIsLoading(false); // turn submission loading screen off before we get to the loading screen for route changes

    // reroute user to interview's webpage
    // use a hard refresh to ensure that the browser releases the camera and microphone
    // window.location.href = `/interviews/${newInterview.id}`; 
    router.push(`/interviews/${newInterview.id}`);
  }

  /**
     * Format time remaining into MM:SS
     * @param seconds Duration in seconds.
     */
  const formatTimer = (seconds: number) => {
      const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
      const secs = (seconds % 60).toString().padStart(2, "0"); 
      return `${mins}:${secs}`;
  }

  /**
   * Handler for when transcript is updated during the interview. AssemblyAI uses turn-based transcription where each turn is represented as a turn event. Each turn has its own partial/final transcript where a partial transcript are intermediate results that may change when more audio gets processed and the final transcript is the true final transcript for this turn. 
   * @param transcript New transcript segment, this will include the speaker (e.g. "Interviewer": "Hey Adora!")
   * @param isFinal Boolean indicating whether this segment is the final transcript for the current turn.
   */
  const updateTranscript = (transcript: string, isFinal: boolean) => {
    // only add the final transcript for this turn to the overall transcript
    if (isFinal) {
      setFullTranscript((prevTranscript) => `${prevTranscript}${transcript}\n`); 
    }
  }

  return (
    // AuthGuard ensures that only logged-in users can view this page.
    // If a user isn't logged in, they are typically redirected away.
    <AuthGuard>
      {/* <p>Transcript: {fullTranscript}</p> */}
      {/* Main container for the entire page layout */}
      <div className={styles.pageContainer}>
        {/* Holds the video feeds and the control buttons */}
        <div className={styles.videoAndButtonContainer}>
          {isLoading && (
            <Spinner message={loadingMessage} />
          )}
          <div style={{ display: isLoading ? "none" : "block", width: "100%" }}>
              {/* Camera Error Notification */}
              {cameraError && (
                  <div className={styles.cameraErr}>
                      <CircleAlert/>
                      <p>{cameraError}</p> 
                  </div>
              )}
              <p className={`${styles.timerDisplay} ${timeLeft < 20 ? styles.timerWarning : ""}`}>
                Timer: {formatTimer(timeLeft)}
              </p>

            {/* Video Grid */}
            <div className={styles.videoContainer}>
              {/* User Webcam */}
              {/* This displays the live video coming from the user's camera */}
              <div className={styles.videoBox}>
                <VideoRecorder
                  startInterview={handleStartInterview}
                  stopInterview={handleStopInterview}
                  timeLeft={timeLeft}
                  setTimeLeft={setTimeLeft}
                  setCameraError={setCameraError}
                  onTranscriptChange={updateTranscript}
                />
              </div>
              
              {/* AI Interviewer */}
              {/* After receiving a sessionToken, this handles starting and stopping the session. */}
              <div className={styles.videoBox}>
                <InteractiveAvatar
                  sessionToken={heygenToken}
                  onTranscriptUpdate={updateTranscript}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}