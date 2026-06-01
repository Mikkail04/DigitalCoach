"""
Schemas for HeyGen related data models.
"""

from pydantic import BaseModel

class HeyGenSessionRequest(BaseModel):
    """
    HeyGen Session Configurations. IDs can be found on HeyGen LiveAvatar website.
    """
    
    avatar_id: str = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a" # What the avatar looks like
    voice_id: str = "c2527536-6d1f-4412-a643-53a3497dada9" # What the avatar sounds like 
    context_id: str = "595268c3-a4cf-499d-bf85-efd006fe8a47" # What the avatar knows
    is_sandbox: bool = False # Toggle HeyGen LiveAvatar's sandbox mode 