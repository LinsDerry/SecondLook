# This script, src_get_data_annotation.py, was created by Satvik Shukla and adapted by Lins Derry for metaLAB project
# Curatorial A(i)gents. The ham_api_key has been removed for security. To retrieve your own key, please go to:
#
# https://www.harvardartmuseums.org/collections/api
#
# To run this Python script using my Mac Terminal, I download Python 3 then entered the following commands:
# 1. python3 get-pip.py
# 2. pip3 install virtualenv
# 3. python3 -m virtualenv env
# 4. source env/bin/activate
# 5. pip3 install certifi pandas tqdm urllib3 elasticsearch
# 6. python3 /Users/linsderry/Desktop/src_get_data_annotation.py
#
# Once the script runs, a CSV file is generated on my Desktop.


# import the Elasticsearch client library
from elasticsearch import Elasticsearch, exceptions

# import JSON and time
import json, time

import certifi
import pandas as pd
import urllib3
from tqdm import trange

ham_api_key = 'ed473380-f7f7-11e9-ac89-7bb693659e8d'

# Path from Mac
DATA_PATH = '/Users/linsderry/Desktop/'

def save_data():
    http = urllib3.PoolManager(
        cert_reqs='CERT_REQUIRED',
        ca_certs=certifi.where())

    features_list = ['imageid', 'source', 'type', 'raw', 'confidence']
    
    #'confidence'
    # Values range from 0 (no confidence) to 1 (very confident).
    # A value of -1 means confidence is unknown or was not provided by the service for the annotation.

    page_req = http.request('GET', 'https://api.harvardartmuseums.org/annotation',
                            fields={
                                'apikey': ham_api_key,
                                'size': 100,
                                'q': 'type:face',
                                'page': 1
                            })

    page_parsed_data = json.loads(page_req.data)
    data = page_parsed_data['info']['next']
    
# Test with num_pages = 1 to make sure data is parsing to CSV OK
#    num_pages = 1
# Note, due to elastic search limitations, was unable to pull more than 10,000 annotations, so max num_pages is 100.
    num_pages = 100
# Run through entire Annotation section on API
#    num_pages = page_parsed_data['info']['pages']


    df = pd.DataFrame()

    for i in trange(1, num_pages + 1):
        for val in page_parsed_data['records']:
            object_req = http.request('GET', 'https://api.harvardartmuseums.org/annotation/{}'.format(val['id']),
                                      fields={
                                          'apikey': ham_api_key
                                      })
            object_parsed_data = json.loads(object_req.data)
# Filter here using if-statement
            if object_parsed_data['source'] == 'AWS Rekognition':
               object_data_to_append = {item: object_parsed_data[item] for item in features_list}
               df = df.append(object_data_to_append, ignore_index=True)

        page_req = http.request('GET', data)
        page_parsed_data = json.loads(page_req.data)

        if i < num_pages - 1:
            data = page_parsed_data['info']['next']
            
# Create CSV file:
    df.to_csv(DATA_PATH + 'metadata-annotation-all-1.csv', index=False)

if __name__ == '__main__':
    save_data()
