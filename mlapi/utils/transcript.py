"""
Helper functions related to modifying an interview transcript
"""
import re

def extractUserTranscript(transcript: str, username: str) -> str:
    """
    Takes a full interview's transcript and extracts the lines spoken by the user.

    - **transcript**: (str) Full interview transcript
    - **username**: (str) Speaker's name
    """

    #  extract user sentences from transcript
    # userLines = transcript.split(/\n+/).filter((line) => line.startsWith(name))
    transcript = transcript.strip()
    sentences = re.split(r"\n+", transcript) # each sentence is separated by a newline character
    userLines = [line for line in sentences if line.startswith(username.strip())]

    # remove the user's name from the transcript (Note: the user's name is in the form of '<name>:' within the transcript)
    # userText = userLines.map((line) => line.replace(`${name}: `, "")).join(" ")
    userLines = [line.replace(f"{username}: ", "") for line in userLines]
    # combine them all into a single string.
    userText = " ".join(userLines)
    return userText