from rq.job import Job
from rq import Retry
from rq.queue import Queue
from redisStore.myconnection import get_redis_con
from utils.logger_config import get_logger

logger = get_logger(__name__)
QUEUE_PRIORITIES = ["high", "default", "low"] # list of queue priorities

def get_queue(priority="default") -> Queue:
    """
    Get a RQ instance with the specified priority ('default', 'high', or 'low')

    Args:
        priority (str): Queue priority ('default', 'high', or 'low')

    Returns:
        Queue: RQ instance
    """
    conn = get_redis_con() # get connection redis client
    return Queue(name=priority, connection=conn)


def add_task_to_queue(priority, task, *args, depends_on=None) -> Job:
    """
    Add a task to the Redis queue with proper error handling and logging.

    Args:
        priority: Priority of the queue you want to submit your task to ('default', 'high', or 'low')
        task: The task function to be executed
        args: List of arguments to pass to the task

    Returns:
        Job: The enqueued job object
    """
    
    try:
        # get RQ instance
        if (priority not in QUEUE_PRIORITIES):
            raise ValueError(f"Invalid queue name '{priority}'. Must be one of: {', '.join(QUEUE_PRIORITIES)}.")

        queue = get_queue(priority)

        job = queue.enqueue(
            task,
            *args,
            depends_on=depends_on,
            retry=Retry(max=3) # retry failed job up to 3 times
        )
        logger.info(f"Task {task.__name__} enqueued with job ID: {job.get_id()}")
        return job
    except Exception as e:
        logger.error(f"Failed to enqueue task: {str(e)}")
        raise e
