import { useRef, useEffect } from "react";
import { LiveAvatarSession, AgentEventsEnum } from "@heygen/liveavatar-web-sdk";
import styles from "@App/styles/interview/NaturalConversationPage.module.scss";
import { VideoOff } from "lucide-react";

interface InteractiveAvatarProps {
  sessionToken: string;
  shouldStart: boolean;
  onTranscriptUpdate?: (transcript: string, isFinal: boolean) => void;
}

function InteractiveAvatar({
  sessionToken,
  shouldStart,
  onTranscriptUpdate,
}: InteractiveAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSession>(null);
  const userConfig = {
    voiceChat: true,
  };
  const sessionStartedRef = useRef(false);
  const sessionStartingRef = useRef(false);
  const startedTokenRef = useRef<string | null>(null);
  const startSession = async () => {
    console.log("Starting session with token:", sessionToken);

    if (sessionStartingRef.current) {
      console.log("Session is already starting");
      return;
    }

    if (sessionStartedRef.current) {
      console.log("Session already started");
      return;
    }

    if (startedTokenRef.current === sessionToken) {
      console.log("This token already started a session");
      return;
    }

    if (sessionRef.current) {
      console.log("Session already exists");
      return;
    }

  sessionStartingRef.current = true;

  try {
    console.log("Creating LiveAvatar session...");

    const session = new LiveAvatarSession(
      sessionToken,
      userConfig
    );
    console.log("AgentEventsEnum", AgentEventsEnum);

    sessionRef.current = session;

    await session.start();

    console.log("Session started successfully");

    sessionStartedRef.current = true;
    startedTokenRef.current = sessionToken;

    session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, ({ text }) => {
      if (onTranscriptUpdate) {
        onTranscriptUpdate(`Interviewer: ${text}`, true);
      }
    });
    console.log("Registering HeyGen event listeners");

    if (videoRef.current) {
      session.attach(videoRef.current);
      videoRef.current.onplaying = () =>
        console.log("Avatar video playing");

      videoRef.current.onpause = () =>
        console.log("Avatar video paused");

      videoRef.current.onerror = (e) =>
        console.error("Avatar video error", e);
    }
  } catch (error) {
    console.error("Session start failed:", error);

    sessionRef.current = null;
    sessionStartedRef.current = false;
  } finally {
    sessionStartingRef.current = false;
  }
};

  const stopSession = async () => {
  try {
    if (sessionRef.current) {
      console.log("Stopping session...");
      await sessionRef.current.stop();
    }
  } catch (error) {
    console.error("Error stopping session:", error);
  } finally {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    sessionRef.current = null;
    sessionStartedRef.current = false;
    sessionStartingRef.current = false;
    startedTokenRef.current = null;
}
};

  useEffect(() => {
    if (shouldStart && sessionToken) {
      void startSession();
    }

    return () => {
      void stopSession();
    };
  }, [shouldStart, sessionToken]);

  return (
    <div className={styles.videoCard}>
      <div className={`${styles.videoHeader} ${styles.aiHeader}`}>
        <p>Interviewer</p>
      </div>
      <div className={`${styles.videoContent} ${styles.aiContainer}`}>
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          style={{display: sessionToken ? "block" : "none"}}
          />
        {!sessionToken && (
          <div className={styles.cameraOff}>
              <VideoOff/>
              <p>Waiting</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InteractiveAvatar;