import json
import sys
import os

# Run the function on a specified directory
if len(sys.argv) != 2:
    print("Usage: python to-metrics.py <directory>")
    sys.exit(1)

input_directory = sys.argv[1]

# Load metrics-data.json
metrics_file_path = os.path.join(input_directory, 'metrics-data.json')
with open(metrics_file_path, 'r') as file:
    metrics_data = json.load(file)

# Load summary files by looking through all subdirectories in the input directory for summary.json
summary_file_paths = []
for root, dirs, files in os.walk(input_directory):
    for file in files:
        if file == 'summary.json':
            summary_file_paths.append(os.path.join(root, file))

# Define a mapping of question text to skill metric keys
# this is in the metrics-mapping.json file, which contains the mapping of questions to skill metrics
# [{"question": "I can identify the problem to be solved", "key": "problemSolving1"}, ...]
mapping_file_path = os.path.join(input_directory, 'metrics-mapping.json')
with open(mapping_file_path, 'r') as file:
    mapping_data = json.load(file)
    mapped = {item["question"]: item["key"] for item in mapping_data}

# Load all summaries from the summary files
summaries = []
for summary_path in summary_file_paths:
    with open(summary_path, 'r') as file:
        summaries.extend(json.load(file))

# Define a mapping of cohort year and season to cohort keys in metrics-data
cohort_mapping = {
    'Baseline': 'baseline_2023',
    'Cohort 1 2024': 'cohort1_2024',
    'Cohort 2 2024': 'cohort2_2024'
}

# Update metrics-data with information from the summaries
for summary in summaries:
    # Identify cohort key based on file name in summary
    filename = summary["file"]
    if "Data_Scientist" in filename:
        cohort_key = "dataScience"
    elif "Collaboration" in filename:
        cohort_key = "collaboration"
    elif "Problem_Solving" in filename:
        cohort_key = "problemSolving"
    elif "Innovation" in filename:
        cohort_key = "innovation"
    elif "Cultural_Intelligence" in filename:
        cohort_key = "culturalIntelligence"
    else:
        continue  # Skip files that don't match expected categories

    # Find the matching module metric in metrics-data
    for module in metrics_data["moduleMetrics"]:
        if module["key"] == cohort_key:
            for average_data in summary["averages"]:
                question = average_data["question"]

                # Find the skill metric for this question in the data
                for skill_metric in metrics_data["skillMetrics"]:

                    if skill_metric["key"] == mapped[question]:  # Match by start of question text
                        # print the matched skill metric key
                        print(skill_metric["key"]) 
                        cohort_data = {
                            "average_baseline": average_data["average_baseline"],
                            "average_final": average_data["average_final"],
                            "average_change": average_data["average_change_percent"],
                            "n": average_data["n"],
                            "p": average_data["p"],
                            "t_stat": average_data["t_stat"],
                            "effect_size": average_data["Effect Size (Cohen's d)"]
                        }

                        # Update each cohort based on the cohort mapping
                        skill_metric["data"][cohort_mapping['Baseline']].update(cohort_data)
                        skill_metric["data"][cohort_mapping['Cohort 1 2024']].update(cohort_data)
                        skill_metric["data"][cohort_mapping['Cohort 2 2024']].update(cohort_data)

# Save updated metrics-data.json
updated_metrics_file_path = os.path.join(input_directory, 'updated_metrics-data.json')
with open(updated_metrics_file_path, 'w') as file:
    json.dump(metrics_data, file, indent=2)

updated_metrics_file_path