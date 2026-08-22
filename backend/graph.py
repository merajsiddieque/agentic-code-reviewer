"""
LangGraph StateGraph workflow definition for the Multi-Language Agentic Code Reviewer.
"""

import sys
from pathlib import Path
from langgraph.graph import END, START, StateGraph

if __package__ is None or __package__ == "":
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from backend.nodes import (
        ast_node,
        load_code_node,
        metrics_node,
        review_node,
        router_node,
        security_node,
    )
    from backend.state import ReviewState
    from backend.tools import detect_language
else:
    from .nodes import (
        ast_node,
        load_code_node,
        metrics_node,
        review_node,
        router_node,
        security_node,
    )
    from .state import ReviewState
    from .tools import detect_language


def route_decision(state: ReviewState) -> str:
    """
    Conditional routing function after the router node.
    - Non-Python languages skip the AST node and proceed directly to metrics / security.
    - Python language routes according to router decision ('security', 'structure', 'full').
    """
    lang = state.get("language") or detect_language(state.get("filename", ""))
    route = state.get("route", "full")

    if lang != "python":
        if route == "security":
            return "security"
        return "metrics"

    # Python routing
    if route == "security":
        return "security"
    elif route == "structure":
        return "structure"
    return "full"


def post_ast_decision(state: ReviewState) -> str:
    """
    Conditional routing function after AST node for Python:
    - 'structure' route goes directly to review_node
    - 'full' route proceeds to metrics_node
    """
    if state.get("route") == "structure":
        return "review"
    return "metrics"


# Build the StateGraph
workflow: StateGraph = StateGraph(state_schema=ReviewState)

# Register Nodes
workflow.add_node("load_code_node", load_code_node)
workflow.add_node("router_node", router_node)
workflow.add_node("ast_node", ast_node)
workflow.add_node("metrics_node", metrics_node)
workflow.add_node("security_node", security_node)
workflow.add_node("review_node", review_node)

# Flow Connections
workflow.add_edge(START, "load_code_node")
workflow.add_edge("load_code_node", "router_node")

workflow.add_conditional_edges(
    "router_node",
    route_decision,
    {
        "security": "security_node",
        "structure": "ast_node",
        "full": "ast_node",
        "metrics": "metrics_node",
    },
)

workflow.add_conditional_edges(
    "ast_node",
    post_ast_decision,
    {
        "metrics": "metrics_node",
        "review": "review_node",
    },
)

workflow.add_edge("metrics_node", "security_node")
workflow.add_edge("security_node", "review_node")
workflow.add_edge("review_node", END)

# Compile into reusable graph instance
review_graph = workflow.compile()
