"""
Benchmark test runner for Agentic Code Reviewer evaluation harness.

Usage:
    python -m backend.evaluation.runner [--limit N]
"""

import argparse
import json
import time
from pathlib import Path
from typing import Any

from ..agent import review_code
from .metrics import calculate_aggregate_metrics, calculate_sample_metrics
from .report import save_and_display_report


def run_evaluation(
    limit: int | None = 3,
    dataset_path: str | Path | None = None,
    output_path: str | Path = "evaluation_report.json",
) -> dict[str, Any]:
    """
    Execute benchmark evaluation over the test dataset and generate a report.

    Args:
        limit: Maximum number of samples to evaluate (default 3 to conserve API quota, None for all).
        dataset_path: Path to dataset.json. Defaults to dataset.json inside the evaluation directory.
        output_path: Path for saving evaluation_report.json.

    Returns:
        The generated report payload dictionary.
    """
    if dataset_path is None:
        dataset_path = Path(__file__).parent / "dataset.json"

    dataset_file = Path(dataset_path)
    if not dataset_file.exists():
        raise FileNotFoundError(f"Evaluation dataset not found at: {dataset_file}")

    dataset = json.loads(dataset_file.read_text(encoding="utf-8"))

    if limit is not None and limit > 0:
        dataset = dataset[:limit]

    eval_results: list[dict[str, Any]] = []

    print(f"[*] Starting Evaluation Harness on {len(dataset)} benchmark test cases...\n")

    for index, item in enumerate(dataset, start=1):
        test_id = item.get("id", index)
        title = item.get("title", f"Sample #{test_id}")
        code = item.get("code", "")
        expected = item.get("expected_findings", [])
        mock_filename = f"{title.lower().replace(' ', '_')}.py"

        print(f"[{index}/{len(dataset)}] Evaluating #{test_id}: {title}...")

        # 1. Run the existing agentic review pipeline
        review_output = review_code(code=code, filename=mock_filename)

        # 2. Evaluate metrics
        metrics = calculate_sample_metrics(expected_findings=expected, review_text=review_output)

        eval_results.append({
            "id": test_id,
            "title": title,
            "code": code,
            "expected_findings": expected,
            "review_output": review_output,
            "metrics": metrics,
        })

        # Pacing between test cases
        if index < len(dataset):
            time.sleep(2.0)

    # 3. Compute aggregate benchmark metrics
    sample_metrics_list = [r["metrics"] for r in eval_results]
    aggregates = calculate_aggregate_metrics(sample_metrics_list)

    # 4. Generate report & display summary
    report = save_and_display_report(
        eval_results=eval_results,
        aggregate_metrics=aggregates,
        output_filepath=output_path,
    )

    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Agentic Code Reviewer Benchmark Runner")
    parser.add_argument(
        "--limit",
        "-n",
        type=int,
        default=3,
        help="Maximum number of dataset samples to evaluate (default: 3). Use 0 to evaluate all samples.",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="evaluation_report.json",
        help="Output report JSON filepath.",
    )
    args = parser.parse_args()

    sample_limit = None if args.limit <= 0 else args.limit
    run_evaluation(limit=sample_limit, output_path=args.output)
