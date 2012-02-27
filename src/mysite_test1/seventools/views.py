from django.shortcuts import render_to_response
from django.template import Context, RequestContext
from django.http import Http404, HttpResponse
from mysite_test1.seventools.models import CardSession, Card
from django.core import serializers
from django.utils import simplejson
from string import strip

# Card creation page
def createcards(request):
    sessions = CardSession.objects.all() # can iterate over and get name and id
    sessionsm = []    
    for session in sessions:
        subdata = {}
        subdata['id'] = session.id;
        subdata['name'] = session.name;
        sessionsm.append(subdata)
    return render_to_response('createcards.html',
                              {"sessions": sessionsm},
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

# Ajax method to add card
def add_card(request):
    # int(float(request.GET['session_id']))
    if (request.is_ajax() and request.method == 'GET'):
        sname = strip(request.GET['name']);
        session_obj = CardSession.objects.filter(id=int(float(request.GET['session_id'])));

        # test to make sure this global id isn't occupied
        global_id = "000-" + request.GET['session_id'] + "-" + sname
        if( Card.objects.filter(global_id=global_id).count() > 0):
            message = "Card not added.  Duplicate found."
            return HttpResponse(message)
        
        newCard = Card(name = sname,
                    session=session_obj[0],
                    x_coord=request.GET['x_coord'], 
                    y_coord=request.GET['y_coord'],
                    global_id=global_id)
        newCard.save();
        message = "Card added"
    else:
        message = "Invalid access method"
    return HttpResponse(message)

# Ajax method to add card
def recall_card(request):
    # height: card_h, width: card_w, x_coord: w_rel, y_coord: h_rel, session_id: session_id
    session = CardSession.objects.get(id=int(float(request.GET['session_id'])))
    h = float(request.GET['height'])
    w = float(request.GET['width'])
    x = float(request.GET['x_coord'])
    y = float(request.GET['y_coord'])
    cards = Card.objects.filter(session=session);
    
    print "test"
    print "h= %f, w= %f, x= %f, y=%f" % (h, w, x, y)
    
    # order by time added so the one on top is pulled
    deleted_name = "";        
    for card in cards:
        w_rel = (x - card.x_coord)/w
        h_rel = (y - card.y_coord)/h
        if((w_rel < 1 and w_rel > 0) and (h_rel < 1 and h_rel > 0)):
            print card.name
            deleted_name = card.name
            card.delete()
            break
    data = {'deleted_name': deleted_name}
    return HttpResponse(simplejson.dumps(data), mimetype='application/javascript')

def saveallcards(request):
    if (request.is_ajax() and request.method == 'POST'):
        allcards = request.POST['cards'];
        
        # Print out info for now
        for card in allcards:
            print card
            print card.name

        message = "Cards added"
    else:
        message = "Invalid access method"
    return HttpResponse(message)

def todo(request):
    return render_to_response('todo.html',
                              {"test": 1},
                              context_instance=RequestContext(request)) # must include context instance to get STATIC_FILES to work



# display page
# pass in sessions so they can choose one
# need session id for each

# Page for adding a session via ajax
#def addSession(request):
    

# page for adding a card to a session