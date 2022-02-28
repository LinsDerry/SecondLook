# This script, src_get_data_object.py, was createdpython by Satvik Shukla and adapted by Lins Derry for metaLAB project
# Curatorial A(i)gents. The ham_api_key has been removed for security. To retrieve your own key, please go to:
#
# https://www.harvardartmuseums.org/collections/api
#
# To run this Python script using my Mac Terminal, I download Python 3 then entered the following commands:
# 1. python3 get-pip.py
# 2. pip3 install virtualenv
# 3. python3 -m virtualenv env
# 4. source env/bin/activate
# 5. pip3 install certifi pandas tqdm urllib3
# 6. python3 /Users/linsderry/Desktop/src_get_data_object.py
#
# Once the script runs, a CSV file is generated on my Desktop containing the features_list as the primary fields.

import json
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

    features_list = ['colorcount', 'colors', 'century', 'classification', 'culture', 'peoplecount', 'people',
                    'titlescount', 'title', 'rank', 'totalpageviews', 'totaluniquepageviews', 'images', 'primaryimageurl',
                    'imagepermissionlevel']
                     
# 'imagepermissionlevel'
# 0 – ok to display images at any size
# 1 – images have restrictions; display at a maximum pixel dimension of 256px
# 2 – do not display any images

# 'rank'
# A lower number means the object is less active.

    page_req = http.request('GET', 'https://api.harvardartmuseums.org/object',
                            fields={
                                'apikey': ham_api_key,
                                'size': 100,
                                'classification': 'Paintings',
                                'hasimage': 1,
                                'color': 'any'
                            })

    page_parsed_data = json.loads(page_req.data)
    data = page_parsed_data['info']['next']

# Test with num_pages = 1 to make sure data is parsing to CSV OK
    num_pages = 54

# Note, due to elastic search limitations, can only pull 10,000 entires maximum.
# Fortunately, the Object section only has 5,400 entries so the below  works.
#    num_pages = page_parsed_data['info']['pages']


    df = pd.DataFrame()

    for i in range(1, num_pages + 1):
        for val in page_parsed_data['records']:
            object_req = http.request('GET', 'https://api.harvardartmuseums.org/object/{}'.format(val['id']),
                                      fields={
                                          'apikey': ham_api_key
                                      })
            object_parsed_data = json.loads(object_req.data)
            if object_parsed_data['verificationlevel'] in [2, 3, 4] and object_parsed_data['imagepermissionlevel'] == 0 and object_parsed_data['peoplecount'] > 0:
                object_data_to_append = {item: object_parsed_data[item] for item in features_list}
                df = df.append(object_data_to_append, ignore_index=True)

        page_req = http.request('GET', data)
        page_parsed_data = json.loads(page_req.data)

        if i < num_pages - 1:
            data = page_parsed_data['info']['next']

# Create CSV file:
    df.to_csv(DATA_PATH + 'metadata-object.csv', index=False)

if __name__ == '__main__':
    save_data()
