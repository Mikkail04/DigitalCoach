"""
Schemas for HeyGen related data models.
"""

from pydantic import BaseModel, HttpUrl


class HeyGenSessionRequest(BaseModel):
    """
    HeyGen Session Configurations. IDs can be found on HeyGen LiveAvatar website.
    """
    
    avatar_id: str = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a" # What the avatar looks like
    voice_id: str = "62bbb4b2-bb26-4727-bc87-cfb2bd4e0cc8" # What the avatar sounds like 
    #context_id: str = "595268c3-a4cf-499d-bf85-efd006fe8a47" # What the avatar knows
    context_id: str = "609a5458-39e1-4f26-a283-f56fb75ed5d6"
    is_sandbox: bool = False # Toggle HeyGen LiveAvatar's sandbox mode 

class HeyGenSessionResponse(BaseModel):
    """
    HeyGen Session Response Model.
    """

    session_url: HttpUrl # URL to connect to the created HeyGen LiveAvatar session