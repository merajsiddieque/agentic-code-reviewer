"""
Report generator module for the Agentic Code Reviewer evaluation harness.
"""

import json
from pathlib import Path
from typing import Any


def save_and_display_report(
    eval_results: list[dict[str, Any]],
    aggregate_metrics: dict[str, float],
    output_filepath: str | Path = "evaluation_report.json",
) -> dict[str, Any]:
    """
    Save evaluation results to a JSON report file and print a formatted summary to the console.

    Args:
        eval_results: List of evaluation outcomes for each sample.
        aggregate_metrics: Aggregated benchmark metrics.
        output_filepath: Path where evaluation_report.json should be saved.

    Returns:
        The complete structured report dictionary.
    """
    failed_cases: list[dict[str, Any]] = [
        {
            "id": r["id"],
            "title": r["title"],
            "filename": r.get("filename", ""),
            "missing_findings": r["metrics"].get("missing_findings", []),
            "false_positives": r["metrics"].get("false_positives", []),
        }
        for r in eval_results
        if r["metrics"].get("fn", 0) > 0 or r["metrics"].get("fp", 0) > 0
    ]

    report_payload = {
        "summary": {
            "total_samples": len(eval_results),
            "passed_samples": len(eval_results) - len(failed_cases),
            "failed_samples": len(failed_cases),
            **aggregate_metrics,
        },
        "per_example_scores": [
            {
                "id": r["id"],
                "title": r["title"],
                "filename": r.get("filename", ""),
                "precision": r["metrics"]["precision"],
                "recall": r["metrics"]["recall"],
                "f1_score": r["metrics"]["f1_score"],
                "exact_match": r["metrics"]["exact_match"],
                "matched_findings": r["metrics"].get("matched_findings", []),
                "missing_findings": r["metrics"].get("missing_findings", []),
                "false_positives": r["metrics"].get("false_positives", []),
            }
            for r in eval_results
        ],
        "failed_cases": failed_cases,
    }

    # Save report to JSON file
    path = Path(output_filepath)
    path.write_text(json.dumps(report_payload, indent=2), encoding="utf-8")

    # Print Formatted Console Output
    print("\n" + "=" * 70)
    print("           AGENTIC CODE REVIEWER - EVALUATION BENCHMARK REPORT")
    print("=" * 70)
    print(f"Total Samples Evaluated : {len(eval_results)}")
    print(f"Overall Precision       : {aggregate_metrics['overall_precision']:.2%}")
    print(f"Overall Recall          : {aggregate_metrics['overall_recall']:.2%}")
    print(f"Overall F1 Score        : {aggregate_metrics['overall_f1']:.2%}")
    print(f"Exact Match Rate        : {aggregate_metrics['overall_exact_match_rate']:.2%}")
    print("-" * 70)
    print(f"{'ID':<4} | {'Benchmark Test Title':<35} | {'Prec':<6} | {'Recall':<6} | {'F1':<6}")
    print("-" * 70)

    for r in eval_results:
        m = r["metrics"]
        print(
            f"{r['id']:<4} | {r['title'][:35]:<35} | {m['precision']:<6.2f} | {m['recall']:<6.2f} | {m['f1_score']:<6.2f}"
        )

    print("=" * 70)
    if failed_cases:
        print(f"\n[!] Failed Cases ({len(failed_cases)}):")
        for f in failed_cases:
            print(f"  - #{f['id']} {f['title']} => Missing: {f['missing_findings']}")
    else:
        print("\n[+] All 10 benchmark test cases passed with 100% finding recall!")

    print(f"\nFull evaluation report saved to: {path.resolve()}\n")
    return report_payload
