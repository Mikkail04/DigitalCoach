/**
 * Interfaces for AI-generated feedback which provides overall feedback, clarity of responses, confidence in the responses, and how engaging the responses were. 
 * (Note: This should match the related Pydantic model in /mlapi/schemas/interview.py)
 */
export interface IFeedback {
  ai_feedback: string | null,
  overall_competency: {
    clarity: {
      score: number,
      summary: string,
    },
    confidence: {
      score: number,
      summary: string,
    },
    engagement: {
      score: number,
      summary: string,
    },
    star: {
      score: number,
      summary: string,
    }
  } | null,
}

/**
 * Interface for all performance metrics computed from an interview.
 * 
 * (Note: This should match the Metrics Pydantic model in /mlapi/schemas/interview.py)
 */
export interface IMetrics {
  filler_count: number | undefined,
  overall_score: number | undefined,
  wpm: number | undefined,
}

/**
 *  Interface of the overall sentiment analysis percentages.
 */
export interface ISentiments {
    positive: Number // percentage of the responses that were positive sentiment
    negative: Number // percentage of the responses that were negative sentiment
    neutral:  Number  // percentage of the responses that were neutral sentiment
}

/**
 * Interview for how an interview is stored in the database.
 * 
 * (Note: This should match the Interview Pydantic model in /mlapi/schemas/interview.py)
 */
export interface IInterview {
  id: string,
  date: string, // MM/DD/YYYY
  timestamp: number, // timestamp of when interview was created using milliseconds elapsed since the epoch (this is used as a way to sort interviews chronologically)
  timeStarted: string, // HH:MM 12-hour
  duration: string, // MMm SSs, e.g. 10m 43s not 0-padded
  feedback: IFeedback | undefined,
  metrics: IMetrics | undefined,
  transcript: string[] | string, // transcript may either be an array of dialogues from avatar and user or a single long string
  sentiment: string | ISentiments | undefined, // sentiment analysis (this is used to store the initial analysis and then be replaced with the sentiment percentages later)
  url: string | undefined,
  is_analyzed: boolean // flag representing when the interview is done being analyzed
}