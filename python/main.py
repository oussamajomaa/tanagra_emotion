
"""
geopy is a Python client for several popular geocoding web services.
geopy makes it easy for Python developers to locate the coordinates of addresses, cities, 
countries, and landmarks across the globe using third-party geocoders and other data sources.
pip install geopy
"""

from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

import json
geolocator = Nominatim(user_agent="osm")


# from bs4 import BeautifulSoup
import re
from flask import Flask, request
from flask_cors import CORS

# library for name entities
import spacy

# library for sentiment analysis
from textblob import TextBlob

import mysql.connector



# import a groupby() method
# from itertools module
from itertools import groupby
from operator import itemgetter

"""
TextBlob: Library for sentiment analysis, we first import TextBlob and then create a TextBlob object for the sample text. 
We then use the sentiment.polarity property of the TextBlob object to determine the polarity of the 
sentiment, which is a value between -1 and 1. 
Finally, we classify the sentiment as positive, negative, or neutral based on the polarity value.
"""

# nlp = en_core_web_md.load()
import requests
from deep_translator import GoogleTranslator

app = Flask(__name__)
cors = CORS(app, resources={r"/*":{"origins":"*"}})

@app.route('/db')
def getDb():
    # Connect to the database
    cnx = mysql.connector.connect(user='osm', password='osm', host='127.0.0.1', database='geonames')

    # Create a cursor
    cursor = cnx.cursor()

    # Execute a SQL statement
    cursor.execute("SELECT * FROM city")
    # Fetch the results
    # results = dict(zip(cursor.column_names, cursor.fetchall()))
    columns = cursor.description 
    results = [{columns[index][0]:column for index, column in enumerate(value)} for value in cursor.fetchall()]
    
    return results

@app.route('/text', methods=['POST'])
def getEnt():
    try:

        
        # Get body request
        body = request.get_json(force=True)
        
        # body = request.args.get('text')
        # print(body)
        # Get params request
        model = request.args.get('model')
        if model == "en":
            nlp = spacy.load('en_core_web_sm')
            label = "GPE"
        if model == "fr":
            nlp = spacy.load('fr_core_news_sm')
            label = "LOC"
        # Tokinization of text
        tokens = nlp(body)

        entities = []
        # split tokens into sentences
        for sentence in tokens.sents:
            sentence = str(sentence)
            # if model == "fr":
            #     sentence_fr = sentence
            ents = nlp(str(sentence)).ents

            sentence = GoogleTranslator(source="auto", target="en").translate(sentence) 
            # Create a TextBlob object
            blob = TextBlob(sentence)
            sentiment = blob.sentiment.polarity
            print(sentence)
            
            print(ents)
            for ent in ents:
                if ent.label_ == label:
                    
                    if sentiment > 0:
                        entities.append({"name":ent.text,"emotion":"Positive"})
                    elif sentiment < 0:
                        entities.append({"name":ent.text,"emotion":"Negative"})
                    else:
                        entities.append({"name":ent.text,"emotion":"Neutral"})

        results = []

        # Sort entities data by "place" key.
        entities = sorted(entities, key= itemgetter('name'))

        # Group entities data by "place" key
        for key, value in groupby(entities, key= itemgetter('name')):
            emotions = []
            for k in value:
                emotions.append(k["emotion"])
            results.append({"name":key, "country":"", "emotions":emotions, "lat": 0, "lng": 0})

        # Compare the number of emotion for every "place" and save the big number

        
            for res in results:
                pos = res['emotions'].count('Positive')
                neg = res['emotions'].count('Negative')
                if pos > neg:
                    res['emotions'] = "Positive"
                elif pos < neg:
                    res['emotions'] = "Negative"
                else:
                    res['emotions'] = "Neutral"
                
                # Get location from geopy.geolocator and try to get latitude and logitude
            
                # location = geolocator.geocode(res['name'])
                # if location:
                #     if geolocator.geocode(res['name']).latitude:
                #         if geolocator.geocode(res['name']).longitude:
                #             res['lat'] = geolocator.geocode(res['name']).latitude
                #             res['lng'] = geolocator.geocode(res['name']).longitude
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        print(f"Error: {e}")
        return json.dumps(e)
    
    # response = requests.get('http://localhost:4200/')
    # print("Code de statut : ", response.status_code)
    return json.dumps(results)


if __name__ == '__main__':
    app.run('0.0.0.0', debug=True, port=3333)

