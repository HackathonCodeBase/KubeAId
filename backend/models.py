from pydantic import BaseModel
from typing import Optional

class Metrics(BaseModel):
    cpu: int
    memory: int
    status: str

class IssueDetail(BaseModel):
    issue_type: Optional[str] = None
    severity: Optional[str] = None
    confidence: Optional[float] = None
