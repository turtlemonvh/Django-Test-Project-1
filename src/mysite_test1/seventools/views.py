from django.shortcuts import render_to_response
from django.template import Context, RequestContext
from django.http import Http404, HttpResponse
from mysite_test1.seventools.models import CardSession, Card
from django.core import serializers
import json
import os.path

# Card creation page
def createcards(request):
    sessions = CardSession.objects.all() # can iterate over and get name and id
    return render_to_response('createcards.html',
                              {"sessions": sessions},
                              context_instance=RequestContext(request)) # must include context instance to get STATIC_FILES to work

# Ajax method to get cards based on the session
def session_cards_JSON(request):
    if (request.is_ajax() and request.method == 'GET'):
        session_id = request.GET['id'] # get the sessioon id
        data = Card.objects.filter(session=session_id)
        return HttpResponse(serializers.serialize('json',data), mimetype="application/json")
    else:
        message = "Invalid access method"
    return HttpResponse(message)

# display page
# pass in sessions so they can choose one
# need session id for each

# Page for adding a session via ajax
#def addSession(request):
    

# page for adding a card to a session