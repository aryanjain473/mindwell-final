# tools/wikipedia_tool.py
import wikipedia

def search_wikipedia(query, sentences=3):
    """
    Search Wikipedia and return a short summary.

    Args:
        query (str): Search query.
        sentences (int): Number of summary sentences.

    Returns:
        str: Summary text.
    """
    try:
        return wikipedia.summary(query, sentences=sentences)
    except wikipedia.exceptions.DisambiguationError as e:
        return f"Multiple results found: {e.options[:5]}"
    except wikipedia.exceptions.PageError:
        return "No results found on Wikipedia."
