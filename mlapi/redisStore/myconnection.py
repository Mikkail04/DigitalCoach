import os
from redis import Redis, ConnectionPool
from utils.logger_config import get_logger
from dotenv import load_dotenv
logger = get_logger(__name__)


load_dotenv() # load environment variables
# Create the connection pool, i.e. a way to manage and reuse the same Redis connection instead of establishing a new one everytime
redis_url = os.getenv("REDIS_URL") # check if we have a redis URL (this is for cases where we'd use a cloud provider)

try:
    if (redis_url):
        POOL = ConnectionPool.from_url(redis_url, decode_responses=False)
    else:
        print(f"Creating connection pool using individual parameters...")
        # create connection pool using our own parameters
        POOL = ConnectionPool(
            host=os.getenv("REDIS_HOST", "redis"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            password=os.getenv("REDIS_PASSWRORD", ""),
            decode_responses=False,
            socket_timeout=5, # time to wait for Redis to respond before throwing an error instead of infinitely hanging 
            health_check_interval=30,
        )
    # test connection to redis server after initialization
    test = Redis(connection_pool=POOL)
    print(f"Redis Connection Pool creation successful: {test.ping()}")

except Exception as e:
    logger.error(f"Failed to create connection pool to Redis server: {e}")
    raise e

def get_redis_con() -> Redis:
    """
    Create a secure Redis connection with authentication.

    Returns:
        Redis: Authenticated Redis connection
    """
    try: 
        return Redis(connection_pool=POOL) # return Redis client that uses the already established connection to our Redis server
    except Exception as e:
        logger.error(f"Failed to create Redis connection: {e}")
        raise e