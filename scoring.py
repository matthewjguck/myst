# update_file.py
import gpt4o

# Initialize the running totals for each category at 0.
RUNNING_SCORES = {
    "Motivational": 0,
    "Educational": 0,
    "Financial": 0,
    "Political": 0,
    "Other": 0
}

def update_scores():
    """
    Calls gpt4o.score() to get the latest score dictionary and updates
    the global RUNNING_SCORES by adding the new scores to the running totals.
    Returns a copy of the updated scores.
    """
    new_scores = gpt4o.score()
    for category, score in new_scores.items():
        if category in RUNNING_SCORES:
            RUNNING_SCORES[category] += score
        else:
            # If an unexpected category comes in, add it to 'Other'
            RUNNING_SCORES["Other"] += score
    return RUNNING_SCORES.copy()

def main():
    # For demonstration purposes, update the running scores a few times.
    # In practice, you could call update_scores() every time a new result is received.
    for i in range(5):  # Simulate 5 updates
        updated = update_scores()
        print(f"After update {i+1}:")
        for category, total in updated.items():
            print(f"  {category}: {total}")
        print("-" * 40)

if __name__ == '__main__':
    main()