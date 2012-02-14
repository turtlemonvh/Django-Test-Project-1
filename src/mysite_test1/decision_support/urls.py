from django.conf.urls.defaults import patterns, include, url
from mysite_test1.decision_support.views import index, select_variables, mappings

urlpatterns = patterns('',
    (r'^$', index), 
    #(r'^select_choices/$',select_choices), # strict match to /hello/
    (r'^select_variables/$',select_variables), # strict match to /time/
    (r'^mappings/$',mappings),
    #(r'^show_weights/$',show_weights),
)

