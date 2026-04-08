"""

FastAPI dependency providers (singleton-style engines).

"""



from __future__ import annotations



from functools import lru_cache



from fastapi import Depends



from services.ai_engine import AIEngine

from services.evaluation_service import EvaluationService

from services.rule_engine import RuleEngine





@lru_cache

def get_rule_engine() -> RuleEngine:

    return RuleEngine()





@lru_cache

def get_ai_engine() -> AIEngine:

    return AIEngine()





def get_evaluation_service(

    rule_engine: RuleEngine = Depends(get_rule_engine),

    ai_engine: AIEngine = Depends(get_ai_engine),

) -> EvaluationService:

    return EvaluationService(rule_engine, ai_engine)


