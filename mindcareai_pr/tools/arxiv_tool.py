# tools/arxiv_tool.py
import arxiv

def search_arxiv(query, max_results=3):
    """
    Search ArXiv for research papers.
    
    Args:
        query (str): Search query (e.g., 'mental health AI').
        max_results (int): Number of papers to return.

    Returns:
        list of dict: Each dict contains title, summary, and url.
    """
    results = []
    search = arxiv.Search(
        query=query,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.Relevance
    )

    for result in search.results():
        results.append({
            "title": result.title,
            "summary": result.summary,
            "url": result.entry_id
        })

    return results
