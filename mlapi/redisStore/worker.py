import sys
from rq import Worker
from redisStore.myconnection import get_redis_con
from utils.logger_config import get_logger
import uuid
logger = get_logger(__name__)

# Default list of queues to listen for jobs on
DEFAULT_QUEUES = ["default", "high", "low"]

def get_worker(priorities=None):
    """
    Create and return a worker instance
    
    Args:
        queues: List of queue priorities to listen on ["default", "high", "low"]
    
    Returns:
        Worker: RQ Worker instance
    """
    # if no priorities are specified, then the new worker will listen to all available queues
    if priorities is None:
        priorities = DEFAULT_QUEUES
    
    conn = get_redis_con()

    return Worker(priorities, connection=conn, name=f"Emma_Frost {uuid.uuid4().hex[:8]}") # create a worker instance that watches the given queue priorities, with in the given Redis server, and give them a custom name


if __name__ == "__main__":
    # Accept queue priorities as command-line arguments
    if len(sys.argv) > 1:
        priorities = sys.argv[1:]
        logger.info(f"Starting worker listening to queues: {', '.join(priorities)}")
        worker = get_worker(priorities)
    else:
        logger.info(f"Starting worker listening to default queues: {', '.join(DEFAULT_QUEUES)}")
        worker = get_worker()

    worker.work(with_scheduler=True)