"""
Prompt guardrails for EnvirozoneAI LLM calls.

Every prompt that reaches Gemini should pass through enforce_prompt_guardrails()
first. The function returns a small structured result that can be logged or
returned safely without exposing the blocked prompt.
"""
import hashlib
import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class GuardrailResult:
    allowed: bool
    reason: Optional[str] = None
    layer: Optional[str] = None
    prompt_hash: Optional[str] = None


REQUIRED_FIELDS = ["user_id", "session_id", "message"]

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous\s+)?instructions",
    r"disregard\s+(your\s+)?(previous|prior|above)",
    r"(new|updated)\s+system\s+prompt",
    r"reveal\s+(the\s+)?(system|developer)\s+prompt",
    r"you\s+are\s+now\s+",
    r"pretend\s+(you\s+are|to\s+be)",
    r"act\s+as\s+(if\s+you\s+(are|were)|a\s+)",
    r"jailbreak",
    r"dan\s*mode",
    r"developer\s+mode",
    r"<\s*script\b[^>]*>",
    r"(--|;|')\s*(drop|select|insert|update|delete)\s+",
]

SECRET_PATTERNS = [
    r"sk-[A-Za-z0-9]{20,}",
    r"-----BEGIN\s+(?:RSA\s+|EC\s+)?PRIVATE\s+KEY",
    r"AIza[0-9A-Za-z\-_]{35}",
    r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}.*secret",
    r"password\s*[=:]\s*\S{8,}",
    r"api[_-]?key\s*[=:]\s*\S{8,}",
    r"Bearer\s+[A-Za-z0-9\-._~+/]+=*",
]

DOMAIN_BLOCKLIST = [
    "falsify audit",
    "fake certification",
    "forge certification",
    "bypass eudr",
    "hide emissions",
    "manipulate trust score",
]


def _hash_prompt(message: str) -> str:
    return hashlib.sha256(message.encode("utf-8")).hexdigest()[:16]


def enforce_prompt_guardrails(request: dict, require_identity: bool = True) -> GuardrailResult:
    """
    Validate an LLM request before provider invocation.

    Args:
        request: Dict containing message and, when require_identity=True,
            user_id and session_id.
        require_identity: Internal scheduled/system prompts in this app do not
            always have a real user/session. They still get injection, secret,
            and domain checks.
    """
    message = str(request.get("message") or "")
    prompt_hash = _hash_prompt(message)

    required_fields = REQUIRED_FIELDS if require_identity else ["message"]
    missing = [field for field in required_fields if not request.get(field)]
    if missing:
        return GuardrailResult(
            allowed=False,
            reason=f"missing_required_fields:{','.join(missing)}",
            layer="layer_1_structural",
            prompt_hash=prompt_hash,
        )

    message_lower = message.lower()

    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, message_lower, re.IGNORECASE):
            return GuardrailResult(
                allowed=False,
                reason="injection_detected",
                layer="layer_2_injection",
                prompt_hash=prompt_hash,
            )

    for pattern in SECRET_PATTERNS:
        if re.search(pattern, message, re.IGNORECASE):
            return GuardrailResult(
                allowed=False,
                reason="secret_detected",
                layer="layer_3_secrets",
                prompt_hash=prompt_hash,
            )

    for blocked_term in DOMAIN_BLOCKLIST:
        if blocked_term in message_lower:
            return GuardrailResult(
                allowed=False,
                reason=f"domain_policy_violation:{blocked_term}",
                layer="layer_4_domain",
                prompt_hash=prompt_hash,
            )

    return GuardrailResult(allowed=True, prompt_hash=prompt_hash)


def blocked_prompt_response(result: GuardrailResult) -> str:
    reason = result.reason or "guardrail_blocked"
    return f"[AI Guardrail Blocked: {reason}] The request was not sent to the AI model."
