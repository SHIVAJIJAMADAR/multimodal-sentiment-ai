import pandas as pd

print("Loading dataset...")

df = pd.read_csv("Reviews.csv")

# Keep only required columns
df = df[["reviews.text", "reviews.rating"]]

# Remove empty rows
df = df.dropna()

# Convert rating → sentiment
def convert_label(rating):
    if rating <= 2:
        return "negative"
    elif rating == 3:
        return "neutral"
    else:
        return "positive"

df["label"] = df["reviews.rating"].apply(convert_label)

# Rename text column
df = df.rename(columns={"reviews.text": "text"})

# Add placeholder image column
df["image_path"] = "placeholder.jpg"

# Final dataset format
df = df[["text", "image_path", "label"]]

# Reduce dataset size (important for CPU training)
df = df.sample(n=min(len(df), 20000), random_state=42)

df.to_csv("dataset.csv", index=False)

print("dataset.csv created successfully!")