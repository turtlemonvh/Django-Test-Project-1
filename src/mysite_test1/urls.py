from django.conf.urls.defaults import patterns, include, url
from mysite_test1.views import home, hello, current_datetime, hours_ahead, get_pi, display_meta
from mysite_test1.books.views import search

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'mysite_test1.views.home', name='home'),
    # url(r'^mysite_test1/', include('mysite_test1.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    
    
    (r'^decision_support/', include('mysite_test1.decision_support.urls')),    
    (r'^$', home), 
    (r'^hello/$',hello), # strict match to /hello/
    (r'^time/$',current_datetime), # strict match to /time/
    (r'^time/plus/(\d{1,2})/$',hours_ahead), # calculate time xx hours ahead, limiting hours to 2 digit #s; r = raw input, so non interpreted meta-chars; parens capture data
    (r'^mc/getpi/$',get_pi),
    (r'^meta/$',display_meta), # display meta
    (r'^search/$', search), # book search
)

urlpatterns += patterns('mysite_test1.contact.views',
    (r'^contact/$', 'contact'),
    (r'^contact/thanks/$', 'thanks'),
    (r'^ajax/xhr_test/$', 'xhr_test'),
    (r'^ajax/ajax_test/$', 'ajax_test'),
)

urlpatterns += patterns('mysite_test1.seventools.views',
    (r'^seventools/$', 'createcards'),
    (r'^seventools/cardsession/$', 'createcards'),
    (r'^seventools/cardsession/addsession/$', 'createcards'),
    (r'^seventools/cardsession/json/$', 'session_cards_JSON'),
    (r'^seventools/cardsession/addcard/$', 'add_card'),
    (r'^seventools/cardsession/recallcard/$', 'recall_card'),
)