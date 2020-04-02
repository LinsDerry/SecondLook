import json

import certifi
import pandas as pd
import urllib3
from tqdm import trange

# from api_key import ham_api_key
# from settings import DATA_PATH


api_key = 'ed473380-f7f7-11e9-ac89-7bb693659e8d'
# Relative path from Webstorm IDE project
DATA_PATH = 'curatorialAI/data'

# Full path from Mac
# DATA_PATH = '/Users/linsderry/desktop'

def save_data():
    http = urllib3.PoolManager(
        cert_reqs='CERT_REQUIRED',
        ca_certs=certifi.where())

    features_list = ['colorcount', 'colors', 'objectid', 'id' 'dated', 'datebegin', 'dateend', 'century'
                     'classification', 'classificationid', 'technique', 'techniqueid', 'culture', 'department',
                     'division', 'peoplecount', 'titlescount', 'rank', 'totalpageviews', 'totaluniquepageviews',
                     'primaryimageurl', 'imagepermissionlevel', 'title', 'people', 'experimental']

# 'imagepermissionlevel'
# 0 – ok to display images at any size
# 1 – images have restrictions; display at a maximum pixel dimension of 256px
# 2 – do not display any images

    page_req = http.request('GET', 'https://api.harvardartmuseums.org/object',
                            fields={
                                'apikey': ham_api_key,
                                'size': 100,
                                'classification': 23,
                                'hasimage': 1,
                                'sort': 'objectid',
                                'sortorder': 'asc',
                                'color': 'any'
                            })

    page_parsed_data = json.loads(page_req.data)
    data = page_parsed_data['info']['next']

    num_pages = page_parsed_data['info']['pages']

    df = pd.DataFrame()

    for i in trange(1, num_pages + 1):
        for val in page_parsed_data['records']:
            object_req = http.request('GET', 'https://api.harvardartmuseums.org/object/{}'.format(val['id']),
                                      fields={
                                          'apikey': ham_api_key
                                      })
            object_parsed_data = json.loads(object_req.data)
            if object_parsed_data['verificationlevel'] in [2, 3, 4] and object_parsed_data['imagepermissionlevel'] == 0:
                object_data_to_append = {item: object_parsed_data[item] for item in features_list}
                df = df.append(object_data_to_append, ignore_index=True)

        page_req = http.request('GET', data)
        page_parsed_data = json.loads(page_req.data)

        if i < num_pages - 1:
            data = page_parsed_data['info']['next']

    df.to_csv(DATA_PATH + 'metadata-object.csv', index=False)


if __name__ == '__main__':
    save_data()