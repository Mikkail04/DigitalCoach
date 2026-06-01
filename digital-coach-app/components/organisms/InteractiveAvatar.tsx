import { useRef, useEffect } from "react";
import { LiveAvatarSession, AgentEventsEnum, SessionEvent } from "@heygen/liveavatar-web-sdk";
import styles from "@App/styles/interview/NaturalConversationPage.module.scss";
import { VideoOff } from "lucide-react";

interface InteractiveAvatarProps {
  sessionToken: string;
  onTranscriptUpdate?: (transcript: string, isFinal: boolean) => void;
}

function InteractiveAvatar({sessionToken, onTranscriptUpdate}: InteractiveAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const userConfig = {
    voiceChat: true,
  };
  
  /**
   * Starts HeyGen LiveAvatar session using the given session token and configurations. Recommend referring to the reviewing heygen/liveavatar-web-sdk library as API documentation is sparse as of writing this.
   */
  const startSession = async () => {
    console.log("Starting mock interview...");
    // create new session
    const session = new LiveAvatarSession(sessionToken, userConfig);
    sessionRef.current = session;
    

    // register event listener for when the avatar talks so we can add it to the transcript
    // the event returns the text that the avatar speaks so we don't have to use AssemblyAI for this
    session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, ({text}) => {
      if (onTranscriptUpdate) {
        onTranscriptUpdate(`Interviewer: ${text}`, true);
      }
      // console.log(`Avatar said: ${text}\n`);
    });

    // HeyGen LiveAvatar keeps a user transcription (we currently use AssemblyAI for transcription) 
    // session.on(AgentEventsEnum.USER_TRANSCRIPTION, ({text}) => {
    //   if (onTranscriptUpdate) {
    //     onTranscriptUpdate(`User: ${text}`, true);
    //   }
    // })

    // attach video element to session once the video and audio tracks arrive
    session.on(SessionEvent.SESSION_STREAM_READY, () => {
        if (videoRef.current) {
          session.attach(videoRef.current);
        }
    });

    // start the session
    try {
      await session.start();
    } catch (e) {
      console.error(`Error starting HeyGen LiveAvatar session: ${e}`);
      await stopSession(); // if session start fails then clean up session
    }

  }

  /**
   * Turn off all tracks from avatar's video element
   */
  const stopAttachedMedia = () => {
    if (!videoRef.current) return;

    // turn off tracks
    const mediaStream = videoRef.current.srcObject as MediaStream | null;
    if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
    }

    videoRef.current.pause(); // pause video
    videoRef.current.srcObject = null; // detach avatar from video element
    videoRef.current.load(); // reset video element

  }

  /**
   * Stops HeyGen LiveAvatar Session.
   */
  const stopSession = async () => {
    console.log("Stopping session...");
    const session = sessionRef.current;
    sessionRef.current = null;

    try {
        // stop session
        if (session) {
          await session.stop();
        }
    } catch (e) {
        console.error(`Error stopping HeyGen LiveAvatar session: ${e}`);
    } finally {
        stopAttachedMedia();
    }
    
  }

  useEffect(() => {
    // start session once session token is received
    if (sessionToken) {
        startSession();
    }

    // stop heygen session when component unmounts
    return () => {
        stopSession();
    }
  }, [sessionToken]);

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