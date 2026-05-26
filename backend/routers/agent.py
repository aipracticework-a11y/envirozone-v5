from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.gemini_service import get_gemini_response

router = APIRouter()


class AgentAskRequest(BaseModel):
    message: str
    page: Optional[str] = "Application"
    context: dict = {}


@router.post("/ask")
def ask_enviro_agent(req: AgentAskRequest):
    """Context-aware assistant endpoint for the floating EnviroAgent."""
    context_bits = "\n".join(
        f"- {key}: {value}" for key, value in req.context.items() if value not in (None, "")
    )
    prompt = f"""You are EnviroAgent, an ESG data trust and compliance copilot inside EnvirozoneAI.
Current page: {req.page}
Available context:
{context_bits or "- No page context provided"}

User question:
{req.message}

Answer in a practical, audit-friendly way. If the question relates to trust scores,
explain what evidence, standards, or data fields should be checked. Keep the answer
concise and action oriented."""

    answer = get_gemini_response(prompt)
    return {
        "answer": answer,
        "page": req.page,
        "agent": "EnviroAgent",
        "capabilities": ["explain", "recommend", "draft", "investigate", "prepare_evidence"],
    }
