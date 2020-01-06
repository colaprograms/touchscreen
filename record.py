import urllib, urllib.request, json
from bs4 import BeautifulSoup
import random, traceback

RN_LOW = 1000001
 
RN_HIGH = 3835994

def randomurl():
  URL = "https://mercury.concordia.ca/search/?searchtype=.&searcharg=b%07d"
  j = random.randint(RN_LOW, RN_HIGH)
  return (URL % j, j)

def remove_some_styling(tag):
  for z in tag.select("strong,a"):
    z.unwrap()

def getrec():
  try:
    uu, j = randomurl()
    print("asked server for", uu)
    req = urllib.request.urlopen( uu )
  except urllib.error.HTTPError as e:
    return {
      'error': ["http", e.code, e.reason, e.headers]
    }
  try:
    resp = req.read()
    print(resp)
    soup = BeautifulSoup(resp, 'html.parser')
    fiel = []
    for z in soup.select(".bibInfoEntry"):
      print("here is the stuff we got:", z)
      out = [None, []]
      def eject():
        if out[0] is not None:
          fiel.append((out[0], out[1]))
          out[:] = [None, []]
      def joinstrs(st):
          return "".join(str(_).strip() for _ in st)
      remove_some_styling(z)
      stuf = z.select(".bibInfoLabel,.bibInfoData")
      for what in stuf:
        if "bibInfoLabel" in what['class']:
          eject()
          out[0] = joinstrs(what.contents)
          pass
          pass
        elif "bibInfoData" in what['class']:
          out[1] += [joinstrs(what.contents)]
        else:
          print(what['class'])
      eject()
  except Exception as e:
    traceback.print_exc()
    return { 'error': ["parsing", traceback.format_exc()] }
  return { 'error': None, 'fields': fiel, 'recordnumber': j }
