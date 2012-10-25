"""
Script that appends topic models to links in a page.

In this first stab, we'll specifically tagify this page:
http://nytm.org/made-in-nyc,

which was the motivation for building this script in the first place.
"""

import pickle
import re
import time
import urllib
import urllib2
from urlparse import urlsplit

from bs4 import BeautifulSoup


DELICIOUS_SEARCH_ROOT = 'http://delicious.com/search/ws/everything'


def get_tags_from_delicious(url_link):
    """For a given url, get the tags for that page from Delicious.

    Delicious doesn't really provide a good API for this, so we
    just BeautifulSoup their asses.
    """
    # Avoid getting throttled.
    time.sleep(2)

    # By manually inspecting how the Delicious search results page works,
    # I learned that they make a POST request to DELICIOUS_SEARCH_ROOT
    # with the following data structure, where the query is the "content"
    # part of the url you are search for.
    # That is 'http://www.blah.com' would become 'www.blah.com'.
    query = urlsplit(url_link).netloc
    data = urllib.urlencode({
        'p': query,
        'al': 'ABP',
        'f': '1'
    })

    # Make a POST request to Delicious and read the results.
    search_results = urllib2.urlopen(DELICIOUS_SEARCH_ROOT, data).read()

    # Parse the shit it out of it, dirty.
    tags = []
    soup = BeautifulSoup(search_results)
    for linkEl in soup.find_all('div', class_='link'):
        # Just grab the tags from the first one that matches for now.
        if re.search(query, linkEl.find('span').text):
            tag_els = linkEl.find_all(class_='tag')
            tags = map(lambda el: el['title'], tag_els)
            break

    # A bit of INFO while this script is running.
    if not tags:
        print 'None found for', url_link
    else:
        print tags, 'found for', url_link

    return tags


def run(input_html, output_pickle):
    """Parse the input_html file for the urls we are lookin for,
    perform the query to Delicious, and pickle the results for the next step.
    """
    input_fh = open(input_html)
    output_fh = open(output_pickle, 'w')

    # Store the aggregated results in a dict structure of the form:
    # {
    #     'blah.com': ['tag1', 'tag2', 'tag3']
    #     'apple.com': ['computers', 'shiny', 'ipod']
    # }
    all_results = {}

    # Search for all the href's to look up.
    soup = BeautifulSoup(input_fh.read())
    url_list_elements = soup.article.contents[1]
    for el in url_list_elements.findAll('li'):
        url = el.find('a').get('href')
        tags = get_tags_from_delicious(url)
        all_results[url] = tags

    # Save the results to an output file for the next step.
    pickle.dump(all_results, output_fh)

    input_fh.close()
    output_fh.close()


if __name__ == '__main__':
    input_html = 'nyc.html'
    output_pickle = 'all_results_pickle'
    run(input_html, output_pickle)
