from textblob import TextBlob

def analyze_sentiment(text: str) -> dict:
    """
    Perform sentiment polarity classification using TextBlob.

    Args:
        text (str): Input text.

    Returns:
        dict: Sentiment polarity (-1 to 1) and label.
    """
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity
    subjectivity = analysis.sentiment.subjectivity  # how subjective the text is

    if polarity > 0.1:
        label = "positive"
    elif polarity < -0.1:
        label = "negative"
    else:
        label = "neutral"

    return {
        "polarity": polarity,
        "subjectivity": subjectivity,
        "label": label
    }
