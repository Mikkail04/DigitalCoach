from schemas import (
    SentimentAnalysisResult,
    StarFeedbackEvaluation,
    CompetencyFeedback,
    FillerHedgeResponse,
    OverallAnalysisResponse,
)
from utils.logger_config import get_logger
from utils.transcript import extractUserTranscript
from data.users import getUser
import os
from openai import OpenAI
from pydantic import ValidationError, BaseModel
from dotenv import load_dotenv
from data.interviews import (
    getTranscriptById, 
    getInterviewById,
    setIsAnalyzed
)
from services.firebase_init import get_firestore_client
from tasks.prompts import (
    SENTIMENT_ANALYSIS_PROMPT,
    STAR_PROMPT,
    COMPETENCY_FEEDBACK_PROMPT,
    FILLER_HEDGE_COUNT_PROMPT,
    OVERALL_FEEDBACK_PROMPT,

) 
logger = get_logger(__name__)

load_dotenv() # load environment variables
async def detect_audio_sentiment(user_id: str, interview_id: str) -> SentimentAnalysisResult:
    """
    Generate audio sentiment analysis using local LLM. This should be a job performed by a Redis RQ Worker.

    Args:
        user_id (str): User id that owns the interview to be analyzed.
        interview_id (str): Id of the interview undergoing sentiment analysis
    Returns:
        result (SentimentAnalysisResult): Sentiment analysis results according to SentimentAnalysisResult schema
    """

    logger.info(f"Starting sentiment analysis on interview={interview_id}...")

    # extract relevant environment variables
    base_url = os.getenv("LM_BASE_URL")
    api_key = os.getenv("LM_API_KEY")
    model_name = os.getenv("MODEL")
    # initialize OpenAI-compliant LLM client
    client = OpenAI(base_url=base_url, api_key=api_key)

    # get interview's transcript
    transcript = await getTranscriptById(user_id, interview_id)

    # get user's name 
    user = await getUser(user_id)
    userTranscript = extractUserTranscript(transcript, user.name)

    # initialize messages for LLM 
    # system messages provide additional context to the LLM
    # user messages are the messages the LLM actually responds to
    model_messages = [
                {
                    "role": "system",
                    "content": SENTIMENT_ANALYSIS_PROMPT
                },
                {
                    "role": "user",
                    "content": userTranscript # pass the transcript to the LLM for sentiment analysis
                }
            ]
    try:
        # response = client.chat.completions.create(
        #     model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
        #     messages = model_messages,
        # )
        response = client.beta.chat.completions.parse(
            model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
            messages = model_messages,
            response_format=SentimentAnalysisResult,
            max_tokens=8192
        )

    except Exception as e:
        logger.error(f"Error communicating with LLM: {e}")
        logger.error(f"Sentiment analysis for interview={interview_id} failed. Will attempt a retry...")
        # return SentimentAnalysisResult(error=f"Error communicating with LLM: {e}")
        raise BaseException(e) # to make sure the RQ job returns a failed status, we must raise an exception
    
    db = get_firestore_client()
    # parse and return LLM response
    try:
        logger.info(f"Verifying LLM sentiment analysis on interview={interview_id}...")

        # llm_response = response.choices[0].message.content # extract LLM's JSON response string

        llm_response = response.choices[0].message.parsed

        logger.info(f"LLM response={llm_response}")
        # verify LLM JSON response is the correct shape 
        # validated_data = SentimentAnalysisResult.model_validate_json(llm_response) # parses JSON string, checks if it fits our response schema and instantiates our schema if successful 
        validated_data = SentimentAnalysisResult.model_validate(llm_response)
        logger.info(f"Sentiment Analysis on interview={interview_id} successful!")

        # determine overall sentiment
        data = validated_data.model_dump() # extract sentiment analysis from verified schema
        positive = negative = neutral = 0 # initialize counters
        
        for res in data["sentiment_analysis"]:
            if res["sentiment"] == "POSITIVE":
                positive += 1
            elif res["sentiment"] == "NEGATIVE":
                negative += 1
            elif res["sentiment"] == "NEUTRAL":
                neutral += 1

        overall_sentiment = "" 
        if max(positive, negative, neutral) == positive:
            overall_sentiment = "POSITIVE"
        elif max(positive, negative, neutral) == negative:
            overall_sentiment = "NEGATIVE"
        else:
            overall_sentiment = "NEUTRAL"

        # get reference to interview
        interviewRef = db.collection("users").document(user_id).collection("interviews").document(interview_id)
        await interviewRef.update({"sentiment": overall_sentiment})

        return validated_data
    except ValidationError as e:
        logger.error(f"LLM sentiment analysis on interview={interview_id} is in invalid shape. Reason: {e} Will attempt to retry...")

        raise ValidationError(f"LLM sentiment analysis on interview={interview_id} is in invalid shape: {llm_response} Reason: {e}") # to make sure the RQ job returns a failed status, we must raise an exception

async def star_analysis(user_id: str, interview_id: str) -> CompetencyFeedback:
    """
    Perform STAR analysis using local LLM. This should be a job performed by a Redis RQ Worker.

    Args:
        user_id (str): User id that owns the interview to be analyzed.
        interview_id (str): Interview id of the interview undergoing STAR analysis.

    Returns:
        result (StarFeedbackEvaluation): STAR analysis results according to StarFeedbackEvaluation schemas 
    """

    logger.info(f"Starting STAR analysis on interview={interview_id}...")

    # extract relevant environment variables
    base_url = os.getenv("LM_BASE_URL")
    api_key = os.getenv("LM_API_KEY")
    model_name = os.getenv("MODEL")

    # initialize OpenAI-compliant LLM client
    client = OpenAI(base_url=base_url, api_key=api_key)

    # get interview's transcript
    transcript = await getTranscriptById(user_id, interview_id)

    # initialize messsages for LLM
    # system messages provide additional context to the LLM before inference
    # user messages are messages that the LLM responds to
    model_messages = [
        {
            "role": "system",
            "content": STAR_PROMPT
        },
        {
            "role": "user",
            "content": transcript # pass the transcript to the LLM for star analysis
        }
    ]
    
    # send task to local LLM
    try:
        # response = client.chat.completions.create(
        #     model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
        #     messages = model_messages,
        # )
        response = client.beta.chat.completions.parse(
            model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
            messages = model_messages,
            response_format=StarFeedbackEvaluation,
            max_tokens=8192
        )
    except Exception as e:
        logger.error(f"Error communicating with LLM: {e}")
        logger.error(f"STAR analysis for interview={interview_id} failed. Will attempt a retry...")
        raise BaseException(e) # raise exception to set failed job status
    

    db = get_firestore_client()

    # parse and return LLM response
    try:
        logger.info(f"Verifying LLM STAR analysis on interview={interview_id}...")

        # llm_response = response.choices[0].message.content
        llm_response = response.choices[0].message.parsed
        # extract LLM's JSON response string
        logger.info(f"LLM response={llm_response}")
        # verify LLM JSON response is the correct shape
        # validated_data = StarFeedbackEvaluation.model_validate_json(llm_response) # parse JSON string, if it matches the schema then instantiate; otherwise throw
        validated_data = StarFeedbackEvaluation.model_validate(llm_response)
        logger.info(f"STAR analysis on interview={interview_id} successful!")

        data = validated_data.model_dump() # generate dictionary of validated llm response
        
        # NOTE: Currently, we only store the final score and overall feedback from STAR analysis but feel free to use the entire LLM response. However, you may have to update the related schemas/interfaces from the backend and frontend to reflect the new shape.
        star_response = {
            "score": data["overall_score"],
            "summary": data["feedback"],
        }

        # add STAR analysis to user's interview
        # get reference to interview
        interviewRef = db.collection("users").document(user_id).collection("interviews").document(interview_id)
        await interviewRef.update({"feedback.overall_competency.star": star_response})

        return star_response
    except ValidationError as e:
        logger.error(f"LLM STAR analysis on interview={interview_id} is in invalid shape. Reason: {e} Will attempt to retry...")
        raise ValidationError(f"LLM STAR analysis on interview={interview_id} is in invalid shape. Reason: {e} Will attempt to retry...") # raise error to set RQ job to failed status

async def analyze_competencies(user_id: str, interview_id: str):
    """
    Perform analysis on competencies (i.e. engagement, clarity, and confidence). This should be a job performed by a Redis RQ Worker.

    
    Note: STAR is technically a competency but it deserves its own analysis due to its complex nature relative to analyzing the other competencies.

    Args:
        user_id (str): User id that owns the interview to be analyzed.
        interview_id (str): Interview id of the interview undergoing STAR analysis.

    Returns:
        result: Competency analysis results.
    """

    class LLMResponse(BaseModel):
        """
        Response schema to define the shape of the expected LLM response for competency analysis.
        """
        clarity: CompetencyFeedback  # Evaluation on communication clarity
        confidence: CompetencyFeedback # Evaluation on confidence
        engagement: CompetencyFeedback # Evaluation on engagement

    logger.info(f"Starting competencies analysis on interview={interview_id}...")

    # extract relevant environment variables
    base_url = os.getenv("LM_BASE_URL")
    api_key = os.getenv("LM_API_KEY")
    model_name = os.getenv("MODEL")

    # initialize OpenAI-compliant LLM client
    client = OpenAI(base_url=base_url, api_key=api_key)

    # get interview's transcript
    transcript = await getTranscriptById(user_id, interview_id)

    # get user's name 
    user = await getUser(user_id)
    userTranscript = extractUserTranscript(transcript, user.name)

    # initialize messsages for LLM
    # system messages provide additional context to the LLM before inference
    # user messages are messages that the LLM responds to
    model_messages = [
        {
            "role": "system",
            "content": COMPETENCY_FEEDBACK_PROMPT
        },
        {
            "role": "user",
            "content": userTranscript # pass the transcript to the LLM for competencies analysis
        }
    ]

    # send task to local LLM
    try:
        # response = client.chat.completions.create(
        #     model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
        #     messages = model_messages,
        # )
        response = client.beta.chat.completions.parse(
            model=model_name,
            messages=model_messages,
            response_format=LLMResponse,
            max_tokens=8192
        )
    except Exception as e:
        logger.error(f"Error communicating with LLM: {e}")
        logger.error(f"Competencies analysis for interview={interview_id} failed. Will attempt a retry...")
        raise BaseException(e) # raise exception to set failed job status
    
    db = get_firestore_client()

    # parse and return LLM response
    try:
        logger.info(f"Verifying LLM competencies analysis on interview={interview_id}...")

        # llm_response = response.choices[0].message.content
        llm_response = response.choices[0].message.parsed
        # extract LLM's JSON response string
        logger.info(f"LLM response={llm_response}")

        # verify LLM JSON response is in the correct shape
        # validated_data = LLMResponse.model_validate_json(llm_response) # parse JSON string, if it matches the schema then instantiate; otherwise throw
        validated_data = LLMResponse.model_validate(llm_response)

        logger.info(f"Competencies analysis on interview={interview_id} successful!")

        # we extract each field one-by-one because if we tried uploading the object itself we risk overwriting the other fields within the interview document's overall_competency object, i.e. STAR analysis field
        data = validated_data.model_dump()
        clarity = data["clarity"]
        confidence = data["confidence"]
        engagement = data["engagement"]

        # add competencies analysis to user's interview
        # get reference to interview
        interviewRef = db.collection("users").document(user_id).collection("interviews").document(interview_id)
        
        await interviewRef.update({
            "feedback.overall_competency.clarity": clarity,
            "feedback.overall_competency.confidence": confidence,
            "feedback.overall_competency.engagement": engagement
        })

        return validated_data
    
    except ValidationError as e:
        logger.error(f"LLM competencies analysis on interview={interview_id} is in invalid shape. Reason: {e} Will attempt to retry...")

        raise ValidationError(f"LLM competencies analysis on interview={interview_id} is in invalid shape: {llm_response} Reason: {e}") # to make sure the RQ job returns a failed status, we must raise an exception


async def filler_hedge_count(user_id: str, interview_id: str) -> FillerHedgeResponse:
    """
    Perform extraction for filler words and hedge phrases. Using an LLM instead of iterating over a list is more reliable since certain filler words such as "like" aren't filler words depending on the context, e.g. "I like this job.". This should be a job performed by a Redis RQ Worker.

    Args:
        user_id (str): User id that owns the interview to be analyzed.
        interview_id (str): Interview id of the interview undergoing STAR analysis.

    Returns:
        result (FillerHedgeResponse): Counts for filler words, hedge phrases, and some of their most frequent examples.
    """

    logger.info(f"Starting filler word and hedge phrase count on interview={interview_id}...")

    # extract relevant environment variables
    base_url = os.getenv("LM_BASE_URL")
    api_key = os.getenv("LM_API_KEY")
    model_name = os.getenv("MODEL")

    # initialize OpenAI-compliant LLM client
    client = OpenAI(base_url=base_url, api_key=api_key)

    # get user's name 
    user = await getUser(user_id)

    # get interview's transcript
    transcript = await getTranscriptById(user_id, interview_id)
    userTranscript = extractUserTranscript(transcript, user.name)

    # initialize messsages for LLM
    # system messages provide additional context to the LLM before inference
    # user messages are messages that the LLM responds to
    model_messages = [
        {
            "role": "system",
            "content": FILLER_HEDGE_COUNT_PROMPT
        },
        {
            "role": "user",
            "content": userTranscript # pass the transcript to the LLM for star analysis
        }
    ]

    # send task to local LLM
    try:
        # response = client.chat.completions.create(
        #     model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
        #     messages = model_messages,
        # )
        response = client.beta.chat.completions.parse(
            model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
            messages = model_messages,
            response_format=FillerHedgeResponse,
            max_tokens=8192
        )
    except Exception as e:
        logger.error(f"Error communicating with LLM: {e}")
        logger.error(f"Filler/hedge extraction for interview={interview_id} failed. Will attempt a retry...")
        raise BaseException(e) # raise exception to set failed job status

    db = get_firestore_client()

    # parse and return LLM response
    try:
        logger.info(f"Verifying LLM filler/hedge extraction on interview={interview_id}...")

        # llm_response = response.choices[0].message.content
        llm_response = response.choices[0].message.parsed

        # extract LLM's JSON response string
        logger.info(f"LLM response={llm_response}")
        # verify LLM JSON response is the correct shape
        # validated_data = FillerHedgeResponse.model_validate_json(llm_response)
        validated_data = FillerHedgeResponse.model_validate(llm_response)
        
        # parse JSON string, if it matches the schema then instantiate; otherwise throw
        logger.info(f"Filler/hedge extraction on interview={interview_id} successful!")

        data = validated_data.model_dump() # generate dictionary of validated llm response
        total_count = data["filler_count"] + data["hedge_count"]

        # add filler/hedge count to user's interview
        # get reference to interview
        interviewRef = db.collection("users").document(user_id).collection("interviews").document(interview_id)
        await interviewRef.update({"metrics.filler_count": total_count})
        return validated_data
    except ValidationError as e:
        logger.error(f"LLM filler/hedge extraction on interview={interview_id} is in invalid shape. Reason: {e} Will attempt to retry...")
        raise ValidationError(f"LLM filler/hedge extraction on interview={interview_id} is in invalid shape. Reason: {e} Will attempt to retry...") # raise error to set RQ job to failed status


async def overall_analysis(user_id: str, interview_id: str) -> OverallAnalysisResponse:
    """
    Perform the final overall analysis on the interview taking into account metrics like WPM and filler word count to produce feedback about the user's interview performance in general and compute a final overall score reflecting this performance. This should be a job performed by a Redis RQ Worker.

    Args:
        user_id (str): User id that owns the interview to be analyzed.
        interview_id (str): Interview id of the interview undergoing STAR analysis.

    Returns:
        result (OverallAnalysisResponse): Overall analysis results, i.e. overall feedback and overall score.
    """

    logger.info(f"Starting final overall analysis on intervew={interview_id}...")

    # extract relevant environment variables
    base_url = os.getenv("LM_BASE_URL")
    api_key = os.getenv("LM_API_KEY")
    model_name = os.getenv("MODEL")

    # initialize OpenAI-compliant LLM client
    client = OpenAI(base_url=base_url, api_key=api_key)

    interview = await getInterviewById(user_id, interview_id) # get interview
    
    # extract transcript
    # transcript = await getTranscriptById(user_id, interview_id)
    transcript = interview.transcript

    # extract WPM 
    wpm = interview.metrics.wpm
    # extract filler word count
    filler_count = interview.metrics.filler_count
    # initialize messsages for LLM
    # system messages provide additional context to the LLM before inference
    # user messages are messages that the LLM responds to
    model_messages = [
        {
            "role": "system",
            "content": OVERALL_FEEDBACK_PROMPT
        },
        {
            "role": "user",
            "content": f"TRANSCRIPT: {transcript}\nWPM: {wpm}\nFILLER WORD COUNT: {filler_count}" # pass the transcript, wpm, and filler word count to the LLM for final overall analysis
        },
    ]

    # send task to local LLM
    try:
        # response = client.chat.completions.create(
        #     model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
        #     messages = model_messages,
        # )
        response = client.beta.chat.completions.parse(
            model=model_name, # llm model name from docker model runner (you can find this by running `docker model list` in your CMD)
            messages = model_messages,
            response_format=OverallAnalysisResponse,
            max_tokens=8192
        )
    except Exception as e:
        logger.error(f"Error communicating with LLM: {e}")
        logger.error(f"Overall analysis for interview={interview_id} failed. Will attempt a retry...")
        raise BaseException(e) # raise exception to set failed job status
    
    db = get_firestore_client()

    # parse and return LLM response
    try:
        logger.info(f"Verifying LLM overall analysis on interview={interview_id}...")

        # llm_response = response.choices[0].message.content
        llm_response = response.choices[0].message.parsed
        # extract LLM's JSON response string
        logger.info(f"LLM response={llm_response}")

        # verify LLM JSON response is the correct shape
        # validated_data = OverallAnalysisResponse.model_validate_json(llm_response)
        validated_data = OverallAnalysisResponse.model_validate(llm_response)

        # parse JSON string, if it matches the schema then instantiate; otherwise throw
        logger.info(f"Overall analysis on interview={interview_id} successful!")

        # get reference to interview
        interviewRef = db.collection("users").document(user_id).collection("interviews").document(interview_id)

        # add overall feedback and overall score to the user's interview
        await interviewRef.update({"metrics.overall_score": validated_data.overall_score,"feedback.ai_feedback": validated_data.overall_feedback})

        # set is_analyzed to true
        await setIsAnalyzed(user_id, interview_id)
        
        logger.info(f"Analysis tasks on interview={interview_id} for user={user_id} successful!")

        return validated_data
        
    
    except ValidationError as e:
        logger.error(f"LLM overall analysis on interview={interview_id} is in invalid shape. Reason: {e} Will attempt to retry...")

        raise ValidationError(f"LLM overall analysis on interview={interview_id} is in invalid shape: {llm_response} Reason: {e}") # to make sure the RQ job returns a failed status, we must raise an exception