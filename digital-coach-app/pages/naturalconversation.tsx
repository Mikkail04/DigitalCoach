import { useState, useEffect } from "react";
import AuthGuard from "@App/lib/auth/AuthGuard";
import { v4 as uuidv4 } from "uuid";
import styles from "@App/styles/interview/NaturalConversationPage.module.scss";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { CircleAlert } from "lucide-react";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import Spinner from "@App/components/atoms/Spinner";
import { IInterview } from "@App/lib/interview/models";
import toast from "react-hot-toast";
import { MAX_SESSION_TIME } from "@App/components/constants";

type Role = "user" | "interviewer";

interface Message {
  role: Role;
  text: string;
  timestamp: string;
}

const VideoRecorder = dynamic(
  () => import("@App/components/video"),
  {
    ssr: false,
    loading: () => <div>Loading Recorder...</div>,
  }
);

const InteractiveAvatar = dynamic(
  () => import("@App/components/organisms/InteractiveAvatar"),
  {
    ssr: false,
    loading: () => <div>Loading Avatar...</div>,
  }
);

const formatTimestamp = () =>
  new Date().toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    });

export default function NaturalConversationPage() {
  // const avatarRef = useRef<{
  //   startSession: () => void;
  //   endSession: () => void;
  //   handleInterrupt: () => void;
  // } | null>(null);
  // const [wasRecording, setWasRecording] = useState(false);
  // const [messages, setMessages] = useState<Message[]>([]);
  // const videoRef = useRef<HTMLVideoElement>(null);
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [heygenToken, setHeyGenToken] = useState(""); // HeyGen authentication token
  const [shouldStartAvatar, setShouldStartAvatar] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_SESSION_TIME);
  const [cameraError, setCameraError] = useState("");
  const { user } = useAuth();
  const router = useRouter();
  // useEffect(() => {
  // if (typeof router.query.token === "string") {
  //   setHeyGenToken(router.query.token);
  // }
  // }, [router.query.token]);
    const [fullTranscript, setFullTranscript] = useState(""); // transcript of the entire interview 
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
  
  // const { startRecording, stopRecording, mediaBlobUrl, previewStream } =
  //   useReactMediaRecorder({ video: true });

  // Callback to add a new user message.
  // const handleUserTranscript = (userTranscript: string) => {
  //   const newMessage: Message = {
  //     role: "user",
  //     text: userTranscript,
  //     timestamp: formatTimestamp(),
  //   };
  //   setMessages((prev) => [...prev, newMessage]);
  // };

  // Callback to add a new interviewer (HeyGen API) message.
  // const handleInterviewerTranscript = (interviewerTranscript: string) => {
  //   const newMessage: Message = {
  //     role: "interviewer",
  //     text: interviewerTranscript,
  //     timestamp: formatTimestamp(),
  //   };
  //   setMessages((prev) => [...prev, newMessage]);
  // };

  /**
   * Requests backend to get a session token from HeyGen LiveAvatar API.
   */
  // const handleStartInterview = async () => {
  //   // request heygen session token
  //   console.log("Requesting Interview Session...");
  //   setIsLoading(true);
  //   setLoadingMessage("Requesting Interview Session...");
  //   const host = typeof window !== "undefined" ? "localhost:8000" : "api"; // if we're in the browser use localhost, but if we're in Docker, use the backend's service name (currently 'api')
  //   console.log(`Using ${host} for the host.`);
  //   try {
  //     const response = await fetch(`http://${host}/api/heygen/session_token`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     const data = await response.json();
  //     if (response.ok) {
  //       console.log("HeyGen token request successful!");
  //       setHeyGenToken(data);
  //     } else {
  //       throw `Error: ${response.statusText || "Something went wrong"}`;
  //     }
  //   } catch (error) {
  //       console.error(`Submission error: ${error}`);
  //   } finally {
  //       setIsLoading(false);
  //   }
  // };
  // const handleStartInterview = async () => {
  //   if (heygenToken) {
  //   console.log("Using preloaded HeyGen token");
  //   return;
  //   }
  //   // request heygen session token
  //   console.log("Requesting Interview Session...");
  //   setIsLoading(true);
  //   setLoadingMessage("Requesting Interview Session...");
  //   const host = typeof window !== "undefined" ? "localhost:8000" : "api"; // if we're in the browser use localhost, but if we're in Docker, use the backend's service name (currently 'api')
  //   console.log(`Using ${host} for the host.`);
  //   try {
  //     const response = await fetch(`http://${host}/api/heygen/session_token`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     const data = await response.json();
  //     if (response.ok) {
  //       console.log("HeyGen token request successful!");
  //       setHeyGenToken(data);
  //     } else {
  //       throw `Error: ${response.statusText || "Something went wrong"}`;
  //     }
  //   } catch (error) {
  //       console.error(`Submission error: ${error}`);
  //   } finally {
  //       setIsLoading(false);
  //   }
  // };
const handleStartInterview = async () => {
  if (heygenToken?.length > 0) {
    console.log("Using existing HeyGen token");
    setShouldStartAvatar(true);
    return;
  }

  console.log("Requesting Interview Session...");
  setIsLoading(true);
  setLoadingMessage("Requesting Interview Session...");

  try {
    const host = process.env.NEXT_PUBLIC_HOST;

    if (!host) {
      throw new Error("NEXT_PUBLIC_HOST is not configured");
    }

    console.log(`Using ${host} for the host.`);

    const response = await fetch(
      `${host}/api/heygen/session_token`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        data?.message ||
        response.statusText ||
        "Failed to create HeyGen session"
      );
    }

    setHeyGenToken(data);
    setShouldStartAvatar(true);
  } catch (error) {
    console.error("Failed to start interview:", error);
    toast.error("Unable to start the interview.");
  } finally {
    setIsLoading(false);
  }
};

const waitForAnalysis = async (
  jobId: string,
  interviewId: string
) => {
  const host = process.env.NEXT_PUBLIC_HOST;

  if (!host) {
    throw new Error("NEXT_PUBLIC_HOST is not configured");
  }

  const timeout = 120000;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const response = await fetch(
      `${host}/api/jobs/results/${jobId}`
    );

    if (!response.ok) {
      throw new Error(
        `Job status request failed: ${response.status}`
      );
    }

    const result = await response.json();

    console.log("Job status:", result.status);

    if (result.status === "success") {
      toast.success("Your interview analysis is complete!");

      setTimeout(() => {
        router.push(`/interviews/${interviewId}`);
      }, 3000);

      return;
    }

    if (result.status === "failed") {
      throw new Error("Analysis failed. Please try again.");
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 3000)
    );
  }

  throw new Error("Analysis timed out. Please try again.");
};



  /**
   * Handle creating a new interview document within the user's collection of interviews using the interview's data like its duration.
   */
const handleStopInterview = async (
  duration: string,
  timeStarted: string
) => {
  if (!user) {
    toast.error("You must be logged in.");
    return;
  }

  const newInterview: IInterview = {
    id: uuidv4(),
    date: new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    timeStarted,
    duration,
    feedback: undefined,
    metrics: undefined,
    transcript: fullTranscript,
    sentiment: undefined,
    url: undefined,
  };

  const req = {
    userId: user.uid,
    interview: newInterview,
  };

  setIsLoading(true);
  setLoadingMessage("Submitting Interview Session...");

  try {
    const host = process.env.NEXT_PUBLIC_HOST;

    if (!host) {
      throw new Error("NEXT_PUBLIC_HOST is not configured");
    }

    console.log(`Using ${host} for the host.`);
    console.log("Submitting Interview Session...");

    const response = await fetch(
      `${host}/api/interview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        data?.message ||
        `Error creating interview: ${response.status}`
      );
    }

    if (!data.job_id) {
      throw new Error(
        "Interview was created, but no analysis job ID was returned."
      );
    }

    console.log(
      "Analysis job started:",
      data.job_id
    );

    setLoadingMessage("Analyzing your interview...");

    await waitForAnalysis(
      data.job_id,
      newInterview.id
    );
  } catch (error) {
    console.error(
      "Interview submission/analysis error:",
      error
    );

    toast.error(
      error instanceof Error
        ? error.message
        : "Something went wrong."
    );
  } finally {
    setIsLoading(false);
  }
};



  // const handleInterruptAvatar = async () => {
  //   await avatarRef.current?.handleInterrupt();
  // };

  // const waitForJobResult = async (
  //   jobId: string,
  //   retries = 10,
  //   delay = 3000
  // ) => {
  //   for (let i = 0; i < retries; i++) {
  //     const statusRes = await axios.get(
  //       `http://localhost:8000/api/create_answer/${jobId}`
  //     );

  //     if (statusRes.data.status === "completed") {
  //       return axios.get(
  //         `http://localhost:8000/api/create_answer/${jobId}/result`
  //       );
  //     }

  //     await new Promise((res) => setTimeout(res, delay));
  //   }
  //   throw new Error("Job did not complete in time.");
  // };

  // Optional: This function is still available if you need to manually fetch a response.
  // const getResponse = async () => {
  //   try {
  //     const getFile = async () => {
  //       const url = mediaBlobUrl || "/output.mp4";
  //       let blob = await fetch(url).then((res) => res.blob());
  //       return new File([blob], "video.mp4");
  //     };
  //     const file = await getFile();

  //     const dlURL = await uploadAnswerVideo(file, uuidv4());
  //     console.log("Video Uploaded to:", dlURL);
      
  //     // const url = (await uploadAnswerVideo(
  //     //   file,
  //     //   uuidv4()
  //     // )) as any;
  //     // const dlURL = await StorageService.getDownloadUrlFromVideoUrlRef(
  //     //   "gs://" + url.ref._location.bucket + "/" + url.ref._location.path
  //     // );
  //     // console.log(dlURL);

  //     const sentResponse = await axios.post(
  //       "http://localhost:8000/api/create_answer/",
  //       {
  //         video_url: dlURL,
  //       }
  //     );
  //     const jobId = sentResponse.data.job_id;

  //     const jobIdResponse = await waitForJobResult(jobId);

  //     console.log(jobIdResponse);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert("An error occurred while processing the recording.");
  //   }
  // };

  // useEffect(() => {
  //   if (videoRef.current) {
  //     videoRef.current.srcObject = previewStream || null;
  //   }
  // }, [previewStream]);
  

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
   * Handler for when transcript is updated during the interview. AssemblyAI uses turn-based transcription where each turn is represented as a turn event. Each turn has its own partial/final transcript where a partial transcript are intermediate results that may change when more audio get processed and the final transcript is the true final transcript for this turn. 
   * @param transcript New transcript segment, this will include the speaker (e.g. "Interviewer": "Hey Adora!")
   * @param isFinal Boolean indicating whether this segment is the final transcript for the current turn.
   */
  const updateTranscript = (transcript: string, isFinal: boolean) => {
    // only add the final transcript for this turn to the overall transcript
    if (isFinal) {
      setFullTranscript((prevTranscript) => `${prevTranscript}\n${transcript}\n`); 
    }
  }

  return (
    // AuthGuard ensures that only logged-in users can view this page.
    // If a user isn't logged in, they are typically redirected away.
    <AuthGuard>
      <p>Transcript: {fullTranscript}</p>

      <button
  onClick={() =>
    toast.success(
      "Your interview analysis is complete!"
    )
  }
>
  Test Toast
</button>
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
                  shouldStart={shouldStartAvatar}
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