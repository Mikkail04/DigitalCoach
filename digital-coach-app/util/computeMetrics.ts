/**
 * Compute the WPM for an interview.
 * @param transcript The interview transcript
 * @param durationStr The duration as a string in the form of MMm SSs not 0-padded
 * @param name The name of the user within the transcript 
 */
export const computeWPM = (transcript: string, durationStr: string, name: string) => {
    // extract user sentences from transcript
    const userLines = transcript.split(/\n+/).filter((line) => line.startsWith(name))

    // remove the user's name from the transcript and combine them all into a single string. (Note: the user's name is in the form of '<name>:' within the transcript)
    const userText = userLines.map((line) => line.replace(`${name}: `, "")).join(" ");
    const wordCount = userText.trim().split(/\s+/).length;

    // convert duration into minutes
    const minsStr = durationStr.match(/(\d+)m/);
    const secsStr = durationStr.match(/(\d+)s/);

    const mins = minsStr ? parseInt(minsStr[1]) : 0; // convert minutes into an int 
    const secs = secsStr ? parseInt(secsStr[1]) : 0; // convert seconds into an int
    const totalMins = mins + (secs / 60);

    // returns WPM as an int
    // return totalMins > 0 ? Math.round(wordCount / totalMins) : 0;
    return Math.round(wordCount / totalMins);

}