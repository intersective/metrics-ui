import os
import pandas as pd
from scipy.stats import ttest_rel
import numpy as np
import hashlib
import sys
import json
pd.options.mode.copy_on_write = True

# Define Likert scale mapping
likert_scale = {
    'strongly disagree': 1,
    'disagree': 2,
    'partially agree': 3,
    'agree': 4,
    'strongly agree': 5
}

def transform_question(question):
    question = question.lower().replace('more ', '').replace('better ', '').replace('as a result of this module', '').replace('.', '').replace('  ', '')
    if 'actively research' in question:
        return question.split('actively research', 1)[1].strip()
    elif 'take the time' in question:
        return question.split('take the time', 1)[1].strip()
    elif 'resilience, ' in question:
        return question.split('resilience, ', 1)[1].strip()
    elif 'i understand' in question:
        return question.split('i understand', 1)[1].strip()
    elif 'i can' in question:
        return question.split('i can', 1)[1].strip()
    elif 'i feel' in question:
        return question.split('i feel', 1)[1].strip()
    elif 'am able' in question:
        return question.split('am able', 1)[1].strip()
    elif 'am effective' in question:
        return question.split('am effective', 1)[1].strip()
    elif 'am equipped' in question:
        return question.split('am equipped', 1)[1].strip()
    return question

# Function to load and process each pair of files
def process_reflection_files(baseline_file, final_file, output_dir):
    baseline_df = pd.read_csv(baseline_file)
    final_df = pd.read_csv(final_file)

    # Identify columns containing Likert scale values (assumes those are the question columns)
    def get_likert_columns(df):
        return [col for col in df.columns if df[col].astype(str).str.lower().isin(likert_scale.keys()).any(axis=0)]

    # Filter data to keep only the email and Likert scale columns
    likert_columns_baseline = get_likert_columns(baseline_df)
    likert_columns_final = get_likert_columns(final_df)
    baseline_data = baseline_df[['User Email'] + likert_columns_baseline]
    final_data = final_df[['User Email'] + likert_columns_final]

    # Map responses to numerical values based on the Likert scale
    # must be a case-insensitive match
    # if the value is not in the likert_scale, replace with None
    case_insensitive_likert_scale = {k.lower(): v for k, v in likert_scale.items()}
    baseline_data.loc[:, likert_columns_baseline] = baseline_data[likert_columns_baseline].apply(lambda col: col.map(lambda x: case_insensitive_likert_scale.get(x.lower(), None) if isinstance(x, str) else None))
    final_data.loc[:, likert_columns_final] = final_data[likert_columns_final].apply(lambda col: col.map(lambda x: case_insensitive_likert_scale.get(x.lower(), None) if isinstance(x, str) else None))    

    # Anonymize email addresses
    baseline_data.loc[:, 'User Email'] = baseline_data['User Email'].apply(lambda x: hashlib.sha256(x.encode()).hexdigest())
    final_data.loc[:, 'User Email'] = final_data['User Email'].apply(lambda x: hashlib.sha256(x.encode()).hexdigest())

    # for each question column in both files, change the header to only have the text from the word "understand" onward, remove the word "more" from the column name, and update the column name in the list of likert_columns
    for i in range(len(likert_columns_baseline)):
        new_question = transform_question(likert_columns_baseline[i])
        baseline_data = baseline_data.rename(columns={likert_columns_baseline[i]: new_question})
        likert_columns_baseline[i] = new_question
    
    for i in range(len(likert_columns_final)):
        new_question = transform_question(likert_columns_final[i])
        final_data = final_data.rename(columns={likert_columns_final[i]: new_question})
        likert_columns_final[i] = new_question

    # Merge baseline and final datasets on 'User Email'
    merged_df = pd.merge(baseline_data, final_data, on='User Email', suffixes=(' (baseline)', ' (final)'))

    # Calculate change and add to the merged DataFrame
    for question in likert_columns_baseline:
        merged_df[f'{question} (change)'] = None
        # the value might still be a string or null or NaN, remove the row if it is
        merged_df = merged_df.dropna(subset=[f'{question} (baseline)', f'{question} (final)'])
        merged_df[f'{question} (change)'] = merged_df[f'{question} (final)'] - merged_df[f'{question} (baseline)']

    averages = []
    # Calculate average baseline, final, and change scores for each likert question
    # store in averages, indexed by question (minus the (baseline) or (final) suffix)
    for question in likert_columns_baseline:
        baseline_avg = merged_df[f'{question} (baseline)'].mean()
        final_avg = merged_df[f'{question} (final)'].mean()
        change_avg = merged_df[f'{question} (change)'].mean()
        n_value = int(merged_df[f'{question} (baseline)'].count())

        # Calculate average change as a percentage based on the fact that the value range is 1-5
        change_avg_percent = (change_avg / 4) * 100

        # Perform t-test for p-value - is the change significant?
        baseline_scores = merged_df[f'{question} (baseline)'].values
        final_scores = merged_df[f'{question} (final)'].values

        # iterate through baseline score, if either baseline or final score is NaN or not a string, remove the corresponding index from both arrays
        for i in range(len(baseline_scores)):
            if np.isnan(baseline_scores[i]) or np.isnan(final_scores[i]):
                baseline_scores = np.delete(baseline_scores, i)
                final_scores = np.delete(final_scores, i)

        t_stat, p_value = ttest_rel(baseline_scores, final_scores)

        # Calculate effect size (Cohen's d)
        cohens_d = (np.mean(final_scores) - np.mean(baseline_scores)) / np.std(np.concatenate((baseline_scores, final_scores)))

        averages.append({
            'question': question,
            'average_baseline': baseline_avg,
            'average_final': final_avg,
            'average_change': change_avg,
            'average_change_percent': change_avg_percent,
            'n': n_value,
            'p': p_value,
            't_stat': t_stat,
            'Effect Size (Cohen\'s d)': cohens_d
        })

    # Save the combined data to a new CSV file
    output_file = os.path.join(output_dir, f'combined_{os.path.basename(baseline_file)}_anonymized.csv')
    merged_df.to_csv(output_file, index=False)

    # Print summary statistics
    summary = {
        'file': os.path.basename(baseline_file),
        'averages': averages
    }
    print("#############################################")
    print("Summary statistics:", summary)
    print(" ")
    return summary

# Function to find and process all pairs in a directory
def process_all_pairs_in_directory(directory, output_dir):
    # List all files in the directory
    files = os.listdir(directory)

    # Identify baseline and final reflection pairs
    baseline_files = [f for f in files if f.startswith('Baseline_Reflection_on_')]
    final_files = [f for f in files if f.startswith('Final_Reflection_on_')]

    # Create a dictionary of baseline to final pairs based on matching identifier
    pairs = {}
    for baseline in baseline_files:
        identifier = baseline.split('your_')[1].split('_')[0]
        final = next((f for f in final_files if f.startswith(f'Final_Reflection_on_{identifier}')), None)
        if final in final_files:
            pairs[baseline] = final

    summary = []

    # Process each pair, combining all summary statistics and outputting to a json file
    for baseline, final in pairs.items():
        baseline_path = os.path.join(directory, baseline)
        final_path = os.path.join(directory, final)
        # output paths to be processed to console
        print(f"Processing {baseline_path} and {final_path}")
        summary.append(process_reflection_files(baseline_path, final_path, output_dir))
        
    # Save summary statistics to a JSON file
    summary_file = os.path.join(output_dir, 'summary.json')
    with open(summary_file, 'w') as f:
        json.dump(summary, f, indent=4)

# Run the function on a specified directory
if len(sys.argv) != 2:
    print("Usage: python data-extract.py <directory>")
    sys.exit(1)

input_directory = sys.argv[1]
output_directory = sys.argv[1]
os.makedirs(output_directory, exist_ok=True)  # Create output directory if it doesn't exist
process_all_pairs_in_directory(input_directory, output_directory)