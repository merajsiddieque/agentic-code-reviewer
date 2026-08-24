"""
Evaluation metrics for the Agentic Code Reviewer.
Calculates precision, recall, f1-score, and exact match rate without external ML libraries.
"""

import re
from typing import Any


def _normalize_text(text: str) -> str:
    """
    Normalize text by lowering case and collapsing whitespace and special markdown punctuation.
    """
    text = text.lower()
    text = re.sub(r"[`*_#\-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _is_finding_present(finding: str, normalized_review: str) -> bool:
    """
    Check if a specific expected finding or concept is present in the review.
    """
    norm_finding = _normalize_text(finding)

    # 1. Direct substring check
    if norm_finding in normalized_review:
        return True

    # 2. Check for token combinations (e.g. 'High severity' -> 'severity' and 'high')
    tokens = [t for t in norm_finding.split() if len(t) > 2]
    if tokens and all(t in normalized_review for t in tokens):
        return True

    return False


def calculate_sample_metrics(
    expected_findings: list[str],
    review_text: str,
    unexpected_findings: list[str] | None = None,
) -> dict[str, Any]:
    """
    Calculate precision, recall, F1, and exact match for a single review against expected
    and unexpected findings.

    Args:
        expected_findings: List of strings/concepts expected in the review.
        review_text: The generated review Markdown from the agent.
        unexpected_findings: Optional list of concepts that should NOT appear (distractors / false positives).

    Returns:
        Dictionary with tp, fp, fn, precision, recall, f1, exact_match, matched, and missing lists.
    """
    normalized_review = _normalize_text(review_text)
    matched: list[str] = []
    missing: list[str] = []
    false_positives: list[str] = []

    # 1. Evaluate True Positives and False Negatives against Expected Findings
    for finding in expected_findings:
        if _is_finding_present(finding, normalized_review):
            matched.append(finding)
        else:
            missing.append(finding)

    # 2. Evaluate False Positives against Unexpected Findings (if provided)
    if unexpected_findings:
        for unwanted in unexpected_findings:
            if _is_finding_present(unwanted, normalized_review):
                false_positives.append(unwanted)

    tp = len(matched)
    fn = len(missing)
    fp = len(false_positives)
    total_expected = len(expected_findings)

    # Recall: Proportion of actual expected findings that were identified
    if total_expected > 0:
        recall = tp / total_expected
    else:
        recall = 1.0 if fn == 0 else 0.0

    # Precision: Proportion of detected findings that were relevant (TP / (TP + FP))
    if (tp + fp) > 0:
        precision = tp / (tp + fp)
    else:
        precision = 1.0 if (total_expected == 0 and fp == 0) else 0.0

    # F1 Score: Harmonic mean of precision and recall
    if (precision + recall) > 0:
        f1 = 2 * (precision * recall) / (precision + recall)
    else:
        f1 = 0.0

    exact_match = 1.0 if (fn == 0 and fp == 0) else 0.0

    return {
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "exact_match": exact_match,
        "matched_findings": matched,
        "missing_findings": missing,
        "false_positives": false_positives,
    }


def calculate_aggregate_metrics(sample_results: list[dict[str, Any]]) -> dict[str, float]:
    """
    Compute macro-averaged overall precision, recall, F1, and exact match rate across all samples.

    Args:
        sample_results: List of per-sample metric dictionaries.

    Returns:
        Dictionary containing overall precision, recall, f1, and exact_match_rate.
    """
    if not sample_results:
        return {
            "overall_precision": 0.0,
            "overall_recall": 0.0,
            "overall_f1": 0.0,
            "overall_exact_match_rate": 0.0,
        }

    n = len(sample_results)
    mean_precision = sum(s["precision"] for s in sample_results) / n
    mean_recall = sum(s["recall"] for s in sample_results) / n
    mean_f1 = sum(s["f1_score"] for s in sample_results) / n
    mean_exact_match = sum(s["exact_match"] for s in sample_results) / n

    return {
        "overall_precision": round(mean_precision, 4),
        "overall_recall": round(mean_recall, 4),
        "overall_f1": round(mean_f1, 4),
        "overall_exact_match_rate": round(mean_exact_match, 4),
    }

